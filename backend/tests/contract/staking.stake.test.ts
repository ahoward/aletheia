/**
 * T016: Contract test POST /v1/narratives/{id}/stake
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the staking endpoint according to OpenAPI spec
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('POST /v1/narratives/{id}/stake', () => {
  const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';
  const narrativeId = 123; // Test narrative ID
  
  const validStakePayload = {
    amount: '100.5',
    lockupDays: 30
  };

  it('should create staking position with valid data', async () => {
    const response = await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(201);

    // Verify response structure matches OpenAPI spec
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('narrativeId', narrativeId);
    expect(response.body).toHaveProperty('amount', validStakePayload.amount);
    expect(response.body).toHaveProperty('lockupDays', validStakePayload.lockupDays);
    expect(response.body).toHaveProperty('stakedAt');
    expect(response.body).toHaveProperty('unlocksAt');
    expect(response.body).toHaveProperty('returns');

    // Verify types
    expect(typeof response.body.id).toBe('string');
    expect(typeof response.body.narrativeId).toBe('number');
    expect(typeof response.body.amount).toBe('string');
    expect(typeof response.body.lockupDays).toBe('number');
    expect(typeof response.body.stakedAt).toBe('string');
    expect(typeof response.body.unlocksAt).toBe('string');
    expect(typeof response.body.returns).toBe('string');

    // Verify dates
    expect(new Date(response.body.stakedAt)).toBeInstanceOf(Date);
    expect(new Date(response.body.unlocksAt)).toBeInstanceOf(Date);
  });

  it('should reject invalid narrative ID', async () => {
    await request(app)
      .post('/v1/narratives/invalid/stake')
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(400);
  });

  it('should reject non-existent narrative', async () => {
    await request(app)
      .post('/v1/narratives/999999/stake')
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(404);
  });

  it('should reject invalid amount format', async () => {
    const invalidAmountPayload = {
      ...validStakePayload,
      amount: 'invalid-amount'
    };

    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(invalidAmountPayload)
      .expect(400);
  });

  it('should reject negative amount', async () => {
    const negativeAmountPayload = {
      ...validStakePayload,
      amount: '-10.5'
    };

    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(negativeAmountPayload)
      .expect(400);
  });

  it('should reject zero amount', async () => {
    const zeroAmountPayload = {
      ...validStakePayload,
      amount: '0'
    };

    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(zeroAmountPayload)
      .expect(400);
  });

  it('should reject lockup period less than minimum', async () => {
    const shortLockupPayload = {
      ...validStakePayload,
      lockupDays: 6 // Less than 7-day minimum
    };

    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(shortLockupPayload)
      .expect(400);
  });

  it('should reject insufficient balance', async () => {
    const largeAmountPayload = {
      ...validStakePayload,
      amount: '999999999999' // Assuming user doesn't have this much
    };

    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(largeAmountPayload)
      .expect(400);
  });

  it('should calculate correct unlock date', async () => {
    const response = await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(201);

    const stakedAt = new Date(response.body.stakedAt);
    const unlocksAt = new Date(response.body.unlocksAt);
    const expectedUnlockTime = new Date(stakedAt.getTime() + (validStakePayload.lockupDays * 24 * 60 * 60 * 1000));

    // Allow for small time differences due to processing delays
    expect(Math.abs(unlocksAt.getTime() - expectedUnlockTime.getTime())).toBeLessThan(60000); // Within 1 minute
  });

  it('should create blockchain transaction', async () => {
    const response = await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(201);

    // Should have transaction reference
    expect(response.body).toHaveProperty('transactionHash');
    expect(response.body.transactionHash).toMatch(/^0x[a-fA-F0-9]{64}$/);
  });

  it('should update narrative total stake', async () => {
    // Get narrative before staking
    const beforeResponse = await request(app)
      .get(`/v1/narratives/${narrativeId}`)
      .set('Authorization', validToken);

    const initialStake = parseFloat(beforeResponse.body.totalStaked || '0');

    // Perform staking
    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .set('Authorization', validToken)
      .send(validStakePayload)
      .expect(201);

    // Get narrative after staking
    const afterResponse = await request(app)
      .get(`/v1/narratives/${narrativeId}`)
      .set('Authorization', validToken);

    const finalStake = parseFloat(afterResponse.body.totalStaked);
    const expectedStake = initialStake + parseFloat(validStakePayload.amount);

    expect(finalStake).toBeCloseTo(expectedStake, 2);
  });

  it('should require authentication', async () => {
    await request(app)
      .post(`/v1/narratives/${narrativeId}/stake`)
      .send(validStakePayload)
      .expect(401);
  });

  it('should handle concurrent staking on same narrative', async () => {
    const concurrentStakes = [
      request(app)
        .post(`/v1/narratives/${narrativeId}/stake`)
        .set('Authorization', validToken)
        .send({ amount: '10', lockupDays: 7 }),
      request(app)
        .post(`/v1/narratives/${narrativeId}/stake`)
        .set('Authorization', validToken)
        .send({ amount: '20', lockupDays: 14 })
    ];

    const responses = await Promise.all(concurrentStakes);
    
    // Both should succeed or fail gracefully
    responses.forEach(response => {
      expect([201, 409, 503]).toContain(response.status);
    });
  });
});
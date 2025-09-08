/**
 * T028: Integration test: Connect wallet and browse narratives
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the complete user journey from quickstart.md Scenario 1
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('Integration: Wallet Connect and Browse Narratives', () => {
  let authToken: string;

  it('should complete the full wallet connection and browsing flow', async () => {
    // Step 1: Connect wallet (simulate MetaMask signature)
    const connectPayload = {
      address: '0x742d35Cc6C4C3f04F7b2c3a6B5e1B7b8D8B8C8C8',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      message: 'Sign this message to authenticate with Aletheia'
    };

    const authResponse = await request(app)
      .post('/v1/auth/connect')
      .send(connectPayload)
      .expect(200);

    expect(authResponse.body).toHaveProperty('token');
    expect(authResponse.body).toHaveProperty('user');
    
    authToken = authResponse.body.token;

    // Step 2: Browse marketplace dashboard
    const narrativesResponse = await request(app)
      .get('/v1/narratives')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(narrativesResponse.body).toHaveProperty('data');
    expect(narrativesResponse.body).toHaveProperty('pagination');
    expect(Array.isArray(narrativesResponse.body.data)).toBe(true);

    // Step 3: Use filters to find narratives by modality
    const filteredResponse = await request(app)
      .get('/v1/narratives?modality=text&sort=staked')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(filteredResponse.body.data).toBeDefined();

    // Step 4: View narrative details
    if (narrativesResponse.body.data.length > 0) {
      const firstNarrative = narrativesResponse.body.data[0];
      
      const detailResponse = await request(app)
        .get(`/v1/narratives/${firstNarrative.tokenId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(detailResponse.body).toHaveProperty('tokenId');
      expect(detailResponse.body).toHaveProperty('description');
      expect(detailResponse.body).toHaveProperty('metadataUri');
      expect(detailResponse.body).toHaveProperty('fulfillmentCount');
      expect(detailResponse.body).toHaveProperty('disseminationCount');
      expect(detailResponse.body).toHaveProperty('recentActivity');
    }

    // Step 5: Get market overview with real-time metrics
    const marketResponse = await request(app)
      .get('/v1/market/overview')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(marketResponse.body).toHaveProperty('totalNarratives');
    expect(marketResponse.body).toHaveProperty('totalStaked');
    expect(marketResponse.body).toHaveProperty('activeUsers');
    expect(marketResponse.body).toHaveProperty('topNarratives');
    
    expect(typeof marketResponse.body.totalNarratives).toBe('number');
    expect(typeof marketResponse.body.totalStaked).toBe('string');
    expect(typeof marketResponse.body.activeUsers).toBe('number');
    expect(Array.isArray(marketResponse.body.topNarratives)).toBe(true);
  });

  it('should handle authentication expiry gracefully', async () => {
    // Use an expired token
    const expiredToken = 'expired.jwt.token';

    const response = await request(app)
      .get('/v1/narratives')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body).toHaveProperty('error');
  });

  it('should maintain session state across requests', async () => {
    // Connect and get token
    const connectPayload = {
      address: '0x742d35Cc6C4C3f04F7b2c3a6B5e1B7b8D8B8C8C8',
      signature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
      message: 'Sign this message to authenticate with Aletheia'
    };

    const authResponse = await request(app)
      .post('/v1/auth/connect')
      .send(connectPayload)
      .expect(200);

    const token = authResponse.body.token;

    // Make multiple requests with same token
    const requests = [
      request(app).get('/v1/narratives').set('Authorization', `Bearer ${token}`),
      request(app).get('/v1/market/overview').set('Authorization', `Bearer ${token}`),
      request(app).get('/v1/validators').set('Authorization', `Bearer ${token}`)
    ];

    const responses = await Promise.all(requests);
    
    // All should succeed with same token
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
/**
 * T019: Contract test POST /v1/semantic/similar
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the semantic similarity endpoint according to OpenAPI spec
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('POST /v1/semantic/similar', () => {
  const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  const validSimilarityPayload = {
    text: 'A narrative about corporate fraud involving financial misstatements and SEC violations',
    threshold: 0.8
  };

  it('should find semantically similar narratives', async () => {
    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(validSimilarityPayload)
      .expect(200);

    // Verify response structure matches OpenAPI spec
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verify each result structure
    response.body.data.forEach((result: any) => {
      expect(result).toHaveProperty('narrative');
      expect(result).toHaveProperty('similarity');
      
      // Verify narrative structure
      expect(result.narrative).toHaveProperty('tokenId');
      expect(result.narrative).toHaveProperty('name');
      expect(result.narrative).toHaveProperty('creator');
      expect(result.narrative).toHaveProperty('modality');
      
      // Verify similarity score
      expect(typeof result.similarity).toBe('number');
      expect(result.similarity).toBeGreaterThanOrEqual(validSimilarityPayload.threshold);
      expect(result.similarity).toBeLessThanOrEqual(1);
    });
  });

  it('should respect similarity threshold', async () => {
    const highThresholdPayload = {
      ...validSimilarityPayload,
      threshold: 0.95
    };

    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(highThresholdPayload)
      .expect(200);

    // All results should have similarity >= 0.95
    response.body.data.forEach((result: any) => {
      expect(result.similarity).toBeGreaterThanOrEqual(0.95);
    });
  });

  it('should default threshold to 0.8 when not provided', async () => {
    const payloadWithoutThreshold = {
      text: validSimilarityPayload.text
    };

    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(payloadWithoutThreshold)
      .expect(200);

    // All results should have similarity >= 0.8 (default)
    response.body.data.forEach((result: any) => {
      expect(result.similarity).toBeGreaterThanOrEqual(0.8);
    });
  });

  it('should reject missing text field', async () => {
    const payloadWithoutText = {
      threshold: 0.8
    };

    await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(payloadWithoutText)
      .expect(400);
  });

  it('should reject text exceeding maximum length', async () => {
    const longTextPayload = {
      text: 'A'.repeat(5001), // Exceeds 5000 char limit
      threshold: 0.8
    };

    await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(longTextPayload)
      .expect(400);
  });

  it('should reject invalid threshold values', async () => {
    // Test threshold > 1
    const highThresholdPayload = {
      ...validSimilarityPayload,
      threshold: 1.5
    };

    await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(highThresholdPayload)
      .expect(400);

    // Test threshold < 0
    const lowThresholdPayload = {
      ...validSimilarityPayload,
      threshold: -0.1
    };

    await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(lowThresholdPayload)
      .expect(400);
  });

  it('should handle empty similarity results', async () => {
    const uniqueTextPayload = {
      text: 'Xzqwerty unique text that should not match anything zxcvbnm',
      threshold: 0.99
    };

    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(uniqueTextPayload)
      .expect(200);

    expect(response.body.data).toEqual([]);
  });

  it('should sort results by similarity descending', async () => {
    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(validSimilarityPayload)
      .expect(200);

    if (response.body.data.length > 1) {
      const similarities = response.body.data.map((result: any) => result.similarity);
      
      // Check if sorted in descending order
      for (let i = 0; i < similarities.length - 1; i++) {
        expect(similarities[i]).toBeGreaterThanOrEqual(similarities[i + 1]);
      }
    }
  });

  it('should require authentication', async () => {
    await request(app)
      .post('/v1/semantic/similar')
      .send(validSimilarityPayload)
      .expect(401);
  });

  it('should handle semantic service unavailable', async () => {
    // This test would require mocking the semantic service to be unavailable
    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send(validSimilarityPayload);

    // Should either succeed (200) or fail gracefully (503)
    expect([200, 503]).toContain(response.status);
  });

  it('should return limited number of results', async () => {
    const response = await request(app)
      .post('/v1/semantic/similar')
      .set('Authorization', validToken)
      .send({ ...validSimilarityPayload, threshold: 0.1 })
      .expect(200);

    // Should not return too many results (e.g., max 50)
    expect(response.body.data.length).toBeLessThanOrEqual(50);
  });
});
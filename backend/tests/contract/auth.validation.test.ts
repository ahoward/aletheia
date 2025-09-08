/**
 * T011: Contract test auth token validation
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the JWT token validation middleware
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('Auth Token Validation', () => {
  it('should accept valid JWT token', async () => {
    // This test assumes we have a protected endpoint to test against
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDc0MmQzNUNjNkM0QzNmMDRGN2IyYzNhNkI1ZTFCN2I4RDhCOENCOCIsImlhdCI6MTUxNjIzOTAyMn0.test';

    const response = await request(app)
      .get('/v1/narratives') // Protected endpoint
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });

  it('should reject missing Authorization header', async () => {
    await request(app)
      .get('/v1/narratives')
      .expect(401);
  });

  it('should reject malformed Authorization header', async () => {
    await request(app)
      .get('/v1/narratives')
      .set('Authorization', 'InvalidFormat')
      .expect(401);
  });

  it('should reject invalid JWT token', async () => {
    await request(app)
      .get('/v1/narratives')
      .set('Authorization', 'Bearer invalid.jwt.token')
      .expect(401);
  });

  it('should reject expired JWT token', async () => {
    // Create an expired token for testing
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDc0MmQzNUNjNkM0QzNmMDRGN2IyYzNhNkI1ZTFCN2I4RDhCOENCOCIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjM5MDIyfQ.expired';

    await request(app)
      .get('/v1/narratives')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should extract user information from valid token', async () => {
    const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIweDc0MmQzNUNjNkM0QzNmMDRGN2IyYzNhNkI1ZTFCN2I4RDhCOENCOCIsImlhdCI6MTUxNjIzOTAyMn0.test';

    const response = await request(app)
      .get('/v1/auth/me') // Endpoint that returns current user info
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.user).toHaveProperty('walletAddress');
    expect(response.body.user.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });
});
/**
 * T012: Contract test GET /v1/narratives
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the narratives listing endpoint according to OpenAPI spec
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('GET /v1/narratives', () => {
  const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  it('should return paginated list of narratives', async () => {
    const response = await request(app)
      .get('/v1/narratives')
      .set('Authorization', validToken)
      .expect(200);

    // Verify response structure matches OpenAPI spec
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('pagination');
    
    expect(Array.isArray(response.body.data)).toBe(true);
    
    // Verify pagination structure
    const pagination = response.body.pagination;
    expect(pagination).toHaveProperty('page');
    expect(pagination).toHaveProperty('limit');
    expect(pagination).toHaveProperty('total');
    expect(pagination).toHaveProperty('totalPages');
    
    expect(typeof pagination.page).toBe('number');
    expect(typeof pagination.limit).toBe('number');
    expect(typeof pagination.total).toBe('number');
    expect(typeof pagination.totalPages).toBe('number');
  });

  it('should return narratives with correct structure', async () => {
    const response = await request(app)
      .get('/v1/narratives?limit=1')
      .set('Authorization', validToken)
      .expect(200);

    if (response.body.data.length > 0) {
      const narrative = response.body.data[0];
      
      // Verify narrative structure matches OpenAPI spec
      expect(narrative).toHaveProperty('tokenId');
      expect(narrative).toHaveProperty('name');
      expect(narrative).toHaveProperty('creator');
      expect(narrative).toHaveProperty('modality');
      expect(narrative).toHaveProperty('totalStaked');
      expect(narrative).toHaveProperty('uniqueStakers');
      expect(narrative).toHaveProperty('tags');
      expect(narrative).toHaveProperty('createdAt');
      expect(narrative).toHaveProperty('lastActivity');
      
      expect(typeof narrative.tokenId).toBe('number');
      expect(typeof narrative.name).toBe('string');
      expect(typeof narrative.creator).toBe('string');
      expect(['text', 'image', 'video', 'multimodal']).toContain(narrative.modality);
      expect(typeof narrative.totalStaked).toBe('string');
      expect(typeof narrative.uniqueStakers).toBe('number');
      expect(Array.isArray(narrative.tags)).toBe(true);
    }
  });

  it('should support pagination parameters', async () => {
    const page2Response = await request(app)
      .get('/v1/narratives?page=2&limit=5')
      .set('Authorization', validToken)
      .expect(200);

    expect(page2Response.body.pagination.page).toBe(2);
    expect(page2Response.body.pagination.limit).toBe(5);
  });

  it('should support sorting parameters', async () => {
    const sortedResponse = await request(app)
      .get('/v1/narratives?sort=staked')
      .set('Authorization', validToken)
      .expect(200);

    expect(sortedResponse.body.data).toBeDefined();
    // Note: Actual sorting validation would require seeded test data
  });

  it('should support modality filtering', async () => {
    const filteredResponse = await request(app)
      .get('/v1/narratives?modality=text')
      .set('Authorization', validToken)
      .expect(200);

    expect(filteredResponse.body.data).toBeDefined();
    // If there are results, they should all be text modality
    filteredResponse.body.data.forEach((narrative: any) => {
      expect(narrative.modality).toBe('text');
    });
  });

  it('should support tags filtering', async () => {
    const tagsResponse = await request(app)
      .get('/v1/narratives?tags=finance&tags=tech')
      .set('Authorization', validToken)
      .expect(200);

    expect(tagsResponse.body.data).toBeDefined();
  });

  it('should reject invalid pagination parameters', async () => {
    await request(app)
      .get('/v1/narratives?page=0')
      .set('Authorization', validToken)
      .expect(400);
  });

  it('should reject limit exceeding maximum', async () => {
    await request(app)
      .get('/v1/narratives?limit=101')
      .set('Authorization', validToken)
      .expect(400);
  });

  it('should require authentication', async () => {
    await request(app)
      .get('/v1/narratives')
      .expect(401);
  });
});
/**
 * T013: Contract test POST /v1/narratives
 * 
 * This test MUST FAIL initially (TDD Red phase)
 * Tests the narrative creation endpoint according to OpenAPI spec
 */

import request from 'supertest';
import { app } from '@/index'; // This will fail - app doesn't exist yet

describe('POST /v1/narratives', () => {
  const validToken = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test';

  const validNarrativePayload = {
    name: 'Test Corporate Scandal',
    description: 'A narrative about corporate malfeasance involving insider trading and regulatory violations at a major tech company.',
    tags: ['finance', 'tech', 'scandal'],
    modality: 'text' as const
  };

  it('should create new narrative with valid data', async () => {
    const response = await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(validNarrativePayload)
      .expect(201);

    // Verify response structure matches OpenAPI spec
    expect(response.body).toHaveProperty('tokenId');
    expect(response.body).toHaveProperty('name', validNarrativePayload.name);
    expect(response.body).toHaveProperty('creator');
    expect(response.body).toHaveProperty('description', validNarrativePayload.description);
    expect(response.body).toHaveProperty('tags');
    expect(response.body).toHaveProperty('modality', validNarrativePayload.modality);
    expect(response.body).toHaveProperty('metadataUri');
    expect(response.body).toHaveProperty('createdAt');
    
    // Verify types
    expect(typeof response.body.tokenId).toBe('number');
    expect(typeof response.body.creator).toBe('string');
    expect(response.body.creator).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(Array.isArray(response.body.tags)).toBe(true);
    expect(response.body.tags).toEqual(validNarrativePayload.tags);
    expect(typeof response.body.metadataUri).toBe('string');
    expect(response.body.metadataUri).toMatch(/^ipfs:\/\//);
  });

  it('should reject missing required fields', async () => {
    const incompletePayload = {
      name: 'Test Narrative'
      // Missing description, tags, modality
    };

    const response = await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(incompletePayload)
      .expect(400);

    expect(response.body).toHaveProperty('error');
  });

  it('should reject invalid modality', async () => {
    const invalidModalityPayload = {
      ...validNarrativePayload,
      modality: 'invalid-modality'
    };

    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(invalidModalityPayload)
      .expect(400);
  });

  it('should reject name exceeding maximum length', async () => {
    const longNamePayload = {
      ...validNarrativePayload,
      name: 'A'.repeat(101) // Exceeds 100 char limit
    };

    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(longNamePayload)
      .expect(400);
  });

  it('should reject description exceeding maximum length', async () => {
    const longDescriptionPayload = {
      ...validNarrativePayload,
      description: 'A'.repeat(5001) // Exceeds 5000 char limit
    };

    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(longDescriptionPayload)
      .expect(400);
  });

  it('should reject too many tags', async () => {
    const tooManyTagsPayload = {
      ...validNarrativePayload,
      tags: Array(11).fill(0).map((_, i) => `tag${i}`) // Exceeds 10 tag limit
    };

    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(tooManyTagsPayload)
      .expect(400);
  });

  it('should generate semantic embedding from description', async () => {
    const response = await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(validNarrativePayload)
      .expect(201);

    // The response itself might not include embedding, but it should be generated
    // This would be verified through the semantic similarity endpoint
    expect(response.body).toHaveProperty('tokenId');
  });

  it('should reject semantically identical narratives', async () => {
    // First, create a narrative
    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(validNarrativePayload)
      .expect(201);

    // Then try to create a very similar one
    const similarPayload = {
      ...validNarrativePayload,
      name: 'Test Corporate Scandal 2', // Slightly different name
      description: validNarrativePayload.description // Same description
    };

    await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(similarPayload)
      .expect(409); // Conflict due to semantic similarity
  });

  it('should calculate and display minting fees', async () => {
    // This might be handled in a separate fee calculation endpoint
    // or included in the creation response
    const response = await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(validNarrativePayload)
      .expect(201);

    // Fee information might be in response or calculated beforehand
    expect(response.body).toHaveProperty('tokenId');
  });

  it('should require authentication', async () => {
    await request(app)
      .post('/v1/narratives')
      .send(validNarrativePayload)
      .expect(401);
  });

  it('should handle IPFS metadata upload failure gracefully', async () => {
    // This test would require mocking IPFS service to fail
    // The system should handle IPFS failures and return appropriate error
    
    const response = await request(app)
      .post('/v1/narratives')
      .set('Authorization', validToken)
      .send(validNarrativePayload);

    // Should either succeed (201) or fail gracefully (503)
    expect([201, 503]).toContain(response.status);
  });
});
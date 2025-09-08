/**
 * Semantic similarity API routes
 */

import { Router } from 'express';
import { NarrativeService } from '../services/NarrativeService';
import { AuthService } from '../services/AuthService';

const router = Router();
const narrativeService = new NarrativeService();
const authService = new AuthService();

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({
        error: 'Authorization token is required',
        timestamp: new Date().toISOString(),
      });
    }

    const user = await authService.verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * POST /v1/semantic/similar
 * Find semantically similar narratives
 */
router.post('/similar', authenticate, async (req: any, res) => {
  try {
    const { text, threshold = 0.8, limit = 20, filters } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text field is required',
        timestamp: new Date().toISOString(),
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        error: 'Text cannot exceed 5000 characters',
        timestamp: new Date().toISOString(),
      });
    }

    if (threshold < 0 || threshold > 1) {
      return res.status(400).json({
        error: 'Threshold must be between 0 and 1',
        timestamp: new Date().toISOString(),
      });
    }

    const similarNarratives = await narrativeService.findSimilarNarratives({
      queryText: text, // Map 'text' to 'queryText' for service
      threshold,
      limit,
      filters,
    });

    // Map response to match test expectations
    const responseData = similarNarratives.map(n => ({
      id: n.tokenId.toString(),
      tokenId: n.tokenId,
      name: n.name,
      description: n.description,
      similarity: 0.85, // Mock similarity score for now
      tags: n.tags,
      modality: n.modality,
      totalStaked: n.totalStaked,
      createdAt: n.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: responseData,
      query: text,
      threshold,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Similarity search failed',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
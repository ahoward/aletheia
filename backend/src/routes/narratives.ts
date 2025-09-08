/**
 * Narratives API routes
 */

import { Router } from 'express';
import { NarrativeService } from '../services/NarrativeService';
import { AuthService } from '../services/AuthService';
import { Modality, NarrativeStatus } from '../models/NarrativeNFT';

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
 * GET /api/narratives
 * List narratives with optional filtering
 */
router.get('/', async (req, res) => {
  try {
    const {
      tags,
      modality,
      status,
      minStake,
      maxStake,
      createdAfter,
      createdBefore,
      creatorAddress,
      limit = '50',
      offset = '0',
    } = req.query;

    const filters: any = {};

    if (tags) {
      filters.tags = Array.isArray(tags) ? tags : [tags];
    }
    if (modality && Object.values(Modality).includes(modality as Modality)) {
      filters.modality = modality as Modality;
    }
    if (status && Object.values(NarrativeStatus).includes(status as NarrativeStatus)) {
      filters.status = status as NarrativeStatus;
    }
    if (minStake) {
      filters.minStake = parseFloat(minStake as string);
    }
    if (maxStake) {
      filters.maxStake = parseFloat(maxStake as string);
    }
    if (createdAfter) {
      filters.createdAfter = new Date(createdAfter as string);
    }
    if (createdBefore) {
      filters.createdBefore = new Date(createdBefore as string);
    }
    if (creatorAddress) {
      filters.creatorAddress = creatorAddress as string;
    }

    const narratives = await narrativeService.getNarratives(
      filters,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    return res.status(200).json({
      success: true,
      data: {
        narratives: narratives.map(n => ({
          id: n.tokenId.toString(),
          tokenId: n.tokenId,
          contractAddress: n.contractAddress,
          creator: n.creator,
          name: n.name,
          description: n.description,
          tags: n.tags,
          modality: n.modality,
          metadataUri: n.metadataUri,
          totalStaked: n.totalStaked,
          uniqueStakers: n.uniqueStakers,
          createdAt: n.createdAt,
          lastActivity: n.lastActivity,
          status: n.status,
        })),
        pagination: {
          limit: parseInt(limit as string),
          offset: parseInt(offset as string),
          total: narratives.length,
        },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch narratives',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/narratives
 * Create a new narrative
 */
router.post('/', authenticate, async (req: any, res) => {
  try {
    const { name, description, content, tags, modality, metadataUri } = req.body;

    if (!name || !description || !content) {
      return res.status(400).json({
        error: 'Name, description, and content are required',
        timestamp: new Date().toISOString(),
      });
    }

    if (!Object.values(Modality).includes(modality)) {
      return res.status(400).json({
        error: 'Invalid modality. Must be one of: text, image, video, audio, mixed',
        timestamp: new Date().toISOString(),
      });
    }

    const narrative = await narrativeService.createNarrative({
      name,
      description,
      content,
      tags: tags || [],
      modality,
      creatorAddress: req.user.walletAddress,
      metadataUri,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: narrative.tokenId.toString(),
        tokenId: narrative.tokenId,
        contractAddress: narrative.contractAddress,
        creator: narrative.creator,
        name: narrative.name,
        description: narrative.description,
        tags: narrative.tags,
        modality: narrative.modality,
        metadataUri: narrative.metadataUri,
        totalStaked: narrative.totalStaked,
        uniqueStakers: narrative.uniqueStakers,
        createdAt: narrative.createdAt,
        lastActivity: narrative.lastActivity,
        status: narrative.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to create narrative',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/narratives/:id
 * Get a specific narrative by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const narrative = await narrativeService.getNarrative(id);

    if (!narrative) {
      return res.status(404).json({
        error: 'Narrative not found',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: narrative.tokenId.toString(),
        tokenId: narrative.tokenId,
        contractAddress: narrative.contractAddress,
        creator: narrative.creator,
        name: narrative.name,
        description: narrative.description,
        tags: narrative.tags,
        modality: narrative.modality,
        metadataUri: narrative.metadataUri,
        totalStaked: narrative.totalStaked,
        uniqueStakers: narrative.uniqueStakers,
        createdAt: narrative.createdAt,
        lastActivity: narrative.lastActivity,
        status: narrative.status,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch narrative',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/narratives/search/similar
 * Search for similar narratives
 */
router.post('/search/similar', async (req, res) => {
  try {
    const { queryText, threshold = 0.7, limit = 20, filters } = req.body;

    if (!queryText) {
      return res.status(400).json({
        error: 'Query text is required',
        timestamp: new Date().toISOString(),
      });
    }

    const similarNarratives = await narrativeService.findSimilarNarratives({
      queryText,
      threshold,
      limit,
      filters,
    });

    return res.status(200).json({
      success: true,
      data: {
        narratives: similarNarratives.map(n => ({
          id: n.tokenId.toString(),
          tokenId: n.tokenId,
          contractAddress: n.contractAddress,
          creator: n.creator,
          name: n.name,
          description: n.description,
          tags: n.tags,
          modality: n.modality,
          metadataUri: n.metadataUri,
          totalStaked: n.totalStaked,
          uniqueStakers: n.uniqueStakers,
          createdAt: n.createdAt,
          lastActivity: n.lastActivity,
          status: n.status,
        })),
        query: queryText,
        threshold,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Similarity search failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/narratives/trending
 * Get trending narratives
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const trending = await narrativeService.getTrendingNarratives(parseInt(limit as string));

    return res.status(200).json({
      success: true,
      data: {
        narratives: trending.map(n => ({
          id: n.tokenId.toString(),
          tokenId: n.tokenId,
          contractAddress: n.contractAddress,
          creator: n.creator,
          name: n.name,
          description: n.description,
          tags: n.tags,
          modality: n.modality,
          metadataUri: n.metadataUri,
          totalStaked: n.totalStaked,
          uniqueStakers: n.uniqueStakers,
          createdAt: n.createdAt,
          lastActivity: n.lastActivity,
          status: n.status,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch trending narratives',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/narratives/stats
 * Get narrative statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await narrativeService.getNarrativeStats();

    return res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch narrative stats',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
/**
 * Market data API routes
 */

import { Router } from 'express';
import { MarketDataEngine } from '../lib/market-data';
import { VisualizationEngine } from '../lib/visualization';

const router = Router();
const marketEngine = new MarketDataEngine();
const vizEngine = new VisualizationEngine();

/**
 * GET /api/market/metrics
 * Get overall market metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = marketEngine.calculateMarketMetrics();

    return res.status(200).json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch market metrics',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/market/trending
 * Get trending narratives with momentum data
 */
router.get('/trending', async (req, res) => {
  try {
    const { limit = '20' } = req.query;
    const trending = marketEngine.getTrendingNarratives(parseInt(limit as string));

    return res.status(200).json({
      success: true,
      data: {
        trending: trending.map(t => ({
          narrative: {
            tokenId: t.narrative.tokenId,
            name: t.narrative.name,
            totalStaked: t.narrative.totalStaked,
            uniqueStakers: t.narrative.uniqueStakers,
            stakingVelocity: t.narrative.stakingVelocity,
            trendingScore: t.narrative.trendingScore,
            category: t.narrative.category,
            createdAt: t.narrative.createdAt,
          },
          momentum: t.momentum,
          percentageChange: t.percentageChange,
          timeframe: t.timeframe,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch trending data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/market/sentiment
 * Get market sentiment indicators
 */
router.get('/sentiment', async (req, res) => {
  try {
    const sentiment = marketEngine.getMarketSentiment();

    return res.status(200).json({
      success: true,
      data: sentiment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch market sentiment',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/market/activity/:narrativeId
 * Get activity timeline for a specific narrative
 */
router.get('/activity/:narrativeId', async (req, res) => {
  try {
    const { narrativeId } = req.params;
    const { hoursBack = '168' } = req.query; // Default 7 days

    const activity = marketEngine.getNarrativeActivity(
      parseInt(narrativeId),
      parseInt(hoursBack as string)
    );

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: parseInt(narrativeId),
        hoursBack: parseInt(hoursBack as string),
        activity: activity.map(a => ({
          timestamp: a.timestamp,
          amount: a.amount,
          action: a.action,
          staker: a.staker,
        })),
        totalVolume: activity.reduce((sum, a) => sum + parseFloat(a.amount), 0).toFixed(4),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch activity data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/market/chart/staking-trends
 * Generate staking trends chart data
 */
router.post('/chart/staking-trends', async (req, res) => {
  try {
    const { narrativeIds, timeframe = '7d' } = req.body;

    if (!narrativeIds || !Array.isArray(narrativeIds)) {
      return res.status(400).json({
        error: 'Narrative IDs array is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Get activities for the narratives
    const activities = [];
    for (const id of narrativeIds) {
      const narrativeActivity = marketEngine.getNarrativeActivity(parseInt(id), 168);
      activities.push(...narrativeActivity);
    }

    // Convert string amounts to numbers for visualization engine
    const activitiesForViz = activities.map(activity => ({
      ...activity,
      amount: parseFloat(activity.amount),
    }));
    
    const series = vizEngine.generateStakingTrends(activitiesForViz);
    const config = vizEngine.createChartConfig({
      title: 'Narrative Staking Trends',
      xAxisLabel: 'Time',
      yAxisLabel: 'Total Staked (NARR)',
    });

    return res.status(200).json({
      success: true,
      data: {
        series,
        config,
        timeframe,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate chart data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/market/chart/similarity-network
 * Generate semantic similarity network data
 */
router.post('/chart/similarity-network', async (req, res) => {
  try {
    const { narratives, threshold = 0.7 } = req.body;

    if (!narratives || !Array.isArray(narratives)) {
      return res.status(400).json({
        error: 'Narratives array is required',
        timestamp: new Date().toISOString(),
      });
    }

    const networkData = vizEngine.generateSimilarityNetwork(narratives, threshold);

    return res.status(200).json({
      success: true,
      data: {
        network: networkData,
        threshold,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate network data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/market/chart/heatmap
 * Generate market heatmap data
 */
router.post('/chart/heatmap', async (req, res) => {
  try {
    const { narratives } = req.body;

    if (!narratives || !Array.isArray(narratives)) {
      return res.status(400).json({
        error: 'Narratives array is required',
        timestamp: new Date().toISOString(),
      });
    }

    const heatmapData = vizEngine.generateMarketHeatmap(narratives);

    return res.status(200).json({
      success: true,
      data: {
        heatmap: heatmapData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate heatmap data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/market/chart/treemap
 * Generate staking distribution treemap data
 */
router.post('/chart/treemap', async (req, res) => {
  try {
    const { narratives } = req.body;

    if (!narratives || !Array.isArray(narratives)) {
      return res.status(400).json({
        error: 'Narratives array is required',
        timestamp: new Date().toISOString(),
      });
    }

    const treemapData = vizEngine.generateStakingTreemap(narratives);

    return res.status(200).json({
      success: true,
      data: {
        treemap: treemapData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate treemap data',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/market/velocity/:narrativeId
 * Get staking velocity for a narrative
 */
router.get('/velocity/:narrativeId', async (req, res) => {
  try {
    const { narrativeId } = req.params;
    const { hoursBack = '24' } = req.query;

    const velocity = marketEngine.calculateStakingVelocity(
      parseInt(narrativeId),
      parseInt(hoursBack as string)
    );

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: parseInt(narrativeId),
        velocity,
        hoursBack: parseInt(hoursBack as string),
        unit: 'NARR',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate velocity',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/market/score/:narrativeId
 * Get trending score for a narrative
 */
router.get('/score/:narrativeId', async (req, res) => {
  try {
    const { narrativeId } = req.params;
    const score = marketEngine.calculateTrendingScore(parseInt(narrativeId));

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: parseInt(narrativeId),
        trendingScore: score,
        maxScore: 100,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate trending score',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
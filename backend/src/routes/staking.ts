/**
 * Staking API routes
 */

import { Router } from 'express';
import { StakingService } from '../services/StakingService';
import { AuthService } from '../services/AuthService';

const router = Router();
const stakingService = new StakingService();
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
 * POST /api/staking/stake
 * Stake tokens on a narrative
 */
router.post('/stake', authenticate, async (req: any, res) => {
  try {
    const { narrativeId, amount, signature } = req.body;

    if (!narrativeId || !amount || !signature) {
      return res.status(400).json({
        error: 'Narrative ID, amount, and signature are required',
        timestamp: new Date().toISOString(),
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be positive',
        timestamp: new Date().toISOString(),
      });
    }

    const activity = await stakingService.stakeOnNarrative({
      narrativeId: parseInt(narrativeId),
      amount,
      stakerAddress: req.user.walletAddress,
      signature,
    });

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: activity.narrativeId,
        amount: activity.amount,
        staker: activity.staker,
        timestamp: activity.timestamp,
        action: activity.action,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Staking failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/staking/unstake
 * Unstake tokens from a narrative
 */
router.post('/unstake', authenticate, async (req: any, res) => {
  try {
    const { narrativeId, amount, signature } = req.body;

    if (!narrativeId || !amount || !signature) {
      return res.status(400).json({
        error: 'Narrative ID, amount, and signature are required',
        timestamp: new Date().toISOString(),
      });
    }

    if (parseFloat(amount) <= 0) {
      return res.status(400).json({
        error: 'Amount must be positive',
        timestamp: new Date().toISOString(),
      });
    }

    const activity = await stakingService.unstakeFromNarrative({
      narrativeId: parseInt(narrativeId),
      amount,
      stakerAddress: req.user.walletAddress,
      signature,
    });

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: activity.narrativeId,
        amount: activity.amount,
        staker: activity.staker,
        timestamp: activity.timestamp,
        action: activity.action,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Unstaking failed',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/staking/positions
 * Get user's stake positions
 */
router.get('/positions', authenticate, async (req: any, res) => {
  try {
    const positions = await stakingService.getUserStakePositions(req.user.walletAddress);

    return res.status(200).json({
      success: true,
      data: {
        positions: positions.map(p => ({
          narrativeId: p.narrativeId,
          totalStaked: p.totalStaked,
          currentValue: p.currentValue,
          projectedRewards: p.projectedRewards,
          averageStakeTime: p.averageStakeTime,
          stakingHistory: p.stakingHistory.map(h => ({
            timestamp: h.timestamp,
            amount: h.amount,
            action: h.action,
          })),
        })),
        totalValue: positions.reduce((sum, p) => sum + parseFloat(p.currentValue), 0).toFixed(4),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch positions',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/staking/positions/:narrativeId
 * Get stake position for specific narrative
 */
router.get('/positions/:narrativeId', authenticate, async (req: any, res) => {
  try {
    const { narrativeId } = req.params;
    const position = await stakingService.getStakePosition(
      parseInt(narrativeId),
      req.user.walletAddress
    );

    if (!position) {
      return res.status(404).json({
        error: 'No stake position found for this narrative',
        timestamp: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: position.narrativeId,
        totalStaked: position.totalStaked,
        currentValue: position.currentValue,
        projectedRewards: position.projectedRewards,
        averageStakeTime: position.averageStakeTime,
        stakingHistory: position.stakingHistory.map(h => ({
          timestamp: h.timestamp,
          amount: h.amount,
          action: h.action,
        })),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch position',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/staking/rewards
 * Get user's staking rewards
 */
router.get('/rewards', authenticate, async (req: any, res) => {
  try {
    const positions = await stakingService.getUserStakePositions(req.user.walletAddress);
    const rewards = [];

    for (const position of positions) {
      const reward = await stakingService.getStakingRewards(
        position.narrativeId,
        req.user.walletAddress
      );
      
      if (reward) {
        rewards.push({
          narrativeId: reward.narrativeId,
          totalEarned: reward.totalEarned,
          pendingRewards: reward.pendingRewards,
          lastClaimedAt: reward.lastClaimedAt,
          nextClaimableAt: reward.nextClaimableAt,
        });
      }
    }

    const totalPending = rewards.reduce(
      (sum, r) => sum + parseFloat(r.pendingRewards), 
      0
    ).toFixed(6);

    const totalEarned = rewards.reduce(
      (sum, r) => sum + parseFloat(r.totalEarned), 
      0
    ).toFixed(6);

    return res.status(200).json({
      success: true,
      data: {
        rewards,
        totalPending,
        totalEarned,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch rewards',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/staking/rewards/claim
 * Claim staking rewards for a narrative
 */
router.post('/rewards/claim', authenticate, async (req: any, res) => {
  try {
    const { narrativeId } = req.body;

    if (!narrativeId) {
      return res.status(400).json({
        error: 'Narrative ID is required',
        timestamp: new Date().toISOString(),
      });
    }

    const claimedAmount = await stakingService.claimRewards(
      parseInt(narrativeId),
      req.user.walletAddress
    );

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: parseInt(narrativeId),
        claimedAmount,
        timestamp: new Date(),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to claim rewards',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/staking/stats
 * Get overall staking statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await stakingService.getStakingStatistics();

    return res.status(200).json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch staking stats',
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/staking/narrative/:narrativeId/stats
 * Get staking stats for a specific narrative
 */
router.get('/narrative/:narrativeId/stats', async (req, res) => {
  try {
    const { narrativeId } = req.params;
    
    const totalStaked = await stakingService.getNarrativeTotalStake(parseInt(narrativeId));
    const apy = await stakingService.calculateNarrativeAPY(parseInt(narrativeId));

    return res.status(200).json({
      success: true,
      data: {
        narrativeId: parseInt(narrativeId),
        totalStaked,
        apy,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch narrative staking stats',
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
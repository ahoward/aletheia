/**
 * T051: Implement StakingService
 * 
 * Service for managing narrative staking operations
 */

import { NarrativeContracts } from '../lib/narrative-contracts';
import { MarketDataEngine, StakingActivity } from '../lib/market-data';
import { ethers } from 'ethers';

export interface StakeRequest {
  narrativeId: number;
  amount: string;
  stakerAddress: string;
  signature: string;
}

export interface UnstakeRequest {
  narrativeId: number;
  amount: string;
  stakerAddress: string;
  signature: string;
}

export interface StakePosition {
  narrativeId: number;
  stakerAddress: string;
  totalStaked: string;
  stakingHistory: StakingActivity[];
  averageStakeTime: number;
  projectedRewards: string;
  currentValue: string;
}

export interface StakingRewards {
  narrativeId: number;
  stakerAddress: string;
  totalEarned: string;
  pendingRewards: string;
  lastClaimedAt: Date;
  nextClaimableAt: Date;
}

export class StakingService {
  private contractsEngine?: NarrativeContracts;
  private marketEngine: MarketDataEngine;
  private stakePositions: Map<string, StakePosition> = new Map();
  private stakingRewards: Map<string, StakingRewards> = new Map();

  constructor() {
    this.marketEngine = new MarketDataEngine();
    this.initializeContracts();
  }

  /**
   * Initialize blockchain contracts
   */
  private initializeContracts(): void {
    if (process.env.ETHEREUM_RPC_URL && process.env.NARR_TOKEN_ADDRESS && process.env.NARRATIVE_NFT_ADDRESS) {
      this.contractsEngine = new NarrativeContracts({
        narrTokenAddress: process.env.NARR_TOKEN_ADDRESS,
        narrativeNftAddress: process.env.NARRATIVE_NFT_ADDRESS,
        providerUrl: process.env.ETHEREUM_RPC_URL,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      });
    }
  }

  /**
   * Stake tokens on a narrative
   */
  async stakeOnNarrative(request: StakeRequest): Promise<StakingActivity> {
    this.validateStakeRequest(request);

    // In production, this would interact with smart contracts
    // For now, simulate the staking operation
    const activity: StakingActivity = {
      timestamp: new Date(),
      narrativeId: request.narrativeId,
      amount: request.amount,
      action: 'stake',
      staker: request.stakerAddress,
    };

    // Update market data
    this.marketEngine.addActivity(activity);

    // Update or create stake position
    await this.updateStakePosition(request.narrativeId, request.stakerAddress, request.amount, 'stake');

    // Calculate rewards
    await this.updateStakingRewards(request.narrativeId, request.stakerAddress);

    return activity;
  }

  /**
   * Unstake tokens from a narrative
   */
  async unstakeFromNarrative(request: UnstakeRequest): Promise<StakingActivity> {
    this.validateUnstakeRequest(request);

    // Check if user has enough staked
    const position = await this.getStakePosition(request.narrativeId, request.stakerAddress);
    if (!position || parseFloat(position.totalStaked) < parseFloat(request.amount)) {
      throw new Error('Insufficient staked amount');
    }

    const activity: StakingActivity = {
      timestamp: new Date(),
      narrativeId: request.narrativeId,
      amount: request.amount,
      action: 'unstake',
      staker: request.stakerAddress,
    };

    // Update market data
    this.marketEngine.addActivity(activity);

    // Update stake position
    await this.updateStakePosition(request.narrativeId, request.stakerAddress, request.amount, 'unstake');

    // Update rewards
    await this.updateStakingRewards(request.narrativeId, request.stakerAddress);

    return activity;
  }

  /**
   * Get stake position for a user on a narrative
   */
  async getStakePosition(narrativeId: number, stakerAddress: string): Promise<StakePosition | null> {
    const positionKey = this.getPositionKey(narrativeId, stakerAddress);
    return this.stakePositions.get(positionKey) || null;
  }

  /**
   * Get all stake positions for a user
   */
  async getUserStakePositions(stakerAddress: string): Promise<StakePosition[]> {
    const positions: StakePosition[] = [];
    
    for (const [key, position] of this.stakePositions.entries()) {
      if (position.stakerAddress.toLowerCase() === stakerAddress.toLowerCase()) {
        positions.push(position);
      }
    }

    return positions.sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked));
  }

  /**
   * Get total staked amount for a narrative
   */
  async getNarrativeTotalStake(narrativeId: number): Promise<string> {
    let totalStaked = 0;

    for (const position of this.stakePositions.values()) {
      if (position.narrativeId === narrativeId) {
        totalStaked += parseFloat(position.totalStaked);
      }
    }

    return totalStaked.toFixed(4);
  }

  /**
   * Get staking rewards for a user on a narrative
   */
  async getStakingRewards(narrativeId: number, stakerAddress: string): Promise<StakingRewards | null> {
    const rewardKey = this.getPositionKey(narrativeId, stakerAddress);
    return this.stakingRewards.get(rewardKey) || null;
  }

  /**
   * Claim staking rewards
   */
  async claimRewards(narrativeId: number, stakerAddress: string): Promise<string> {
    const rewards = await this.getStakingRewards(narrativeId, stakerAddress);
    
    if (!rewards) {
      throw new Error('No rewards found for this position');
    }

    if (parseFloat(rewards.pendingRewards) === 0) {
      throw new Error('No pending rewards to claim');
    }

    const claimedAmount = rewards.pendingRewards;
    
    // Update rewards record
    rewards.totalEarned = (parseFloat(rewards.totalEarned) + parseFloat(claimedAmount)).toFixed(4);
    rewards.pendingRewards = '0';
    rewards.lastClaimedAt = new Date();
    rewards.nextClaimableAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const rewardKey = this.getPositionKey(narrativeId, stakerAddress);
    this.stakingRewards.set(rewardKey, rewards);

    return claimedAmount;
  }

  /**
   * Calculate APY for a narrative based on staking activity
   */
  async calculateNarrativeAPY(narrativeId: number): Promise<number> {
    const activities = this.marketEngine.getNarrativeActivity(narrativeId, 168); // 7 days
    
    if (activities.length === 0) {
      return 0;
    }

    const totalStaked = await this.getNarrativeTotalStake(narrativeId);
    if (parseFloat(totalStaked) === 0) {
      return 0;
    }

    // Mock APY calculation based on activity and total staked
    // In production, this would use actual reward distribution mechanics
    const activityScore = activities.length * 0.1;
    const stakingVelocity = this.marketEngine.calculateStakingVelocity(narrativeId, 168);
    
    const baseAPY = 5; // 5% base APY
    const activityBonus = Math.min(10, activityScore); // Max 10% bonus
    const velocityBonus = Math.min(5, stakingVelocity / 1000); // Max 5% bonus
    
    return baseAPY + activityBonus + velocityBonus;
  }

  /**
   * Get staking statistics for all narratives
   */
  async getStakingStatistics(): Promise<{
    totalValueLocked: string;
    activeStakers: number;
    averageAPY: number;
    topStakedNarratives: Array<{ narrativeId: number; totalStaked: string; apy: number }>;
  }> {
    const marketMetrics = this.marketEngine.calculateMarketMetrics();
    
    // Calculate average APY
    const narrativeIds = Array.from(new Set(
      Array.from(this.stakePositions.values()).map(p => p.narrativeId)
    ));
    
    let totalAPY = 0;
    const topStakedNarratives: Array<{ narrativeId: number; totalStaked: string; apy: number }> = [];
    
    for (const narrativeId of narrativeIds) {
      const totalStaked = await this.getNarrativeTotalStake(narrativeId);
      const apy = await this.calculateNarrativeAPY(narrativeId);
      
      totalAPY += apy;
      topStakedNarratives.push({ narrativeId, totalStaked, apy });
    }

    const averageAPY = narrativeIds.length > 0 ? totalAPY / narrativeIds.length : 0;
    
    // Sort by total staked
    topStakedNarratives.sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked));

    return {
      totalValueLocked: marketMetrics.totalValueLocked,
      activeStakers: marketMetrics.activeStakers,
      averageAPY,
      topStakedNarratives: topStakedNarratives.slice(0, 10),
    };
  }

  /**
   * Validate stake request
   */
  private validateStakeRequest(request: StakeRequest): void {
    if (!ethers.isAddress(request.stakerAddress)) {
      throw new Error('Invalid staker address');
    }

    if (parseFloat(request.amount) <= 0) {
      throw new Error('Stake amount must be positive');
    }

    if (request.narrativeId < 0) {
      throw new Error('Invalid narrative ID');
    }
  }

  /**
   * Validate unstake request
   */
  private validateUnstakeRequest(request: UnstakeRequest): void {
    if (!ethers.isAddress(request.stakerAddress)) {
      throw new Error('Invalid staker address');
    }

    if (parseFloat(request.amount) <= 0) {
      throw new Error('Unstake amount must be positive');
    }

    if (request.narrativeId < 0) {
      throw new Error('Invalid narrative ID');
    }
  }

  /**
   * Update stake position for a user
   */
  private async updateStakePosition(
    narrativeId: number,
    stakerAddress: string,
    amount: string,
    action: 'stake' | 'unstake'
  ): Promise<void> {
    const positionKey = this.getPositionKey(narrativeId, stakerAddress);
    let position = this.stakePositions.get(positionKey);

    if (!position) {
      position = {
        narrativeId,
        stakerAddress,
        totalStaked: '0',
        stakingHistory: [],
        averageStakeTime: 0,
        projectedRewards: '0',
        currentValue: '0',
      };
    }

    // Update total staked amount
    const currentStaked = parseFloat(position.totalStaked);
    const amountNum = parseFloat(amount);

    if (action === 'stake') {
      position.totalStaked = (currentStaked + amountNum).toFixed(4);
    } else {
      position.totalStaked = Math.max(0, currentStaked - amountNum).toFixed(4);
    }

    // Add to history
    const activity: StakingActivity = {
      timestamp: new Date(),
      narrativeId,
      amount,
      action,
      staker: stakerAddress,
    };
    
    position.stakingHistory.push(activity);

    // Update current value (same as total staked for now)
    position.currentValue = position.totalStaked;

    // Calculate projected rewards (mock calculation)
    const apy = await this.calculateNarrativeAPY(narrativeId);
    const projectedAnnual = (parseFloat(position.totalStaked) * apy) / 100;
    position.projectedRewards = (projectedAnnual / 365).toFixed(4); // Daily projected

    this.stakePositions.set(positionKey, position);
  }

  /**
   * Update staking rewards for a position
   */
  private async updateStakingRewards(narrativeId: number, stakerAddress: string): Promise<void> {
    const rewardKey = this.getPositionKey(narrativeId, stakerAddress);
    let rewards = this.stakingRewards.get(rewardKey);

    if (!rewards) {
      rewards = {
        narrativeId,
        stakerAddress,
        totalEarned: '0',
        pendingRewards: '0',
        lastClaimedAt: new Date(0),
        nextClaimableAt: new Date(),
      };
    }

    // Calculate pending rewards based on time and stake amount
    const position = await this.getStakePosition(narrativeId, stakerAddress);
    if (!position) return;

    const hoursStaked = this.calculateHoursStaked(position.stakingHistory);
    const apy = await this.calculateNarrativeAPY(narrativeId);
    
    const hourlyRewardRate = (apy / 100) / (365 * 24); // APY to hourly rate
    const newRewards = parseFloat(position.totalStaked) * hourlyRewardRate * hoursStaked;
    
    rewards.pendingRewards = (parseFloat(rewards.pendingRewards) + newRewards).toFixed(6);

    this.stakingRewards.set(rewardKey, rewards);
  }

  /**
   * Calculate hours staked since last reward calculation
   */
  private calculateHoursStaked(history: StakingActivity[]): number {
    if (history.length === 0) return 0;
    
    const lastActivity = history[history.length - 1];
    const hoursAgo = (Date.now() - lastActivity.timestamp.getTime()) / (1000 * 60 * 60);
    
    return Math.min(24, hoursAgo); // Cap at 24 hours for this calculation
  }

  /**
   * Generate position key for storage
   */
  private getPositionKey(narrativeId: number, stakerAddress: string): string {
    return `${narrativeId}_${stakerAddress.toLowerCase()}`;
  }

  /**
   * Clear all staking data (for testing)
   */
  async clearAll(): Promise<void> {
    this.stakePositions.clear();
    this.stakingRewards.clear();
    this.marketEngine.reset();
  }
}

export default StakingService;
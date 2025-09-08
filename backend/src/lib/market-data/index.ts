/**
 * T046: Create market-data library with CLI
 * 
 * Market data analysis and trending narratives library
 */

export interface MarketMetrics {
  totalValueLocked: string;
  totalNarratives: number;
  activeStakers: number;
  averageStakeSize: string;
  topNarrativesByStake: NarrativeMetric[];
  stakingVolume24h: string;
  priceChange24h: string;
}

export interface NarrativeMetric {
  tokenId: number;
  name: string;
  totalStaked: string;
  uniqueStakers: number;
  stakingVelocity: number;
  trendingScore: number;
  category: string;
  createdAt: Date;
}

export interface TrendingData {
  narrative: NarrativeMetric;
  momentum: number;
  percentageChange: number;
  timeframe: string;
}

export interface StakingActivity {
  timestamp: Date;
  narrativeId: number;
  amount: string;
  action: 'stake' | 'unstake';
  staker: string;
}

export class MarketDataEngine {
  private activities: StakingActivity[] = [];
  private narrativeMetrics: Map<number, NarrativeMetric> = new Map();

  constructor() {}

  /**
   * Add staking activity to the dataset
   */
  addActivity(activity: StakingActivity): void {
    this.activities.push(activity);
    this.updateNarrativeMetric(activity);
  }

  /**
   * Calculate overall market metrics
   */
  calculateMarketMetrics(): MarketMetrics {
    const narratives = Array.from(this.narrativeMetrics.values());
    
    const totalValueLocked = narratives
      .reduce((sum, n) => sum + parseFloat(n.totalStaked), 0)
      .toFixed(4);

    const activeStakers = new Set(
      this.activities
        .filter(a => this.isRecent(a.timestamp, 24))
        .map(a => a.staker)
    ).size;

    const averageStakeSize = narratives.length > 0
      ? (parseFloat(totalValueLocked) / narratives.length).toFixed(4)
      : '0';

    const stakingVolume24h = this.activities
      .filter(a => this.isRecent(a.timestamp, 24) && a.action === 'stake')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0)
      .toFixed(4);

    const topNarrativesByStake = narratives
      .sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked))
      .slice(0, 10);

    return {
      totalValueLocked,
      totalNarratives: narratives.length,
      activeStakers,
      averageStakeSize,
      topNarrativesByStake,
      stakingVolume24h,
      priceChange24h: this.calculatePriceChange24h(),
    };
  }

  /**
   * Get trending narratives based on momentum
   */
  getTrendingNarratives(limit: number = 20): TrendingData[] {
    const narratives = Array.from(this.narrativeMetrics.values());
    
    return narratives
      .map(narrative => {
        const momentum = this.calculateMomentum(narrative.tokenId);
        const percentageChange = this.calculatePercentageChange(narrative.tokenId, 24);
        
        return {
          narrative,
          momentum,
          percentageChange,
          timeframe: '24h',
        };
      })
      .sort((a, b) => b.momentum - a.momentum)
      .slice(0, limit);
  }

  /**
   * Calculate staking velocity for a narrative
   */
  calculateStakingVelocity(narrativeId: number, hoursBack: number = 24): number {
    const recentActivities = this.activities.filter(
      a => a.narrativeId === narrativeId && this.isRecent(a.timestamp, hoursBack)
    );

    const stakeVolume = recentActivities
      .filter(a => a.action === 'stake')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);

    const unstakeVolume = recentActivities
      .filter(a => a.action === 'unstake')
      .reduce((sum, a) => sum + parseFloat(a.amount), 0);

    return stakeVolume + unstakeVolume;
  }

  /**
   * Get activity timeline for a narrative
   */
  getNarrativeActivity(narrativeId: number, hoursBack: number = 168): StakingActivity[] {
    return this.activities
      .filter(a => a.narrativeId === narrativeId && this.isRecent(a.timestamp, hoursBack))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Calculate trending score based on multiple factors
   */
  calculateTrendingScore(narrativeId: number): number {
    const metric = this.narrativeMetrics.get(narrativeId);
    if (!metric) return 0;

    const velocity = this.calculateStakingVelocity(narrativeId);
    const momentum = this.calculateMomentum(narrativeId);
    const recency = this.calculateRecencyScore(metric.createdAt);
    const stakingDiversity = this.calculateStakingDiversity(narrativeId);

    // Weighted combination of factors
    return (
      velocity * 0.3 +
      momentum * 0.3 +
      recency * 0.2 +
      stakingDiversity * 0.2
    );
  }

  /**
   * Get market sentiment indicators
   */
  getMarketSentiment(): {
    bullishNarratives: number;
    bearishNarratives: number;
    neutralNarratives: number;
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
  } {
    const narratives = Array.from(this.narrativeMetrics.values());
    let bullish = 0;
    let bearish = 0;
    let neutral = 0;

    narratives.forEach(narrative => {
      const change = this.calculatePercentageChange(narrative.tokenId, 24);
      if (change > 5) bullish++;
      else if (change < -5) bearish++;
      else neutral++;
    });

    const overallSentiment = bullish > bearish 
      ? (bullish > neutral ? 'bullish' : 'neutral')
      : (bearish > neutral ? 'bearish' : 'neutral');

    return {
      bullishNarratives: bullish,
      bearishNarratives: bearish,
      neutralNarratives: neutral,
      overallSentiment,
    };
  }

  /**
   * Update narrative metric based on activity
   */
  private updateNarrativeMetric(activity: StakingActivity): void {
    const existing = this.narrativeMetrics.get(activity.narrativeId);
    
    if (!existing) {
      // Create new metric entry
      this.narrativeMetrics.set(activity.narrativeId, {
        tokenId: activity.narrativeId,
        name: `Narrative #${activity.narrativeId}`,
        totalStaked: activity.action === 'stake' ? activity.amount : '0',
        uniqueStakers: 1,
        stakingVelocity: 0,
        trendingScore: 0,
        category: 'General',
        createdAt: activity.timestamp,
      });
    } else {
      // Update existing metric
      const currentStaked = parseFloat(existing.totalStaked);
      const activityAmount = parseFloat(activity.amount);
      
      existing.totalStaked = (
        activity.action === 'stake' 
          ? currentStaked + activityAmount
          : Math.max(0, currentStaked - activityAmount)
      ).toFixed(4);

      // Update unique stakers count
      const uniqueStakers = new Set(
        this.activities
          .filter(a => a.narrativeId === activity.narrativeId)
          .map(a => a.staker)
      ).size;
      existing.uniqueStakers = uniqueStakers;

      // Update trending score
      existing.trendingScore = this.calculateTrendingScore(activity.narrativeId);
    }
  }

  /**
   * Calculate momentum based on recent activity
   */
  private calculateMomentum(narrativeId: number): number {
    const recent4h = this.calculateStakingVelocity(narrativeId, 4);
    const recent24h = this.calculateStakingVelocity(narrativeId, 24);
    
    if (recent24h === 0) return 0;
    return (recent4h * 6) / recent24h; // Normalize 4h to 24h equivalent
  }

  /**
   * Calculate percentage change in staking over time period
   */
  private calculatePercentageChange(narrativeId: number, hoursBack: number): number {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    
    const beforeActivities = this.activities.filter(
      a => a.narrativeId === narrativeId && a.timestamp < cutoff
    );
    
    const afterActivities = this.activities.filter(
      a => a.narrativeId === narrativeId && a.timestamp >= cutoff
    );

    const beforeStake = beforeActivities
      .reduce((sum, a) => sum + (a.action === 'stake' ? parseFloat(a.amount) : -parseFloat(a.amount)), 0);
    
    const afterStake = afterActivities
      .reduce((sum, a) => sum + (a.action === 'stake' ? parseFloat(a.amount) : -parseFloat(a.amount)), 0);

    if (beforeStake === 0) return afterStake > 0 ? 100 : 0;
    return ((afterStake - beforeStake) / beforeStake) * 100;
  }

  /**
   * Calculate price change over 24h (mock implementation)
   */
  private calculatePriceChange24h(): string {
    // Mock price change calculation
    const activities24h = this.activities.filter(a => this.isRecent(a.timestamp, 24));
    const buyPressure = activities24h.filter(a => a.action === 'stake').length;
    const sellPressure = activities24h.filter(a => a.action === 'unstake').length;
    
    const netPressure = buyPressure - sellPressure;
    const changePercent = (netPressure / Math.max(1, activities24h.length)) * 10;
    
    return changePercent.toFixed(2);
  }

  /**
   * Calculate recency score (newer narratives get higher scores)
   */
  private calculateRecencyScore(createdAt: Date): number {
    const hoursOld = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 100 - hoursOld); // Score decreases with age
  }

  /**
   * Calculate staking diversity (more unique stakers = higher score)
   */
  private calculateStakingDiversity(narrativeId: number): number {
    const metric = this.narrativeMetrics.get(narrativeId);
    if (!metric) return 0;
    
    return Math.min(100, metric.uniqueStakers * 2); // Cap at 100
  }

  /**
   * Check if timestamp is within specified hours
   */
  private isRecent(timestamp: Date, hoursBack: number): boolean {
    const cutoff = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return timestamp >= cutoff;
  }

  /**
   * Get raw activities data (for debugging/analysis)
   */
  getRawActivities(): StakingActivity[] {
    return [...this.activities];
  }

  /**
   * Clear all data
   */
  reset(): void {
    this.activities = [];
    this.narrativeMetrics.clear();
  }
}

export default MarketDataEngine;
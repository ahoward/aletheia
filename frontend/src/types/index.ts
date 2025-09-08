/**
 * Frontend TypeScript types for Aletheia
 * These match the backend interfaces
 */

export enum Modality {
  TEXT = 'text',
  IMAGE = 'image', 
  VIDEO = 'video',
  AUDIO = 'audio',
  MIXED = 'mixed',
}

export enum NarrativeStatus {
  ACTIVE = 'active',
  FLAGGED = 'flagged',
  ARCHIVED = 'archived',
}

export enum UserRole {
  BASIC = 'basic',
  VALIDATOR = 'validator',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: string;
  lastActivity: string;
  displayName: string;
}

export interface NarrativeNFT {
  id: string;
  tokenId: number;
  contractAddress: string;
  creator: string;
  creatorDisplayName: string;
  name: string;
  description: string;
  tags: string[];
  tagCategories: Record<string, string[]>;
  modality: Modality;
  metadataUri: string;
  totalStaked: string;
  uniqueStakers: number;
  createdAt: string;
  lastActivity: string;
  status: NarrativeStatus;
  isActive: boolean;
}

export interface StakePosition {
  narrativeId: number;
  totalStaked: string;
  currentValue: string;
  projectedRewards: string;
  averageStakeTime: number;
  stakingHistory: StakingActivity[];
}

export interface StakingActivity {
  timestamp: string;
  narrativeId: number;
  amount: string;
  action: 'stake' | 'unstake';
  staker: string;
}

export interface StakingRewards {
  narrativeId: number;
  totalEarned: string;
  pendingRewards: string;
  lastClaimedAt: string;
  nextClaimableAt: string;
}

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
  createdAt: string;
}

export interface TrendingData {
  narrative: NarrativeMetric;
  momentum: number;
  percentageChange: number;
  timeframe: string;
}

export interface AuthToken {
  token: string;
  user: User;
  expiresAt: string;
}

export interface WalletAuthChallenge {
  address: string;
  message: string;
  nonce: string;
  expiresAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Form types
export interface CreateNarrativeForm {
  name: string;
  description: string;
  content: string;
  tags: string[];
  modality: Modality;
}

export interface StakeForm {
  narrativeId: number;
  amount: string;
}

export interface SimilaritySearchForm {
  text: string;
  threshold?: number;
  limit?: number;
}

// Wallet types
export interface WalletConnection {
  address: string;
  chainId: number;
  isConnected: boolean;
  provider?: any;
}

// Chart data types for visualization
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'scatter' | 'area';
}

export interface NetworkNode {
  id: string;
  label: string;
  value: number;
  group?: string;
  x?: number;
  y?: number;
}

export interface NetworkEdge {
  source: string;
  target: string;
  weight: number;
  label?: string;
  type?: 'similarity' | 'stake' | 'reference';
}
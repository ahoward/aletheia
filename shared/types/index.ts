// Core entity types based on data-model.md

export interface User {
  walletAddress: string;
  ens?: string | null;
  role: UserRole[];
  reputation?: number | null;
  createdAt: Date;
  lastActive: Date;
  settings?: Record<string, any>;
}

export interface NarrativeNFT {
  tokenId: number;
  contractAddress: string;
  creator: string;
  name: string;
  description: string;
  tags: string[];
  modality: Modality;
  embedding: number[]; // 768-dimensional vector
  metadataUri: string;
  totalStaked: string; // decimal as string
  uniqueStakers: number;
  createdAt: Date;
  lastActivity: Date;
  status: NarrativeStatus;
}

export interface StakingPosition {
  id: string;
  userId: string;
  narrativeId: number;
  amount: string; // decimal as string
  lockupPeriod: number; // days
  stakedAt: Date;
  unlocksAt: Date;
  unstaked: boolean;
  unstakedAt?: Date | null;
  returns: string; // decimal as string
  transactionHash: string;
}

export interface Validator {
  uid: number;
  walletAddress: string;
  consensusWeight: number;
  reputationScore: number;
  totalValidations: number;
  successfulValidations: number;
  oracleEndpoint?: string | null;
  isActive: boolean;
  lastValidation: Date;
  registeredAt: Date;
}

export interface Miner {
  uid: number;
  walletAddress: string;
  specialization: Modality;
  performanceScore: number;
  totalGenerated: number;
  successfulDisseminations: number;
  rewardsEarned: string; // decimal as string
  isActive: boolean;
  lastActivity: Date;
  registeredAt: Date;
}

export interface FulfillmentActivity {
  id: string;
  narrativeId: number;
  minerId: number;
  contentHash: string;
  contentType: Modality;
  coherenceScore: number;
  demandScore: number;
  semanticSimilarity: number;
  generatedAt: Date;
  validatedAt: Date;
  validatorId: number;
}

export interface DisseminationProof {
  id: string;
  fulfillmentId: string;
  minerId: number;
  targetUrl: string;
  domainAuthority: number;
  disseminationScore: number;
  verified: boolean;
  verifiedAt: Date;
  duration: number; // hours
  transactionHash: string;
}

export interface MarketMetrics {
  timestamp: Date;
  narrativeId: number;
  totalStaked: number;
  stakeDelta: number;
  activeStakers: number;
  fulfillmentCount: number;
  disseminationCount: number;
  averageCoherence: number;
  averageDemand: number;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: string; // decimal as string
  tokenSymbol: string;
  narrativeId?: number | null;
  transactionHash: string;
  blockNumber: number;
  status: TransactionStatus;
  createdAt: Date;
  confirmedAt?: Date | null;
}

// Enums and utility types

export type UserRole = 'underwriter' | 'validator' | 'miner' | 'observer';

export type Modality = 'text' | 'image' | 'video' | 'multimodal';

export type NarrativeStatus = 'active' | 'paused' | 'archived';

export type TransactionType = 'stake' | 'unstake' | 'mint' | 'reward';

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

// API response types

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresAt: string;
}

// Semantic analysis types

export interface SemanticCluster {
  id: string;
  centroid: number[];
  narrativeCount: number;
  totalStaked: string;
  dominantTags: string[];
}

export interface SemanticPoint {
  narrativeId: number;
  coordinates: number[];
  stakeSize: number;
}

// Dashboard types

export interface ValidatorDashboard {
  networkHealth: {
    activeValidators: number;
    consensusRate: number;
    averageReputationScore: number;
  };
  consensusAlignment: number;
  reputationScore: number;
  oracleCosts: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  recentValidations: ValidationActivity[];
}

export interface ValidationActivity {
  id: string;
  narrativeId: number;
  narrativeName: string;
  timestamp: Date;
  coherenceScore: number;
  demandScore: number;
  consensusMatch: boolean;
}

export interface Bounty {
  narrative: NarrativeNFT;
  potentialReward: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  competitors: number;
  deadline?: Date;
}

export interface MarketOverview {
  totalNarratives: number;
  totalStaked: string;
  activeUsers: number;
  topNarratives: NarrativeNFT[];
  recentActivity: ActivityFeed[];
}

export interface ActivityFeed {
  id: string;
  type: 'stake' | 'unstake' | 'mint' | 'fulfillment' | 'dissemination';
  timestamp: Date;
  userId: string;
  narrativeId?: number;
  amount?: string;
  details: Record<string, any>;
}

// WebSocket message types

export interface WSMessage {
  type: WSMessageType;
  payload: any;
  timestamp: Date;
}

export type WSMessageType = 
  | 'market_update'
  | 'narrative_update' 
  | 'staking_update'
  | 'validator_update'
  | 'miner_update'
  | 'new_activity';

// Form types for frontend

export interface CreateNarrativeForm {
  name: string;
  description: string;
  tags: string[];
  modality: Modality;
}

export interface StakeForm {
  amount: string;
  lockupDays: number;
}

export interface AuthForm {
  address: string;
  signature: string;
  message: string;
}
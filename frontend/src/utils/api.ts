/**
 * API client utilities for Aletheia frontend
 */

import axios, { AxiosResponse } from 'axios';
import {
  ApiResponse,
  PaginatedResponse,
  NarrativeNFT,
  StakePosition,
  StakingRewards,
  MarketMetrics,
  TrendingData,
  AuthToken,
  WalletAuthChallenge,
  CreateNarrativeForm,
  StakeForm,
  SimilaritySearchForm,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token management
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  // Store in localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('aletheia_auth_token', token);
  }
};

export const clearAuthToken = () => {
  authToken = null;
  delete api.defaults.headers.common['Authorization'];
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aletheia_auth_token');
  }
};

export const getStoredAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('aletheia_auth_token');
  }
  return null;
};

// Initialize auth token from localStorage
if (typeof window !== 'undefined') {
  const storedToken = getStoredAuthToken();
  if (storedToken) {
    setAuthToken(storedToken);
  }
}

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      // Redirect to auth page or show login modal
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  generateChallenge: async (walletAddress: string): Promise<WalletAuthChallenge> => {
    const response = await api.post<ApiResponse<WalletAuthChallenge>>('/v1/auth/challenge', {
      walletAddress,
    });
    return response.data.data;
  },

  connect: async (address: string, signature: string, message: string): Promise<AuthToken> => {
    const response = await api.post<ApiResponse<AuthToken>>('/v1/auth/connect', {
      address,
      signature,
      message,
    });
    return response.data.data;
  },

  verify: async (): Promise<{ user: any; valid: boolean }> => {
    const response = await api.post<ApiResponse<{ user: any; valid: boolean }>>('/v1/auth/verify');
    return response.data.data;
  },

  refresh: async (): Promise<AuthToken> => {
    const response = await api.post<ApiResponse<AuthToken>>('/v1/auth/refresh');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/v1/auth/logout');
    clearAuthToken();
  },
};

// Narratives API
export const narrativesApi = {
  list: async (params?: {
    limit?: number;
    offset?: number;
    tags?: string[];
    modality?: string;
    status?: string;
    creatorAddress?: string;
  }): Promise<PaginatedResponse<NarrativeNFT>> => {
    const response = await api.get<ApiResponse<PaginatedResponse<NarrativeNFT>>>('/v1/narratives', {
      params,
    });
    return response.data.data;
  },

  get: async (id: string): Promise<NarrativeNFT> => {
    const response = await api.get<ApiResponse<NarrativeNFT>>(`/v1/narratives/${id}`);
    return response.data.data;
  },

  create: async (narrative: CreateNarrativeForm): Promise<NarrativeNFT> => {
    const response = await api.post<ApiResponse<NarrativeNFT>>('/v1/narratives', narrative);
    return response.data.data;
  },

  findSimilar: async (search: SimilaritySearchForm): Promise<NarrativeNFT[]> => {
    const response = await api.post<ApiResponse<NarrativeNFT[]>>('/v1/semantic/similar', search);
    return response.data.data;
  },

  getTrending: async (limit?: number): Promise<NarrativeNFT[]> => {
    const response = await api.get<ApiResponse<NarrativeNFT[]>>('/v1/narratives/trending', {
      params: { limit },
    });
    return response.data.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/v1/narratives/stats');
    return response.data.data;
  },
};

// Staking API
export const stakingApi = {
  stake: async (stakeData: StakeForm & { signature: string }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/v1/staking/stake', stakeData);
    return response.data.data;
  },

  unstake: async (unstakeData: { narrativeId: number; amount: string; signature: string }): Promise<any> => {
    const response = await api.post<ApiResponse<any>>('/v1/staking/unstake', unstakeData);
    return response.data.data;
  },

  getPositions: async (): Promise<StakePosition[]> => {
    const response = await api.get<ApiResponse<{ positions: StakePosition[] }>>('/v1/staking/positions');
    return response.data.data.positions;
  },

  getPosition: async (narrativeId: number): Promise<StakePosition> => {
    const response = await api.get<ApiResponse<StakePosition>>(`/v1/staking/positions/${narrativeId}`);
    return response.data.data;
  },

  getRewards: async (): Promise<{ rewards: StakingRewards[]; totalPending: string; totalEarned: string }> => {
    const response = await api.get<ApiResponse<any>>('/v1/staking/rewards');
    return response.data.data;
  },

  claimRewards: async (narrativeId: number): Promise<{ claimedAmount: string }> => {
    const response = await api.post<ApiResponse<any>>('/v1/staking/rewards/claim', { narrativeId });
    return response.data.data;
  },

  getStats: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/v1/staking/stats');
    return response.data.data;
  },

  getNarrativeStats: async (narrativeId: number): Promise<{ totalStaked: string; apy: number }> => {
    const response = await api.get<ApiResponse<any>>(`/v1/staking/narrative/${narrativeId}/stats`);
    return response.data.data;
  },
};

// Market API
export const marketApi = {
  getMetrics: async (): Promise<MarketMetrics> => {
    const response = await api.get<ApiResponse<MarketMetrics>>('/v1/market/metrics');
    return response.data.data;
  },

  getTrending: async (limit?: number): Promise<TrendingData[]> => {
    const response = await api.get<ApiResponse<{ trending: TrendingData[] }>>('/v1/market/trending', {
      params: { limit },
    });
    return response.data.data.trending;
  },

  getSentiment: async (): Promise<any> => {
    const response = await api.get<ApiResponse<any>>('/v1/market/sentiment');
    return response.data.data;
  },

  getActivity: async (narrativeId: number, hoursBack?: number): Promise<any> => {
    const response = await api.get<ApiResponse<any>>(`/v1/market/activity/${narrativeId}`, {
      params: { hoursBack },
    });
    return response.data.data;
  },

  getVelocity: async (narrativeId: number, hoursBack?: number): Promise<{ velocity: number }> => {
    const response = await api.get<ApiResponse<any>>(`/v1/market/velocity/${narrativeId}`, {
      params: { hoursBack },
    });
    return response.data.data;
  },

  getTrendingScore: async (narrativeId: number): Promise<{ trendingScore: number }> => {
    const response = await api.get<ApiResponse<any>>(`/v1/market/score/${narrativeId}`);
    return response.data.data;
  },

  getChartData: async (type: string, data: any): Promise<any> => {
    const response = await api.post<ApiResponse<any>>(`/v1/market/chart/${type}`, data);
    return response.data.data;
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<any> => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
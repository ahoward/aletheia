/**
 * Zustand state management for Aletheia frontend
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  User,
  NarrativeNFT,
  StakePosition,
  MarketMetrics,
  WalletConnection,
  TrendingData,
} from '@/types';

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      setToken: (token) =>
        set({
          token,
        }),
      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'aletheia-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Wallet Store
interface WalletState {
  connection: WalletConnection | null;
  isConnecting: boolean;
  error: string | null;
  setConnection: (connection: WalletConnection | null) => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connection: null,
  isConnecting: false,
  error: null,
  setConnection: (connection) =>
    set({
      connection,
      error: null,
    }),
  setConnecting: (isConnecting) =>
    set({
      isConnecting,
    }),
  setError: (error) =>
    set({
      error,
      isConnecting: false,
    }),
  disconnect: () =>
    set({
      connection: null,
      error: null,
    }),
}));

// Narratives Store
interface NarrativesState {
  narratives: NarrativeNFT[];
  trending: NarrativeNFT[];
  currentNarrative: NarrativeNFT | null;
  isLoading: boolean;
  error: string | null;
  searchResults: NarrativeNFT[];
  searchLoading: boolean;
  setNarratives: (narratives: NarrativeNFT[]) => void;
  setTrending: (trending: NarrativeNFT[]) => void;
  setCurrentNarrative: (narrative: NarrativeNFT | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchResults: (results: NarrativeNFT[]) => void;
  setSearchLoading: (loading: boolean) => void;
  addNarrative: (narrative: NarrativeNFT) => void;
  updateNarrative: (id: string, updates: Partial<NarrativeNFT>) => void;
}

export const useNarrativesStore = create<NarrativesState>((set) => ({
  narratives: [],
  trending: [],
  currentNarrative: null,
  isLoading: false,
  error: null,
  searchResults: [],
  searchLoading: false,
  setNarratives: (narratives) =>
    set({
      narratives,
      error: null,
    }),
  setTrending: (trending) =>
    set({
      trending,
    }),
  setCurrentNarrative: (currentNarrative) =>
    set({
      currentNarrative,
    }),
  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),
  setSearchResults: (searchResults) =>
    set({
      searchResults,
      searchLoading: false,
    }),
  setSearchLoading: (searchLoading) =>
    set({
      searchLoading,
    }),
  addNarrative: (narrative) =>
    set((state) => ({
      narratives: [narrative, ...state.narratives],
    })),
  updateNarrative: (id, updates) =>
    set((state) => ({
      narratives: state.narratives.map((n) =>
        n.id === id ? { ...n, ...updates } : n
      ),
      currentNarrative:
        state.currentNarrative?.id === id
          ? { ...state.currentNarrative, ...updates }
          : state.currentNarrative,
    })),
}));

// Staking Store
interface StakingState {
  positions: StakePosition[];
  totalValue: string;
  totalRewards: string;
  pendingRewards: string;
  isLoading: boolean;
  error: string | null;
  setPositions: (positions: StakePosition[]) => void;
  setTotalValue: (value: string) => void;
  setTotalRewards: (rewards: string) => void;
  setPendingRewards: (rewards: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updatePosition: (narrativeId: number, updates: Partial<StakePosition>) => void;
}

export const useStakingStore = create<StakingState>((set) => ({
  positions: [],
  totalValue: '0',
  totalRewards: '0',
  pendingRewards: '0',
  isLoading: false,
  error: null,
  setPositions: (positions) =>
    set({
      positions,
      error: null,
    }),
  setTotalValue: (totalValue) =>
    set({
      totalValue,
    }),
  setTotalRewards: (totalRewards) =>
    set({
      totalRewards,
    }),
  setPendingRewards: (pendingRewards) =>
    set({
      pendingRewards,
    }),
  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),
  updatePosition: (narrativeId, updates) =>
    set((state) => ({
      positions: state.positions.map((p) =>
        p.narrativeId === narrativeId ? { ...p, ...updates } : p
      ),
    })),
}));

// Market Store
interface MarketState {
  metrics: MarketMetrics | null;
  trending: TrendingData[];
  sentiment: any;
  isLoading: boolean;
  error: string | null;
  setMetrics: (metrics: MarketMetrics) => void;
  setTrending: (trending: TrendingData[]) => void;
  setSentiment: (sentiment: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  metrics: null,
  trending: [],
  sentiment: null,
  isLoading: false,
  error: null,
  setMetrics: (metrics) =>
    set({
      metrics,
      error: null,
    }),
  setTrending: (trending) =>
    set({
      trending,
    }),
  setSentiment: (sentiment) =>
    set({
      sentiment,
    }),
  setLoading: (isLoading) =>
    set({
      isLoading,
    }),
  setError: (error) =>
    set({
      error,
      isLoading: false,
    }),
}));

// UI Store
interface UIState {
  sidebarOpen: boolean;
  currentView: 'dashboard' | 'narratives' | 'staking' | 'market' | 'create';
  theme: 'dark' | 'light';
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: UIState['currentView']) => void;
  setTheme: (theme: 'dark' | 'light') => void;
  addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      currentView: 'dashboard',
      theme: 'dark',
      notifications: [],
      setSidebarOpen: (sidebarOpen) =>
        set({
          sidebarOpen,
        }),
      setCurrentView: (currentView) =>
        set({
          currentView,
        }),
      setTheme: (theme) =>
        set({
          theme,
        }),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: new Date(),
            },
            ...state.notifications,
          ].slice(0, 10), // Keep only last 10 notifications
        })),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      clearNotifications: () =>
        set({
          notifications: [],
        }),
    }),
    {
      name: 'aletheia-ui',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        currentView: state.currentView,
        theme: state.theme,
      }),
    }
  )
);
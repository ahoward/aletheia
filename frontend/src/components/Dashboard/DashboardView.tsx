/**
 * Main dashboard view component
 */

'use client';

import { useEffect } from 'react';
import { useAuthStore, useStakingStore, useNarrativesStore, useMarketStore } from '@/store';
import { StatsCard } from './StatsCard';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { stakingApi, narrativesApi, marketApi } from '@/utils/api';

export const DashboardView = () => {
  const { isAuthenticated } = useAuthStore();
  const { 
    totalValue, 
    totalRewards, 
    pendingRewards, 
    positions,
    setTotalValue,
    setTotalRewards,
    setPendingRewards,
    setPositions,
    setLoading: setStakingLoading 
  } = useStakingStore();
  
  const { 
    narratives, 
    trending,
    setNarratives,
    setTrending,
    setLoading: setNarrativesLoading 
  } = useNarrativesStore();
  
  const { 
    metrics,
    setMetrics,
    setLoading: setMarketLoading 
  } = useMarketStore();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load market metrics (public data)
        setMarketLoading(true);
        const marketMetrics = await marketApi.getMetrics();
        setMetrics(marketMetrics);

        // Load trending narratives
        setNarrativesLoading(true);
        const trendingData = await narrativesApi.getTrending(10);
        setTrending(trendingData);

        // Load all narratives
        const allNarratives = await narrativesApi.list({ limit: 50 });
        setNarratives(allNarratives.data);

        // If authenticated, load user-specific data
        if (isAuthenticated) {
          setStakingLoading(true);
          
          // Load user positions
          const userPositions = await stakingApi.getPositions();
          setPositions(userPositions);

          // Load rewards data
          const rewardsData = await stakingApi.getRewards();
          setTotalRewards(rewardsData.totalEarned);
          setPendingRewards(rewardsData.totalPending);

          // Calculate total portfolio value
          const totalPortfolioValue = userPositions.reduce((sum, position) => {
            return sum + parseFloat(position.currentValue);
          }, 0);
          setTotalValue(totalPortfolioValue.toString());
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setMarketLoading(false);
        setNarrativesLoading(false);
        setStakingLoading(false);
      }
    };

    loadDashboardData();
  }, [isAuthenticated, setMetrics, setTrending, setNarratives, setPositions, setTotalValue, setTotalRewards, setPendingRewards, setMarketLoading, setNarrativesLoading, setStakingLoading]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">
            Welcome to the Aletheia narrative marketplace
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Last updated</div>
          <div className="text-sm text-white">{new Date().toLocaleTimeString()}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Value */}
        <StatsCard
          title="Portfolio Value"
          value={formatCurrency(totalValue || '0')}
          change={{
            value: '+12.5',
            type: 'positive',
            period: '24h'
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          }
        />

        {/* Pending Rewards */}
        <StatsCard
          title="Pending Rewards"
          value={formatCurrency(pendingRewards || '0')}
          change={{
            value: '+8.2',
            type: 'positive',
            period: '7d'
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        {/* Active Positions */}
        <StatsCard
          title="Active Positions"
          value={positions.length}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />

        {/* Total Narratives */}
        <StatsCard
          title="Total Narratives"
          value={formatNumber(metrics?.totalNarratives || narratives.length)}
          change={{
            value: '+23',
            type: 'positive',
            period: '24h'
          }}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Stats */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Market Overview</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Total Value Locked</span>
              <span className="text-white font-semibold">
                {formatCurrency(metrics?.totalValueLocked || '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Active Stakers</span>
              <span className="text-white font-semibold">
                {formatNumber(metrics?.activeStakers || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">24h Volume</span>
              <span className="text-white font-semibold">
                {formatCurrency(metrics?.stakingVolume24h || '0')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg Stake Size</span>
              <span className="text-white font-semibold">
                {formatCurrency(metrics?.averageStakeSize || '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Trending Narratives */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Trending Narratives</h2>
          <div className="space-y-3">
            {trending.slice(0, 5).map((narrative, index) => (
              <div key={narrative.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {narrative.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatCurrency(narrative.totalStaked)} staked
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-400">
                    +{narrative.uniqueStakers}
                  </p>
                  <p className="text-xs text-gray-400">stakers</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {isAuthenticated && positions.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Your Recent Positions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Narrative
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Amount Staked
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Projected Rewards
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {positions.slice(0, 5).map((position) => (
                  <tr key={position.narrativeId}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      Narrative #{position.narrativeId}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(position.totalStaked)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                      {formatCurrency(position.currentValue)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-green-400">
                      {formatCurrency(position.projectedRewards)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Welcome message for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Welcome to Aletheia
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Connect your wallet to start staking on narratives, earn rewards, and participate in the decentralized truth marketplace.
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Stake on narratives</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Earn rewards</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Validate truth</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
/**
 * Main staking view component
 */

'use client';

import { useState, useEffect } from 'react';
import { useStakingStore, useAuthStore, useUIStore } from '@/store';
import { stakingApi } from '@/utils/api';
import { formatCurrency, formatTimeAgo, formatNumber } from '@/lib/utils';
import { StakePosition } from '@/types';

export const StakingView = () => {
  const [selectedPosition, setSelectedPosition] = useState<StakePosition | null>(null);
  const [claimingRewards, setClaimingRewards] = useState<Set<number>>(new Set());

  const { 
    positions, 
    totalValue, 
    totalRewards, 
    pendingRewards,
    isLoading,
    error,
    setPositions,
    setTotalValue,
    setTotalRewards,
    setPendingRewards,
    setLoading,
    setError,
    updatePosition
  } = useStakingStore();

  const { isAuthenticated, user } = useAuthStore();
  const { addNotification } = useUIStore();

  // Load staking data
  useEffect(() => {
    if (isAuthenticated) {
      loadStakingData();
    }
  }, [isAuthenticated]);

  const loadStakingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userPositions, rewardsData] = await Promise.all([
        stakingApi.getPositions(),
        stakingApi.getRewards()
      ]);

      setPositions(userPositions);
      setTotalRewards(rewardsData.totalEarned);
      setPendingRewards(rewardsData.totalPending);

      // Calculate total portfolio value
      const totalPortfolioValue = userPositions.reduce((sum, position) => {
        return sum + parseFloat(position.currentValue);
      }, 0);
      setTotalValue(totalPortfolioValue.toString());

    } catch (err) {
      console.error('Error loading staking data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load staking data');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimRewards = async (narrativeId: number) => {
    try {
      setClaimingRewards(prev => new Set(prev).add(narrativeId));

      const result = await stakingApi.claimRewards(narrativeId);

      // Update local state
      updatePosition(narrativeId, {
        projectedRewards: '0', // Reset after claiming
      });

      addNotification({
        type: 'success',
        title: 'Rewards Claimed',
        message: `Successfully claimed ${formatCurrency(result.claimedAmount)} in rewards`,
      });

      // Reload staking data to get updated values
      await loadStakingData();

    } catch (error) {
      console.error('Claim rewards error:', error);
      addNotification({
        type: 'error',
        title: 'Claim Failed',
        message: error instanceof Error ? error.message : 'Failed to claim rewards',
      });
    } finally {
      setClaimingRewards(prev => {
        const newSet = new Set(prev);
        newSet.delete(narrativeId);
        return newSet;
      });
    }
  };

  const handleUnstake = async (narrativeId: number, amount: string) => {
    try {
      setLoading(true);

      // Mock signature for unstaking
      const mockSignature = '0x' + Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      await stakingApi.unstake({
        narrativeId,
        amount,
        signature: mockSignature
      });

      addNotification({
        type: 'success',
        title: 'Unstake Successful',
        message: `Successfully unstaked ${formatCurrency(amount)}`,
      });

      // Reload staking data
      await loadStakingData();

    } catch (error) {
      console.error('Unstake error:', error);
      addNotification({
        type: 'error',
        title: 'Unstake Failed',
        message: error instanceof Error ? error.message : 'Failed to unstake',
      });
    } finally {
      setLoading(false);
    }
  };

  // Authentication required message
  if (!isAuthenticated) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-gray-400 mb-6">
            Please connect your wallet to view your staking positions and manage rewards.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Staking</h1>
          <p className="text-gray-400 mt-1">
            Manage your narrative stakes and rewards
          </p>
        </div>
        <button
          onClick={loadStakingData}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase">
              Portfolio Value
            </h3>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatCurrency(totalValue || '0')}
          </div>
          <div className="text-sm text-green-400">
            +12.5% this month
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase">
              Total Rewards Earned
            </h3>
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatCurrency(totalRewards || '0')}
          </div>
          <div className="text-sm text-gray-400">
            All time earnings
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-400 uppercase">
              Pending Rewards
            </h3>
            <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white mb-2">
            {formatCurrency(pendingRewards || '0')}
          </div>
          <div className="text-sm text-gray-400">
            Ready to claim
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && positions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading staking positions...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Positions</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadStakingData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && positions.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No Staking Positions</h3>
          <p className="text-gray-400 mb-6">
            You haven't staked on any narratives yet. Start exploring narratives to begin earning rewards.
          </p>
          <button
            onClick={() => {/* Navigate to narratives */}}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Explore Narratives
          </button>
        </div>
      )}

      {/* Positions Table */}
      {positions.length > 0 && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Your Positions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Narrative
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Staked Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Pending Rewards
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Avg Stake Time
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {positions.map((position) => (
                  <tr key={position.narrativeId} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        Narrative #{position.narrativeId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatCurrency(position.totalStaked)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {formatCurrency(position.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">
                      {formatCurrency(position.projectedRewards)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatNumber(position.averageStakeTime / (24 * 60 * 60 * 1000))} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleClaimRewards(position.narrativeId)}
                        disabled={claimingRewards.has(position.narrativeId) || parseFloat(position.projectedRewards) <= 0}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        {claimingRewards.has(position.narrativeId) ? 'Claiming...' : 'Claim'}
                      </button>
                      <button
                        onClick={() => handleUnstake(position.narrativeId, position.totalStaked)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Unstake
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
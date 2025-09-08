/**
 * Main market view component
 */

'use client';

import { useState, useEffect } from 'react';
import { useMarketStore } from '@/store';
import { marketApi } from '@/utils/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { MarketMetrics, TrendingData } from '@/types';

export const MarketView = () => {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [chartData, setChartData] = useState<any>(null);

  const { 
    metrics, 
    trending, 
    sentiment,
    isLoading,
    error,
    setMetrics,
    setTrending,
    setSentiment,
    setLoading,
    setError
  } = useMarketStore();

  // Load market data
  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [marketMetrics, trendingData, sentimentData] = await Promise.all([
        marketApi.getMetrics(),
        marketApi.getTrending(10),
        marketApi.getSentiment().catch(() => null) // Optional
      ]);

      setMetrics(marketMetrics);
      setTrending(trendingData);
      if (sentimentData) {
        setSentiment(sentimentData);
      }

    } catch (err) {
      console.error('Error loading market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  // Load chart data based on timeframe
  const loadChartData = async (type: string, timeframe: string) => {
    try {
      const data = await marketApi.getChartData(type, { timeframe });
      setChartData(data);
    } catch (error) {
      console.error('Error loading chart data:', error);
    }
  };

  const getChangeColor = (change: string | number) => {
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (numChange > 0) return 'text-green-400';
    if (numChange < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getChangeIcon = (change: string | number) => {
    const numChange = typeof change === 'string' ? parseFloat(change) : change;
    if (numChange > 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      );
    }
    if (numChange < 0) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      );
    }
    return null;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Market</h1>
          <p className="text-gray-400 mt-1">
            Real-time market data and analytics
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="24h">24 Hours</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
          <button
            onClick={loadMarketData}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !metrics && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading market data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Market Data</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={loadMarketData}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Market Metrics */}
      {metrics && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase">
                  Total Value Locked
                </h3>
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatCurrency(metrics.totalValueLocked)}
              </div>
              <div className={`text-sm flex items-center space-x-1 ${getChangeColor(metrics.priceChange24h)}`}>
                {getChangeIcon(metrics.priceChange24h)}
                <span>{metrics.priceChange24h}% (24h)</span>
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase">
                  Total Narratives
                </h3>
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatNumber(metrics.totalNarratives)}
              </div>
              <div className="text-sm text-green-400">
                +12 new today
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase">
                  Active Stakers
                </h3>
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatNumber(metrics.activeStakers)}
              </div>
              <div className="text-sm text-gray-400">
                Unique participants
              </div>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase">
                  24h Volume
                </h3>
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-2xl font-bold text-white mb-2">
                {formatCurrency(metrics.stakingVolume24h)}
              </div>
              <div className="text-sm text-green-400">
                +18.2% from yesterday
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Narratives by Stake */}
            <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Top Narratives by Stake</h2>
              <div className="space-y-4">
                {metrics.topNarrativesByStake.slice(0, 5).map((narrative, index) => (
                  <div key={narrative.tokenId} className="flex items-center space-x-4 p-4 bg-gray-700/30 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {narrative.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {narrative.uniqueStakers} stakers • {narrative.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">
                        {formatCurrency(narrative.totalStaked)}
                      </p>
                      <p className="text-xs text-green-400">
                        {narrative.trendingScore.toFixed(1)} score
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Narratives */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Trending</h2>
              <div className="space-y-3">
                {trending.slice(0, 8).map((trend, index) => (
                  <div key={trend.narrative.tokenId} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-600 rounded text-white text-xs flex items-center justify-center">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {trend.narrative.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {trend.timeframe}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-medium ${getChangeColor(trend.percentageChange)}`}>
                        +{trend.percentageChange.toFixed(1)}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {trend.momentum.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Market Stats */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Market Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {formatCurrency(metrics.averageStakeSize)}
                </div>
                <div className="text-sm text-gray-400">Average Stake Size</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {(metrics.totalValueLocked && metrics.totalNarratives 
                    ? formatCurrency((parseFloat(metrics.totalValueLocked) / metrics.totalNarratives).toString())
                    : '$0')}
                </div>
                <div className="text-sm text-gray-400">Avg TVL per Narrative</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-2">
                  {(metrics.activeStakers && metrics.totalNarratives 
                    ? (metrics.activeStakers / metrics.totalNarratives).toFixed(1)
                    : '0')}
                </div>
                <div className="text-sm text-gray-400">Avg Stakers per Narrative</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
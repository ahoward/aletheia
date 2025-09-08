/**
 * Narrative detail modal component
 */

'use client';

import { useEffect, useState } from 'react';
import { NarrativeNFT } from '@/types';
import { formatCurrency, formatTimeAgo, truncateAddress } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { narrativesApi, marketApi } from '@/utils/api';

interface NarrativeModalProps {
  narrative: NarrativeNFT;
  isOpen: boolean;
  onClose: () => void;
  onStake?: (narrative: NarrativeNFT) => void;
}

export const NarrativeModal = ({
  narrative,
  isOpen,
  onClose,
  onStake,
}: NarrativeModalProps) => {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);

  // Load additional analytics data
  useEffect(() => {
    if (isOpen && narrative) {
      const loadAnalytics = async () => {
        try {
          setLoading(true);
          const [activity, velocity, trendingScore] = await Promise.all([
            marketApi.getActivity(narrative.tokenId, 24).catch(() => null),
            marketApi.getVelocity(narrative.tokenId, 24).catch(() => null),
            marketApi.getTrendingScore(narrative.tokenId).catch(() => null),
          ]);
          
          setAnalytics({
            activity,
            velocity: velocity?.velocity || 0,
            trendingScore: trendingScore?.trendingScore || 0,
          });
        } catch (error) {
          console.error('Error loading analytics:', error);
        } finally {
          setLoading(false);
        }
      };

      loadAnalytics();
    }
  }, [isOpen, narrative]);

  // Handle click outside modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'text':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'flagged':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'archived':
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-gray-700 rounded-lg text-blue-400">
              {getModalityIcon(narrative.modality)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{narrative.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>Token #{narrative.tokenId}</span>
                <span>•</span>
                <span>{formatTimeAgo(narrative.createdAt)}</span>
                <span>•</span>
                <span className={`px-2 py-1 rounded-full border text-xs font-medium ${getStatusColor(narrative.status)}`}>
                  {narrative.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {isAuthenticated && narrative.isActive && onStake && (
              <button
                onClick={() => onStake(narrative)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span>Stake</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {narrative.description}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(narrative.totalStaked)}
              </div>
              <div className="text-sm text-gray-400">Total Staked</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {narrative.uniqueStakers.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Unique Stakers</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? '...' : analytics?.velocity?.toFixed(2) || '0.00'}
              </div>
              <div className="text-sm text-gray-400">Velocity (24h)</div>
            </div>
            
            <div className="bg-gray-700/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">
                {loading ? '...' : analytics?.trendingScore?.toFixed(0) || '0'}
              </div>
              <div className="text-sm text-gray-400">Trending Score</div>
            </div>
          </div>

          {/* Tags */}
          {narrative.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {narrative.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-700 text-gray-300 text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tag Categories */}
          {Object.keys(narrative.tagCategories).length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Categories</h3>
              <div className="space-y-3">
                {Object.entries(narrative.tagCategories).map(([category, tags]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-400 mb-2 capitalize">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-600/20 text-blue-300 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Creator Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Creator</h3>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {narrative.creator.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-white">
                    {narrative.creatorDisplayName || 'Anonymous Creator'}
                  </div>
                  <div className="text-sm text-gray-400 font-mono">
                    {truncateAddress(narrative.creator, 8)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Technical Details</h3>
            <div className="bg-gray-700/30 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Contract Address</span>
                <span className="text-gray-300 font-mono">
                  {truncateAddress(narrative.contractAddress)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token ID</span>
                <span className="text-gray-300">#{narrative.tokenId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Modality</span>
                <span className="text-gray-300 capitalize">{narrative.modality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Metadata URI</span>
                <span className="text-gray-300 truncate max-w-48">
                  {narrative.metadataUri}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Activity</span>
                <span className="text-gray-300">
                  {formatTimeAgo(narrative.lastActivity)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * Individual narrative card component
 */

'use client';

import { NarrativeNFT } from '@/types';
import { formatCurrency, formatTimeAgo, truncateAddress } from '@/lib/utils';
import { useAuthStore } from '@/store';

interface NarrativeCardProps {
  narrative: NarrativeNFT;
  onStake?: (narrative: NarrativeNFT) => void;
  onView?: (narrative: NarrativeNFT) => void;
  showStakeButton?: boolean;
}

export const NarrativeCard = ({ 
  narrative, 
  onStake, 
  onView, 
  showStakeButton = true 
}: NarrativeCardProps) => {
  const { isAuthenticated } = useAuthStore();

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'text':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'image':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'video':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      case 'audio':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h4" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'flagged':
        return 'text-yellow-400 bg-yellow-400/10';
      case 'archived':
        return 'text-gray-400 bg-gray-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gray-700 text-blue-400`}>
            {getModalityIcon(narrative.modality)}
          </div>
          <div>
            <h3 className="font-semibold text-white text-lg">{narrative.name}</h3>
            <p className="text-sm text-gray-400">
              Token #{narrative.tokenId} • {formatTimeAgo(narrative.createdAt)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(narrative.status)}`}>
            {narrative.status}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
        {narrative.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {narrative.tags.slice(0, 4).map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-md"
          >
            #{tag}
          </span>
        ))}
        {narrative.tags.length > 4 && (
          <span className="px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-md">
            +{narrative.tags.length - 4} more
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <div className="text-lg font-bold text-white">
            {formatCurrency(narrative.totalStaked)}
          </div>
          <div className="text-xs text-gray-400">Total Staked</div>
        </div>
        <div className="text-center p-3 bg-gray-700/50 rounded-lg">
          <div className="text-lg font-bold text-white">
            {narrative.uniqueStakers.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">Stakers</div>
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center justify-between mb-4 text-sm">
        <div className="text-gray-400">
          Creator: {' '}
          <span className="text-gray-300">
            {narrative.creatorDisplayName || truncateAddress(narrative.creator)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between space-x-3">
        <button
          onClick={() => onView?.(narrative)}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View Details</span>
        </button>
        
        {showStakeButton && isAuthenticated && narrative.isActive && (
          <button
            onClick={() => onStake?.(narrative)}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            <span>Stake</span>
          </button>
        )}
      </div>
    </div>
  );
};
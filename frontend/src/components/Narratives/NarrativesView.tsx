/**
 * Main narratives view component
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNarrativesStore, useAuthStore, useUIStore } from '@/store';
import { narrativesApi } from '@/utils/api';
import { NarrativeCard } from './NarrativeCard';
import { NarrativeFilters } from './NarrativeFilters';
import { NarrativeModal } from './NarrativeModal';
import { StakeModal } from '@/components/Staking/StakeModal';
import { NarrativeNFT, Modality, NarrativeStatus } from '@/types';
import { debounce } from '@/lib/utils';

interface FilterOptions {
  search: string;
  modality: Modality | 'all';
  status: NarrativeStatus | 'all';
  tags: string[];
  sortBy: 'newest' | 'oldest' | 'most_staked' | 'most_stakers' | 'trending';
  creator: string;
}

export const NarrativesView = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    modality: 'all',
    status: 'all',
    tags: [],
    sortBy: 'newest',
    creator: '',
  });
  
  const [selectedNarrative, setSelectedNarrative] = useState<NarrativeNFT | null>(null);
  const [stakeNarrative, setStakeNarrative] = useState<NarrativeNFT | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const { 
    narratives, 
    isLoading, 
    error,
    searchResults,
    searchLoading,
    setNarratives,
    setLoading,
    setError,
    setSearchResults,
    setSearchLoading
  } = useNarrativesStore();
  
  const { isAuthenticated } = useAuthStore();
  const { addNotification } = useUIStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setSearchResults([]);
        return;
      }
      
      try {
        setSearchLoading(true);
        const results = await narrativesApi.findSimilar({
          text: searchTerm,
          threshold: 0.6,
          limit: 20,
        });
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        addNotification({
          type: 'error',
          title: 'Search Failed',
          message: 'Failed to search narratives. Please try again.',
        });
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    [setSearchResults, setSearchLoading, addNotification]
  );

  // Load narratives data
  const loadNarratives = useCallback(async (resetPage = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPage ? 1 : page;
      const limit = 20;
      const offset = (currentPage - 1) * limit;

      // Build query parameters
      const params: any = {
        limit,
        offset,
      };

      if (filters.modality !== 'all') {
        params.modality = filters.modality;
      }
      
      if (filters.status !== 'all') {
        params.status = filters.status;
      }
      
      if (filters.tags.length > 0) {
        params.tags = filters.tags;
      }
      
      if (filters.creator) {
        params.creatorAddress = filters.creator;
      }

      const result = await narrativesApi.list(params);
      
      // Sort results based on sortBy filter
      let sortedNarratives = [...result.data];
      switch (filters.sortBy) {
        case 'oldest':
          sortedNarratives.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          break;
        case 'most_staked':
          sortedNarratives.sort((a, b) => parseFloat(b.totalStaked) - parseFloat(a.totalStaked));
          break;
        case 'most_stakers':
          sortedNarratives.sort((a, b) => b.uniqueStakers - a.uniqueStakers);
          break;
        case 'trending':
          // For now, sort by recent activity + staking
          sortedNarratives.sort((a, b) => {
            const aScore = new Date(a.lastActivity).getTime() + parseFloat(a.totalStaked) * 0.001;
            const bScore = new Date(b.lastActivity).getTime() + parseFloat(b.totalStaked) * 0.001;
            return bScore - aScore;
          });
          break;
        case 'newest':
        default:
          sortedNarratives.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
      }

      if (resetPage) {
        setNarratives(sortedNarratives);
        setPage(2);
      } else {
        setNarratives([...narratives, ...sortedNarratives]);
        setPage(page + 1);
      }
      
      setHasMore(result.data.length === limit);

      // Extract available tags
      const tags = new Set<string>();
      result.data.forEach(narrative => {
        narrative.tags.forEach(tag => tags.add(tag));
      });
      setAvailableTags(Array.from(tags).sort());

    } catch (err) {
      console.error('Error loading narratives:', err);
      setError(err instanceof Error ? err.message : 'Failed to load narratives');
      addNotification({
        type: 'error',
        title: 'Loading Failed',
        message: 'Failed to load narratives. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, [filters, page, narratives, setNarratives, setLoading, setError, addNotification]);

  // Load narratives on mount and filter changes
  useEffect(() => {
    loadNarratives(true);
  }, [filters.modality, filters.status, filters.tags, filters.creator, filters.sortBy]);

  // Handle search
  useEffect(() => {
    if (filters.search) {
      debouncedSearch(filters.search);
    } else {
      setSearchResults([]);
    }
  }, [filters.search, debouncedSearch]);

  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleViewNarrative = (narrative: NarrativeNFT) => {
    setSelectedNarrative(narrative);
  };

  const handleStakeNarrative = (narrative: NarrativeNFT) => {
    if (!isAuthenticated) {
      addNotification({
        type: 'warning',
        title: 'Authentication Required',
        message: 'Please connect your wallet to stake on narratives.',
      });
      return;
    }
    setStakeNarrative(narrative);
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      loadNarratives(false);
    }
  };

  // Filter narratives based on search
  const displayNarratives = filters.search && searchResults.length > 0 
    ? searchResults 
    : narratives.filter(narrative => {
        // Client-side filtering for search when no semantic results
        if (filters.search && !searchResults.length && !searchLoading) {
          const searchLower = filters.search.toLowerCase();
          return (
            narrative.name.toLowerCase().includes(searchLower) ||
            narrative.description.toLowerCase().includes(searchLower) ||
            narrative.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
            narrative.creator.toLowerCase().includes(searchLower) ||
            narrative.creatorDisplayName?.toLowerCase().includes(searchLower)
          );
        }
        return true;
      });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Narratives</h1>
          <p className="text-gray-400 mt-1">
            Discover and stake on narrative NFTs
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Total Narratives</div>
          <div className="text-2xl font-bold text-white">
            {narratives.length.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Filters */}
      <NarrativeFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        availableTags={availableTags}
        isLoading={isLoading || searchLoading}
      />

      {/* Loading State */}
      {(isLoading || searchLoading) && displayNarratives.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400">Loading narratives...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-6 text-center">
          <svg className="w-8 h-8 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Narratives</h3>
          <p className="text-red-300 mb-4">{error}</p>
          <button
            onClick={() => loadNarratives(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && displayNarratives.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No Narratives Found</h3>
          <p className="text-gray-400 mb-6">
            {filters.search || filters.modality !== 'all' || filters.status !== 'all' || filters.tags.length > 0 || filters.creator
              ? 'Try adjusting your filters or search criteria.'
              : 'Be the first to create a narrative NFT.'}
          </p>
          <button
            onClick={() => handleFiltersChange({
              search: '',
              modality: 'all',
              status: 'all',
              tags: [],
              sortBy: 'newest',
              creator: '',
            })}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Narratives Grid */}
      {displayNarratives.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayNarratives.map((narrative) => (
              <NarrativeCard
                key={narrative.id}
                narrative={narrative}
                onView={handleViewNarrative}
                onStake={handleStakeNarrative}
              />
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && !filters.search && (
            <div className="text-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Loading...</span>
                  </span>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {selectedNarrative && (
        <NarrativeModal
          narrative={selectedNarrative}
          isOpen={!!selectedNarrative}
          onClose={() => setSelectedNarrative(null)}
          onStake={handleStakeNarrative}
        />
      )}

      {stakeNarrative && (
        <StakeModal
          narrative={stakeNarrative}
          isOpen={!!stakeNarrative}
          onClose={() => setStakeNarrative(null)}
        />
      )}
    </div>
  );
};
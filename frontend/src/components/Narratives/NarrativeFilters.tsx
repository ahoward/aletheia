/**
 * Narrative filtering and search component
 */

'use client';

import { useState } from 'react';
import { Modality, NarrativeStatus } from '@/types';
import { cn } from '@/lib/utils';

interface FilterOptions {
  search: string;
  modality: Modality | 'all';
  status: NarrativeStatus | 'all';
  tags: string[];
  sortBy: 'newest' | 'oldest' | 'most_staked' | 'most_stakers' | 'trending';
  creator: string;
}

interface NarrativeFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags?: string[];
  isLoading?: boolean;
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'most_staked', label: 'Most Staked' },
  { value: 'most_stakers', label: 'Most Stakers' },
  { value: 'trending', label: 'Trending' },
];

const modalityOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'text', label: 'Text' },
  { value: 'image', label: 'Image' },
  { value: 'video', label: 'Video' },
  { value: 'audio', label: 'Audio' },
  { value: 'mixed', label: 'Mixed' },
];

const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'archived', label: 'Archived' },
];

export const NarrativeFilters = ({
  filters,
  onFiltersChange,
  availableTags = [],
  isLoading = false,
}: NarrativeFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addTag = (tag: string) => {
    if (tag && !filters.tags.includes(tag)) {
      updateFilter('tags', [...filters.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    updateFilter('tags', filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      modality: 'all',
      status: 'all',
      tags: [],
      sortBy: 'newest',
      creator: '',
    });
    setShowAdvanced(false);
  };

  const hasActiveFilters = 
    filters.search || 
    filters.modality !== 'all' || 
    filters.status !== 'all' || 
    filters.tags.length > 0 || 
    filters.creator ||
    filters.sortBy !== 'newest';

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search narratives, creators, tags..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          disabled={isLoading}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 pl-10 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
        />
        <svg
          className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sort By */}
        <select
          value={filters.sortBy}
          onChange={(e) => updateFilter('sortBy', e.target.value as any)}
          disabled={isLoading}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Modality Filter */}
        <select
          value={filters.modality}
          onChange={(e) => updateFilter('modality', e.target.value as any)}
          disabled={isLoading}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {modalityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value as any)}
          disabled={isLoading}
          className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Advanced Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          disabled={isLoading}
          className={cn(
            "px-3 py-1 rounded-lg text-sm font-medium transition-colors disabled:opacity-50",
            showAdvanced
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          )}
        >
          Advanced
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            disabled={isLoading}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t border-gray-700">
          {/* Creator Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Creator Address
            </label>
            <input
              type="text"
              placeholder="0x..."
              value={filters.creator}
              onChange={(e) => updateFilter('creator', e.target.value)}
              disabled={isLoading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tags
            </label>
            
            {/* Tag Input */}
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={() => addTag(tagInput)}
                disabled={isLoading || !tagInput}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Add
              </button>
            </div>

            {/* Selected Tags */}
            {filters.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {filters.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-full"
                  >
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      disabled={isLoading}
                      className="ml-2 text-blue-200 hover:text-white disabled:opacity-50"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Popular Tags */}
            {availableTags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Popular tags:</p>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      disabled={isLoading || filters.tags.includes(tag)}
                      className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-gray-300 disabled:text-gray-500 text-xs rounded-md transition-colors disabled:cursor-not-allowed"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="text-sm text-gray-400">
          {isLoading ? (
            <span className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></div>
              <span>Applying filters...</span>
            </span>
          ) : (
            <span>Filters active • Use "Clear All" to reset</span>
          )}
        </div>
      )}
    </div>
  );
};
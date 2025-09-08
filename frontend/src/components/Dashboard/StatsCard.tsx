/**
 * Dashboard statistics card component
 */

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'positive' | 'negative' | 'neutral';
    period?: string;
  };
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  change,
  icon,
  loading = false,
  className,
}: StatsCardProps) => {
  if (loading) {
    return (
      <div className={cn(
        'bg-gray-800 border border-gray-700 rounded-lg p-6',
        className
      )}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className="p-2 bg-gray-700 rounded-lg text-blue-400">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <div>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {change && (
            <div className="flex items-center mt-2 space-x-1">
              {change.type === 'positive' && (
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
                </svg>
              )}
              {change.type === 'negative' && (
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
                </svg>
              )}
              <span className={cn(
                'text-sm font-medium',
                change.type === 'positive' && 'text-green-400',
                change.type === 'negative' && 'text-red-400',
                change.type === 'neutral' && 'text-gray-400'
              )}>
                {typeof change.value === 'number' ? `${change.value}%` : change.value}
              </span>
              {change.period && (
                <span className="text-xs text-gray-500">
                  {change.period}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
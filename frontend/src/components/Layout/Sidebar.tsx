/**
 * Sidebar navigation component for Aletheia
 */

'use client';

import { useUIStore, useStakingStore, useNarrativesStore } from '@/store';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v14l-5-3-5 3V5z" />
      </svg>
    ),
  },
  {
    id: 'narratives',
    label: 'Narratives',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    id: 'staking',
    label: 'Staking',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
      </svg>
    ),
  },
  {
    id: 'market',
    label: 'Market',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    id: 'create',
    label: 'Create',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
];

export const Sidebar = () => {
  const { sidebarOpen, currentView, setCurrentView } = useUIStore();
  const { totalValue, pendingRewards } = useStakingStore();
  const { narratives } = useNarrativesStore();

  if (!sidebarOpen) {
    return (
      <div className="w-16 bg-gray-900 border-r border-gray-700 flex flex-col">
        {/* Collapsed sidebar with icons only */}
        <div className="flex-1 py-4">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={cn(
                'w-full h-12 flex items-center justify-center mb-1 transition-colors relative group',
                currentView === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
              title={item.label}
            >
              {item.icon}
              {currentView === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
              )}
              <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {item.label}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
      {/* Navigation */}
      <div className="flex-1 py-4">
        <nav className="px-3 space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as any)}
              className={cn(
                'w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors relative',
                currentView === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
              {currentView === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-r"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Stats section */}
        <div className="mt-8 px-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Quick Stats
          </h3>
          
          <div className="space-y-3">
            {/* Portfolio value */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400">Portfolio Value</div>
              <div className="text-lg font-semibold text-white">
                {totalValue ? `$${parseFloat(totalValue).toLocaleString()}` : '$0'}
              </div>
            </div>

            {/* Pending rewards */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400">Pending Rewards</div>
              <div className="text-lg font-semibold text-green-400">
                {pendingRewards ? `$${parseFloat(pendingRewards).toLocaleString()}` : '$0'}
              </div>
            </div>

            {/* Total narratives */}
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-xs text-gray-400">Narratives</div>
              <div className="text-lg font-semibold text-white">
                {narratives.length.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-500 text-center">
          Aletheia v1.0.0
        </div>
      </div>
    </div>
  );
};
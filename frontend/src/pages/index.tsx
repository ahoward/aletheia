import React from 'react';
import Head from 'next/head';
import { useUIStore } from '@/store';
import { DashboardView } from '@/components/Dashboard/DashboardView';
import { NarrativesView } from '@/components/Narratives/NarrativesView';
import { StakingView } from '@/components/Staking/StakingView';
import { MarketView } from '@/components/Market/MarketView';

export default function Home() {
  const { currentView } = useUIStore();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
      default:
        return <DashboardView />;
      case 'narratives':
        return <NarrativesView />;
      case 'staking':
        return <StakingView />;
      case 'market':
        return <MarketView />;
      case 'create':
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <h1 className="text-3xl font-bold text-white mb-4">Create Narrative</h1>
              <p className="text-gray-400 mb-8">
                Create and mint your own narrative NFT to participate in the marketplace
              </p>
              <div className="max-w-md mx-auto bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
                <p className="text-yellow-300 text-sm">
                  <strong>Coming Soon:</strong> The narrative creation interface is currently under development. 
                  Check back soon to start creating your own narrative NFTs.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <Head>
        <title>Aletheia - Decentralized Narrative Market</title>
        <meta name="description" content="Veritas Inversa - Professional narrative underwriting platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {renderCurrentView()}
    </>
  );
}
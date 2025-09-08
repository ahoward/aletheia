/**
 * Wallet connection component for Web3 authentication
 */

'use client';

import { useState, useCallback } from 'react';
import { useWalletStore, useAuthStore } from '@/store';
import { authApi, setAuthToken } from '@/utils/api';
import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const WalletConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setConnection, setConnecting, setError: setWalletError } = useWalletStore();
  const { setUser, setToken, setLoading } = useAuthStore();

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError('Please install MetaMask or another Web3 wallet');
      return;
    }

    setIsConnecting(true);
    setConnecting(true);
    setLoading(true);
    setError(null);
    setWalletError(null);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Get chain ID
      const chainId = await window.ethereum.request({
        method: 'eth_chainId',
      });

      // Create provider and signer
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // Set wallet connection
      setConnection({
        address,
        chainId: parseInt(chainId, 16),
        isConnected: true,
        provider,
      });

      // Generate authentication challenge
      const challenge = await authApi.generateChallenge(address);

      // Sign the challenge message
      const signature = await signer.signMessage(challenge.message);

      // Authenticate with the backend
      const authResult = await authApi.connect(address, signature, challenge.message);

      // Store authentication token
      setAuthToken(authResult.token);
      setToken(authResult.token);
      setUser(authResult.user);

      console.log('Successfully connected wallet and authenticated');
    } catch (err) {
      console.error('Wallet connection failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      setWalletError(errorMessage);
      
      // Clean up on error
      setConnection(null);
    } finally {
      setIsConnecting(false);
      setConnecting(false);
      setLoading(false);
    }
  }, [setConnection, setConnecting, setWalletError, setUser, setToken, setLoading]);

  const disconnectWallet = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setConnection(null);
      setUser(null);
      setToken(null);
      setError(null);
      setWalletError(null);
    }
  }, [setConnection, setUser, setToken, setWalletError]);

  if (isConnecting) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
        <span className="text-sm text-gray-400">Connecting...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end space-y-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
        <span>Connect Wallet</span>
      </button>
      
      {error && (
        <div className="text-xs text-red-400 max-w-48 text-right">
          {error}
        </div>
      )}
    </div>
  );
};
/**
 * Staking modal component
 */

'use client';

import { useState, useEffect } from 'react';
import { NarrativeNFT } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore, useWalletStore, useStakingStore, useUIStore } from '@/store';
import { stakingApi } from '@/utils/api';

interface StakeModalProps {
  narrative: NarrativeNFT;
  isOpen: boolean;
  onClose: () => void;
}

export const StakeModal = ({ narrative, isOpen, onClose }: StakeModalProps) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { connection } = useWalletStore();
  const { updatePosition } = useStakingStore();
  const { addNotification } = useUIStore();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setValidationError(null);
    }
  }, [isOpen]);

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

  const validateAmount = (value: string) => {
    setValidationError(null);
    
    if (!value) {
      setValidationError('Amount is required');
      return false;
    }

    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue <= 0) {
      setValidationError('Amount must be greater than 0');
      return false;
    }

    if (numValue < 0.01) {
      setValidationError('Minimum stake amount is 0.01');
      return false;
    }

    if (numValue > 1000000) {
      setValidationError('Maximum stake amount is 1,000,000');
      return false;
    }

    return true;
  };

  const handleAmountChange = (value: string) => {
    // Allow only numbers and decimal point
    const cleanValue = value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limit decimal places to 6
    if (parts[1] && parts[1].length > 6) {
      return;
    }

    setAmount(cleanValue);
    
    if (cleanValue) {
      validateAmount(cleanValue);
    } else {
      setValidationError(null);
    }
  };

  const handleStake = async () => {
    if (!validateAmount(amount) || !user || !connection) {
      return;
    }

    try {
      setLoading(true);

      // Create mock signature (in real app, would sign with wallet)
      const mockSignature = '0x' + Array(130).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');

      const stakeData = {
        narrativeId: narrative.tokenId,
        amount: amount,
        signature: mockSignature,
      };

      const result = await stakingApi.stake(stakeData);

      // Update local state
      updatePosition(narrative.tokenId, {
        totalStaked: (parseFloat(amount) + parseFloat(narrative.totalStaked)).toString(),
        currentValue: result.currentValue || amount,
        projectedRewards: result.projectedRewards || '0',
        averageStakeTime: Date.now(),
        stakingHistory: []
      });

      addNotification({
        type: 'success',
        title: 'Stake Successful',
        message: `Successfully staked ${formatCurrency(amount)} on ${narrative.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Staking error:', error);
      addNotification({
        type: 'error',
        title: 'Staking Failed',
        message: error instanceof Error ? error.message : 'Failed to stake. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateProjectedRewards = () => {
    const amountNum = parseFloat(amount || '0');
    // Mock APY calculation - 15% annual
    const annualAPY = 0.15;
    const dailyAPY = annualAPY / 365;
    return (amountNum * dailyAPY).toFixed(4);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-700 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Stake on Narrative</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Narrative Info */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">{narrative.name}</h3>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Current Stake</span>
              <span className="text-white">{formatCurrency(narrative.totalStaked)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Unique Stakers</span>
              <span className="text-white">{narrative.uniqueStakers}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stake Amount
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                disabled={loading}
                className={`w-full bg-gray-700 border rounded-lg px-4 py-3 text-white text-lg placeholder-gray-400 focus:outline-none focus:ring-2 disabled:opacity-50 ${
                  validationError
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-600 focus:ring-blue-500'
                }`}
              />
              <div className="absolute right-3 top-3 text-gray-400 text-lg">
                NARR
              </div>
            </div>
            {validationError && (
              <p className="mt-2 text-sm text-red-400">{validationError}</p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-2">
            {['10', '50', '100', '500'].map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => handleAmountChange(quickAmount)}
                disabled={loading}
                className="px-3 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {quickAmount}
              </button>
            ))}
          </div>

          {/* Projected Returns */}
          {amount && !validationError && (
            <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
              <h4 className="text-blue-300 font-medium mb-2">Projected Returns</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Daily Rewards</span>
                  <span className="text-white">{formatCurrency(calculateProjectedRewards())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual APY</span>
                  <span className="text-green-400">~15%</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-blue-700/30">
                  <span>*Estimates based on current conditions</span>
                </div>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 text-sm">
            <div className="flex items-start space-x-2">
              <svg className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-yellow-300 font-medium">Important Notice</p>
                <p className="text-yellow-200 mt-1">
                  Staking involves risk. Narrative values can fluctuate and you may lose part of your stake.
                  Only stake what you can afford to lose.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleStake}
              disabled={loading || !amount || !!validationError}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Staking...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span>Confirm Stake</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
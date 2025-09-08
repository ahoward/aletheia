/**
 * T034: Create User model
 * 
 * User model for wallet-based authentication
 */

import { ethers } from 'ethers';

export enum UserRole {
  BASIC = 'basic',
  VALIDATOR = 'validator', 
  ADMIN = 'admin',
}

export class User {
  id: string;
  walletAddress: string;
  role: UserRole;
  createdAt: Date;
  lastActivity: Date;

  constructor(
    id: string,
    walletAddress: string,
    role: UserRole = UserRole.BASIC,
    createdAt: Date = new Date(),
    lastActivity: Date = new Date()
  ) {
    if (!this.isValidWalletAddress(walletAddress)) {
      throw new Error('Invalid wallet address');
    }

    this.id = id;
    this.walletAddress = walletAddress.toLowerCase();
    this.role = role;
    this.createdAt = createdAt;
    this.lastActivity = lastActivity;
  }

  /**
   * Validate Ethereum wallet address format
   */
  private isValidWalletAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Update last activity timestamp
   */
  updateLastActivity(): void {
    this.lastActivity = new Date();
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user can validate narratives
   */
  canValidate(): boolean {
    return this.role === UserRole.VALIDATOR || this.role === UserRole.ADMIN;
  }

  /**
   * Get user's display name (shortened wallet address)
   */
  getDisplayName(): string {
    return `${this.walletAddress.slice(0, 6)}...${this.walletAddress.slice(-4)}`;
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): {
    id: string;
    walletAddress: string;
    role: UserRole;
    createdAt: string;
    lastActivity: string;
    displayName: string;
  } {
    return {
      id: this.id,
      walletAddress: this.walletAddress,
      role: this.role,
      createdAt: this.createdAt.toISOString(),
      lastActivity: this.lastActivity.toISOString(),
      displayName: this.getDisplayName(),
    };
  }
}

export default User;
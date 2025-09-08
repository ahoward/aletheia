/**
 * T045: Create narrative-contracts library with CLI
 * 
 * Smart contract interaction library for narrative NFTs and staking
 */

import { ethers } from 'ethers';

export interface ContractConfig {
  narrTokenAddress: string;
  narrativeNftAddress: string;
  providerUrl: string;
  chainId: number;
}

export interface StakeOperation {
  narrativeId: number;
  amount: string;
  staker: string;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
}

export interface NftMintResult {
  tokenId: number;
  transactionHash: string;
  contractAddress: string;
  creator: string;
  metadataUri: string;
}

export class NarrativeContracts {
  private provider: ethers.JsonRpcProvider;
  private config: ContractConfig;
  private narrTokenContract?: ethers.Contract;
  private narrativeNftContract?: ethers.Contract;

  constructor(config: ContractConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.providerUrl);
    this.initializeContracts();
  }

  /**
   * Initialize contract instances with ABIs
   */
  private initializeContracts(): void {
    // Simplified ABI for NARR token (ERC-20)
    const narrTokenAbi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function approve(address spender, uint256 amount) returns (bool)',
      'function allowance(address owner, address spender) view returns (uint256)',
      'event Transfer(address indexed from, address indexed to, uint256 value)',
      'event Approval(address indexed owner, address indexed spender, uint256 value)',
    ];

    // Simplified ABI for Narrative NFT contract
    const narrativeNftAbi = [
      'function mint(address to, string memory metadataUri) returns (uint256)',
      'function ownerOf(uint256 tokenId) view returns (address)',
      'function tokenURI(uint256 tokenId) view returns (string)',
      'function getTotalStaked(uint256 tokenId) view returns (uint256)',
      'function stake(uint256 tokenId, uint256 amount) returns (bool)',
      'function unstake(uint256 tokenId, uint256 amount) returns (bool)',
      'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
      'event Stake(uint256 indexed tokenId, address indexed staker, uint256 amount)',
      'event Unstake(uint256 indexed tokenId, address indexed staker, uint256 amount)',
    ];

    this.narrTokenContract = new ethers.Contract(
      this.config.narrTokenAddress,
      narrTokenAbi,
      this.provider
    ) as any;

    this.narrativeNftContract = new ethers.Contract(
      this.config.narrativeNftAddress,
      narrativeNftAbi,
      this.provider
    ) as any;
  }

  /**
   * Get NARR token balance for an address
   */
  async getNarrBalance(address: string): Promise<string> {
    if (!this.narrTokenContract) {
      throw new Error('NARR token contract not initialized');
    }

    try {
      const balance = await this.narrTokenContract.balanceOf(address);
      return ethers.formatUnits(balance, 18);
    } catch (error) {
      throw new Error(`Failed to get NARR balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint a new narrative NFT
   */
  async mintNarrative(
    creatorAddress: string,
    metadataUri: string,
    signer: ethers.Signer
  ): Promise<NftMintResult> {
    if (!this.narrativeNftContract) {
      throw new Error('Narrative NFT contract not initialized');
    }

    try {
      const contractWithSigner = this.narrativeNftContract!.connect(signer) as any;
      const tx = await contractWithSigner.mint(creatorAddress, metadataUri);
      const receipt = await tx.wait();

      // Extract tokenId from Transfer event
      const transferEvent = receipt.logs.find(
        (log: any) => log.topics[0] === ethers.id('Transfer(address,address,uint256)')
      );

      if (!transferEvent) {
        throw new Error('Transfer event not found in transaction receipt');
      }

      const tokenId = parseInt(transferEvent.topics[3], 16);

      return {
        tokenId,
        transactionHash: receipt.hash,
        contractAddress: this.config.narrativeNftAddress,
        creator: creatorAddress,
        metadataUri,
      };
    } catch (error) {
      throw new Error(`Failed to mint narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Stake NARR tokens on a narrative
   */
  async stakeOnNarrative(
    tokenId: number,
    amount: string,
    signer: ethers.Signer
  ): Promise<StakeOperation> {
    if (!this.narrativeNftContract || !this.narrTokenContract) {
      throw new Error('Contracts not initialized');
    }

    try {
      const amountWei = ethers.parseUnits(amount, 18);
      const stakerAddress = await signer.getAddress();

      // First approve the NFT contract to spend NARR tokens
      const narrWithSigner = this.narrTokenContract!.connect(signer) as any;
      const approveTx = await narrWithSigner.approve(this.config.narrativeNftAddress, amountWei);
      await approveTx.wait();

      // Then stake on the narrative
      const nftWithSigner = this.narrativeNftContract!.connect(signer) as any;
      const stakeTx = await nftWithSigner.stake(tokenId, amountWei);
      const receipt = await stakeTx.wait();

      return {
        narrativeId: tokenId,
        amount,
        staker: stakerAddress,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to stake on narrative: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get total amount staked on a narrative
   */
  async getTotalStaked(tokenId: number): Promise<string> {
    if (!this.narrativeNftContract) {
      throw new Error('Narrative NFT contract not initialized');
    }

    try {
      const totalStaked = await this.narrativeNftContract.getTotalStaked(tokenId);
      return ethers.formatUnits(totalStaked, 18);
    } catch (error) {
      throw new Error(`Failed to get total staked: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get narrative NFT metadata URI
   */
  async getNftMetadata(tokenId: number): Promise<string> {
    if (!this.narrativeNftContract) {
      throw new Error('Narrative NFT contract not initialized');
    }

    try {
      return await this.narrativeNftContract.tokenURI(tokenId);
    } catch (error) {
      throw new Error(`Failed to get NFT metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get the owner of a narrative NFT
   */
  async getNftOwner(tokenId: number): Promise<string> {
    if (!this.narrativeNftContract) {
      throw new Error('Narrative NFT contract not initialized');
    }

    try {
      return await this.narrativeNftContract.ownerOf(tokenId);
    } catch (error) {
      throw new Error(`Failed to get NFT owner: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Listen for staking events
   */
  onStakeEvent(callback: (event: StakeOperation) => void): void {
    if (!this.narrativeNftContract) {
      throw new Error('Narrative NFT contract not initialized');
    }

    this.narrativeNftContract.on('Stake', async (tokenId, staker, amount, event) => {
      const stakeOperation: StakeOperation = {
        narrativeId: tokenId,
        amount: ethers.formatUnits(amount, 18),
        staker,
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber,
        timestamp: new Date(),
      };

      callback(stakeOperation);
    });
  }

  /**
   * Stop listening for events
   */
  removeAllListeners(): void {
    if (this.narrativeNftContract) {
      this.narrativeNftContract.removeAllListeners();
    }
    if (this.narrTokenContract) {
      this.narrTokenContract.removeAllListeners();
    }
  }

  /**
   * Check if the provider is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return Number(network.chainId) === this.config.chainId;
    } catch {
      return false;
    }
  }
}

export default NarrativeContracts;
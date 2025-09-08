/**
 * T050: Implement NarrativeService
 * 
 * Core service for narrative NFT management and semantic analysis
 */

import { NarrativeNFT, NarrativeStatus, Modality } from '../models/NarrativeNFT';
import { SemanticEngine } from '../lib/semantic-engine';
import { NarrativeContracts } from '../lib/narrative-contracts';
import { MarketDataEngine } from '../lib/market-data';

export interface CreateNarrativeRequest {
  name: string;
  description: string;
  content: string;
  tags: string[];
  modality: Modality;
  creatorAddress: string;
  metadataUri?: string;
}

export interface NarrativeSearchFilters {
  tags?: string[];
  modality?: Modality;
  status?: NarrativeStatus;
  minStake?: number;
  maxStake?: number;
  createdAfter?: Date;
  createdBefore?: Date;
  creatorAddress?: string;
}

export interface SimilaritySearchRequest {
  queryText: string;
  threshold?: number;
  limit?: number;
  filters?: NarrativeSearchFilters;
}

export class NarrativeService {
  private narratives: Map<string, NarrativeNFT> = new Map();
  private semanticEngine: SemanticEngine;
  private contractsEngine?: NarrativeContracts;
  private marketEngine: MarketDataEngine;

  constructor() {
    this.semanticEngine = new SemanticEngine();
    this.marketEngine = new MarketDataEngine();
    this.initializeContracts();
  }

  /**
   * Initialize blockchain contracts
   */
  private initializeContracts(): void {
    if (process.env.ETHEREUM_RPC_URL && process.env.NARR_TOKEN_ADDRESS && process.env.NARRATIVE_NFT_ADDRESS) {
      this.contractsEngine = new NarrativeContracts({
        narrTokenAddress: process.env.NARR_TOKEN_ADDRESS,
        narrativeNftAddress: process.env.NARRATIVE_NFT_ADDRESS,
        providerUrl: process.env.ETHEREUM_RPC_URL,
        chainId: parseInt(process.env.CHAIN_ID || '31337'),
      });
    }
  }

  /**
   * Create a new narrative NFT
   */
  async createNarrative(request: CreateNarrativeRequest): Promise<NarrativeNFT> {
    // Generate semantic embedding
    const fullText = `${request.name} ${request.description} ${request.content}`;
    const embedding = await this.semanticEngine.generateEmbedding(fullText);

    // Create narrative instance
    const narrative = new NarrativeNFT(
      0, // Will be set after minting
      process.env.NARRATIVE_NFT_ADDRESS || '',
      request.creatorAddress,
      request.name,
      request.description,
      request.tags,
      request.modality,
      embedding.embedding,
      request.metadataUri || '',
      '0',
      0,
      new Date(),
      new Date(),
      NarrativeStatus.ACTIVE
    );

    // Store content separately (not on-chain)
    narrative.setContent(request.content);

    // Generate unique ID for now (in production, would be set by blockchain)
    const narrativeId = `narrative_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    narrative.tokenId = parseInt(narrativeId.replace(/\D/g, '').slice(-8)); // Extract numbers for tokenId

    this.narratives.set(narrativeId, narrative);

    return narrative;
  }

  /**
   * Get narrative by ID
   */
  async getNarrative(narrativeId: string): Promise<NarrativeNFT | null> {
    return this.narratives.get(narrativeId) || null;
  }

  /**
   * Get all narratives with optional filters
   */
  async getNarratives(filters?: NarrativeSearchFilters, limit?: number, offset?: number): Promise<NarrativeNFT[]> {
    let narratives = Array.from(this.narratives.values());

    // Apply filters
    if (filters) {
      if (filters.tags && filters.tags.length > 0) {
        narratives = narratives.filter(n => 
          filters.tags!.some(tag => n.tags.includes(tag))
        );
      }

      if (filters.modality) {
        narratives = narratives.filter(n => n.modality === filters.modality);
      }

      if (filters.status) {
        narratives = narratives.filter(n => n.status === filters.status);
      }

      if (filters.minStake !== undefined) {
        narratives = narratives.filter(n => parseFloat(n.totalStaked) >= filters.minStake!);
      }

      if (filters.maxStake !== undefined) {
        narratives = narratives.filter(n => parseFloat(n.totalStaked) <= filters.maxStake!);
      }

      if (filters.createdAfter) {
        narratives = narratives.filter(n => n.createdAt >= filters.createdAfter!);
      }

      if (filters.createdBefore) {
        narratives = narratives.filter(n => n.createdAt <= filters.createdBefore!);
      }

      if (filters.creatorAddress) {
        narratives = narratives.filter(n => 
          n.creator.toLowerCase() === filters.creatorAddress!.toLowerCase()
        );
      }
    }

    // Sort by creation date (newest first)
    narratives.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    if (offset !== undefined) {
      narratives = narratives.slice(offset);
    }
    if (limit !== undefined) {
      narratives = narratives.slice(0, limit);
    }

    return narratives;
  }

  /**
   * Search for similar narratives using semantic similarity
   */
  async findSimilarNarratives(request: SimilaritySearchRequest): Promise<NarrativeNFT[]> {
    const allNarratives = await this.getNarratives(request.filters);
    
    const candidates = allNarratives.map(narrative => ({
      text: `${narrative.name} ${narrative.description}`,
      embedding: narrative.embedding,
      narrative,
    }));

    const similarResults = await this.semanticEngine.findSimilar(
      request.queryText,
      candidates,
      request.threshold || 0.7,
      request.limit || 20
    );

    return similarResults.map(result => 
      candidates.find(c => c.embedding === result.embedding)!.narrative
    );
  }

  /**
   * Check if two narratives are semantically similar
   */
  async areNarrativesSimilar(
    narrativeId1: string,
    narrativeId2: string,
    threshold: number = 0.85
  ): Promise<boolean> {
    const narrative1 = await this.getNarrative(narrativeId1);
    const narrative2 = await this.getNarrative(narrativeId2);

    if (!narrative1 || !narrative2) {
      throw new Error('One or both narratives not found');
    }

    const text1 = `${narrative1.name} ${narrative1.description}`;
    const text2 = `${narrative2.name} ${narrative2.description}`;

    return await this.semanticEngine.areSimilar(text1, text2, threshold);
  }

  /**
   * Get trending narratives based on market activity
   */
  async getTrendingNarratives(limit: number = 20): Promise<NarrativeNFT[]> {
    const trendingData = this.marketEngine.getTrendingNarratives(limit);
    
    const trendingNarratives: NarrativeNFT[] = [];
    
    for (const trend of trendingData) {
      const narrative = Array.from(this.narratives.values())
        .find(n => n.tokenId === trend.narrative.tokenId);
      
      if (narrative) {
        trendingNarratives.push(narrative);
      }
    }

    return trendingNarratives;
  }

  /**
   * Update narrative staking information
   */
  async updateNarrativeStaking(
    narrativeId: string,
    totalStaked: string,
    uniqueStakers: number
  ): Promise<void> {
    const narrative = this.narratives.get(narrativeId);
    if (!narrative) {
      throw new Error('Narrative not found');
    }

    narrative.totalStaked = totalStaked;
    narrative.uniqueStakers = uniqueStakers;
    narrative.lastActivity = new Date();

    // Update market data
    this.marketEngine.addActivity({
      timestamp: new Date(),
      narrativeId: narrative.tokenId,
      amount: totalStaked,
      action: 'stake',
      staker: 'system', // Placeholder for batch updates
    });
  }

  /**
   * Mark narrative as validated
   */
  async validateNarrative(narrativeId: string, validatorAddress: string): Promise<void> {
    const narrative = this.narratives.get(narrativeId);
    if (!narrative) {
      throw new Error('Narrative not found');
    }

    narrative.status = NarrativeStatus.ACTIVE;
    narrative.lastActivity = new Date();
  }

  /**
   * Flag narrative for review
   */
  async flagNarrative(
    narrativeId: string,
    reason: string,
    reporterAddress: string
  ): Promise<void> {
    const narrative = this.narratives.get(narrativeId);
    if (!narrative) {
      throw new Error('Narrative not found');
    }

    narrative.status = NarrativeStatus.FLAGGED;
    narrative.lastActivity = new Date();

    // In production, this would also create a moderation record
  }

  /**
   * Get narrative statistics
   */
  async getNarrativeStats(): Promise<{
    total: number;
    active: number;
    flagged: number;
    totalValueLocked: string;
    averageStake: string;
  }> {
    const narratives = Array.from(this.narratives.values());
    const active = narratives.filter(n => n.status === NarrativeStatus.ACTIVE).length;
    const flagged = narratives.filter(n => n.status === NarrativeStatus.FLAGGED).length;
    
    const totalStaked = narratives.reduce(
      (sum, n) => sum + parseFloat(n.totalStaked), 
      0
    );
    
    const averageStake = narratives.length > 0 
      ? (totalStaked / narratives.length).toFixed(4)
      : '0';

    return {
      total: narratives.length,
      active,
      flagged,
      totalValueLocked: totalStaked.toFixed(4),
      averageStake,
    };
  }

  /**
   * Get narratives by creator
   */
  async getNarrativesByCreator(creatorAddress: string): Promise<NarrativeNFT[]> {
    return this.getNarratives({
      creatorAddress,
    });
  }

  /**
   * Batch update narratives from blockchain data
   */
  async syncWithBlockchain(): Promise<void> {
    if (!this.contractsEngine) {
      console.warn('Blockchain contracts not configured');
      return;
    }

    // In production, this would sync with actual blockchain data
    console.log('Syncing with blockchain...');
  }

  /**
   * Get semantic embedding for text
   */
  async getTextEmbedding(text: string): Promise<number[]> {
    const result = await this.semanticEngine.generateEmbedding(text);
    return result.embedding;
  }

  /**
   * Clear all narratives (for testing)
   */
  async clearAllNarratives(): Promise<void> {
    this.narratives.clear();
    this.marketEngine.reset();
  }
}

export default NarrativeService;
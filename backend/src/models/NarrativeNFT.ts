/**
 * T035: Create NarrativeNFT model
 * 
 * NarrativeNFT model for narrative NFTs with semantic embeddings
 */

export enum Modality {
  TEXT = 'text',
  IMAGE = 'image', 
  VIDEO = 'video',
  AUDIO = 'audio',
  MIXED = 'mixed',
}

export enum NarrativeStatus {
  ACTIVE = 'active',
  FLAGGED = 'flagged',
  ARCHIVED = 'archived',
}

export class NarrativeNFT {
  tokenId: number;
  contractAddress: string;
  creator: string;
  name: string;
  description: string;
  tags: string[];
  modality: Modality;
  embedding: number[];
  metadataUri: string;
  totalStaked: string;
  uniqueStakers: number;
  createdAt: Date;
  lastActivity: Date;
  status: NarrativeStatus;
  private content?: string;

  constructor(
    tokenId: number,
    contractAddress: string,
    creator: string,
    name: string,
    description: string,
    tags: string[],
    modality: Modality,
    embedding: number[],
    metadataUri: string,
    totalStaked: string = '0',
    uniqueStakers: number = 0,
    createdAt: Date = new Date(),
    lastActivity: Date = new Date(),
    status: NarrativeStatus = NarrativeStatus.ACTIVE
  ) {
    if (!name || name.length === 0) {
      throw new Error('Name is required');
    }

    if (!description || description.length === 0) {
      throw new Error('Description is required');
    }

    if (!creator || !this.isValidAddress(creator)) {
      throw new Error('Valid creator address is required');
    }

    if (embedding.length !== 768) {
      throw new Error('Embedding must be 768-dimensional');
    }

    this.tokenId = tokenId;
    this.contractAddress = contractAddress;
    this.creator = creator.toLowerCase();
    this.name = name;
    this.description = description;
    this.tags = tags;
    this.modality = modality;
    this.embedding = embedding;
    this.metadataUri = metadataUri;
    this.totalStaked = totalStaked;
    this.uniqueStakers = uniqueStakers;
    this.createdAt = createdAt;
    this.lastActivity = lastActivity;
    this.status = status;
  }

  /**
   * Validate Ethereum address format
   */
  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Calculate semantic similarity with another narrative
   */
  calculateSimilarity(other: NarrativeNFT): number {
    if (this.embedding.length !== other.embedding.length) {
      return 0;
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < this.embedding.length; i++) {
      dotProduct += this.embedding[i] * other.embedding[i];
      norm1 += this.embedding[i] * this.embedding[i];
      norm2 += other.embedding[i] * other.embedding[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Check if narrative has a specific tag
   */
  hasTag(tag: string): boolean {
    return this.tags.some(t => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Add tags to narrative
   */
  addTags(newTags: string[]): void {
    const uniqueTags = newTags.filter(tag => !this.hasTag(tag));
    this.tags.push(...uniqueTags);
    this.lastActivity = new Date();
  }

  /**
   * Update staking information
   */
  updateStaking(totalStaked: string, uniqueStakers: number): void {
    this.totalStaked = totalStaked;
    this.uniqueStakers = uniqueStakers;
    this.lastActivity = new Date();
  }

  /**
   * Set narrative content (stored separately from metadata)
   */
  setContent(content: string): void {
    this.content = content;
  }

  /**
   * Get narrative content
   */
  getContent(): string | undefined {
    return this.content;
  }

  /**
   * Get display name for creator
   */
  getCreatorDisplayName(): string {
    return `${this.creator.slice(0, 6)}...${this.creator.slice(-4)}`;
  }

  /**
   * Check if narrative is active
   */
  isActive(): boolean {
    return this.status === NarrativeStatus.ACTIVE;
  }

  /**
   * Flag narrative for review
   */
  flag(): void {
    this.status = NarrativeStatus.FLAGGED;
    this.lastActivity = new Date();
  }

  /**
   * Archive narrative
   */
  archive(): void {
    this.status = NarrativeStatus.ARCHIVED;
    this.lastActivity = new Date();
  }

  /**
   * Reactivate narrative
   */
  reactivate(): void {
    this.status = NarrativeStatus.ACTIVE;
    this.lastActivity = new Date();
  }

  /**
   * Get tag categories (assumes tags follow category:value format)
   */
  getTagCategories(): Record<string, string[]> {
    const categories: Record<string, string[]> = {};
    
    this.tags.forEach(tag => {
      if (tag.includes(':')) {
        const [category, value] = tag.split(':', 2);
        if (!categories[category]) {
          categories[category] = [];
        }
        categories[category].push(value);
      } else {
        if (!categories['general']) {
          categories['general'] = [];
        }
        categories['general'].push(tag);
      }
    });

    return categories;
  }

  /**
   * Convert to JSON-serializable object
   */
  toJSON(): {
    tokenId: number;
    contractAddress: string;
    creator: string;
    creatorDisplayName: string;
    name: string;
    description: string;
    tags: string[];
    tagCategories: Record<string, string[]>;
    modality: Modality;
    metadataUri: string;
    totalStaked: string;
    uniqueStakers: number;
    createdAt: string;
    lastActivity: string;
    status: NarrativeStatus;
    isActive: boolean;
  } {
    return {
      tokenId: this.tokenId,
      contractAddress: this.contractAddress,
      creator: this.creator,
      creatorDisplayName: this.getCreatorDisplayName(),
      name: this.name,
      description: this.description,
      tags: this.tags,
      tagCategories: this.getTagCategories(),
      modality: this.modality,
      metadataUri: this.metadataUri,
      totalStaked: this.totalStaked,
      uniqueStakers: this.uniqueStakers,
      createdAt: this.createdAt.toISOString(),
      lastActivity: this.lastActivity.toISOString(),
      status: this.status,
      isActive: this.isActive(),
    };
  }
}

export default NarrativeNFT;
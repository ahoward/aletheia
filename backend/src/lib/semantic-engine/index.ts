/**
 * T044: Create semantic-engine library with CLI
 * 
 * Semantic engine for embedding generation and similarity calculations
 */

export interface SemanticEmbedding {
  text: string;
  embedding: number[];
  model: string;
  timestamp: Date;
}

export interface SimilarityResult {
  text: string;
  similarity: number;
  embedding: number[];
}

export class SemanticEngine {
  private modelName: string;
  private apiEndpoint: string;

  constructor(options: { modelName?: string; apiEndpoint?: string } = {}) {
    this.modelName = options.modelName || 'sentence-transformers/all-MiniLM-L6-v2';
    this.apiEndpoint = options.apiEndpoint || process.env.SEMANTIC_SERVICE_URL || 'http://localhost:5000';
  }

  /**
   * Generate semantic embedding for text
   */
  async generateEmbedding(text: string): Promise<SemanticEmbedding> {
    if (!text || text.trim().length === 0) {
      throw new Error('Text cannot be empty');
    }

    if (text.length > 5000) {
      throw new Error('Text cannot exceed 5000 characters');
    }

    try {
      // In production, this would call a Python microservice
      // For now, return mock embedding
      const mockEmbedding = this.generateMockEmbedding(text);

      return {
        text,
        embedding: mockEmbedding,
        model: this.modelName,
        timestamp: new Date(),
      };
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (embedding1.length !== embedding2.length) {
      throw new Error('Embeddings must have the same dimensions');
    }

    if (embedding1.length !== 768) {
      throw new Error('Embeddings must be 768-dimensional');
    }

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      norm1 += embedding1[i] * embedding1[i];
      norm2 += embedding2[i] * embedding2[i];
    }

    if (norm1 === 0 || norm2 === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
  }

  /**
   * Find similar texts from a collection
   */
  async findSimilar(
    queryText: string,
    candidates: Array<{ text: string; embedding: number[] }>,
    threshold: number = 0.8,
    limit: number = 50
  ): Promise<SimilarityResult[]> {
    const queryEmbedding = await this.generateEmbedding(queryText);

    const results = candidates
      .map(candidate => ({
        text: candidate.text,
        similarity: this.calculateSimilarity(queryEmbedding.embedding, candidate.embedding),
        embedding: candidate.embedding,
      }))
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return results;
  }

  /**
   * Check if two texts are semantically similar above threshold
   */
  async areSimilar(text1: string, text2: string, threshold: number = 0.95): Promise<boolean> {
    const [embedding1, embedding2] = await Promise.all([
      this.generateEmbedding(text1),
      this.generateEmbedding(text2),
    ]);

    const similarity = this.calculateSimilarity(embedding1.embedding, embedding2.embedding);
    return similarity >= threshold;
  }

  /**
   * Generate mock embedding for development
   */
  private generateMockEmbedding(text: string): number[] {
    // Simple hash-based mock embedding for development
    const hash = this.simpleHash(text);
    const embedding = new Array(768);
    
    for (let i = 0; i < 768; i++) {
      // Generate deterministic but varied values based on text hash
      const seed = (hash + i) * 2654435761;
      embedding[i] = (Math.sin(seed) * 2) - 1; // Normalize to [-1, 1]
    }
    
    // Normalize the vector
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  /**
   * Simple hash function for mock embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default SemanticEngine;
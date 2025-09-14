/**
 * Persistent Thought Storage System
 *
 * Stores captured thoughts in local files within the workspace root to survive MCP server restarts.
 * Uses JSON format for structured storage and easy querying.
 */

import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { CapturedThought } from '../types/index.js';

export interface StoredThought extends CapturedThought {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThoughtStorageOptions {
  workspaceRoot: string;
  storageDir?: string; // Default: ".loqa-assistant/thoughts"
}

export class ThoughtStorage {
  private workspaceRoot: string;
  private storageDir: string;
  private thoughtsFile: string;
  private indexFile: string;

  constructor(options: ThoughtStorageOptions) {
    this.workspaceRoot = options.workspaceRoot;
    this.storageDir = join(this.workspaceRoot, options.storageDir || '.loqa-assistant/thoughts');
    this.thoughtsFile = join(this.storageDir, 'thoughts.json');
    this.indexFile = join(this.storageDir, 'index.json');
  }

  /**
   * Initialize storage directory and files if they don't exist
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });

      // Initialize thoughts file if it doesn't exist
      try {
        await fs.access(this.thoughtsFile);
      } catch {
        await fs.writeFile(this.thoughtsFile, JSON.stringify([], null, 2));
      }

      // Initialize index file if it doesn't exist
      try {
        await fs.access(this.indexFile);
      } catch {
        const initialIndex = {
          totalThoughts: 0,
          lastUpdated: new Date().toISOString(),
          categories: {},
          tags: {}
        };
        await fs.writeFile(this.indexFile, JSON.stringify(initialIndex, null, 2));
      }
    } catch (error) {
      throw new Error(`Failed to initialize thought storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Store a new thought
   */
  async storeThought(thought: CapturedThought): Promise<StoredThought> {
    await this.initialize();

    const storedThought: StoredThought = {
      ...thought,
      id: this.generateThoughtId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Read existing thoughts
      const existingThoughts = await this.loadThoughts();

      // Add new thought
      existingThoughts.push(storedThought);

      // Write back to file
      await fs.writeFile(this.thoughtsFile, JSON.stringify(existingThoughts, null, 2));

      // Update index
      await this.updateIndex(storedThought, 'add');

      return storedThought;
    } catch (error) {
      throw new Error(`Failed to store thought: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all thoughts from storage
   */
  async loadThoughts(): Promise<StoredThought[]> {
    try {
      const data = await fs.readFile(this.thoughtsFile, 'utf-8');
      return JSON.parse(data) as StoredThought[];
    } catch (error) {
      // Return empty array if file doesn't exist or is corrupted
      return [];
    }
  }

  /**
   * Find thoughts by various criteria
   */
  async findThoughts(criteria: {
    tags?: string[];
    content?: string;
    dateRange?: { from: Date; to: Date };
    limit?: number;
  }): Promise<StoredThought[]> {
    const thoughts = await this.loadThoughts();

    let filtered = thoughts;

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      filtered = filtered.filter(thought =>
        criteria.tags!.some(tag => thought.tags.includes(tag))
      );
    }

    // Filter by content (case-insensitive search)
    if (criteria.content) {
      const searchTerm = criteria.content.toLowerCase();
      filtered = filtered.filter(thought =>
        thought.content.toLowerCase().includes(searchTerm) ||
        (thought.context && thought.context.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by date range
    if (criteria.dateRange) {
      filtered = filtered.filter(thought => {
        const thoughtDate = new Date(thought.createdAt);
        return thoughtDate >= criteria.dateRange!.from && thoughtDate <= criteria.dateRange!.to;
      });
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Apply limit
    if (criteria.limit && criteria.limit > 0) {
      filtered = filtered.slice(0, criteria.limit);
    }

    return filtered;
  }

  /**
   * Get storage statistics
   */
  async getStats(): Promise<{
    totalThoughts: number;
    recentThoughts: number;
    topTags: Array<{ tag: string; count: number }>;
    storageSize: string;
    lastUpdated: string;
  }> {
    const thoughts = await this.loadThoughts();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentThoughts = thoughts.filter(
      thought => new Date(thought.createdAt) > oneWeekAgo
    ).length;

    // Count tags
    const tagCounts: { [key: string]: number } = {};
    thoughts.forEach(thought => {
      thought.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Get file size
    let storageSize = '0 KB';
    try {
      const stats = await fs.stat(this.thoughtsFile);
      const sizeInKB = Math.round(stats.size / 1024 * 100) / 100;
      storageSize = `${sizeInKB} KB`;
    } catch {
      // File might not exist yet
    }

    return {
      totalThoughts: thoughts.length,
      recentThoughts,
      topTags,
      storageSize,
      lastUpdated: thoughts.length > 0
        ? Math.max(...thoughts.map(t => new Date(t.updatedAt).getTime())).toString()
        : 'Never',
    };
  }

  /**
   * Find similar thoughts based on content, tags, and context
   */
  async findSimilarThoughts(newThought: CapturedThought): Promise<Array<{
    thought: StoredThought;
    similarity: number;
    reasons: string[];
  }>> {
    const existingThoughts = await this.loadThoughts();
    const similarities: Array<{
      thought: StoredThought;
      similarity: number;
      reasons: string[];
    }> = [];

    for (const existing of existingThoughts) {
      let similarity = 0;
      const reasons: string[] = [];

      // Content similarity (basic keyword matching)
      const newWords = this.extractKeywords(newThought.content);
      const existingWords = this.extractKeywords(existing.content);
      const commonWords = newWords.filter(word => existingWords.includes(word));

      if (commonWords.length > 0) {
        const contentSimilarity = (commonWords.length * 2) / (newWords.length + existingWords.length);
        similarity += contentSimilarity * 40; // Weight content similarity heavily
        if (contentSimilarity > 0.3) {
          reasons.push(`Shared keywords: ${commonWords.slice(0, 3).join(', ')}`);
        }
      }

      // Tag overlap
      const commonTags = newThought.tags.filter(tag => existing.tags.includes(tag));
      if (commonTags.length > 0) {
        const tagSimilarity = commonTags.length / Math.max(newThought.tags.length, existing.tags.length);
        similarity += tagSimilarity * 30; // Weight tag similarity
        reasons.push(`Common tags: ${commonTags.join(', ')}`);
      }

      // Context similarity
      if (newThought.context && existing.context) {
        const contextWords = this.extractKeywords(newThought.context);
        const existingContextWords = this.extractKeywords(existing.context);
        const commonContextWords = contextWords.filter(word => existingContextWords.includes(word));

        if (commonContextWords.length > 0) {
          similarity += 20; // Context similarity bonus
          reasons.push(`Related context: ${commonContextWords.slice(0, 2).join(', ')}`);
        }
      }

      // Time-based relevance (recent thoughts more likely to be related)
      const daysDiff = (Date.now() - new Date(existing.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < 7) {
        similarity += Math.max(0, 10 * (7 - daysDiff) / 7); // Boost recent thoughts
      }

      if (similarity > 15) { // Only include thoughts with reasonable similarity
        similarities.push({
          thought: existing,
          similarity: Math.round(similarity),
          reasons
        });
      }
    }

    // Sort by similarity score (highest first)
    return similarities.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Update an existing thought by appending new content
   */
  async updateThought(thoughtId: string, additionalContent: string, newTags: string[] = []): Promise<StoredThought> {
    const thoughts = await this.loadThoughts();
    const thoughtIndex = thoughts.findIndex(t => t.id === thoughtId);

    if (thoughtIndex === -1) {
      throw new Error(`Thought with ID ${thoughtId} not found`);
    }

    const existingThought = thoughts[thoughtIndex];

    // Update the thought
    const updatedThought: StoredThought = {
      ...existingThought,
      content: `${existingThought.content}\n\n**Update (${new Date().toISOString().split('T')[0]}):** ${additionalContent}`,
      tags: [...new Set([...existingThought.tags, ...newTags])], // Merge tags without duplicates
      updatedAt: new Date().toISOString(),
    };

    // Replace in array
    thoughts[thoughtIndex] = updatedThought;

    // Save back to file
    await fs.writeFile(this.thoughtsFile, JSON.stringify(thoughts, null, 2));

    return updatedThought;
  }

  /**
   * Delete a specific thought by ID
   */
  async deleteThought(thoughtId: string): Promise<boolean> {
    const thoughts = await this.loadThoughts();
    const initialLength = thoughts.length;

    // Filter out the thought with the specified ID
    const filteredThoughts = thoughts.filter(t => t.id !== thoughtId);

    if (filteredThoughts.length === initialLength) {
      return false; // Thought not found
    }

    // Save the updated thoughts array
    await fs.writeFile(this.thoughtsFile, JSON.stringify(filteredThoughts, null, 2));

    // Update index
    await this.updateIndex(thoughts.find(t => t.id === thoughtId)!, 'remove');

    return true;
  }

  /**
   * Get aging thoughts (older than specified days)
   */
  async getAgingThoughts(daysOld: number = 7): Promise<{
    aging: StoredThought[];
    stale: StoredThought[];
    stats: {
      totalThoughts: number;
      agingCount: number;
      staleCount: number;
      averageAge: number;
    };
  }> {
    const thoughts = await this.loadThoughts();
    const now = new Date();
    const agingThreshold = new Date(now.getTime() - daysOld * 24 * 60 * 60 * 1000);
    const staleThreshold = new Date(now.getTime() - (daysOld * 2) * 24 * 60 * 60 * 1000);

    const aging = thoughts.filter(t => new Date(t.createdAt) < agingThreshold && new Date(t.createdAt) >= staleThreshold);
    const stale = thoughts.filter(t => new Date(t.createdAt) < staleThreshold);

    // Calculate average age in days
    const totalAge = thoughts.reduce((sum, t) => {
      const age = (now.getTime() - new Date(t.createdAt).getTime()) / (24 * 60 * 60 * 1000);
      return sum + age;
    }, 0);
    const averageAge = thoughts.length > 0 ? totalAge / thoughts.length : 0;

    return {
      aging,
      stale,
      stats: {
        totalThoughts: thoughts.length,
        agingCount: aging.length,
        staleCount: stale.length,
        averageAge: Math.round(averageAge * 10) / 10,
      },
    };
  }

  /**
   * Clear all thoughts (with confirmation)
   */
  async clearThoughts(confirmation: boolean = false): Promise<void> {
    if (!confirmation) {
      throw new Error('Clearing thoughts requires explicit confirmation');
    }

    try {
      await fs.writeFile(this.thoughtsFile, JSON.stringify([], null, 2));

      const emptyIndex = {
        totalThoughts: 0,
        lastUpdated: new Date().toISOString(),
        categories: {},
        tags: {}
      };
      await fs.writeFile(this.indexFile, JSON.stringify(emptyIndex, null, 2));
    } catch (error) {
      throw new Error(`Failed to clear thoughts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract meaningful keywords from text for similarity matching
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'should', 'could', 'can', 'may', 'might', 'must', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
    ]);

    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 20); // Limit to top 20 keywords
  }

  /**
   * Generate a unique thought ID
   */
  private generateThoughtId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `thought_${timestamp}_${random}`;
  }

  /**
   * Update the index file with thought metadata
   */
  private async updateIndex(thought: StoredThought, operation: 'add' | 'remove'): Promise<void> {
    try {
      let index: any;
      try {
        const indexData = await fs.readFile(this.indexFile, 'utf-8');
        index = JSON.parse(indexData);
      } catch {
        index = { totalThoughts: 0, lastUpdated: new Date().toISOString(), categories: {}, tags: {} };
      }

      if (operation === 'add') {
        index.totalThoughts += 1;

        // Update tag counts
        thought.tags.forEach(tag => {
          index.tags[tag] = (index.tags[tag] || 0) + 1;
        });
      } else if (operation === 'remove') {
        index.totalThoughts = Math.max(0, index.totalThoughts - 1);

        // Decrease tag counts
        thought.tags.forEach(tag => {
          if (index.tags[tag]) {
            index.tags[tag] = Math.max(0, index.tags[tag] - 1);
            if (index.tags[tag] === 0) {
              delete index.tags[tag];
            }
          }
        });
      }

      index.lastUpdated = new Date().toISOString();

      await fs.writeFile(this.indexFile, JSON.stringify(index, null, 2));
    } catch (error) {
      // Index update failure shouldn't prevent thought storage
      console.warn('Failed to update thought index:', error);
    }
  }
}
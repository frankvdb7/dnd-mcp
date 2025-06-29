// Unit tests for UnifiedSearchEngine
// This file can be used with Jest or any other test framework

import { UnifiedSearchEngine } from '../dist/unified-search-engine.js';

describe('UnifiedSearchEngine', () => {
  let searchEngine;
  
  beforeEach(() => {
    searchEngine = new UnifiedSearchEngine();
  });
  
  afterEach(() => {
    // Clear cache between tests
    searchEngine.clearCache();
  });

  describe('Basic Search Functionality', () => {
    it('should search across all content types by default', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'fireball',
        limit: 5
      });
      
      expect(result.query).toBe('fireball');
      expect(result.totalResults).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(5000); // Under 5 seconds
      expect(typeof result.results).toBe('object');
    }, 10000); // 10 second timeout for API calls
    
    it('should filter by specific content types', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'dragon',
        contentTypes: ['monsters'],
        limit: 3
      });
      
      expect(result.results.monsters).toBeDefined();
      expect(result.results.monsters.items.length).toBeGreaterThan(0);
      
      // Should not have results for other content types (they should have 0 items)
      expect(result.results.spells.items.length).toBe(0);
    }, 10000);
    
    it('should limit results per content type', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'sword',
        contentTypes: ['weapons'],
        limit: 2
      });
      
      expect(result.results.weapons.items.length).toBeLessThanOrEqual(2);
    }, 10000);
  });

  describe('Input Validation', () => {
    it('should require a non-empty query', async () => {
      await expect(searchEngine.unifiedSearch({ query: '' }))
        .rejects
        .toThrow('Search query is required and must be a non-empty string');
    });
    
    it('should handle invalid content types gracefully', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'test',
        contentTypes: ['invalid-type'],
        limit: 1
      });
      
      // Should return empty results for invalid content type
      expect(result.totalResults).toBe(0);
    });
    
    it('should clamp limit values to valid range', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'test',
        limit: 100, // Should be clamped to 20
        contentTypes: ['spells']
      });
      
      // Verify the normalized limit was applied
      expect(result.results.spells.items.length).toBeLessThanOrEqual(20);
    }, 10000);
  });

  describe('Relevance Ranking', () => {
    it('should rank exact matches higher than partial matches', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'fire',
        contentTypes: ['spells'],
        limit: 10,
        sortBy: 'relevance'
      });
      
      if (result.results.spells.items.length >= 2) {
        const items = result.results.spells.items;
        
        // Find items with exact and partial matches
        const exactMatch = items.find(item => 
          item.name.toLowerCase() === 'fire'
        );
        const partialMatch = items.find(item => 
          item.name.toLowerCase().includes('fire') && 
          item.name.toLowerCase() !== 'fire'
        );
        
        if (exactMatch && partialMatch) {
          expect(exactMatch.relevanceScore).toBeGreaterThan(partialMatch.relevanceScore);
        }
      }
    }, 10000);
    
    it('should sort by name when requested', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'fire',
        contentTypes: ['spells'],
        limit: 5,
        sortBy: 'name'
      });
      
      if (result.results.spells.items.length >= 2) {
        const items = result.results.spells.items;
        for (let i = 1; i < items.length; i++) {
          expect(items[i].name.localeCompare(items[i-1].name)).toBeGreaterThanOrEqual(0);
        }
      }
    }, 10000);
  });

  describe('Caching', () => {
    it('should cache search results', async () => {
      const query = { query: 'test-cache', limit: 1 };
      
      // First search - should be slow
      const start1 = Date.now();
      const result1 = await searchEngine.unifiedSearch(query);
      const duration1 = Date.now() - start1;
      
      // Second search - should be fast (cached)
      const start2 = Date.now();
      const result2 = await searchEngine.unifiedSearch(query);
      const duration2 = Date.now() - start2;
      
      expect(duration2).toBeLessThan(duration1);
      expect(result1.totalResults).toBe(result2.totalResults);
    }, 15000);
    
    it('should provide cache statistics', () => {
      const stats = searchEngine.getCacheStats();
      
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('keys');
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.keys).toBe('number');
    });
  });

  describe('Result Structure', () => {
    it('should return properly structured results', async () => {
      const result = await searchEngine.unifiedSearch({
        query: 'magic',
        limit: 2
      });
      
      // Check top-level structure
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('totalResults');
      expect(result).toHaveProperty('executionTime');
      expect(result).toHaveProperty('results');
      
      // Check results structure
      expect(typeof result.results).toBe('object');
      
      // Check individual content type structure
      const spellResults = result.results.spells;
      expect(spellResults).toHaveProperty('count');
      expect(spellResults).toHaveProperty('items');
      expect(spellResults).toHaveProperty('hasMore');
      expect(Array.isArray(spellResults.items)).toBe(true);
      
      // Check item structure if items exist
      if (spellResults.items.length > 0) {
        const item = spellResults.items[0];
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('contentType');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('relevanceScore');
      }
    }, 10000);
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      // This test assumes that an invalid query might cause API errors
      // but the search engine should handle them gracefully
      const result = await searchEngine.unifiedSearch({
        query: 'nonexistent-impossible-query-xyz123',
        limit: 1
      });
      
      // Should not throw an error, even if no results found
      expect(result).toHaveProperty('totalResults');
      expect(result.totalResults).toBeGreaterThanOrEqual(0);
    }, 10000);
  });
});

// Export for potential use in other test files
export { UnifiedSearchEngine };
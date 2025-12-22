// Unit tests for Open5eClient
// This file can be used with Jest or any other test framework

import { Open5eClient } from '../dist/open5e-client.js';
import { jest } from '@jest/globals';

describe('Open5eClient', () => {
  let client;
  let makeRequestSpy;

  beforeEach(() => {
    client = new Open5eClient();
    // Spy on the makeRequest method to avoid actual API calls
    makeRequestSpy = jest.spyOn(client, 'makeRequest').mockImplementation(async (path, params) => {
      // Mocked response for monster searches
      if (path.includes('/v1/monsters/')) {
        const allMonsters = [
          { name: 'Acolyte', challenge_rating: '1/4', type: 'humanoid' },
          { name: 'Adult Black Dragon', challenge_rating: '14', type: 'dragon' },
          { name: 'Ape', challenge_rating: '1/2', type: 'beast' },
          { name: 'Archmage', challenge_rating: '12', type: 'humanoid' },
          { name: 'Bandit', challenge_rating: '1/8', type: 'humanoid' },
          { name: 'Bugbear', challenge_rating: '1', type: 'humanoid' },
          { name: 'Goblin', challenge_rating: '1/4', type: 'humanoid' },
          { name: 'Wolf', challenge_rating: '1/4', type: 'beast' },
          { name: 'Dire Wolf', challenge_rating: '1', type: 'beast' },
          { name: 'Giant Eagle', challenge_rating: '1', type: 'beast' },
          { name: 'Lion', challenge_rating: '1', type: 'beast' },
          { name: 'Tiger', challenge_rating: '1', type: 'beast' },
          { name: 'Brown Bear', challenge_rating: '1', type: 'beast' },
          { name: 'Rhinoceros', challenge_rating: '2', type: 'beast' },
          { name: 'Sabertooth Tiger', challenge_rating: '2', type: 'beast' },
          { name: 'Elephant', challenge_rating: '4', type: 'beast' },
          { name: 'T-Rex', challenge_rating: '8', type: 'beast' },
        ].map(m => ({ ...m, type: m.type || 'unknown', challenge_rating: m.challenge_rating || '0' }));

        let monsters = allMonsters;
        if (params && params.cr__gte !== undefined && params.cr__lte !== undefined) {
          monsters = allMonsters.filter(m => {
            const cr = m.challenge_rating.includes('/') ? parseFloat(m.challenge_rating.split('/')[0]) / parseFloat(m.challenge_rating.split('/')[1]) : parseFloat(m.challenge_rating);
            return cr >= params.cr__gte && cr <= params.cr__lte;
          });
        }

        return Promise.resolve({
          count: monsters.length,
          results: monsters,
          hasMore: false,
        });
      }
      return Promise.resolve({ count: 0, results: [], hasMore: false });
    });
  });

  afterEach(() => {
    // Clear cache between tests and restore mocks
    client.clearCache();
    makeRequestSpy.mockRestore();
  });

  describe('getMonstersByCRRange', () => {
    it('should call makeRequest with the correct parameters', async () => {
      const minCR = 1;
      const maxCR = 2;
      await client.getMonstersByCRRange(minCR, maxCR);
      expect(makeRequestSpy).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
        cr__gte: minCR,
        cr__lte: maxCR,
      }));
    });

    it('should return monsters within the specified CR range', async () => {
      const minCR = 1;
      const maxCR = 2;
      const monsters = await client.getMonstersByCRRange(minCR, maxCR);
      for (const monster of monsters) {
        if (monster.challenge_rating) {
          const cr = monster.challenge_rating.includes('/') ? parseFloat(monster.challenge_rating.split('/')[0]) / parseFloat(monster.challenge_rating.split('/')[1]) : parseFloat(monster.challenge_rating);
          expect(cr).toBeGreaterThanOrEqual(minCR);
          expect(cr).toBeLessThanOrEqual(maxCR);
        }
      }
    });

    it('should respect the limit parameter', async () => {
      const limit = 5;
      const monsters = await client.getMonstersByCRRange(1, 10, undefined, undefined, limit);
      expect(monsters.length).toBeLessThanOrEqual(limit);
    });

    it('should filter by type', async () => {
      const type = 'beast';
      const monsters = await client.getMonstersByCRRange(1, 10, undefined, [type]);
      for (const monster of monsters) {
        expect(monster.type.toLowerCase()).toContain(type);
      }
    });
  });
});

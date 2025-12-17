import { Open5eClient } from '../src/open5e-client';
import { MonsterData } from '../src/open5e-client';

describe('getMonstersByCRRange', () => {
  let client: Open5eClient;

  beforeEach(() => {
    client = new Open5eClient();
  });

  it('should return monsters within the specified CR range', async () => {
    const minCR = 1;
    const maxCR = 2;
    const limit = 10;
    const monsters: MonsterData[] = await client.getMonstersByCRRange(minCR, maxCR, undefined, undefined, limit);

    expect(monsters.length).toBeGreaterThan(0);
    expect(monsters.length).toBeLessThanOrEqual(limit);

    for (const monster of monsters) {
      const cr = parseFloat(monster.challengeRating);
      expect(cr).toBeGreaterThanOrEqual(minCR);
      expect(cr).toBeLessThanOrEqual(maxCR);
    }
  }, 60000);

  it('should return monsters with the correct type when filtered', async () => {
    const minCR = 1;
    const maxCR = 5;
    const limit = 5;
    const type = 'beast';
    const monsters: MonsterData[] = await client.getMonstersByCRRange(minCR, maxCR, undefined, [type], limit);

    expect(monsters.length).toBeGreaterThan(0);
    expect(monsters.length).toBeLessThanOrEqual(limit);

    for (const monster of monsters) {
      expect(monster.type.toLowerCase()).toContain(type);
    }
  }, 60000);
});

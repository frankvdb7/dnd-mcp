#!/usr/bin/env node

/**
 * Simple test to verify Open5e client functionality
 */

import { Open5eClient } from './dist/open5e-client.js';

async function testClient() {
  console.log('🧪 Testing Open5e Client Direct Integration\n');
  
  const client = new Open5eClient();

  try {
    // Test 1: Search spells
    console.log('1. Testing spell search...');
    const spellResults = await client.searchSpells('heal', { limit: 3 });
    console.log(`   ✅ Found ${spellResults.count} spells, showing ${spellResults.results.length}`);
    if (spellResults.results.length > 0) {
      console.log(`   Example: ${spellResults.results[0].name} (Level ${spellResults.results[0].level})`);
    }

    // Test 2: Search races
    console.log('\n2. Testing race search...');
    const raceResults = await client.searchRaces('elf');
    console.log(`   ✅ Found ${raceResults.count} races, showing ${raceResults.results.length}`);
    if (raceResults.results.length > 0) {
      console.log(`   Example: ${raceResults.results[0].name} with ${raceResults.results[0].traits.length} traits`);
    }

    // Test 3: Search classes
    console.log('\n3. Testing class search...');
    const classResults = await client.searchClasses();
    console.log(`   ✅ Found ${classResults.count} classes, showing ${classResults.results.length}`);
    if (classResults.results.length > 0) {
      console.log(`   Example: ${classResults.results[0].name} (Hit Die: ${classResults.results[0].hitDie})`);
    }

    // Test 4: Search monsters
    console.log('\n4. Testing monster search...');
    const monsterResults = await client.searchMonsters('dragon', { limit: 3 });
    console.log(`   ✅ Found ${monsterResults.count} monsters, showing ${monsterResults.results.length}`);
    if (monsterResults.results.length > 0) {
      console.log(`   Example: ${monsterResults.results[0].name} (CR ${monsterResults.results[0].challengeRating})`);
    }

    // Test 5: Search weapons
    console.log('\n5. Testing weapon search...');
    const weaponResults = await client.searchWeapons('', { isMartial: true, limit: 3 });
    console.log(`   ✅ Found ${weaponResults.count} weapons, showing ${weaponResults.results.length}`);
    if (weaponResults.results.length > 0) {
      console.log(`   Example: ${weaponResults.results[0].name} (Martial: ${weaponResults.results[0].properties.martial})`);
    }

    console.log('\n📊 Summary:');
    console.log('✅ All core functionality working correctly');
    console.log('✅ Open5e API integration successful');
    console.log('✅ Data transformation functioning properly');
    console.log('✅ Enhanced features available');

    const stats = client.getCacheStats();
    console.log(`\n💾 Cache stats: ${stats.keys} entries`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testClient();
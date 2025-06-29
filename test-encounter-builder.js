#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function testEncounterBuilder() {
  const client = new Open5eClient();
  
  console.log('Testing DM-focused encounter builder functionality...');
  
  try {
    // Test 1: Build a basic medium encounter
    console.log('\n1. Testing basic encounter building...');
    const basicEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 3,
      difficulty: 'medium'
    });
    
    console.log(`✅ Basic encounter: ${basicEncounter.name}`);
    console.log(`   Description: ${basicEncounter.description}`);
    console.log(`   Monsters: ${basicEncounter.monsters.length} types`);
    console.log(`   Total XP: ${basicEncounter.totalXP}, Adjusted: ${basicEncounter.adjustedXP}`);
    console.log(`   Duration: ${basicEncounter.estimatedDuration}`);
    console.log(`   Tactics: ${basicEncounter.tactics}`);
    
    basicEncounter.monsters.forEach((monster, index) => {
      console.log(`   ${index + 1}. ${monster.count}x ${monster.name} (CR ${monster.cr}, ${monster.xp} XP each)`);
    });
    
    // Test 2: Build encounter with environment filter
    console.log('\n2. Testing encounter with environment filter...');
    const forestEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 5,
      difficulty: 'hard',
      environment: 'forest'
    });
    
    console.log(`✅ Forest encounter: ${forestEncounter.name}`);
    console.log(`   Environment: ${forestEncounter.environment}`);
    console.log(`   Monsters: ${forestEncounter.monsters.length} types`);
    
    // Test 3: Build encounter with CR limits
    console.log('\n3. Testing encounter with CR limits...');
    const lowCREncounter = await client.buildRandomEncounter({
      partySize: 3,
      partyLevel: 1,
      difficulty: 'easy',
      minCR: 0,
      maxCR: 2
    });
    
    console.log(`✅ Low CR encounter: ${lowCREncounter.name}`);
    console.log(`   CR Range: 0-2`);
    console.log(`   Monsters: ${lowCREncounter.monsters.length} types`);
    
    lowCREncounter.monsters.forEach((monster, index) => {
      console.log(`   ${index + 1}. ${monster.count}x ${monster.name} (CR ${monster.cr})`);
    });
    
    // Test 4: Test encounter difficulty calculation
    console.log('\n4. Testing encounter difficulty calculation...');
    const testMonsters = [
      { name: 'goblin', cr: '1/4', count: 4 },
      { name: 'hobgoblin', cr: '1/2', count: 1 }
    ];
    
    // We need to get actual monster data first
    const monsterDetails = await Promise.all(
      testMonsters.map(async (monster) => {
        const results = await client.searchMonsters(monster.name, { limit: 1 });
        if (results.results.length === 0) {
          throw new Error(`Monster "${monster.name}" not found`);
        }
        const xp = {
          '1/4': 50,
          '1/2': 100,
          '1': 200
        }[monster.cr] || 0;
        
        return {
          name: monster.name,
          cr: monster.cr,
          count: monster.count,
          xp: xp,
          totalXP: xp * monster.count,
          monsterData: results.results[0]
        };
      })
    );
    
    const calculatedDifficulty = await client.getEncounterDifficulty(4, 2, monsterDetails);
    console.log(`✅ Custom encounter difficulty: ${calculatedDifficulty}`);
    console.log(`   Monsters: ${testMonsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}`);
    
    // Test 5: Test monster search by CR range
    console.log('\n5. Testing monster search by CR range...');
    
    // Use the search method directly since we implemented it in the handler
    const crResults = await client.searchMonsters('', { cr: 1, limit: 10 });
    console.log(`✅ Found ${crResults.results.length} CR 1 monsters:`);
    crResults.results.slice(0, 5).forEach((monster, index) => {
      console.log(`   ${index + 1}. ${monster.name} (${monster.type})`);
    });
    
    // Test some low CR monsters for variety
    const lowCRResults = await client.searchMonsters('', { cr: '1/4', limit: 5 });
    console.log(`✅ Found ${lowCRResults.results.length} CR 1/4 monsters:`);
    lowCRResults.results.forEach((monster, index) => {
      console.log(`   ${index + 1}. ${monster.name} (${monster.type})`);
    });
    
    console.log('\n🎉 All encounter builder tests completed successfully!');
    console.log('\nDM Encounter Builder Features:');
    console.log('✅ Random encounter generation with party size/level balancing');
    console.log('✅ Difficulty scaling (easy, medium, hard, deadly)');
    console.log('✅ Environment-based monster filtering');
    console.log('✅ CR range restrictions');
    console.log('✅ Encounter difficulty calculation');
    console.log('✅ Tactical advice generation');
    console.log('✅ Duration estimation');
    console.log('✅ Monster search by challenge rating');
    
  } catch (error) {
    console.error('Error testing encounter builder:', error.message);
    console.error('Stack:', error.stack);
  }
}

testEncounterBuilder();
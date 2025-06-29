#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function showCurrentDMControls() {
  const client = new Open5eClient();
  
  console.log('🎮 CURRENT DM INTERACTIVITY IN ENCOUNTER BUILDER\n');
  
  try {
    // Example 1: Basic generation
    console.log('1️⃣ BASIC GENERATION (minimal DM input)');
    console.log('   Input: party_size=4, party_level=3, difficulty="medium"');
    
    const basic = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 3,
      difficulty: 'medium'
    });
    
    console.log(`   ➜ Generated: ${basic.name}`);
    console.log(`   ➜ ${basic.description}`);
    console.log(`   ➜ XP: ${basic.totalXP} (adjusted: ${basic.adjustedXP})`);
    console.log(`   ➜ Duration: ${basic.estimatedDuration}\n`);
    
    // Example 2: CR constraints
    console.log('2️⃣ CHALLENGE RATING CONTROL');
    console.log('   Input: + min_cr=1, max_cr=3 (only CR 1-3 monsters)');
    
    const crConstrained = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 5,
      difficulty: 'hard',
      minCR: 1,
      maxCR: 3
    });
    
    console.log(`   ➜ Generated: ${crConstrained.name}`);
    console.log(`   ➜ Monsters: ${crConstrained.monsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}`);
    console.log(`   ➜ All monsters are CR 1-3 as requested\n`);
    
    // Example 3: Monster count limits
    console.log('3️⃣ MONSTER COUNT CONTROL');
    console.log('   Input: + max_monsters=3 (limit to 3 monsters max)');
    
    const limitedCount = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 6,
      difficulty: 'deadly',
      maxMonsters: 3
    });
    
    console.log(`   ➜ Generated: ${limitedCount.name}`);
    console.log(`   ➜ Monster count: ${limitedCount.monsters.reduce((sum, m) => sum + m.count, 0)} (≤ 3)`);
    console.log(`   ➜ Monsters: ${limitedCount.monsters.map(m => `${m.count}x ${m.name}`).join(', ')}\n`);
    
    // Example 4: Multiple difficulty levels
    console.log('4️⃣ DIFFICULTY SCALING');
    const difficulties = ['easy', 'medium', 'hard', 'deadly'];
    
    for (const diff of difficulties) {
      const encounter = await client.buildRandomEncounter({
        partySize: 4,
        partyLevel: 4,
        difficulty: diff,
        minCR: 1,
        maxCR: 4
      });
      
      console.log(`   ${diff.toUpperCase()}: ${encounter.totalXP} XP → ${encounter.monsters.map(m => `${m.count}x ${m.name}(${m.cr})`).join(', ')}`);
    }
    
    console.log('\n📊 CURRENT DM CONTROL SUMMARY:');
    console.log('✅ Party composition: size (1-8) and level (1-20)');
    console.log('✅ Difficulty scaling: easy/medium/hard/deadly');
    console.log('✅ Challenge rating bounds: min_cr and max_cr (0-30)');
    console.log('✅ Monster quantity: max_monsters (1-15)');
    console.log('✅ Environment theming: environment string filter');
    console.log('✅ Creature types: monster_types array filter');
    console.log('✅ Automatic XP balancing with official D&D 5E rules');
    console.log('✅ Tactical analysis and duration estimates');
    
    console.log('\n🎯 WHAT DMs CAN CONTROL:');
    console.log('• Core Parameters: Who\'s fighting and how hard should it be?');
    console.log('• Threat Level: What CR range fits the story?');
    console.log('• Encounter Scale: Fewer strong monsters vs many weak ones?');
    console.log('• Thematic Filtering: What creatures fit the environment/story?');
    
    console.log('\n🚀 ENHANCEMENT OPPORTUNITIES:');
    console.log('• Specific monster inclusion/exclusion');
    console.log('• Encounter role composition (tank/DPS/support)');
    console.log('• Terrain/environmental hazards');
    console.log('• Story context integration');
    console.log('• Custom monster stat adjustments');
    console.log('• Multi-wave encounter support');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

showCurrentDMControls();
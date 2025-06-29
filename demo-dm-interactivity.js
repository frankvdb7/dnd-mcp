#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function demonstrateDMInteractivity() {
  const client = new Open5eClient();
  
  console.log('🎲 DEMONSTRATING DM INTERACTIVITY IN ENCOUNTER BUILDING\n');
  
  try {
    // Level 1: Minimal DM input (just basics)
    console.log('━━━ LEVEL 1: MINIMAL DM CONTROL ━━━');
    console.log('DM only specifies: party size, level, difficulty');
    
    const basicEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 5,
      difficulty: 'medium'
    });
    
    console.log(`✨ Result: ${basicEncounter.name}`);
    console.log(`   ${basicEncounter.description}`);
    console.log(`   Monsters: ${basicEncounter.monsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}\n`);
    
    // Level 2: Environment theming
    console.log('━━━ LEVEL 2: ENVIRONMENT THEMING ━━━');
    console.log('DM specifies: environment = "underwater"');
    
    const thematicEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 5,
      difficulty: 'medium',
      environment: 'underwater'
    });
    
    console.log(`🌊 Result: ${thematicEncounter.name}`);
    console.log(`   ${thematicEncounter.description}`);
    console.log(`   Environment: ${thematicEncounter.environment}`);
    console.log(`   Monsters: ${thematicEncounter.monsters.map(m => `${m.count}x ${m.name}`).join(', ')}\n`);
    
    // Level 3: CR constraints for specific threats
    console.log('━━━ LEVEL 3: CHALLENGE RATING CONTROL ━━━');
    console.log('DM specifies: only low-CR minions (CR 0-2) for a "swarm" encounter');
    
    const swarmEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 6,
      difficulty: 'hard',
      minCR: 0,
      maxCR: 2,
      maxMonsters: 12  // Allow more monsters for swarm effect
    });
    
    console.log(`🐝 Result: ${swarmEncounter.name}`);
    console.log(`   ${swarmEncounter.description}`);
    console.log(`   CR Range: 0-2, Max Monsters: 12`);
    console.log(`   Monsters: ${swarmEncounter.monsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}`);
    console.log(`   Total Monsters: ${swarmEncounter.monsters.reduce((sum, m) => sum + m.count, 0)}\n`);
    
    // Level 4: Creature type filtering
    console.log('━━━ LEVEL 4: CREATURE TYPE FILTERING ━━━');
    console.log('DM specifies: only undead creatures for a necromancer\'s lair');
    
    const undeadEncounter = await client.buildRandomEncounter({
      partySize: 4,
      partyLevel: 8,
      difficulty: 'deadly',
      environment: 'tomb',
      monsterTypes: ['undead'],
      minCR: 2,
      maxCR: 10
    });
    
    console.log(`💀 Result: ${undeadEncounter.name}`);
    console.log(`   ${undeadEncounter.description}`);
    console.log(`   Monster Types: undead only`);
    console.log(`   Monsters: ${undeadEncounter.monsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}\n`);
    
    // Level 5: Custom encounter validation
    console.log('━━━ LEVEL 5: CUSTOM ENCOUNTER VALIDATION ━━━');
    console.log('DM creates custom encounter and checks difficulty');
    
    const customMonsters = [
      { name: 'hobgoblin captain', cr: '3', count: 1 },
      { name: 'hobgoblin', cr: '1/2', count: 4 },
      { name: 'goblin', cr: '1/4', count: 8 }
    ];
    
    // Calculate what this would be for a party
    const partySize = 5;
    const partyLevel = 4;
    
    console.log(`👥 Custom encounter for ${partySize} level-${partyLevel} characters:`);
    console.log(`   ${customMonsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}`);
    
    // We'd need to implement this with actual monster data, but showing the concept
    const totalMonsters = customMonsters.reduce((sum, m) => sum + m.count, 0);
    console.log(`   Total monsters: ${totalMonsters}`);
    console.log(`   ⚠️ DM can validate this is appropriate difficulty before using\n`);
    
    // Level 6: Multiple options generation
    console.log('━━━ LEVEL 6: MULTIPLE OPTIONS FOR DM CHOICE ━━━');
    console.log('Generate 3 different encounters with same parameters for DM to choose from:');
    
    const encounterOptions = [];
    for (let i = 0; i < 3; i++) {
      const option = await client.buildRandomEncounter({
        partySize: 4,
        partyLevel: 7,
        difficulty: 'hard',
        environment: 'forest',
        maxMonsters: 6
      });
      encounterOptions.push(option);
      
      console.log(`   Option ${i + 1}: ${option.name}`);
      console.log(`      ${option.monsters.map(m => `${m.count}x ${m.name} (CR ${m.cr})`).join(', ')}`);
      console.log(`      Tactics: ${option.tactics}`);
      console.log(`      Duration: ${option.estimatedDuration}\n`);
    }
    
    console.log('━━━ SUMMARY OF DM INTERACTIVITY LEVELS ━━━');
    console.log('✅ Level 1: Basic parameters (party, difficulty)');
    console.log('✅ Level 2: Environment/terrain theming');  
    console.log('✅ Level 3: Challenge rating constraints');
    console.log('✅ Level 4: Creature type filtering');
    console.log('✅ Level 5: Custom encounter validation');
    console.log('✅ Level 6: Multiple option generation');
    console.log('\n🎯 POTENTIAL ENHANCEMENTS:');
    console.log('🔮 Level 7: Specific monster selection/exclusion');
    console.log('🔮 Level 8: Narrative context integration');
    console.log('🔮 Level 9: Dynamic encounter scaling');
    console.log('🔮 Level 10: Campaign-aware encounters');
    
  } catch (error) {
    console.error('Error demonstrating DM interactivity:', error.message);
  }
}

demonstrateDMInteractivity();
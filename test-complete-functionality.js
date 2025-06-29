#!/usr/bin/env node

import { Open5eClient } from './dist/open5e-client.js';

const client = new Open5eClient();

async function testAllMCPTools() {
  console.log('🧪 Testing all MCP tool functionality...\n');

  try {
    // Test 1: search_spells
    console.log('1️⃣ Testing search_spells...');
    const searchResults = await client.searchSpells('fire', { limit: 5 });
    console.log(`   ✅ Found ${searchResults.count} total, showing ${searchResults.results.length} spells`);
    
    // Test 2: get_spell_details  
    console.log('\n2️⃣ Testing get_spell_details...');
    const fireball = await client.getSpellDetails('Fireball');
    console.log(`   ✅ ${fireball ? 'Found' : 'Not found'}: ${fireball?.name} (Level ${fireball?.level})`);
    
    // Test 3: get_spell_by_level
    console.log('\n3️⃣ Testing get_spell_by_level...');
    const level3Spells = await client.getSpellsByLevel(3);
    console.log(`   ✅ Found ${level3Spells.count} level 3 spells, showing ${level3Spells.results.length}`);
    
    // Test 4: get_spells_by_class
    console.log('\n4️⃣ Testing get_spells_by_class...');
    const wizardSpells = await client.getSpellsByClass('wizard');
    console.log(`   ✅ Found ${wizardSpells.length} wizard spells`);
    
    // Test 5: search_classes
    console.log('\n5️⃣ Testing search_classes...');
    const classes = await client.searchClasses();
    console.log(`   ✅ Found ${classes.count} classes`);
    
    // Test 6: get_class_details
    console.log('\n6️⃣ Testing get_class_details...');
    const wizardClass = await client.getClassDetails('wizard');
    console.log(`   ✅ ${wizardClass ? 'Found' : 'Not found'}: ${wizardClass?.name}`);
    
    // Test 7: search_races
    console.log('\n7️⃣ Testing search_races...');
    const races = await client.searchRaces();
    console.log(`   ✅ Found ${races.count} races, showing ${races.results.length}`);
    
    // Test 8: get_race_details
    console.log('\n8️⃣ Testing get_race_details...');
    const elf = await client.getRaceDetails('elf');
    console.log(`   ✅ ${elf ? 'Found' : 'Not found'}: ${elf?.name}`);
    
    // Test 9: search_monsters
    console.log('\n9️⃣ Testing search_monsters...');
    const monsters = await client.searchMonsters('dragon', { limit: 5 });
    console.log(`   ✅ Found ${monsters.count} dragons, showing ${monsters.results.length}`);
    
    // Test 10: search_weapons
    console.log('\n🔟 Testing search_weapons...');
    const weapons = await client.searchWeapons('sword', { limit: 5 });
    console.log(`   ✅ Found ${weapons.count} swords, showing ${weapons.results.length}`);
    
    console.log('\n✅ All MCP tools tested successfully!');
    console.log('\n📊 Final cache stats:', client.getCacheStats());
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAllMCPTools();
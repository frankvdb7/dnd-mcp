#!/usr/bin/env node

import { Open5eClient } from './dist/open5e-client.js';

const client = new Open5eClient();

async function testGetSpellsByClass() {
  console.log('🧙‍♂️ Testing getSpellsByClass functionality...\n');

  const testClasses = ['wizard', 'sorcerer', 'cleric', 'bard'];
  
  for (const className of testClasses) {
    console.log(`\n📚 Testing ${className} spells:`);
    try {
      const spells = await client.getSpellsByClass(className);
      console.log(`  Found ${spells.length} spells for ${className}`);
      
      if (spells.length > 0) {
        console.log(`  Sample spells: ${spells.slice(0, 3).map(s => s.name).join(', ')}`);
        
        // Test that classes array contains the expected class
        const spellsWithClass = spells.filter(spell => 
          spell.classes.some(cls => cls.toLowerCase().includes(className.toLowerCase()))
        );
        console.log(`  Spells with ${className} in classes: ${spellsWithClass.length}`);
      }
    } catch (error) {
      console.error(`  ❌ Error testing ${className}: ${error.message}`);
    }
  }
}

async function testGetSpellDetails() {
  console.log('\n✨ Testing getSpellDetails functionality...\n');
  
  const testSpells = ['Fireball', 'Shield', 'Magic Missile'];
  
  for (const spellName of testSpells) {
    console.log(`\n🔍 Testing ${spellName}:`);
    try {
      const spell = await client.getSpellDetails(spellName);
      if (spell) {
        console.log(`  ✅ Found: ${spell.name} (Level ${spell.level})`);
        console.log(`  School: ${spell.school}`);
        console.log(`  Classes: ${spell.classes.join(', ')}`);
      } else {
        console.log(`  ❌ Not found: ${spellName}`);
      }
    } catch (error) {
      console.error(`  ❌ Error testing ${spellName}: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Open5e API tests...\n');
  
  try {
    await testGetSpellDetails();
    await testGetSpellsByClass();
    
    console.log('\n📊 Cache stats:', client.getCacheStats());
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
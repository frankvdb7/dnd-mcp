#!/usr/bin/env node

import { Open5eClient } from './dist/open5e-client.js';

const client = new Open5eClient();

async function testArtificerSpells() {
  console.log('🔧 Testing Artificer spell support...\n');

  try {
    const artificerSpells = await client.getSpellsByClass('artificer');
    console.log(`✅ Found ${artificerSpells.length} artificer spells`);
    
    if (artificerSpells.length > 0) {
      console.log('\n📜 Sample artificer spells:');
      artificerSpells.slice(0, 10).forEach((spell, index) => {
        console.log(`${index + 1}. ${spell.name} (Level ${spell.level}) - ${spell.school}`);
      });
      
      // Check for known artificer spells
      const knownArtificerSpells = ['Cure Wounds', 'Detect Magic', 'Identify', 'Shield'];
      console.log('\n🔍 Checking for known artificer spells:');
      knownArtificerSpells.forEach(spellName => {
        const found = artificerSpells.find(s => s.name.toLowerCase().includes(spellName.toLowerCase()));
        console.log(`  ${found ? '✅' : '❌'} ${spellName}: ${found ? 'Found' : 'Not found'}`);
      });
    }
  } catch (error) {
    console.error('❌ Error testing artificer spells:', error.message);
  }
}

testArtificerSpells();
#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function testSpellLists() {
  const client = new Open5eClient();
  
  console.log('Testing spell lists functionality...');
  
  try {
    // Test getting all spell lists first
    console.log('\n1. Testing get all spell lists...');
    const allSpellLists = await client.getAllSpellLists();
    
    console.log(`Found ${allSpellLists.length} total spell lists:`);
    allSpellLists.forEach((spellList, index) => {
      console.log(`${index + 1}. ${spellList.name} (${spellList.slug}) - ${spellList.spellCount} spells`);
    });
    
    // Test basic spell lists search
    console.log('\n\n2. Testing basic spell lists search...');
    const results = await client.searchSpellLists('', { limit: 5 });
    
    console.log(`Found ${results.count} spell lists total`);
    console.log(`Showing ${results.results.length} spell lists:`);
    
    results.results.forEach((spellList, index) => {
      console.log(`\n${index + 1}. ${spellList.name}`);
      console.log(`   Slug: ${spellList.slug}`);
      console.log(`   Spell Count: ${spellList.spellCount}`);
      console.log(`   Description: ${spellList.description}`);
      console.log(`   Document: ${spellList.document.title}`);
      console.log(`   First 5 spells: ${spellList.spells.slice(0, 5).join(', ')}`);
    });
    
    // Test specific spell list details
    console.log('\n\n3. Testing spell list details for "Wizard"...');
    const wizardList = await client.getSpellListDetails('wizard');
    
    if (wizardList) {
      console.log(`Name: ${wizardList.name}`);
      console.log(`Slug: ${wizardList.slug}`);
      console.log(`Total Spells: ${wizardList.spellCount}`);
      console.log(`Description: ${wizardList.description}`);
      console.log(`Sample spells: ${wizardList.spells.slice(0, 10).join(', ')}`);
    } else {
      console.log('Wizard spell list not found');
    }
    
    // Test another class
    console.log('\n\n4. Testing spell list details for "Cleric"...');
    const clericList = await client.getSpellListDetails('cleric');
    
    if (clericList) {
      console.log(`Name: ${clericList.name}`);
      console.log(`Total Spells: ${clericList.spellCount}`);
      console.log(`Sample spells: ${clericList.spells.slice(0, 10).join(', ')}`);
    } else {
      console.log('Cleric spell list not found');
    }
    
    // Test getting detailed spells for a class (limited to avoid too many API calls)
    console.log('\n\n5. Testing detailed spells for "Bard" class (first 5 spells)...');
    const bardSpells = await client.getSpellsForClass('bard');
    
    console.log(`Found ${bardSpells.length} detailed spells for Bard:`);
    bardSpells.slice(0, 5).forEach((spell, index) => {
      console.log(`\n${index + 1}. ${spell.name} (Level ${spell.level})`);
      console.log(`   School: ${spell.school}`);
      console.log(`   Casting Time: ${spell.castingTime}`);
      console.log(`   Range: ${spell.range}`);
      console.log(`   Components: ${spell.components}`);
      console.log(`   Duration: ${spell.duration}`);
      console.log(`   Description: ${spell.description.substring(0, 150)}...`);
    });
    
    // Test another class with fewer spells
    console.log('\n\n6. Testing detailed spells for "Ranger" class (first 3 spells)...');
    const rangerSpells = await client.getSpellsForClass('ranger');
    
    console.log(`Found ${rangerSpells.length} detailed spells for Ranger:`);
    rangerSpells.slice(0, 3).forEach((spell, index) => {
      console.log(`${index + 1}. ${spell.name} (Level ${spell.level}) - ${spell.school}`);
    });
    
    // Test search by partial name
    console.log('\n\n7. Testing search for "sor" (should find sorcerer)...');
    const searchResults = await client.searchSpellLists('sor', { limit: 3 });
    console.log(`Found ${searchResults.count} spell lists matching "sor"`);
    
    searchResults.results.forEach((spellList, index) => {
      console.log(`${index + 1}. ${spellList.name} (${spellList.spellCount} spells)`);
    });
    
  } catch (error) {
    console.error('Error testing spell lists:', error.message);
  }
}

testSpellLists();
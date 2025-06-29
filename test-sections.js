#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function testSections() {
  const client = new Open5eClient();
  
  console.log('Testing rules sections functionality...');
  
  try {
    // Test getting all sections first
    console.log('\n1. Testing get all sections...');
    const allSections = await client.getAllSections();
    
    console.log(`Found ${allSections.length} total sections:`);
    allSections.slice(0, 10).forEach((section, index) => {
      console.log(`${index + 1}. ${section.name} (${section.slug})`);
    });
    
    // Test basic sections search
    console.log('\n\n2. Testing basic sections search...');
    const results = await client.searchSections('', { limit: 5 });
    
    console.log(`Found ${results.count} sections total`);
    console.log(`Showing ${results.results.length} sections:`);
    
    results.results.forEach((section, index) => {
      console.log(`\n${index + 1}. ${section.name}`);
      console.log(`   Slug: ${section.slug}`);
      console.log(`   Description: ${section.description.substring(0, 150)}...`);
    });
    
    // Test search for specific rules
    console.log('\n\n3. Testing search for "abilities"...');
    const abilitiesResults = await client.searchSections('abilities', { limit: 3 });
    console.log(`Found ${abilitiesResults.count} sections matching "abilities"`);
    
    abilitiesResults.results.forEach((section, index) => {
      console.log(`${index + 1}. ${section.name} (${section.slug})`);
    });
    
    // Test search for "combat"
    console.log('\n\n4. Testing search for "combat"...');
    const combatResults = await client.searchSections('combat', { limit: 3 });
    console.log(`Found ${combatResults.count} sections matching "combat"`);
    
    combatResults.results.forEach((section, index) => {
      console.log(`${index + 1}. ${section.name} (${section.slug})`);
    });
    
    // Test specific section details by name
    console.log('\n\n5. Testing section details for "Abilities"...');
    const abilitiesDetails = await client.getSectionDetails('Abilities');
    
    if (abilitiesDetails) {
      console.log(`Name: ${abilitiesDetails.name}`);
      console.log(`Slug: ${abilitiesDetails.slug}`);
      console.log(`Description: ${abilitiesDetails.description.substring(0, 300)}...`);
    } else {
      console.log('Abilities section not found');
    }
    
    // Test section details by slug
    console.log('\n\n6. Testing section details by slug "spellcasting"...');
    const spellcastingDetails = await client.getSectionDetails('spellcasting');
    
    if (spellcastingDetails) {
      console.log(`Name: ${spellcastingDetails.name}`);
      console.log(`Slug: ${spellcastingDetails.slug}`);
      console.log(`Description: ${spellcastingDetails.description.substring(0, 300)}...`);
    } else {
      console.log('Spellcasting section not found');
    }
    
    // Test other core sections
    console.log('\n\n7. Testing details for "Equipment"...');
    const equipmentDetails = await client.getSectionDetails('Equipment');
    
    if (equipmentDetails) {
      console.log(`Found: ${equipmentDetails.name} (${equipmentDetails.slug})`);
    } else {
      console.log('Equipment section not found');
    }
    
    // List all available section names for reference
    console.log('\n\n8. All available sections:');
    allSections.forEach((section, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${section.name.padEnd(25)} (${section.slug})`);
    });
    
  } catch (error) {
    console.error('Error testing sections:', error.message);
  }
}

testSections();
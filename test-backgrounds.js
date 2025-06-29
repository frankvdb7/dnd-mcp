#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function testBackgrounds() {
  const client = new Open5eClient();
  
  console.log('Testing backgrounds functionality...');
  
  try {
    // Test basic backgrounds search
    console.log('\n1. Testing basic backgrounds search...');
    const results = await client.searchBackgrounds('', { limit: 5 });
    
    console.log(`Found ${results.count} backgrounds total`);
    console.log(`Showing ${results.results.length} backgrounds:`);
    
    results.results.forEach((background, index) => {
      console.log(`\n${index + 1}. ${background.name}`);
      console.log(`   Key: ${background.key}`);
      console.log(`   Description: ${background.description.substring(0, 100)}...`);
      console.log(`   Benefits: ${background.benefits.length} listed`);
      if (background.abilityScoreIncrease) {
        console.log(`   Ability Score Increase: ${background.abilityScoreIncrease.substring(0, 50)}...`);
      }
      if (background.skillProficiencies) {
        console.log(`   Skill Proficiencies: ${background.skillProficiencies}`);
      }
    });
    
    // Test search by name
    console.log('\n\n2. Testing search for "acolyte"...');
    const acolyteResults = await client.searchBackgrounds('acolyte', { limit: 3 });
    console.log(`Found ${acolyteResults.count} backgrounds matching "acolyte"`);
    
    acolyteResults.results.forEach((background, index) => {
      console.log(`${index + 1}. ${background.name}`);
    });
    
    // Test search for "artisan"
    console.log('\n\n3. Testing search for "artisan"...');
    const artisanResults = await client.searchBackgrounds('artisan', { limit: 3 });
    console.log(`Found ${artisanResults.count} backgrounds matching "artisan"`);
    
    artisanResults.results.forEach((background, index) => {
      console.log(`${index + 1}. ${background.name}`);
    });
    
    // Test specific background details
    if (results.results.length > 0) {
      const firstBackground = results.results[0];
      console.log(`\n\n4. Testing background details for "${firstBackground.name}"...`);
      const backgroundDetails = await client.getBackgroundDetails(firstBackground.name);
      
      if (backgroundDetails) {
        console.log(`Name: ${backgroundDetails.name}`);
        console.log(`Key: ${backgroundDetails.key}`);
        console.log(`Description: ${backgroundDetails.description}`);
        console.log(`Benefits Count: ${backgroundDetails.benefits.length}`);
        
        // Show first few benefits
        backgroundDetails.benefits.slice(0, 3).forEach((benefit, index) => {
          console.log(`  Benefit ${index + 1}: ${benefit.name} (${benefit.type})`);
          console.log(`    ${benefit.desc.substring(0, 100)}...`);
        });
        
        if (backgroundDetails.skillProficiencies) {
          console.log(`Skill Proficiencies: ${backgroundDetails.skillProficiencies}`);
        }
        if (backgroundDetails.languages) {
          console.log(`Languages: ${backgroundDetails.languages}`);
        }
        if (backgroundDetails.equipment) {
          console.log(`Equipment: ${backgroundDetails.equipment.substring(0, 100)}...`);
        }
      }
    }
    
    // Test specific well-known backgrounds
    console.log('\n\n5. Testing details for "Charlatan"...');
    const charlatanDetails = await client.getBackgroundDetails('Charlatan');
    
    if (charlatanDetails) {
      console.log(`Found: ${charlatanDetails.name}`);
      console.log(`Benefits: ${charlatanDetails.benefits.length}`);
      
      // Show specific benefit types
      const featureBenefit = charlatanDetails.benefits.find(b => b.type === 'feature');
      if (featureBenefit) {
        console.log(`Feature: ${featureBenefit.name}`);
        console.log(`Feature Description: ${featureBenefit.desc.substring(0, 150)}...`);
      }
    } else {
      console.log('Charlatan background not found');
    }
    
    // Test another background
    console.log('\n\n6. Testing details for "Folk Hero"...');
    const folkHeroDetails = await client.getBackgroundDetails('Folk Hero');
    
    if (folkHeroDetails) {
      console.log(`Found: ${folkHeroDetails.name}`);
      console.log(`Benefits: ${folkHeroDetails.benefits.length}`);
    } else {
      console.log('Folk Hero background not found');
    }
    
  } catch (error) {
    console.error('Error testing backgrounds:', error.message);
  }
}

testBackgrounds();
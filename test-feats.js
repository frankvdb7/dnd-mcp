import { Open5eClient } from './dist/open5e-client.js';

async function testFeats() {
  const client = new Open5eClient();
  
  console.log('Testing feats functionality...');
  
  try {
    // Test basic feats search
    console.log('\n1. Testing basic feats search...');
    const results = await client.searchFeats('', { limit: 5 });
    
    console.log(`Found ${results.count} feats total`);
    console.log(`Showing ${results.results.length} feats:`);
    
    results.results.forEach((feat, index) => {
      console.log(`\n${index + 1}. ${feat.name}`);
      console.log(`   Has Prerequisite: ${feat.hasPrerequisite ? 'Yes' : 'No'}`);
      if (feat.prerequisite) {
        console.log(`   Prerequisite: ${feat.prerequisite}`);
      }
      console.log(`   Benefits: ${feat.benefits.length} listed`);
      console.log(`   Description: ${feat.description.substring(0, 100)}...`);
    });
    
    // Test search by prerequisite requirement
    console.log('\n\n2. Testing feats with prerequisites...');
    const prereqResults = await client.searchFeats('', { hasPrerequisite: true, limit: 3 });
    console.log(`Found ${prereqResults.count} feats with prerequisites`);
    
    prereqResults.results.forEach((feat, index) => {
      console.log(`${index + 1}. ${feat.name}`);
      console.log(`   Prerequisite: ${feat.prerequisite}`);
    });
    
    // Test search feats without prerequisites
    console.log('\n\n3. Testing feats without prerequisites...');
    const noPrereqResults = await client.searchFeats('', { hasPrerequisite: false, limit: 3 });
    console.log(`Found ${noPrereqResults.count} feats without prerequisites`);
    
    noPrereqResults.results.forEach((feat, index) => {
      console.log(`${index + 1}. ${feat.name} (no prerequisites)`);
    });
    
    // Test search by name
    console.log('\n\n4. Testing search for "alert"...');
    const alertResults = await client.searchFeats('alert', { limit: 3 });
    console.log(`Found ${alertResults.count} feats matching "alert"`);
    
    alertResults.results.forEach((feat, index) => {
      console.log(`${index + 1}. ${feat.name}`);
    });
    
    // Test specific feat details
    if (results.results.length > 0) {
      const firstFeat = results.results[0];
      console.log(`\n\n5. Testing feat details for "${firstFeat.name}"...`);
      const featDetails = await client.getFeatDetails(firstFeat.name);
      
      if (featDetails) {
        console.log(`Name: ${featDetails.name}`);
        console.log(`Has Prerequisite: ${featDetails.hasPrerequisite}`);
        console.log(`Prerequisite: ${featDetails.prerequisite || 'None'}`);
        console.log(`Benefits Count: ${featDetails.benefits.length}`);
        if (featDetails.benefits.length > 0) {
          console.log(`First Benefit: ${featDetails.benefits[0].desc.substring(0, 100)}...`);
        }
        console.log(`Description: ${featDetails.description.substring(0, 200)}...`);
      }
    }
    
    // Test search for combat feats
    console.log('\n\n6. Testing search for "combat" feats...');
    const combatResults = await client.searchFeats('combat', { limit: 3 });
    console.log(`Found ${combatResults.count} feats with "combat"`);
    
    combatResults.results.forEach((feat, index) => {
      console.log(`${index + 1}. ${feat.name} (Prerequisites: ${feat.hasPrerequisite ? 'Yes' : 'No'})`);
    });
    
  } catch (error) {
    console.error('Error testing feats:', error.message);
  }
}

testFeats();
import { Open5eClient } from './dist/open5e-client.js';

async function testMagicItems() {
  const client = new Open5eClient();
  
  console.log('Testing magic items functionality...');
  
  try {
    // Test basic magic items search
    console.log('\n1. Testing basic magic items search...');
    const results = await client.searchMagicItems('', { limit: 5 });
    
    console.log(`Found ${results.count} magic items total`);
    console.log(`Showing ${results.results.length} magic items:`);
    
    results.results.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log(`   Type: ${item.type}`);
      console.log(`   Rarity: ${item.rarity}`);
      console.log(`   Attunement: ${item.requiresAttunement}`);
      console.log(`   Source: ${item.document.title}`);
    });
    
    // Test search by rarity
    console.log('\n\n2. Testing search by rarity (legendary)...');
    const legendaryResults = await client.searchMagicItems('', { rarity: 'legendary', limit: 3 });
    console.log(`Found ${legendaryResults.count} legendary items`);
    
    legendaryResults.results.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.rarity})`);
    });
    
    // Test search by name
    console.log('\n\n3. Testing search for "sword"...');
    const swordResults = await client.searchMagicItems('sword', { limit: 3 });
    console.log(`Found ${swordResults.count} items with "sword"`);
    
    swordResults.results.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.type}, ${item.rarity})`);
    });
    
    // Test specific item details
    if (results.results.length > 0) {
      const firstItem = results.results[0];
      console.log(`\n\n4. Testing item details for "${firstItem.name}"...`);
      const itemDetails = await client.getMagicItemDetails(firstItem.name);
      
      if (itemDetails) {
        console.log(`Name: ${itemDetails.name}`);
        console.log(`Type: ${itemDetails.type}`);
        console.log(`Rarity: ${itemDetails.rarity}`);
        console.log(`Attunement: ${itemDetails.requiresAttunement}`);
        console.log(`Description: ${itemDetails.description.substring(0, 200)}...`);
      }
    }
    
    // Test filtering by type
    console.log('\n\n5. Testing search by type (weapon)...');
    const weaponResults = await client.searchMagicItems('', { type: 'weapon', limit: 3 });
    console.log(`Found ${weaponResults.count} magic weapons`);
    
    weaponResults.results.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} (${item.rarity})`);
    });
    
  } catch (error) {
    console.error('Error testing magic items:', error.message);
  }
}

testMagicItems();
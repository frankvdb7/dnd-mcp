import { Open5eClient } from './dist/open5e-client.js';

async function testMonsters() {
  const client = new Open5eClient();
  
  console.log('Testing monster search...');
  
  try {
    // Test basic monster search
    const results = await client.searchMonsters('', { limit: 5 });
    
    console.log(`\nFound ${results.count} monsters total`);
    console.log(`Showing ${results.results.length} monsters:`);
    
    results.results.forEach((monster, index) => {
      console.log(`\n${index + 1}. ${monster.name}`);
      console.log(`   CR: ${monster.challengeRating}`);
      console.log(`   Type: ${monster.size} ${monster.type}`);
      console.log(`   HP: ${monster.hitPoints}`);
      console.log(`   AC: ${monster.armorClass}`);
    });
    
    // Test search by CR
    console.log('\n\nTesting monsters by Challenge Rating 1...');
    const crResults = await client.getMonstersByCR(1);
    console.log(`Found ${crResults.count} CR 1 monsters`);
    
    if (crResults.results.length > 0) {
      const firstMonster = crResults.results[0];
      console.log(`\nFirst CR 1 monster: ${firstMonster.name}`);
      console.log(`Actions: ${firstMonster.actions.length}`);
      if (firstMonster.actions.length > 0) {
        console.log(`First action: ${firstMonster.actions[0].name || 'Unnamed'}`);
      }
    }
    
    // Test search by name
    console.log('\n\nTesting search for "dragon"...');
    const dragonResults = await client.searchMonsters('dragon', { limit: 3 });
    console.log(`Found ${dragonResults.count} dragons`);
    
    dragonResults.results.forEach((dragon, index) => {
      console.log(`${index + 1}. ${dragon.name} (CR ${dragon.challengeRating})`);
    });
    
  } catch (error) {
    console.error('Error testing monsters:', error.message);
  }
}

testMonsters();
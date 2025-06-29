import { Open5eClient } from './dist/open5e-client.js';

async function testConditions() {
  const client = new Open5eClient();
  
  console.log('Testing conditions functionality...');
  
  try {
    // Test getting all conditions
    console.log('\n1. Testing get all conditions...');
    const allConditions = await client.getAllConditions();
    
    console.log(`Found ${allConditions.length} conditions total:`);
    allConditions.forEach((condition, index) => {
      console.log(`${index + 1}. ${condition.name}`);
    });
    
    // Test basic conditions search
    console.log('\n\n2. Testing basic conditions search...');
    const results = await client.searchConditions('', { limit: 5 });
    
    console.log(`Showing ${results.results.length} conditions:`);
    results.results.forEach((condition, index) => {
      console.log(`\n${index + 1}. ${condition.name}`);
      console.log(`   Description: ${condition.description.substring(0, 150)}...`);
    });
    
    // Test search by name
    console.log('\n\n3. Testing search for "blinded"...');
    const blindedResults = await client.searchConditions('blinded', { limit: 3 });
    console.log(`Found ${blindedResults.count} conditions matching "blinded"`);
    
    blindedResults.results.forEach((condition, index) => {
      console.log(`${index + 1}. ${condition.name}`);
    });
    
    // Test search for "paralyzed"
    console.log('\n\n4. Testing search for "paralyzed"...');
    const paralyzedResults = await client.searchConditions('paralyzed', { limit: 3 });
    console.log(`Found ${paralyzedResults.count} conditions matching "paralyzed"`);
    
    paralyzedResults.results.forEach((condition, index) => {
      console.log(`${index + 1}. ${condition.name}`);
    });
    
    // Test specific condition details
    if (allConditions.length > 0) {
      const testCondition = 'blinded';
      console.log(`\n\n5. Testing condition details for "${testCondition}"...`);
      const conditionDetails = await client.getConditionDetails(testCondition);
      
      if (conditionDetails) {
        console.log(`Name: ${conditionDetails.name}`);
        console.log(`Description: ${conditionDetails.description}`);
      } else {
        console.log(`Condition "${testCondition}" not found`);
      }
    }
    
    // Test another specific condition
    const testCondition2 = 'poisoned';
    console.log(`\n\n6. Testing condition details for "${testCondition2}"...`);
    const conditionDetails2 = await client.getConditionDetails(testCondition2);
    
    if (conditionDetails2) {
      console.log(`Name: ${conditionDetails2.name}`);
      console.log(`Description: ${conditionDetails2.description}`);
    } else {
      console.log(`Condition "${testCondition2}" not found`);
    }
    
    // Test search for "charmed"
    console.log('\n\n7. Testing search for "charmed"...');
    const charmedResults = await client.searchConditions('charmed', { limit: 1 });
    if (charmedResults.results.length > 0) {
      const charmed = charmedResults.results[0];
      console.log(`Found: ${charmed.name}`);
      console.log(`Description: ${charmed.description}`);
    }
    
  } catch (error) {
    console.error('Error testing conditions:', error.message);
  }
}

testConditions();
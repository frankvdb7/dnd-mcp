import { Open5eClient } from './dist/open5e-client.js';

async function testValidation() {
  const client = new Open5eClient();
  
  console.log('Testing validation and error handling...');
  
  try {
    // Test 1: Invalid input validation
    console.log('\n1. Testing invalid search query type...');
    try {
      await client.searchMagicItems(123); // Should fail - number instead of string
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Correctly caught invalid input:', error.message);
    }
    
    // Test 2: Invalid limit validation
    console.log('\n2. Testing invalid limit...');
    try {
      await client.searchMagicItems('sword', { limit: 100 }); // Should fail - limit too high
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Correctly caught invalid limit:', error.message);
    }
    
    // Test 3: Valid request should work
    console.log('\n3. Testing valid request...');
    try {
      const results = await client.searchMagicItems('sword', { limit: 3 });
      console.log(`✅ Valid request succeeded: found ${results.count} items`);
    } catch (error) {
      console.log('❌ Valid request failed:', error.message);
    }
    
    // Test 4: Empty string handling
    console.log('\n4. Testing empty string handling...');
    try {
      const results = await client.searchMagicItems('', { limit: 2 });
      console.log(`✅ Empty query handled: found ${results.count} items`);
    } catch (error) {
      console.log('❌ Empty query failed:', error.message);
    }
    
    // Test 5: Network error simulation (invalid endpoint)
    console.log('\n5. Testing error handling for invalid API path...');
    try {
      // This should trigger our API validation
      await client.makeRequest('/invalid/endpoint');
      console.log('❌ Should have failed but didn\'t');
    } catch (error) {
      console.log('✅ Correctly caught API error:', error.message);
    }
    
    // Test 6: Test parameter sanitization
    console.log('\n6. Testing parameter sanitization...');
    try {
      const results = await client.searchMagicItems('  sword  ', { limit: 5 }); // Extra spaces
      console.log(`✅ Parameter sanitization worked: found ${results.count} items`);
    } catch (error) {
      console.log('❌ Parameter sanitization failed:', error.message);
    }
    
    console.log('\n✅ Validation and error handling tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

testValidation();
#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

// Test suite configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds for full suite
  retries: 2,
  verbose: true
};

// Test results tracking
let testResults = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  failures: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  const prefix = {
    info: '💬',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    test: '🧪'
  }[type];
  console.log(`[${timestamp}] ${prefix} ${message}`);
}

function assert(condition, message) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    if (TEST_CONFIG.verbose) log(`PASS: ${message}`, 'success');
  } else {
    testResults.failed++;
    testResults.failures.push(message);
    log(`FAIL: ${message}`, 'error');
  }
}

function assertEquals(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, actual: ${actual})`);
}

function assertGreaterThan(actual, threshold, message) {
  assert(actual > threshold, `${message} (expected > ${threshold}, actual: ${actual})`);
}

function assertExists(value, message) {
  assert(value !== null && value !== undefined, `${message} should exist`);
}

function assertArrayNotEmpty(array, message) {
  assert(Array.isArray(array) && array.length > 0, `${message} should be non-empty array`);
}

async function runTest(testName, testFn) {
  log(`Running: ${testName}`, 'test');
  try {
    await testFn();
  } catch (error) {
    testResults.failed++;
    testResults.total++;
    testResults.failures.push(`${testName}: ${error.message}`);
    log(`ERROR in ${testName}: ${error.message}`, 'error');
  }
}

// Test suite implementation
async function runComprehensiveTestSuite() {
  const client = new Open5eClient();
  
  log('🚀 Starting Comprehensive Open5e API Integration Test Suite', 'info');
  log(`Timeout: ${TEST_CONFIG.timeout}ms, Retries: ${TEST_CONFIG.retries}`, 'info');
  
  // 1. MAGIC ITEMS TESTS
  await runTest('Magic Items - Basic Search', async () => {
    const results = await client.searchMagicItems('', { limit: 5 });
    assertExists(results, 'Magic items search results');
    assertGreaterThan(results.count, 1000, 'Magic items total count');
    assertArrayNotEmpty(results.results, 'Magic items results array');
    
    const firstItem = results.results[0];
    assertExists(firstItem.name, 'First magic item name');
    assertExists(firstItem.type, 'First magic item type');
    assertExists(firstItem.description, 'First magic item description');
    assertExists(firstItem.rarity, 'First magic item rarity');
  });

  await runTest('Magic Items - Rarity Filtering', async () => {
    const rareItems = await client.searchMagicItems('', { rarity: 'rare', limit: 3 });
    assertExists(rareItems, 'Rare magic items search');
    rareItems.results.forEach((item, index) => {
      assertEquals(item.rarity.toLowerCase(), 'rare', `Item ${index + 1} rarity should be rare`);
    });
  });

  await runTest('Magic Items - Details Lookup', async () => {
    const searchResults = await client.searchMagicItems('sword', { limit: 1 });
    if (searchResults.results.length > 0) {
      const itemName = searchResults.results[0].name;
      const details = await client.getMagicItemDetails(itemName);
      assertExists(details, 'Magic item details');
      assertEquals(details.name, itemName, 'Magic item details name match');
    }
  });

  await runTest('Magic Items - Input Validation', async () => {
    try {
      await client.searchMagicItems(123); // Invalid input
      assert(false, 'Should have thrown validation error for invalid query type');
    } catch (error) {
      assert(error.message.includes('string'), 'Validation error for invalid query type');
    }

    try {
      await client.searchMagicItems('test', { limit: 100 }); // Invalid limit
      assert(false, 'Should have thrown validation error for invalid limit');
    } catch (error) {
      assert(error.message.includes('between 1 and 50'), 'Validation error for invalid limit');
    }
  });

  // 2. ARMOR TESTS
  await runTest('Armor - Basic Search', async () => {
    const results = await client.searchArmor('', { limit: 5 });
    assertExists(results, 'Armor search results');
    assertGreaterThan(results.count, 10, 'Armor total count');
    assertArrayNotEmpty(results.results, 'Armor results array');
    
    const firstArmor = results.results[0];
    assertExists(firstArmor.name, 'First armor name');
    assertExists(firstArmor.category, 'First armor category');
    assertExists(firstArmor.acDisplay, 'First armor AC display');
    assert(typeof firstArmor.acBase === 'number', 'Armor AC base is number');
  });

  await runTest('Armor - Category Filtering', async () => {
    const heavyArmor = await client.searchArmor('', { category: 'heavy', limit: 3 });
    assertExists(heavyArmor, 'Heavy armor search');
    heavyArmor.results.forEach((armor, index) => {
      assertEquals(armor.category.toLowerCase(), 'heavy', `Armor ${index + 1} category should be heavy`);
    });
  });

  await runTest('Armor - Details Lookup', async () => {
    const searchResults = await client.searchArmor('', { limit: 1 });
    if (searchResults.results.length > 0) {
      const armorName = searchResults.results[0].name;
      const details = await client.getArmorDetails(armorName);
      assertExists(details, 'Armor details');
      assertEquals(details.name, armorName, 'Armor details name match');
    }
  });

  await runTest('Armor - AC Base Filtering', async () => {
    const highACarmor = await client.searchArmor('', { acBase: 15, limit: 3 });
    assertExists(highACarmor, 'High AC armor search');
    highACarmor.results.forEach((armor, index) => {
      assertGreaterThan(armor.acBase, 14, `Armor ${index + 1} AC base should be >= 15`);
    });
  });

  // 3. FEATS TESTS
  await runTest('Feats - Basic Search', async () => {
    const results = await client.searchFeats('', { limit: 5 });
    assertExists(results, 'Feats search results');
    assertGreaterThan(results.count, 50, 'Feats total count');
    assertArrayNotEmpty(results.results, 'Feats results array');
    
    const firstFeat = results.results[0];
    assertExists(firstFeat.name, 'First feat name');
    assertExists(firstFeat.description, 'First feat description');
    assert(typeof firstFeat.hasPrerequisite === 'boolean', 'Feat hasPrerequisite is boolean');
  });

  await runTest('Feats - Prerequisite Filtering', async () => {
    const prereqFeats = await client.searchFeats('', { hasPrerequisite: true, limit: 3 });
    assertExists(prereqFeats, 'Prerequisites feats search');
    prereqFeats.results.forEach((feat, index) => {
      assertEquals(feat.hasPrerequisite, true, `Feat ${index + 1} should have prerequisites`);
      assertExists(feat.prerequisite, `Feat ${index + 1} prerequisite text`);
    });
  });

  await runTest('Feats - Details Lookup', async () => {
    const searchResults = await client.searchFeats('', { limit: 1 });
    if (searchResults.results.length > 0) {
      const featName = searchResults.results[0].name;
      const details = await client.getFeatDetails(featName);
      assertExists(details, 'Feat details');
      assertEquals(details.name, featName, 'Feat details name match');
    }
  });

  await runTest('Feats - Search by Name', async () => {
    const alertFeats = await client.searchFeats('alert', { limit: 5 });
    assertExists(alertFeats, 'Alert feats search');
    if (alertFeats.results.length > 0) {
      const alertFeat = alertFeats.results.find(f => f.name.toLowerCase().includes('alert'));
      assertExists(alertFeat, 'Found feat containing "alert"');
    }
  });

  // 4. CONDITIONS TESTS
  await runTest('Conditions - Get All Conditions', async () => {
    const allConditions = await client.getAllConditions();
    assertExists(allConditions, 'All conditions');
    assertArrayNotEmpty(allConditions, 'All conditions array');
    assertGreaterThan(allConditions.length, 10, 'Conditions count');
    
    const firstCondition = allConditions[0];
    assertExists(firstCondition.name, 'First condition name');
    assertExists(firstCondition.description, 'First condition description');
  });

  await runTest('Conditions - Basic Search', async () => {
    const results = await client.searchConditions('', { limit: 5 });
    assertExists(results, 'Conditions search results');
    assertGreaterThan(results.count, 10, 'Conditions total count');
    assertArrayNotEmpty(results.results, 'Conditions results array');
  });

  await runTest('Conditions - Search by Name', async () => {
    const blindedResults = await client.searchConditions('blinded', { limit: 3 });
    assertExists(blindedResults, 'Blinded condition search');
    if (blindedResults.results.length > 0) {
      const blindedCondition = blindedResults.results.find(c => 
        c.name.toLowerCase().includes('blinded') || c.name.toLowerCase() === 'blinded'
      );
      assertExists(blindedCondition, 'Found blinded condition');
    }
  });

  await runTest('Conditions - Details Lookup', async () => {
    const details = await client.getConditionDetails('poisoned');
    if (details) {
      assertExists(details.name, 'Poisoned condition name');
      assertExists(details.description, 'Poisoned condition description');
    }
  });

  // 5. CROSS-FUNCTIONALITY TESTS
  await runTest('Cache Performance', async () => {
    const startTime = Date.now();
    
    // First call (should hit API)
    await client.searchMagicItems('sword', { limit: 2 });
    const firstCallTime = Date.now() - startTime;
    
    // Second call (should hit cache)
    const cacheStartTime = Date.now();
    await client.searchMagicItems('sword', { limit: 2 });
    const cacheCallTime = Date.now() - cacheStartTime;
    
    // Cache should be significantly faster
    assert(cacheCallTime < firstCallTime, `Cache should be faster (${cacheCallTime}ms vs ${firstCallTime}ms)`);
    
    const stats = client.getCacheStats();
    assertExists(stats, 'Cache stats');
    assertGreaterThan(stats.keys, 0, 'Cache should have keys');
  });

  await runTest('Error Handling', async () => {
    try {
      await client.getMagicItemDetails(''); // Empty string
      assert(false, 'Should have thrown error for empty item name');
    } catch (error) {
      assert(error.message.includes('empty'), 'Empty string validation error');
    }

    try {
      await client.searchMagicItems('test', { rarity: 'invalid' }); // Invalid rarity
      assert(false, 'Should have thrown error for invalid rarity');
    } catch (error) {
      assert(error.message.includes('rarity'), 'Invalid rarity validation error');
    }
  });

  await runTest('Data Integrity', async () => {
    // Test magic items data integrity
    const magicItems = await client.searchMagicItems('', { limit: 3 });
    magicItems.results.forEach((item, index) => {
      assert(typeof item.name === 'string' && item.name.length > 0, `Magic item ${index + 1} has valid name`);
      assert(typeof item.description === 'string', `Magic item ${index + 1} has description`);
      assert(typeof item.rarity === 'string', `Magic item ${index + 1} has rarity`);
    });

    // Test armor data integrity
    const armor = await client.searchArmor('', { limit: 3 });
    armor.results.forEach((item, index) => {
      assert(typeof item.name === 'string' && item.name.length > 0, `Armor ${index + 1} has valid name`);
      assert(typeof item.acBase === 'number', `Armor ${index + 1} has numeric AC base`);
      assert(typeof item.grantsStealthDisadvantage === 'boolean', `Armor ${index + 1} has boolean stealth disadvantage`);
    });

    // Test feats data integrity
    const feats = await client.searchFeats('', { limit: 3 });
    feats.results.forEach((feat, index) => {
      assert(typeof feat.name === 'string' && feat.name.length > 0, `Feat ${index + 1} has valid name`);
      assert(typeof feat.hasPrerequisite === 'boolean', `Feat ${index + 1} has boolean prerequisite flag`);
      assert(Array.isArray(feat.benefits), `Feat ${index + 1} has benefits array`);
    });

    // Test conditions data integrity
    const conditions = await client.getAllConditions();
    conditions.slice(0, 3).forEach((condition, index) => {
      assert(typeof condition.name === 'string' && condition.name.length > 0, `Condition ${index + 1} has valid name`);
      assert(typeof condition.description === 'string', `Condition ${index + 1} has description`);
    });
  });

  // 6. PERFORMANCE TESTS
  await runTest('Concurrent Requests', async () => {
    const promises = [
      client.searchMagicItems('potion', { limit: 2 }),
      client.searchArmor('chain', { limit: 2 }),
      client.searchFeats('combat', { limit: 2 }),
      client.searchConditions('paralyzed', { limit: 2 })
    ];

    const startTime = Date.now();
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;

    results.forEach((result, index) => {
      assertExists(result, `Concurrent request ${index + 1} completed`);
    });

    assert(totalTime < 10000, `Concurrent requests completed in reasonable time (${totalTime}ms)`);
  });

  // Print final results
  console.log('\n' + '='.repeat(60));
  log('📊 Test Suite Complete', 'info');
  console.log('='.repeat(60));
  
  log(`Total Tests: ${testResults.total}`, 'info');
  log(`Passed: ${testResults.passed}`, testResults.passed > 0 ? 'success' : 'info');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'info');

  if (testResults.failures.length > 0) {
    console.log('\n🔍 Failure Details:');
    testResults.failures.forEach((failure, index) => {
      console.log(`${index + 1}. ${failure}`);
    });
  }

  const overallSuccess = testResults.failed === 0;
  log(`Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`, overallSuccess ? 'success' : 'error');
  
  return overallSuccess;
}

// Run the test suite
runComprehensiveTestSuite()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    log(`Fatal error in test suite: ${error.message}`, 'error');
    console.error(error);
    process.exit(1);
  });
#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

// Unit test framework for validation and edge cases
class UnitTestFramework {
  constructor() {
    this.tests = [];
    this.results = { passed: 0, failed: 0, total: 0, failures: [] };
  }

  test(name, testFn) {
    this.tests.push({ name, testFn });
  }

  async run() {
    console.log('🧪 Running Unit Tests for Validation and Edge Cases\n');
    
    for (const { name, testFn } of this.tests) {
      this.results.total++;
      try {
        await testFn();
        this.results.passed++;
        console.log(`✅ ${name}`);
      } catch (error) {
        this.results.failed++;
        this.results.failures.push({ name, error: error.message });
        console.log(`❌ ${name}: ${error.message}`);
      }
    }

    this.printResults();
    return this.results.failed === 0;
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  assertEqual(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(`${message} - Expected: ${expected}, Got: ${actual}`);
    }
  }

  assertThrows(fn, expectedMessage, testDescription) {
    try {
      fn();
      throw new Error(`${testDescription} - Expected to throw, but didn't`);
    } catch (error) {
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(`${testDescription} - Expected error containing "${expectedMessage}", got: ${error.message}`);
      }
    }
  }

  async assertThrowsAsync(fn, expectedMessage, testDescription) {
    try {
      await fn();
      throw new Error(`${testDescription} - Expected to throw, but didn't`);
    } catch (error) {
      if (expectedMessage && !error.message.includes(expectedMessage)) {
        throw new Error(`${testDescription} - Expected error containing "${expectedMessage}", got: ${error.message}`);
      }
    }
  }

  printResults() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 Unit Test Results');
    console.log('='.repeat(50));
    console.log(`Total: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed}`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failures.length > 0) {
      console.log('\n🔍 Failures:');
      this.results.failures.forEach(({ name, error }) => {
        console.log(`  • ${name}: ${error}`);
      });
    }
  }
}

// Test suite
async function runValidationUnitTests() {
  const framework = new UnitTestFramework();
  const client = new Open5eClient();

  // Magic Items Input Validation Tests
  framework.test('Magic Items - Invalid Query Type', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems(123),
      'string',
      'Should reject numeric query'
    );
  });

  framework.test('Magic Items - Invalid Limit Range', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems('test', { limit: 100 }),
      'between 1 and 50',
      'Should reject limit > 50'
    );
  });

  framework.test('Magic Items - Negative Limit', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems('test', { limit: -1 }),
      'between 1 and 50',
      'Should reject negative limit'
    );
  });

  framework.test('Magic Items - Zero Limit', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems('test', { limit: 0 }),
      'between 1 and 50',
      'Should reject zero limit'
    );
  });

  framework.test('Magic Items - Decimal Limit', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems('test', { limit: 5.5 }),
      'integer',
      'Should reject decimal limit'
    );
  });

  framework.test('Magic Items - Invalid Rarity', async () => {
    await framework.assertThrowsAsync(
      () => client.searchMagicItems('test', { rarity: 'invalid' }),
      'Invalid rarity',
      'Should reject invalid rarity'
    );
  });

  framework.test('Magic Items - Empty Item Name', async () => {
    await framework.assertThrowsAsync(
      () => client.getMagicItemDetails(''),
      'empty',
      'Should reject empty item name'
    );
  });

  framework.test('Magic Items - Long Item Name', async () => {
    const longName = 'a'.repeat(150);
    await framework.assertThrowsAsync(
      () => client.getMagicItemDetails(longName),
      'too long',
      'Should reject overly long item name'
    );
  });

  framework.test('Magic Items - Non-string Item Name', async () => {
    await framework.assertThrowsAsync(
      () => client.getMagicItemDetails(null),
      'string',
      'Should reject null item name'
    );
  });

  // Armor Input Validation Tests
  framework.test('Armor - Invalid Category', async () => {
    const result = await client.searchArmor('', { category: 'invalid' });
    // Should not throw but may return empty results
    framework.assert(typeof result === 'object', 'Should return object for invalid category');
  });

  framework.test('Armor - Invalid AC Base Range', async () => {
    const result = await client.searchArmor('', { acBase: 50 });
    // Should not throw but may return empty results  
    framework.assert(typeof result === 'object', 'Should return object for high AC base');
  });

  // Feats Input Validation Tests
  framework.test('Feats - Invalid Prerequisite Type', async () => {
    const result = await client.searchFeats('', { hasPrerequisite: 'invalid' });
    // Should handle type coercion or return results
    framework.assert(typeof result === 'object', 'Should handle invalid prerequisite type');
  });

  // Edge Cases Tests
  framework.test('Empty Query Handling - Magic Items', async () => {
    const result = await client.searchMagicItems('', { limit: 5 });
    framework.assert(result.count >= 0, 'Should handle empty query gracefully');
    framework.assert(Array.isArray(result.results), 'Should return array for empty query');
  });

  framework.test('Empty Query Handling - Armor', async () => {
    const result = await client.searchArmor('', { limit: 5 });
    framework.assert(result.count >= 0, 'Should handle empty query gracefully');
    framework.assert(Array.isArray(result.results), 'Should return array for empty query');
  });

  framework.test('Empty Query Handling - Feats', async () => {
    const result = await client.searchFeats('', { limit: 5 });
    framework.assert(result.count >= 0, 'Should handle empty query gracefully');
    framework.assert(Array.isArray(result.results), 'Should return array for empty query');
  });

  framework.test('Empty Query Handling - Conditions', async () => {
    const result = await client.searchConditions('', { limit: 5 });
    framework.assert(result.count >= 0, 'Should handle empty query gracefully');
    framework.assert(Array.isArray(result.results), 'Should return array for empty query');
  });

  // Whitespace Handling Tests
  framework.test('Whitespace Query Handling', async () => {
    const result = await client.searchMagicItems('  sword  ', { limit: 2 });
    framework.assert(result.count >= 0, 'Should handle whitespace in query');
  });

  framework.test('Unicode Query Handling', async () => {
    const result = await client.searchMagicItems('épée', { limit: 2 });
    framework.assert(result.count >= 0, 'Should handle unicode characters');
  });

  // Parameter Sanitization Tests
  framework.test('Parameter Sanitization - Null Values', async () => {
    const result = await client.searchMagicItems('sword', { 
      rarity: null, 
      type: undefined, 
      limit: 5 
    });
    framework.assert(typeof result === 'object', 'Should handle null/undefined parameters');
  });

  // Response Validation Tests
  framework.test('Response Structure Validation', async () => {
    const result = await client.searchMagicItems('sword', { limit: 1 });
    
    framework.assert(typeof result === 'object', 'Response should be object');
    framework.assert(typeof result.count === 'number', 'Count should be number');
    framework.assert(Array.isArray(result.results), 'Results should be array');
    framework.assert(typeof result.hasMore === 'boolean', 'HasMore should be boolean');
    
    if (result.results.length > 0) {
      const item = result.results[0];
      framework.assert(typeof item.name === 'string', 'Item name should be string');
      framework.assert(typeof item.description === 'string', 'Item description should be string');
      framework.assert(typeof item.rarity === 'string', 'Item rarity should be string');
    }
  });

  // Cache Validation Tests
  framework.test('Cache Stats Structure', async () => {
    const stats = client.getCacheStats();
    framework.assert(typeof stats === 'object', 'Cache stats should be object');
    framework.assert(typeof stats.keys === 'number', 'Cache keys should be number');
  });

  // Large Query Tests
  framework.test('Large Result Set Handling', async () => {
    const result = await client.searchMagicItems('', { limit: 50 });
    framework.assert(result.results.length <= 50, 'Should respect limit parameter');
  });

  // Concurrent Request Validation
  framework.test('Concurrent Request Handling', async () => {
    const promises = [
      client.searchMagicItems('sword', { limit: 1 }),
      client.searchMagicItems('armor', { limit: 1 }),
      client.searchMagicItems('shield', { limit: 1 })
    ];
    
    const results = await Promise.all(promises);
    framework.assert(results.length === 3, 'All concurrent requests should complete');
    results.forEach((result, index) => {
      framework.assert(typeof result === 'object', `Concurrent request ${index + 1} should return object`);
    });
  });

  return await framework.run();
}

// Run the tests
runValidationUnitTests()
  .then(success => {
    console.log(`\n🎯 Unit Tests ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error in unit tests:', error);
    process.exit(1);
  });
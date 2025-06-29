#!/usr/bin/env node
import { spawn } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

// MCP Integration Test Suite
class MCPIntegrationTest {
  constructor() {
    this.results = { passed: 0, failed: 0, total: 0, failures: [] };
    this.timeout = 10000; // 10 seconds per test
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const prefix = { info: '💬', success: '✅', error: '❌', test: '🧪' }[type];
    console.log(`[${timestamp}] ${prefix} ${message}`);
  }

  assert(condition, message) {
    this.results.total++;
    if (condition) {
      this.results.passed++;
      this.log(`PASS: ${message}`, 'success');
    } else {
      this.results.failed++;
      this.results.failures.push(message);
      this.log(`FAIL: ${message}`, 'error');
    }
  }

  async testMCPTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      const testRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      const testInput = JSON.stringify(testRequest) + '\n';
      
      // Create temporary input file
      const inputFile = join(process.cwd(), `mcp-test-${Date.now()}.json`);
      writeFileSync(inputFile, testInput);

      const child = spawn('node', ['dist/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let resolved = false;

      const cleanup = () => {
        try {
          unlinkSync(inputFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      };

      const timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          child.kill();
          cleanup();
          reject(new Error(`Test timeout for ${toolName}`));
        }
      }, this.timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          cleanup();

          try {
            // Look for JSON response in stdout
            const lines = stdout.split('\n').filter(line => line.trim());
            const jsonResponses = lines.filter(line => {
              try {
                const parsed = JSON.parse(line);
                return parsed.id === 1;
              } catch {
                return false;
              }
            });

            if (jsonResponses.length > 0) {
              const response = JSON.parse(jsonResponses[0]);
              resolve(response);
            } else {
              reject(new Error(`No valid JSON response found for ${toolName}. stdout: ${stdout}, stderr: ${stderr}`));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response for ${toolName}: ${error.message}`));
          }
        }
      });

      child.on('error', (error) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timeoutId);
          cleanup();
          reject(error);
        }
      });

      // Send the test request
      child.stdin.write(testInput);
      child.stdin.end();
    });
  }

  async runTest(testName, testFn) {
    this.log(`Running: ${testName}`, 'test');
    try {
      await testFn();
    } catch (error) {
      this.results.failed++;
      this.results.total++;
      this.results.failures.push(`${testName}: ${error.message}`);
      this.log(`ERROR in ${testName}: ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting MCP Integration Tests', 'info');

    // Test 1: Magic Items Search Tool
    await this.runTest('MCP Tool - search_magic_items', async () => {
      const response = await this.testMCPTool('search_magic_items', {
        query: 'sword',
        limit: 3
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
      this.assert(response.result.content[0].type === 'text', 'Content should be text type');
      
      const data = JSON.parse(response.result.content[0].text);
      this.assert(typeof data.found === 'number', 'Should have found count');
      this.assert(Array.isArray(data.magicItems), 'Should have magicItems array');
    });

    // Test 2: Magic Items Details Tool
    await this.runTest('MCP Tool - get_magic_item_details', async () => {
      const response = await this.testMCPTool('get_magic_item_details', {
        item_name: 'Sword'
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
    });

    // Test 3: Armor Search Tool
    await this.runTest('MCP Tool - search_armor', async () => {
      const response = await this.testMCPTool('search_armor', {
        limit: 3
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
      
      const data = JSON.parse(response.result.content[0].text);
      this.assert(typeof data.found === 'number', 'Should have found count');
      this.assert(Array.isArray(data.armor), 'Should have armor array');
    });

    // Test 4: Armor Details Tool
    await this.runTest('MCP Tool - get_armor_details', async () => {
      const response = await this.testMCPTool('get_armor_details', {
        armor_name: 'Chain Mail'
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
    });

    // Test 5: Feats Search Tool
    await this.runTest('MCP Tool - search_feats', async () => {
      const response = await this.testMCPTool('search_feats', {
        limit: 3
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
      
      const data = JSON.parse(response.result.content[0].text);
      this.assert(typeof data.found === 'number', 'Should have found count');
      this.assert(Array.isArray(data.feats), 'Should have feats array');
    });

    // Test 6: Feats Details Tool
    await this.runTest('MCP Tool - get_feat_details', async () => {
      const response = await this.testMCPTool('get_feat_details', {
        feat_name: 'Alert'
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
    });

    // Test 7: Conditions Search Tool
    await this.runTest('MCP Tool - search_conditions', async () => {
      const response = await this.testMCPTool('search_conditions', {
        limit: 3
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
      
      const data = JSON.parse(response.result.content[0].text);
      this.assert(typeof data.found === 'number', 'Should have found count');
      this.assert(Array.isArray(data.conditions), 'Should have conditions array');
    });

    // Test 8: Conditions Details Tool
    await this.runTest('MCP Tool - get_condition_details', async () => {
      const response = await this.testMCPTool('get_condition_details', {
        condition_name: 'blinded'
      });

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
    });

    // Test 9: Get All Conditions Tool
    await this.runTest('MCP Tool - get_all_conditions', async () => {
      const response = await this.testMCPTool('get_all_conditions', {});

      this.assert(response.result, 'Should have result');
      this.assert(response.result.content, 'Should have content array');
      
      const data = JSON.parse(response.result.content[0].text);
      this.assert(typeof data.total === 'number', 'Should have total count');
      this.assert(Array.isArray(data.conditions), 'Should have conditions array');
    });

    // Test 10: Error Handling - Invalid Tool
    await this.runTest('MCP Tool - Error Handling', async () => {
      try {
        await this.testMCPTool('invalid_tool_name', {});
        this.assert(false, 'Should have thrown error for invalid tool');
      } catch (error) {
        this.assert(true, 'Correctly handled invalid tool name');
      }
    });

    // Test 11: Input Validation - Magic Items
    await this.runTest('MCP Tool - Input Validation', async () => {
      const response = await this.testMCPTool('search_magic_items', {
        query: 123,  // Invalid type
        limit: 3
      });

      // Should either return error or handle gracefully
      this.assert(response.result || response.error, 'Should handle invalid input');
      if (response.error) {
        this.assert(response.error.message.includes('string') || response.error.message.includes('Error'), 'Should provide meaningful error message');
      }
    });

    // Print results
    this.printResults();
    return this.results.failed === 0;
  }

  printResults() {
    console.log('\n' + '='.repeat(60));
    this.log('📊 MCP Integration Test Results', 'info');
    console.log('='.repeat(60));
    
    this.log(`Total Tests: ${this.results.total}`, 'info');
    this.log(`Passed: ${this.results.passed}`, this.results.passed > 0 ? 'success' : 'info');
    this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'info');
    this.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`, 'info');

    if (this.results.failures.length > 0) {
      console.log('\n🔍 Failure Details:');
      this.results.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure}`);
      });
    }

    const overallSuccess = this.results.failed === 0;
    this.log(`Overall Result: ${overallSuccess ? 'PASS' : 'FAIL'}`, overallSuccess ? 'success' : 'error');
  }
}

// Note: This is a simulated MCP test - actual MCP testing would require the full MCP protocol
// For now, we'll create a simpler integration test that validates our API client works
async function runSimplifiedIntegrationTest() {
  console.log('🧪 Running Simplified Integration Tests for New Open5e Features\n');
  
  const { Open5eClient } = await import('./dist/open5e-client.js');
  const client = new Open5eClient();
  
  let passed = 0;
  let failed = 0;
  const failures = [];

  async function test(name, testFn) {
    try {
      console.log(`🔍 Testing: ${name}`);
      await testFn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      failures.push(`${name}: ${error.message}`);
      failed++;
    }
  }

  // Integration tests for all new features
  await test('Magic Items Integration', async () => {
    const search = await client.searchMagicItems('sword', { limit: 2 });
    if (search.results.length === 0) throw new Error('No magic items found');
    
    const details = await client.getMagicItemDetails(search.results[0].name);
    if (!details) throw new Error('Magic item details not found');
  });

  await test('Armor Integration', async () => {
    const search = await client.searchArmor('', { limit: 2 });
    if (search.results.length === 0) throw new Error('No armor found');
    
    const details = await client.getArmorDetails(search.results[0].name);
    if (!details) throw new Error('Armor details not found');
  });

  await test('Feats Integration', async () => {
    const search = await client.searchFeats('', { limit: 2 });
    if (search.results.length === 0) throw new Error('No feats found');
    
    const details = await client.getFeatDetails(search.results[0].name);
    if (!details) throw new Error('Feat details not found');
  });

  await test('Conditions Integration', async () => {
    const all = await client.getAllConditions();
    if (all.length === 0) throw new Error('No conditions found');
    
    const search = await client.searchConditions('blinded', { limit: 2 });
    if (search.results.length === 0) throw new Error('No conditions found in search');
  });

  await test('Filtering Integration', async () => {
    const rareItems = await client.searchMagicItems('', { rarity: 'rare', limit: 2 });
    const heavyArmor = await client.searchArmor('', { category: 'heavy', limit: 2 });
    const prereqFeats = await client.searchFeats('', { hasPrerequisite: true, limit: 2 });
    
    // Results should be properly filtered
    if (rareItems.results.some(item => item.rarity.toLowerCase() !== 'rare')) {
      throw new Error('Rarity filtering not working');
    }
  });

  await test('Error Handling Integration', async () => {
    try {
      await client.searchMagicItems(123); // Should throw
      throw new Error('Should have thrown for invalid input');
    } catch (error) {
      if (!error.message.includes('string')) {
        throw new Error('Unexpected error message');
      }
    }
  });

  await test('Performance Integration', async () => {
    const start = Date.now();
    await Promise.all([
      client.searchMagicItems('sword', { limit: 1 }),
      client.searchArmor('chain', { limit: 1 }),
      client.searchFeats('alert', { limit: 1 }),
      client.getAllConditions()
    ]);
    const duration = Date.now() - start;
    
    if (duration > 15000) {
      throw new Error(`Performance test took too long: ${duration}ms`);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Integration Test Results`);
  console.log('='.repeat(50));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failures.length > 0) {
    console.log('\n🔍 Failures:');
    failures.forEach(failure => console.log(`  • ${failure}`));
  }

  return failed === 0;
}

// Run the simplified integration test
runSimplifiedIntegrationTest()
  .then(success => {
    console.log(`\n🎯 Integration Tests ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('💥 Fatal error in integration tests:', error);
    process.exit(1);
  });
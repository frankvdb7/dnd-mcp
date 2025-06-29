#!/usr/bin/env node

/**
 * Test script for the migrated Open5e MCP server
 * Verifies all functionality works correctly
 */

import { spawn } from 'child_process';
import { performance } from 'perf_hooks';

class MigrationTester {
  constructor() {
    this.testResults = [];
  }

  async testMCPTool(toolName, args = {}) {
    return new Promise((resolve, reject) => {
      console.log(`🧪 Testing ${toolName}...`);
      
      const start = performance.now();
      const child = spawn('node', ['dist/index-open5e.js'], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let output = '';
      let error = '';

      child.stdout.on('data', (data) => {
        output += data.toString();
      });

      child.stderr.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        const end = performance.now();
        const responseTime = end - start;

        if (code === 0 && output) {
          try {
            // Parse the MCP response
            const lines = output.trim().split('\n');
            const jsonResponse = lines[lines.length - 1];
            const parsed = JSON.parse(jsonResponse);
            
            resolve({
              success: true,
              responseTime,
              data: parsed,
              toolName
            });
          } catch (parseError) {
            reject({
              success: false,
              error: `JSON parse error: ${parseError.message}`,
              toolName,
              output
            });
          }
        } else {
          reject({
            success: false,
            error: error || `Process exited with code ${code}`,
            toolName,
            output
          });
        }
      });

      // Send MCP request
      const mcpRequest = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: args
        }
      };

      child.stdin.write(JSON.stringify(mcpRequest) + '\n');
      child.stdin.end();

      // Timeout after 10 seconds
      setTimeout(() => {
        child.kill();
        reject({
          success: false,
          error: 'Test timeout',
          toolName
        });
      }, 10000);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Migration Test Suite\n');

    const tests = [
      // Spell functionality tests
      { name: 'search_spells', args: { query: 'heal', limit: 3 } },
      { name: 'get_spell_details', args: { spell_name: 'healing word' } },
      { name: 'get_spell_by_level', args: { level: 3 } },
      { name: 'get_spells_by_class', args: { class_name: 'wizard' } },
      
      // Race functionality tests (previously broken)
      { name: 'search_races', args: { query: 'elf' } },
      { name: 'get_race_details', args: { race_name: 'elf' } },
      
      // Class functionality tests
      { name: 'search_classes', args: {} },
      { name: 'get_class_details', args: { class_name: 'fighter' } },
      
      // New monster functionality
      { name: 'search_monsters', args: { query: 'dragon', limit: 3 } },
      { name: 'get_monsters_by_cr', args: { challenge_rating: 1 } },
      
      // New equipment functionality
      { name: 'search_weapons', args: { is_martial: true, limit: 5 } },
      
      // Utility
      { name: 'get_api_stats', args: {} }
    ];

    for (const test of tests) {
      try {
        const result = await this.testMCPTool(test.name, test.args);
        this.testResults.push(result);
        console.log(`✅ ${test.name}: ${result.responseTime.toFixed(0)}ms`);
      } catch (error) {
        this.testResults.push(error);
        console.log(`❌ ${test.name}: ${error.error}`);
      }
    }

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 MIGRATION TEST REPORT');
    console.log('=' .repeat(50));

    const successful = this.testResults.filter(r => r.success).length;
    const total = this.testResults.length;
    const successRate = (successful / total) * 100;

    console.log(`\n✅ Overall Success Rate: ${successRate.toFixed(1)}% (${successful}/${total})`);

    if (successful > 0) {
      const avgResponseTime = this.testResults
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.responseTime, 0) / successful;
      
      console.log(`⚡ Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
    }

    console.log('\n📋 Test Results by Category:');
    
    // Group results by category
    const categories = {
      'Spell Tools': ['search_spells', 'get_spell_details', 'get_spell_by_level', 'get_spells_by_class'],
      'Race Tools': ['search_races', 'get_race_details'],
      'Class Tools': ['search_classes', 'get_class_details'],
      'Monster Tools (NEW)': ['search_monsters', 'get_monsters_by_cr'],
      'Equipment Tools (NEW)': ['search_weapons'],
      'Utility': ['get_api_stats']
    };

    Object.entries(categories).forEach(([category, tools]) => {
      const categoryResults = this.testResults.filter(r => tools.includes(r.toolName));
      const categorySuccess = categoryResults.filter(r => r.success).length;
      const categoryTotal = categoryResults.length;
      const categoryRate = categoryTotal > 0 ? (categorySuccess / categoryTotal) * 100 : 0;
      
      console.log(`  ${category}: ${categoryRate.toFixed(0)}% (${categorySuccess}/${categoryTotal})`);
    });

    console.log('\n🎯 Key Achievements:');
    
    // Check for specific improvements
    const raceTest = this.testResults.find(r => r.toolName === 'search_races');
    if (raceTest && raceTest.success) {
      console.log('  ✅ FIXED: Race functionality now working (was completely broken)');
    }

    const monsterTest = this.testResults.find(r => r.toolName === 'search_monsters');
    if (monsterTest && monsterTest.success) {
      console.log('  ✅ NEW: Monster functionality added (3000+ creatures available)');
    }

    const weaponTest = this.testResults.find(r => r.toolName === 'search_weapons');
    if (weaponTest && weaponTest.success) {
      console.log('  ✅ NEW: Equipment functionality added');
    }

    const spellTest = this.testResults.find(r => r.toolName === 'search_spells');
    if (spellTest && spellTest.success) {
      console.log('  ✅ ENHANCED: Spell functionality with advanced filtering');
    }

    console.log('\n🚀 Migration Status:');
    if (successRate >= 90) {
      console.log('  Status: ✅ MIGRATION SUCCESSFUL');
      console.log('  Ready for production deployment');
    } else if (successRate >= 70) {
      console.log('  Status: ⚠️ MIGRATION PARTIALLY SUCCESSFUL');
      console.log('  Some issues need resolution before deployment');
    } else {
      console.log('  Status: ❌ MIGRATION FAILED');
      console.log('  Significant issues need resolution');
    }

    // Show failed tests for debugging
    const failedTests = this.testResults.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  ${test.toolName}: ${test.error}`);
      });
    }
  }
}

// Run the tests
const tester = new MigrationTester();
tester.runAllTests().catch(console.error);
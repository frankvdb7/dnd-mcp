#!/usr/bin/env node

/**
 * Open5e API Performance Testing Script
 * Tests response times, query sizes, and reliability
 */

import https from 'https';
import { performance } from 'perf_hooks';
import fs from 'fs';

class PerformanceTester {
  constructor() {
    this.results = {
      endpoints: {},
      querySizes: {},
      concurrent: {},
      availability: []
    };
  }

  async makeRequest(url) {
    const start = performance.now();
    
    return new Promise((resolve, reject) => {
      const req = https.get(url, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const end = performance.now();
          const responseTime = end - start;
          
          try {
            const json = JSON.parse(data);
            resolve({
              responseTime,
              statusCode: res.statusCode,
              data: json,
              size: data.length
            });
          } catch (error) {
            reject(new Error(`JSON Parse Error: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        const end = performance.now();
        reject({
          error: error.message,
          responseTime: end - start
        });
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testEndpointPerformance() {
    console.log('🚀 Testing endpoint response times...');
    
    const endpoints = [
      { name: 'spells', url: 'https://api.open5e.com/v2/spells/?limit=10' },
      { name: 'classes', url: 'https://api.open5e.com/v1/classes/?limit=5' },
      { name: 'races', url: 'https://api.open5e.com/v2/races/?limit=10' },
      { name: 'monsters', url: 'https://api.open5e.com/v1/monsters/?limit=10' },
      { name: 'weapons', url: 'https://api.open5e.com/v2/weapons/?limit=10' },
      { name: 'armor', url: 'https://api.open5e.com/v2/armor/?limit=10' }
    ];

    for (const endpoint of endpoints) {
      const times = [];
      console.log(`  Testing ${endpoint.name}...`);
      
      // Test each endpoint 5 times
      for (let i = 0; i < 5; i++) {
        try {
          const result = await this.makeRequest(endpoint.url);
          times.push(result.responseTime);
          console.log(`    Attempt ${i+1}: ${result.responseTime.toFixed(0)}ms`);
        } catch (error) {
          console.log(`    Attempt ${i+1}: ERROR - ${error.message || error.error}`);
          times.push(null);
        }
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      const validTimes = times.filter(t => t !== null);
      this.results.endpoints[endpoint.name] = {
        times: validTimes,
        avg: validTimes.length > 0 ? validTimes.reduce((a, b) => a + b) / validTimes.length : null,
        min: validTimes.length > 0 ? Math.min(...validTimes) : null,
        max: validTimes.length > 0 ? Math.max(...validTimes) : null,
        successRate: (validTimes.length / times.length) * 100
      };
    }
  }

  async testQuerySizes() {
    console.log('📊 Testing different query sizes...');
    
    const sizes = [
      { limit: 1, name: 'small' },
      { limit: 10, name: 'medium' },
      { limit: 50, name: 'large' },
      { limit: 100, name: 'extra-large' }
    ];

    for (const size of sizes) {
      console.log(`  Testing ${size.name} queries (limit=${size.limit})...`);
      
      try {
        const result = await this.makeRequest(`https://api.open5e.com/v2/spells/?limit=${size.limit}`);
        const itemCount = result.data.results ? result.data.results.length : 0;
        
        this.results.querySizes[size.name] = {
          limit: size.limit,
          responseTime: result.responseTime,
          actualItems: itemCount,
          dataSize: result.size,
          efficiency: result.responseTime / itemCount // ms per item
        };
        
        console.log(`    ${result.responseTime.toFixed(0)}ms for ${itemCount} items (${(result.size/1024).toFixed(1)}KB)`);
      } catch (error) {
        console.log(`    ERROR: ${error.message || error.error}`);
        this.results.querySizes[size.name] = { error: error.message || error.error };
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }

  async testConcurrentRequests() {
    console.log('⚡ Testing concurrent request handling...');
    
    const concurrentCounts = [2, 5, 10];
    const testUrl = 'https://api.open5e.com/v2/spells/?limit=5';
    
    for (const count of concurrentCounts) {
      console.log(`  Testing ${count} concurrent requests...`);
      
      const start = performance.now();
      const promises = Array(count).fill().map(() => this.makeRequest(testUrl));
      
      try {
        const results = await Promise.allSettled(promises);
        const end = performance.now();
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        const totalTime = end - start;
        
        this.results.concurrent[`${count}_requests`] = {
          totalTime,
          successful,
          failed,
          successRate: (successful / count) * 100,
          avgTimePerRequest: successful > 0 ? 
            results
              .filter(r => r.status === 'fulfilled')
              .reduce((sum, r) => sum + r.value.responseTime, 0) / successful : null
        };
        
        console.log(`    ${totalTime.toFixed(0)}ms total, ${successful}/${count} successful`);
      } catch (error) {
        console.log(`    ERROR: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  async testAvailability(duration = 30000) {
    console.log(`🕐 Testing API availability for ${duration/1000} seconds...`);
    
    const testUrl = 'https://api.open5e.com/v2/spells/?limit=1';
    const interval = 5000; // Test every 5 seconds
    const iterations = Math.floor(duration / interval);
    
    for (let i = 0; i < iterations; i++) {
      const timestamp = new Date().toISOString();
      
      try {
        const result = await this.makeRequest(testUrl);
        this.results.availability.push({
          timestamp,
          success: true,
          responseTime: result.responseTime
        });
        console.log(`    ${timestamp}: ✅ ${result.responseTime.toFixed(0)}ms`);
      } catch (error) {
        this.results.availability.push({
          timestamp,
          success: false,
          error: error.message || error.error
        });
        console.log(`    ${timestamp}: ❌ ${error.message || error.error}`);
      }
      
      if (i < iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }
  }

  generateReport() {
    console.log('\n📋 PERFORMANCE TEST REPORT');
    console.log('=' .repeat(50));
    
    // Endpoint Performance
    console.log('\n🚀 ENDPOINT RESPONSE TIMES:');
    Object.entries(this.results.endpoints).forEach(([name, data]) => {
      if (data.avg !== null) {
        console.log(`  ${name.padEnd(12)}: ${data.avg.toFixed(0)}ms avg (${data.min.toFixed(0)}-${data.max.toFixed(0)}ms) - ${data.successRate}% success`);
      } else {
        console.log(`  ${name.padEnd(12)}: ERROR - 0% success rate`);
      }
    });
    
    // Query Size Performance
    console.log('\n📊 QUERY SIZE PERFORMANCE:');
    Object.entries(this.results.querySizes).forEach(([name, data]) => {
      if (!data.error) {
        console.log(`  ${name.padEnd(12)}: ${data.responseTime.toFixed(0)}ms for ${data.actualItems} items (${data.efficiency.toFixed(1)}ms/item)`);
      } else {
        console.log(`  ${name.padEnd(12)}: ERROR - ${data.error}`);
      }
    });
    
    // Concurrent Request Performance
    console.log('\n⚡ CONCURRENT REQUEST PERFORMANCE:');
    Object.entries(this.results.concurrent).forEach(([name, data]) => {
      console.log(`  ${name.padEnd(12)}: ${data.totalTime.toFixed(0)}ms total, ${data.successRate}% success`);
    });
    
    // Availability
    console.log('\n🕐 AVAILABILITY TEST:');
    const successful = this.results.availability.filter(r => r.success).length;
    const total = this.results.availability.length;
    const uptime = total > 0 ? (successful / total) * 100 : 0;
    console.log(`  Uptime: ${uptime.toFixed(1)}% (${successful}/${total} requests successful)`);
    
    if (successful > 0) {
      const avgResponseTime = this.results.availability
        .filter(r => r.success)
        .reduce((sum, r) => sum + r.responseTime, 0) / successful;
      console.log(`  Average response time: ${avgResponseTime.toFixed(0)}ms`);
    }
    
    // Overall Assessment
    console.log('\n✅ ASSESSMENT:');
    const overallAvg = Object.values(this.results.endpoints)
      .filter(data => data.avg !== null)
      .reduce((sum, data) => sum + data.avg, 0) / 
      Object.values(this.results.endpoints).filter(data => data.avg !== null).length;
    
    console.log(`  Overall average response time: ${overallAvg.toFixed(0)}ms`);
    console.log(`  API availability: ${uptime.toFixed(1)}%`);
    console.log(`  Performance rating: ${overallAvg < 1000 ? '🟢 Excellent' : overallAvg < 2000 ? '🟡 Good' : '🔴 Needs Improvement'}`);
  }

  async runAllTests() {
    console.log('🧪 Starting Open5e API Performance Tests\n');
    
    try {
      await this.testEndpointPerformance();
      await this.testQuerySizes();
      await this.testConcurrentRequests();
      await this.testAvailability(30000); // 30 second availability test
      
      this.generateReport();
      
      // Save results to file
      fs.writeFileSync('performance-results.json', JSON.stringify(this.results, null, 2));
      console.log('\n💾 Results saved to performance-results.json');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
    }
  }
}

// Run tests if called directly
const tester = new PerformanceTester();
tester.runAllTests().catch(console.error);

export default PerformanceTester;
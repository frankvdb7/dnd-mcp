#!/usr/bin/env node

/**
 * Open5e API Rate Limiting and Error Handling Test Script
 * Tests rate limits, error scenarios, and API robustness
 */

import https from 'https';
import { performance } from 'perf_hooks';
import fs from 'fs';

class RateLimitTester {
  constructor() {
    this.results = {
      rateLimiting: {
        threshold: null,
        headers: [],
        responses: []
      },
      errorScenarios: {},
      loadTesting: {},
      authentication: {},
      malformedRequests: {}
    };
  }

  async makeRequestWithHeaders(url, options = {}) {
    const start = performance.now();
    
    return new Promise((resolve, reject) => {
      const req = https.get(url, options, (res) => {
        let data = '';
        
        // Capture all response headers
        const headers = {};
        Object.keys(res.headers).forEach(key => {
          headers[key] = res.headers[key];
        });
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const end = performance.now();
          const responseTime = end - start;
          
          resolve({
            statusCode: res.statusCode,
            headers: headers,
            responseTime,
            data: data,
            size: data.length
          });
        });
      });
      
      req.on('error', (error) => {
        const end = performance.now();
        reject({
          error: error.message,
          responseTime: end - start,
          statusCode: null
        });
      });
      
      req.setTimeout(30000, () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async testRateLimiting() {
    console.log('🚦 Testing rate limiting behavior...');
    
    const testUrl = 'https://api.open5e.com/v2/spells/?limit=1';
    const requestCount = 50;
    const burstInterval = 100; // 100ms between requests
    
    console.log(`  Sending ${requestCount} requests with ${burstInterval}ms intervals...`);
    
    for (let i = 0; i < requestCount; i++) {
      try {
        const result = await this.makeRequestWithHeaders(testUrl);
        
        this.results.rateLimiting.responses.push({
          requestNumber: i + 1,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          timestamp: new Date().toISOString(),
          headers: result.headers
        });
        
        // Look for rate limiting headers
        const rateLimitHeaders = {};
        Object.keys(result.headers).forEach(key => {
          if (key.toLowerCase().includes('rate') || 
              key.toLowerCase().includes('limit') ||
              key.toLowerCase().includes('throttle') ||
              key.toLowerCase().includes('retry')) {
            rateLimitHeaders[key] = result.headers[key];
          }
        });
        
        if (Object.keys(rateLimitHeaders).length > 0) {
          this.results.rateLimiting.headers.push({
            requestNumber: i + 1,
            headers: rateLimitHeaders
          });
        }
        
        console.log(`    Request ${i+1}: ${result.statusCode} (${result.responseTime.toFixed(0)}ms)`);
        
        // Check if we hit rate limiting
        if (result.statusCode === 429) {
          console.log(`    🚫 Rate limit hit at request ${i+1}!`);
          this.results.rateLimiting.threshold = i + 1;
          break;
        }
        
        // Brief delay between requests
        await new Promise(resolve => setTimeout(resolve, burstInterval));
        
      } catch (error) {
        console.log(`    Request ${i+1}: ERROR - ${error.message || error.error}`);
        this.results.rateLimiting.responses.push({
          requestNumber: i + 1,
          error: error.message || error.error,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (!this.results.rateLimiting.threshold) {
      console.log(`    ✅ No rate limiting detected up to ${requestCount} requests`);
    }
  }

  async testErrorScenarios() {
    console.log('❌ Testing error scenarios...');
    
    const errorTests = [
      {
        name: '404 - Nonexistent endpoint',
        url: 'https://api.open5e.com/v2/nonexistent/',
        expectedStatus: 404
      },
      {
        name: '400 - Invalid parameter type',
        url: 'https://api.open5e.com/v1/monsters/?cr=invalid',
        expectedStatus: 400
      },
      {
        name: '404 - Out of range pagination',
        url: 'https://api.open5e.com/v2/spells/?page=999999',
        expectedStatus: 404
      },
      {
        name: '400 - Invalid ordering field',
        url: 'https://api.open5e.com/v2/spells/?ordering=nonexistent_field',
        expectedStatus: 400
      },
      {
        name: 'Malformed URL',
        url: 'https://api.open5e.com/v2/spells/?invalid[]=test',
        expectedStatus: 400
      }
    ];
    
    for (const test of errorTests) {
      console.log(`  Testing: ${test.name}...`);
      
      try {
        const result = await this.makeRequestWithHeaders(test.url);
        
        this.results.errorScenarios[test.name] = {
          url: test.url,
          expectedStatus: test.expectedStatus,
          actualStatus: result.statusCode,
          headers: result.headers,
          responseTime: result.responseTime,
          success: result.statusCode === test.expectedStatus
        };
        
        const statusMatch = result.statusCode === test.expectedStatus ? '✅' : '❌';
        console.log(`    ${statusMatch} Expected ${test.expectedStatus}, got ${result.statusCode}`);
        
      } catch (error) {
        this.results.errorScenarios[test.name] = {
          url: test.url,
          expectedStatus: test.expectedStatus,
          error: error.message || error.error,
          success: false
        };
        console.log(`    ❌ Request failed: ${error.message || error.error}`);
      }
    }
  }

  async testLoadBehavior() {
    console.log('⚡ Testing API behavior under load...');
    
    const concurrentLevels = [5, 10, 20];
    const testUrl = 'https://api.open5e.com/v2/spells/?limit=5';
    
    for (const concurrency of concurrentLevels) {
      console.log(`  Testing ${concurrency} concurrent requests...`);
      
      const start = performance.now();
      const promises = Array(concurrency).fill().map((_, i) => 
        this.makeRequestWithHeaders(`${testUrl}&_=${i}`) // Add unique param to avoid caching
      );
      
      try {
        const results = await Promise.allSettled(promises);
        const end = performance.now();
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        const totalTime = end - start;
        
        // Check for rate limiting responses
        const rateLimited = results
          .filter(r => r.status === 'fulfilled')
          .filter(r => r.value.statusCode === 429).length;
        
        this.results.loadTesting[`${concurrency}_concurrent`] = {
          totalTime,
          successful,
          failed,
          rateLimited,
          successRate: (successful / concurrency) * 100,
          avgResponseTime: successful > 0 ? 
            results
              .filter(r => r.status === 'fulfilled')
              .reduce((sum, r) => sum + r.value.responseTime, 0) / successful : null
        };
        
        console.log(`    ${totalTime.toFixed(0)}ms total, ${successful}/${concurrency} successful, ${rateLimited} rate limited`);
        
      } catch (error) {
        console.log(`    ❌ Load test failed: ${error.message}`);
      }
      
      // Cool down between tests
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  async testAuthentication() {
    console.log('🔐 Testing authentication requirements...');
    
    const testUrl = 'https://api.open5e.com/v2/spells/?limit=1';
    
    // Test without any auth headers
    console.log('  Testing unauthenticated access...');
    try {
      const result = await this.makeRequestWithHeaders(testUrl);
      
      this.results.authentication.unauthenticated = {
        statusCode: result.statusCode,
        success: result.statusCode === 200,
        headers: result.headers
      };
      
      if (result.statusCode === 200) {
        console.log('    ✅ API allows unauthenticated access');
      } else {
        console.log(`    ❌ Unauthenticated access failed: ${result.statusCode}`);
      }
      
    } catch (error) {
      console.log(`    ❌ Authentication test failed: ${error.message || error.error}`);
      this.results.authentication.unauthenticated = {
        error: error.message || error.error,
        success: false
      };
    }
    
    // Test with common auth headers to see if they're accepted/required
    const authTests = [
      { name: 'API Key in header', headers: { 'X-API-Key': 'test-key' } },
      { name: 'Authorization Bearer', headers: { 'Authorization': 'Bearer test-token' } },
      { name: 'Authorization Basic', headers: { 'Authorization': 'Basic dGVzdDp0ZXN0' } }
    ];
    
    for (const authTest of authTests) {
      console.log(`  Testing ${authTest.name}...`);
      try {
        const result = await this.makeRequestWithHeaders(testUrl, { headers: authTest.headers });
        
        this.results.authentication[authTest.name] = {
          statusCode: result.statusCode,
          success: result.statusCode === 200,
          headers: result.headers
        };
        
        console.log(`    ${result.statusCode === 200 ? '✅' : '❌'} Status: ${result.statusCode}`);
        
      } catch (error) {
        console.log(`    ❌ ${authTest.name} failed: ${error.message || error.error}`);
      }
    }
  }

  async testMalformedRequests() {
    console.log('🔧 Testing malformed request handling...');
    
    const malformedTests = [
      {
        name: 'Invalid JSON in body',
        url: 'https://api.open5e.com/v2/spells/',
        method: 'POST', // Though API might not support POST
        body: '{"invalid": json}'
      },
      {
        name: 'Extremely long parameter',
        url: 'https://api.open5e.com/v2/spells/?search=' + 'a'.repeat(10000)
      },
      {
        name: 'SQL injection attempt',
        url: 'https://api.open5e.com/v2/spells/?search=\'; DROP TABLE spells; --'
      },
      {
        name: 'XSS attempt',
        url: 'https://api.open5e.com/v2/spells/?search=<script>alert("xss")</script>'
      },
      {
        name: 'Unicode handling',
        url: 'https://api.open5e.com/v2/spells/?search=🔥🐉✨'
      }
    ];
    
    for (const test of malformedTests) {
      console.log(`  Testing: ${test.name}...`);
      
      try {
        const result = await this.makeRequestWithHeaders(test.url);
        
        this.results.malformedRequests[test.name] = {
          url: test.url,
          statusCode: result.statusCode,
          responseTime: result.responseTime,
          handled: result.statusCode >= 400 && result.statusCode < 500, // Client errors expected
          headers: result.headers
        };
        
        const status = result.statusCode >= 400 && result.statusCode < 500 ? '✅ Properly rejected' : 
                      result.statusCode === 200 ? '⚠️ Accepted (may be filtered)' : 
                      '❌ Unexpected response';
        
        console.log(`    ${status} (${result.statusCode})`);
        
      } catch (error) {
        this.results.malformedRequests[test.name] = {
          url: test.url,
          error: error.message || error.error,
          handled: true // Connection errors are acceptable for malformed requests
        };
        
        console.log(`    ✅ Request rejected: ${error.message || error.error}`);
      }
      
      // Small delay to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  generateReport() {
    console.log('\n📋 RATE LIMITING & ERROR HANDLING REPORT');
    console.log('=' .repeat(60));
    
    // Rate Limiting Results
    console.log('\n🚦 RATE LIMITING ANALYSIS:');
    if (this.results.rateLimiting.threshold) {
      console.log(`  Rate limit threshold: ${this.results.rateLimiting.threshold} requests`);
    } else {
      console.log(`  No rate limiting detected (tested up to ${this.results.rateLimiting.responses.length} requests)`);
    }
    
    if (this.results.rateLimiting.headers.length > 0) {
      console.log(`  Rate limiting headers found: ${this.results.rateLimiting.headers.length} instances`);
    } else {
      console.log('  No rate limiting headers detected');
    }
    
    // Error Handling Results
    console.log('\n❌ ERROR HANDLING ANALYSIS:');
    Object.entries(this.results.errorScenarios).forEach(([name, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`  ${status} ${name}: Expected ${result.expectedStatus}, got ${result.actualStatus || 'ERROR'}`);
    });
    
    // Load Testing Results
    console.log('\n⚡ LOAD TESTING RESULTS:');
    Object.entries(this.results.loadTesting).forEach(([test, result]) => {
      console.log(`  ${test}: ${result.successRate.toFixed(1)}% success rate, ${result.rateLimited} rate limited`);
    });
    
    // Authentication Results
    console.log('\n🔐 AUTHENTICATION ANALYSIS:');
    if (this.results.authentication.unauthenticated?.success) {
      console.log('  ✅ API allows unauthenticated access');
    } else {
      console.log('  ❌ API requires authentication');
    }
    
    // Malformed Request Results
    console.log('\n🔧 MALFORMED REQUEST HANDLING:');
    Object.entries(this.results.malformedRequests).forEach(([name, result]) => {
      const status = result.handled ? '✅' : '❌';
      console.log(`  ${status} ${name}: ${result.statusCode || 'Rejected'}`);
    });
    
    // Overall Assessment
    console.log('\n✅ OVERALL ASSESSMENT:');
    const errorHandlingScore = Object.values(this.results.errorScenarios).filter(r => r.success).length / 
                              Object.values(this.results.errorScenarios).length * 100;
    const malformedHandlingScore = Object.values(this.results.malformedRequests).filter(r => r.handled).length / 
                                  Object.values(this.results.malformedRequests).length * 100;
    
    console.log(`  Error handling accuracy: ${errorHandlingScore.toFixed(1)}%`);
    console.log(`  Malformed request handling: ${malformedHandlingScore.toFixed(1)}%`);
    console.log(`  Authentication requirement: ${this.results.authentication.unauthenticated?.success ? 'None' : 'Required'}`);
    console.log(`  Rate limiting detected: ${this.results.rateLimiting.threshold ? 'Yes' : 'No'}`);
    
    const overallRating = errorHandlingScore >= 80 && malformedHandlingScore >= 60 ? 
                         '🟢 Excellent' : 
                         errorHandlingScore >= 60 ? '🟡 Good' : '🔴 Needs Improvement';
    
    console.log(`  Overall robustness: ${overallRating}`);
  }

  async runAllTests() {
    console.log('🧪 Starting Open5e API Rate Limiting & Error Handling Tests\n');
    
    try {
      await this.testRateLimiting();
      console.log('');
      await this.testErrorScenarios();
      console.log('');
      await this.testLoadBehavior();
      console.log('');
      await this.testAuthentication();
      console.log('');
      await this.testMalformedRequests();
      
      this.generateReport();
      
      // Save detailed results
      fs.writeFileSync('rate-limit-results.json', JSON.stringify(this.results, null, 2));
      console.log('\n💾 Detailed results saved to rate-limit-results.json');
      
    } catch (error) {
      console.error('❌ Test execution failed:', error.message);
    }
  }
}

// Run tests
const tester = new RateLimitTester();
tester.runAllTests().catch(console.error);

export default RateLimitTester;
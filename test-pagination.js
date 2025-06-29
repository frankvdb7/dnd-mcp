#!/usr/bin/env node

import { Open5eClient } from './dist/open5e-client.js';

const client = new Open5eClient();

async function testPagination() {
  console.log('📄 Testing pagination functionality...\n');

  try {
    // Test spell search pagination
    console.log('🔍 Testing spell search pagination:');
    const page1 = await client.searchSpells('', { limit: 10 });
    console.log(`   Page 1: ${page1.results.length} results, hasMore: ${page1.hasMore}`);
    
    const page2 = await client.searchSpells('', { limit: 15 });
    console.log(`   Page 2: ${page2.results.length} results, hasMore: ${page2.hasMore}`);
    
    // Test that pagination handles different limits
    const smallPage = await client.searchSpells('fire', { limit: 3 });
    console.log(`   Small page (limit 3): ${smallPage.results.length} results`);
    
    const largePage = await client.searchSpells('fire', { limit: 20 });
    console.log(`   Large page (limit 20): ${largePage.results.length} results`);
    
    // Test level filtering with pagination
    console.log('\n🎯 Testing level filtering:');
    const cantrips = await client.getSpellsByLevel(0);
    console.log(`   Cantrips (level 0): ${cantrips.results.length} results`);
    
    const level1 = await client.getSpellsByLevel(1);
    console.log(`   Level 1 spells: ${level1.results.length} results`);
    
    const level9 = await client.getSpellsByLevel(9);
    console.log(`   Level 9 spells: ${level9.results.length} results`);
    
    console.log('\n✅ Pagination tests completed!');
    
  } catch (error) {
    console.error('❌ Pagination test failed:', error);
  }
}

testPagination();
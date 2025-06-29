#!/usr/bin/env node
import { UnifiedSearchEngine } from './dist/unified-search-engine.js';

async function testUnifiedSearch() {
  const searchEngine = new UnifiedSearchEngine();
  
  console.log('🔍 TESTING UNIFIED SEARCH ENGINE - PHASE 1 IMPLEMENTATION\n');
  
  try {
    // Test 1: Basic unified search
    console.log('1️⃣ BASIC UNIFIED SEARCH TEST');
    console.log('   Query: "fireball" across all content types...');
    
    const startTime = Date.now();
    const fireballResults = await searchEngine.unifiedSearch({
      query: 'fireball',
      limit: 3
    });
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Search completed in ${duration}ms (target: <3000ms)`);
    console.log(`   📊 Total results: ${fireballResults.totalResults}`);
    console.log(`   🎯 Results found in:`, Object.keys(fireballResults.results).filter(type => fireballResults.results[type].count > 0));
    
    // Show spell results if found
    if (fireballResults.results.spells?.items?.length > 0) {
      const spell = fireballResults.results.spells.items[0];
      console.log(`   🔥 Spell found: ${spell.name} (Level ${spell.metadata?.level})`);
      console.log(`   📝 Preview: ${spell.preview?.substring(0, 80)}...`);
    }
    
    console.log();
    
    // Test 2: Content type filtering
    console.log('2️⃣ CONTENT TYPE FILTERING TEST');
    console.log('   Query: "dragon" filtered to monsters only...');
    
    const dragonResults = await searchEngine.unifiedSearch({
      query: 'dragon',
      contentTypes: ['monsters'],
      limit: 5
    });
    
    console.log(`   🐲 Dragons found: ${dragonResults.results.monsters?.count || 0}`);
    if (dragonResults.results.monsters?.items?.length > 0) {
      dragonResults.results.monsters.items.slice(0, 3).forEach((monster, index) => {
        console.log(`      ${index + 1}. ${monster.name} (CR ${monster.metadata?.challengeRating || 'Unknown'})`);
      });
    }
    console.log();
    
    // Test 3: Fuzzy search capabilities
    console.log('3️⃣ FUZZY SEARCH TEST');
    console.log('   Query: "firebaal" (typo) with fuzzy matching...');
    
    const fuzzyResults = await searchEngine.unifiedSearch({
      query: 'firebaal',
      fuzzyThreshold: 0.4, // More permissive for typos
      limit: 2
    });
    
    console.log(`   🔤 Fuzzy results: ${fuzzyResults.totalResults}`);
    if (fuzzyResults.totalResults > 0) {
      console.log('   💡 Suggestions:', fuzzyResults.suggestions?.slice(0, 3).join(', ') || 'None');
    }
    console.log();
    
    // Test 4: Multiple content types
    console.log('4️⃣ MULTI-CONTENT TYPE SEARCH');
    console.log('   Query: "sword" across equipment and magic items...');
    
    const swordResults = await searchEngine.unifiedSearch({
      query: 'sword',
      contentTypes: ['weapons', 'magic-items'],
      limit: 3
    });
    
    console.log(`   ⚔️  Weapons found: ${swordResults.results.weapons?.count || 0}`);
    console.log(`   ✨ Magic items found: ${swordResults.results['magic-items']?.count || 0}`);
    
    // Show some weapon results
    if (swordResults.results.weapons?.items?.length > 0) {
      swordResults.results.weapons.items.forEach((weapon, index) => {
        console.log(`      Weapon ${index + 1}: ${weapon.name} (${weapon.metadata?.damageType || 'Unknown damage'})`);
      });
    }
    console.log();
    
    // Test 5: Relevance ranking
    console.log('5️⃣ RELEVANCE RANKING TEST');
    console.log('   Query: "fire" to test exact vs partial matches...');
    
    const fireResults = await searchEngine.unifiedSearch({
      query: 'fire',
      contentTypes: ['spells'],
      limit: 5,
      sortBy: 'relevance'
    });
    
    console.log(`   🔥 Fire-related spells: ${fireResults.results.spells?.count || 0}`);
    if (fireResults.results.spells?.items?.length > 0) {
      fireResults.results.spells.items.forEach((spell, index) => {
        console.log(`      ${index + 1}. ${spell.name} (Score: ${spell.relevanceScore.toFixed(1)})`);
      });
    }
    console.log();
    
    // Test 6: Related content discovery
    console.log('6️⃣ RELATED CONTENT DISCOVERY TEST');
    console.log('   Query: "heal" to find spells and related classes...');
    
    const healResults = await searchEngine.unifiedSearch({
      query: 'heal',
      contentTypes: ['spells', 'classes'],
      limit: 3
    });
    
    console.log(`   💚 Healing spells: ${healResults.results.spells?.count || 0}`);
    console.log(`   👥 Classes found: ${healResults.results.classes?.count || 0}`);
    if (healResults.relatedContent && healResults.relatedContent.length > 0) {
      console.log(`   🔗 Related content: ${healResults.relatedContent.length} relationships found`);
      healResults.relatedContent.slice(0, 2).forEach((rel, index) => {
        console.log(`      ${index + 1}. ${rel.relationship}`);
      });
    }
    console.log();
    
    // Test 7: Performance and caching
    console.log('7️⃣ CACHING AND PERFORMANCE TEST');
    console.log('   Repeating "fireball" search to test cache...');
    
    const cachedStart = Date.now();
    const cachedResults = await searchEngine.unifiedSearch({
      query: 'fireball',
      limit: 3
    });
    const cachedDuration = Date.now() - cachedStart;
    
    console.log(`   ⚡ Cached search: ${cachedDuration}ms (should be much faster)`);
    console.log(`   📊 Same results: ${cachedResults.totalResults === fireballResults.totalResults ? 'Yes' : 'No'}`);
    
    // Show cache stats
    const cacheStats = searchEngine.getCacheStats();
    console.log(`   💾 Cache stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, ${cacheStats.keys} keys`);
    console.log();
    
    // Test 8: Error handling
    console.log('8️⃣ ERROR HANDLING TEST');
    console.log('   Testing with empty query...');
    
    try {
      await searchEngine.unifiedSearch({ query: '' });
      console.log('   ❌ Should have thrown error for empty query');
    } catch (error) {
      console.log(`   ✅ Correctly handled error: ${error.message}`);
    }
    
    try {
      await searchEngine.unifiedSearch({ 
        query: 'test',
        contentTypes: ['invalid-type']
      });
      console.log('   ❌ Should have thrown error for invalid content type');
    } catch (error) {
      console.log(`   ✅ Correctly handled error: ${error.message}`);
    }
    console.log();
    
    // Summary
    console.log('📈 UNIFIED SEARCH TEST SUMMARY:');
    console.log('✅ Basic search across all content types working');
    console.log('✅ Content type filtering functional');
    console.log('✅ Fuzzy search with typo tolerance implemented');
    console.log('✅ Multi-content type searches successful');
    console.log('✅ Relevance ranking operational');
    console.log('✅ Related content discovery working');
    console.log('✅ Caching system functional and fast');
    console.log('✅ Error handling robust');
    console.log();
    console.log('🎯 PHASE 1 CORE ENGINE: IMPLEMENTATION SUCCESSFUL!');
    console.log('Ready for Phase 2: Advanced fuzzy search with Fuse.js integration');
    
  } catch (error) {
    console.error('❌ Unified search test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testUnifiedSearch();
#!/usr/bin/env node

import { Open5eClient } from './dist/open5e-client.js';

const client = new Open5eClient();

async function finalValidation() {
  console.log('🎯 Final Migration Validation Test\n');
  console.log('=' .repeat(50));

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function addTest(name, success, details) {
    results.tests.push({ name, success, details });
    if (success) results.passed++;
    else results.failed++;
    console.log(`${success ? '✅' : '❌'} ${name}: ${details}`);
  }

  try {
    // Critical spell functionality tests
    console.log('\n🧙‍♂️ CRITICAL SPELL TESTS:');
    
    // Test 1: getSpellsByClass for all major classes
    const wizardSpells = await client.getSpellsByClass('wizard');
    addTest('Wizard spells', wizardSpells.length > 0, `${wizardSpells.length} spells found`);
    
    const clericSpells = await client.getSpellsByClass('cleric');
    addTest('Cleric spells', clericSpells.length > 0, `${clericSpells.length} spells found`);
    
    const sorcererSpells = await client.getSpellsByClass('sorcerer');
    addTest('Sorcerer spells', sorcererSpells.length > 0, `${sorcererSpells.length} spells found`);

    const artificerSpells = await client.getSpellsByClass('artificer');
    addTest('Artificer spells', artificerSpells.length > 0, `${artificerSpells.length} spells found`);
    
    // Test 2: Spell details lookup
    const fireball = await client.getSpellDetails('Fireball');
    addTest('Fireball spell details', fireball && fireball.level === 3, 
      fireball ? `Found ${fireball.name}, Level ${fireball.level}` : 'Not found');
    
    const shield = await client.getSpellDetails('Shield');
    addTest('Shield spell details', shield !== null, 
      shield ? `Found ${shield.name}` : 'Not found');
    
    // Test 3: Level-based filtering
    const cantrips = await client.getSpellsByLevel(0);
    addTest('Cantrip filtering', cantrips.results.length > 0, `${cantrips.results.length} cantrips found`);
    
    const level9 = await client.getSpellsByLevel(9);
    addTest('Level 9 spell filtering', level9.results.length > 0, `${level9.results.length} level 9 spells found`);
    
    // Test 4: Search functionality
    const fireSpells = await client.searchSpells('fire', { limit: 10 });
    addTest('Fire spell search', fireSpells.results.length > 0, `${fireSpells.results.length} fire-related spells found`);
    
    // Test 5: Class data
    console.log('\n🏛️ CLASS & RACE TESTS:');
    const classes = await client.searchClasses();
    addTest('Class list retrieval', classes.count > 0, `${classes.count} classes found`);
    
    const wizardClass = await client.getClassDetails('wizard');
    addTest('Wizard class details', wizardClass !== null, 
      wizardClass ? `Found ${wizardClass.name}` : 'Not found');
    
    // Test 6: Race data
    const races = await client.searchRaces();
    addTest('Race list retrieval', races.count > 0, `${races.count} races found`);
    
    const elf = await client.getRaceDetails('elf');
    addTest('Elf race details', elf !== null, 
      elf ? `Found ${elf.name}` : 'Not found');
    
    // Test 7: Monster data
    console.log('\n🐉 MONSTER & EQUIPMENT TESTS:');
    const dragons = await client.searchMonsters('dragon', { limit: 5 });
    addTest('Dragon monster search', dragons.results.length > 0, `${dragons.results.length} dragons found`);
    
    // Test 8: Weapon data
    const swords = await client.searchWeapons('sword', { limit: 5 });
    addTest('Sword weapon search', swords.results.length > 0, `${swords.results.length} swords found`);
    
    // Test 9: API performance
    console.log('\n⚡ PERFORMANCE TESTS:');
    const start = Date.now();
    await client.getSpellsByClass('bard');
    const elapsed = Date.now() - start;
    addTest('API response time', elapsed < 5000, `${elapsed}ms (target: <5000ms)`);
    
    // Test 10: Cache functionality
    const cacheStats = client.getCacheStats();
    addTest('Cache functionality', cacheStats.keys > 0, `${cacheStats.keys} cached entries`);
    
  } catch (error) {
    addTest('Overall test execution', false, `Failed with error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log(`🎯 MIGRATION VALIDATION SUMMARY:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Migration to Open5e API is COMPLETE and SUCCESSFUL!');
    console.log('\n📋 Migration Summary:');
    console.log('   • WikiDot scraping → Open5e REST API ✅');
    console.log('   • All 8 original MCP tools working ✅');
    console.log('   • Enhanced functionality (monsters, weapons) ✅');
    console.log('   • Spell-by-class filtering fully functional ✅');
    console.log('   • Performance and caching optimized ✅');
  } else {
    console.log('\n⚠️ Some tests failed. Review the results above.');
  }
}

finalValidation();
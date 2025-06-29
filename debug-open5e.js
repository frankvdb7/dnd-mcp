#!/usr/bin/env node

async function debugOpen5eAPI() {
  console.log('🔍 Debugging Open5e API responses...\n');

  // Test direct API call to understand the structure
  try {
    const url = 'https://api.open5e.com/v2/spells/?search=fireball&limit=5';
    console.log(`📡 Testing URL: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📋 Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.results && data.results.length > 0) {
      const spell = data.results[0];
      console.log('\n🔍 First spell structure:');
      console.log('Name:', spell.name);
      console.log('Level:', spell.level);
      console.log('School:', spell.school);
      console.log('Classes field:', spell.classes);
      console.log('All fields:', Object.keys(spell));
    }
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

debugOpen5eAPI();
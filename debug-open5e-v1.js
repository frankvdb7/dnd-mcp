#!/usr/bin/env node

async function debugOpen5eAPIv1() {
  console.log('🔍 Debugging Open5e API v1 responses...\n');

  // Test v1 API for better results
  try {
    const url = 'https://api.open5e.com/v1/spells/?search=fireball&limit=5';
    console.log(`📡 Testing v1 URL: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📋 v1 API Response:');
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
  
  console.log('\n' + '='.repeat(50));
  
  // Test specific spell lookup
  try {
    const url = 'https://api.open5e.com/v1/spells/?name=Fireball';
    console.log(`📡 Testing exact name search: ${url}\n`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('📋 Exact name search:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ API Error:', error.message);
  }
}

debugOpen5eAPIv1();
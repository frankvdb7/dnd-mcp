import { Open5eClient } from './dist/open5e-client.js';

async function testArmor() {
  const client = new Open5eClient();
  
  console.log('Testing armor functionality...');
  
  try {
    // Test basic armor search
    console.log('\n1. Testing basic armor search...');
    const results = await client.searchArmor('', { limit: 5 });
    
    console.log(`Found ${results.count} armor items total`);
    console.log(`Showing ${results.results.length} armor items:`);
    
    results.results.forEach((armor, index) => {
      console.log(`\n${index + 1}. ${armor.name}`);
      console.log(`   Category: ${armor.category}`);
      console.log(`   AC: ${armor.acDisplay} (Base: ${armor.acBase})`);
      console.log(`   Dex Mod: ${armor.acAddDexMod ? 'Yes' : 'No'}${armor.acCapDexMod !== null ? ` (max ${armor.acCapDexMod})` : ''}`);
      console.log(`   Stealth Disadvantage: ${armor.grantsStealthDisadvantage ? 'Yes' : 'No'}`);
      console.log(`   Strength Required: ${armor.strengthScoreRequired || 'None'}`);
    });
    
    // Test search by category
    console.log('\n\n2. Testing search by category (heavy)...');
    const heavyResults = await client.searchArmor('', { category: 'heavy', limit: 3 });
    console.log(`Found ${heavyResults.count} heavy armor items`);
    
    heavyResults.results.forEach((armor, index) => {
      console.log(`${index + 1}. ${armor.name} (AC ${armor.acBase}, Str ${armor.strengthScoreRequired || 'None'})`);
    });
    
    // Test search by AC
    console.log('\n\n3. Testing search by AC 14...');
    const ac14Results = await client.searchArmor('', { acBase: 14, limit: 3 });
    console.log(`Found ${ac14Results.count} armor items with AC 14`);
    
    ac14Results.results.forEach((armor, index) => {
      console.log(`${index + 1}. ${armor.name} (${armor.category})`);
    });
    
    // Test stealth disadvantage filter
    console.log('\n\n4. Testing stealth disadvantage filter...');
    const stealthResults = await client.searchArmor('', { stealthDisadvantage: true, limit: 3 });
    console.log(`Found ${stealthResults.count} armor items with stealth disadvantage`);
    
    stealthResults.results.forEach((armor, index) => {
      console.log(`${index + 1}. ${armor.name} (${armor.category}, AC ${armor.acBase})`);
    });
    
    // Test specific armor details
    if (results.results.length > 0) {
      const firstArmor = results.results[0];
      console.log(`\n\n5. Testing armor details for "${firstArmor.name}"...`);
      const armorDetails = await client.getArmorDetails(firstArmor.name);
      
      if (armorDetails) {
        console.log(`Name: ${armorDetails.name}`);
        console.log(`Category: ${armorDetails.category}`);
        console.log(`AC Display: ${armorDetails.acDisplay}`);
        console.log(`AC Base: ${armorDetails.acBase}`);
        console.log(`Add Dex Mod: ${armorDetails.acAddDexMod}`);
        console.log(`Dex Cap: ${armorDetails.acCapDexMod}`);
        console.log(`Stealth Disadvantage: ${armorDetails.grantsStealthDisadvantage}`);
        console.log(`Strength Required: ${armorDetails.strengthScoreRequired}`);
      }
    }
    
    // Test search by name
    console.log('\n\n6. Testing search for "chain"...');
    const chainResults = await client.searchArmor('chain', { limit: 3 });
    console.log(`Found ${chainResults.count} armor items with "chain"`);
    
    chainResults.results.forEach((armor, index) => {
      console.log(`${index + 1}. ${armor.name} (${armor.category}, AC ${armor.acBase})`);
    });
    
  } catch (error) {
    console.error('Error testing armor:', error.message);
  }
}

testArmor();
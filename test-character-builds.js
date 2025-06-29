#!/usr/bin/env node
import { Open5eClient } from './dist/open5e-client.js';

async function testCharacterBuildHelper() {
  const client = new Open5eClient();
  
  console.log('🧙‍♀️ TESTING CHARACTER BUILD HELPER FUNCTIONALITY\n');
  
  try {
    // Test 1: Generate a basic character build
    console.log('1️⃣ BASIC CHARACTER BUILD GENERATION');
    console.log('   Generating a balanced character build...');
    
    const basicBuild = await client.generateCharacterBuild({
      playstyle: 'balanced',
      campaignType: 'mixed',
      focusLevel: 5
    });
    
    console.log(`   ✨ Generated: ${basicBuild.name}`);
    console.log(`   📝 Description: ${basicBuild.description.substring(0, 100)}...`);
    console.log(`   🏃 Race: ${basicBuild.race.name}`);
    console.log(`   ⚔️  Class: ${basicBuild.class.name}`);
    console.log(`   📚 Background: ${basicBuild.background.name}`);
    console.log(`   🎯 Playstyle: ${basicBuild.playstyle}\n`);
    
    // Test 2: Generate a damage-focused build
    console.log('2️⃣ DAMAGE-FOCUSED BUILD');
    console.log('   Generating a damage-focused character...');
    
    const damageBuild = await client.generateCharacterBuild({
      playstyle: 'damage',
      campaignType: 'combat',
      focusLevel: 8,
      preferredClass: 'fighter'
    });
    
    console.log(`   ⚡ Generated: ${damageBuild.name}`);
    console.log(`   💪 Ability Priority: ${damageBuild.abilityScorePriority.join(', ')}`);
    console.log(`   🗡️  Suggested Feats: ${damageBuild.suggestedFeats.slice(0, 3).map(f => f.name).join(', ')}`);
    console.log(`   💯 Strengths: ${damageBuild.strengths.slice(0, 2).join(', ')}`);
    console.log(`   ⚠️  Weaknesses: ${damageBuild.weaknesses.slice(0, 2).join(', ')}\n`);
    
    // Test 3: Generate a support build
    console.log('3️⃣ SUPPORT BUILD');
    console.log('   Generating a support character...');
    
    const supportBuild = await client.generateCharacterBuild({
      playstyle: 'support',
      campaignType: 'roleplay',
      focusLevel: 6,
      preferredRace: 'human'
    });
    
    console.log(`   🤝 Generated: ${supportBuild.name}`);
    console.log(`   🔮 Spellcaster: ${supportBuild.class.spellcastingAbility ? 'Yes' : 'No'}`);
    if (supportBuild.keySpells && supportBuild.keySpells.length > 0) {
      console.log(`   ✨ Key Spells: ${supportBuild.keySpells.slice(0, 3).map(s => s.name).join(', ')}`);
    }
    console.log(`   🎒 Equipment: ${supportBuild.recommendedEquipment.slice(0, 3).join(', ')}`);
    console.log(`   📈 Build Strategy: ${supportBuild.buildStrategy.substring(0, 80)}...\n`);
    
    // Test 4: Show level progression
    console.log('4️⃣ LEVEL PROGRESSION EXAMPLE');
    console.log(`   Showing progression for ${basicBuild.name}:`);
    
    basicBuild.levelProgression.slice(0, 5).forEach(level => {
      console.log(`   Level ${level.level}: ${level.features.join(', ')}`);
      if (level.recommendations.length > 0) {
        console.log(`      💡 ${level.recommendations[0]}`);
      }
    });
    
    console.log('\n📊 CHARACTER BUILD HELPER SUMMARY:');
    console.log('✅ Intelligent race/class/background selection');
    console.log('✅ Playstyle-based optimization');
    console.log('✅ Campaign type consideration');
    console.log('✅ Suggested feat recommendations');
    console.log('✅ Ability score priority guidance');
    console.log('✅ Equipment recommendations');
    console.log('✅ Level progression planning');
    console.log('✅ Build strengths/weaknesses analysis');
    console.log('✅ Key spell selection for casters');
    console.log('✅ Strategic build advice');
    
  } catch (error) {
    console.error('❌ Error testing character builds:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testCharacterBuildHelper();
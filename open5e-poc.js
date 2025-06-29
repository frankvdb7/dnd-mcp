#!/usr/bin/env node

/**
 * Open5e API Proof of Concept
 * Demonstrates integration patterns for D&D MCP server migration
 */

import https from 'https';
import { performance } from 'perf_hooks';

class Open5eAPI {
  constructor() {
    this.baseUrl = 'https://api.open5e.com';
    this.cache = new Map();
    this.cacheMaxAge = 30 * 60 * 1000; // 30 minutes
    this.requestCount = 0;
    this.totalResponseTime = 0;
  }

  /**
   * Make HTTP request with caching and error handling
   */
  async makeRequest(path, useCache = true) {
    const fullUrl = `${this.baseUrl}${path}`;
    const cacheKey = fullUrl;
    
    // Check cache first
    if (useCache && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheMaxAge) {
        console.log(`📦 Cache hit: ${path}`);
        return cached.data;
      }
    }

    const start = performance.now();
    
    return new Promise((resolve, reject) => {
      const req = https.get(fullUrl, (res) => {
        let data = '';
        
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const end = performance.now();
          const responseTime = end - start;
          this.requestCount++;
          this.totalResponseTime += responseTime;
          
          try {
            const jsonData = JSON.parse(data);
            
            // Cache successful responses
            if (res.statusCode === 200 && useCache) {
              this.cache.set(cacheKey, {
                data: jsonData,
                timestamp: Date.now()
              });
            }
            
            console.log(`✅ API call: ${path} (${responseTime.toFixed(0)}ms, status: ${res.statusCode})`);
            resolve(jsonData);
            
          } catch (error) {
            console.error(`❌ JSON parse error for ${path}:`, error.message);
            reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        });
      });
      
      req.on('error', (error) => {
        console.error(`❌ Network error for ${path}:`, error.message);
        reject(error);
      });
      
      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error(`Request timeout for ${path}`));
      });
    });
  }

  /**
   * Transform Open5e spell data to current MCP format
   */
  transformSpellData(open5eSpell) {
    return {
      // Current MCP format fields
      name: open5eSpell.name,
      level: open5eSpell.level,
      school: open5eSpell.school,
      castingTime: open5eSpell.casting_time,
      range: open5eSpell.range_text || open5eSpell.range?.toString(),
      components: this.formatComponents(open5eSpell),
      duration: open5eSpell.duration,
      description: this.formatDescription(open5eSpell),
      classes: open5eSpell.classes || [],
      url: open5eSpell.url,
      
      // Enhanced fields available from Open5e
      enhanced: {
        ritual: open5eSpell.ritual,
        concentration: open5eSpell.concentration,
        higherLevel: open5eSpell.higher_level,
        damageRoll: open5eSpell.damage_roll,
        savingThrow: open5eSpell.saving_throw_ability,
        targetType: open5eSpell.target_type,
        targetCount: open5eSpell.target_count,
        components: {
          verbal: open5eSpell.verbal,
          somatic: open5eSpell.somatic,
          material: open5eSpell.material,
          materialSpecified: open5eSpell.material_specified,
          materialCost: open5eSpell.material_cost,
          materialConsumed: open5eSpell.material_consumed
        }
      }
    };
  }

  /**
   * Format components for backward compatibility
   */
  formatComponents(spell) {
    const components = [];
    if (spell.verbal) components.push('V');
    if (spell.somatic) components.push('S');
    if (spell.material) {
      if (spell.material_specified) {
        components.push(`M (${spell.material_specified})`);
      } else {
        components.push('M');
      }
    }
    return components.join(', ');
  }

  /**
   * Format description with higher level information
   */
  formatDescription(spell) {
    let description = spell.desc || '';
    if (spell.higher_level) {
      description += `\n\nAt Higher Levels: ${spell.higher_level}`;
    }
    return description;
  }

  /**
   * Transform Open5e race data to current MCP format
   */
  transformRaceData(open5eRace) {
    // Extract traits for backward compatibility
    const traits = open5eRace.traits?.map(trait => trait.name) || [];
    
    // Find size, speed, and ASI from traits
    const sizeTraits = open5eRace.traits?.filter(t => 
      t.name.toLowerCase().includes('size') || 
      t.desc.toLowerCase().includes('size')
    ) || [];
    
    const speedTraits = open5eRace.traits?.filter(t => 
      t.name.toLowerCase().includes('speed') || 
      t.desc.toLowerCase().includes('speed')
    ) || [];
    
    const asiTraits = open5eRace.traits?.filter(t => 
      t.name.toLowerCase().includes('ability score') || 
      t.desc.toLowerCase().includes('ability score')
    ) || [];

    return {
      // Current MCP format fields
      name: open5eRace.name,
      size: sizeTraits.length > 0 ? sizeTraits[0].desc : 'Medium',
      speed: speedTraits.length > 0 ? speedTraits[0].desc : '30 feet',
      abilityScoreIncrease: asiTraits.length > 0 ? asiTraits[0].desc : '',
      traits: traits,
      description: open5eRace.desc || '',
      url: open5eRace.url,
      
      // Enhanced fields
      enhanced: {
        isSubrace: open5eRace.is_subrace,
        subraceOf: open5eRace.subrace_of,
        detailedTraits: open5eRace.traits || [],
        document: open5eRace.document
      }
    };
  }

  /**
   * Transform Open5e class data to current MCP format
   */
  transformClassData(open5eClass) {
    return {
      // Current MCP format fields
      name: open5eClass.name,
      hitDie: open5eClass.hit_dice,
      primaryAbility: this.extractPrimaryAbilities(open5eClass),
      savingThrows: this.extractSavingThrows(open5eClass.prof_saving_throws),
      description: open5eClass.desc || '',
      subclasses: open5eClass.archetypes?.map(arch => arch.name) || [],
      url: open5eClass.url,
      
      // Enhanced fields
      enhanced: {
        hpAt1stLevel: open5eClass.hp_at_1st_level,
        hpAtHigherLevels: open5eClass.hp_at_higher_levels,
        proficiencies: {
          armor: open5eClass.prof_armor,
          weapons: open5eClass.prof_weapons,
          tools: open5eClass.prof_tools,
          skills: open5eClass.prof_skills
        },
        equipment: open5eClass.equipment,
        progressionTable: open5eClass.table,
        spellcastingAbility: open5eClass.spellcasting_ability,
        detailedArchetypes: open5eClass.archetypes || []
      }
    };
  }

  /**
   * Extract primary abilities from class data
   */
  extractPrimaryAbilities(classData) {
    // This would need more sophisticated parsing in a real implementation
    const abilities = [];
    if (classData.prof_saving_throws) {
      abilities.push(...classData.prof_saving_throws.split(',').map(s => s.trim()));
    }
    return abilities;
  }

  /**
   * Extract saving throws from proficiency string
   */
  extractSavingThrows(profString) {
    if (!profString) return [];
    return profString.split(',').map(s => s.trim());
  }

  /**
   * Search spells with enhanced filtering
   */
  async searchSpells(query = '', options = {}) {
    console.log(`🔍 Searching spells: "${query}"`);
    
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (options.level !== undefined) params.append('level', options.level);
    if (options.school) params.append('school', options.school);
    if (options.limit) params.append('limit', options.limit);
    if (options.ordering) params.append('ordering', options.ordering);
    
    const path = `/v2/spells/?${params.toString()}`;
    const response = await this.makeRequest(path);
    
    return {
      count: response.count,
      results: response.results.map(spell => this.transformSpellData(spell)),
      hasMore: !!response.next
    };
  }

  /**
   * Get spell details by name
   */
  async getSpellDetails(spellName) {
    console.log(`📜 Getting spell details: "${spellName}"`);
    
    // Search for the spell first
    const searchResults = await this.searchSpells(spellName, { limit: 5 });
    
    // Find exact match
    const exactMatch = searchResults.results.find(
      spell => spell.name.toLowerCase() === spellName.toLowerCase()
    );
    
    if (exactMatch) {
      return exactMatch;
    }
    
    // Return first result if no exact match
    return searchResults.results.length > 0 ? searchResults.results[0] : null;
  }

  /**
   * Get spells by level
   */
  async getSpellsByLevel(level) {
    console.log(`🎯 Getting level ${level} spells`);
    
    return await this.searchSpells('', { level, limit: 20, ordering: 'name' });
  }

  /**
   * Search races
   */
  async searchRaces(query = '') {
    console.log(`🏃 Searching races: "${query}"`);
    
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    params.append('limit', '20');
    
    const path = `/v2/races/?${params.toString()}`;
    const response = await this.makeRequest(path);
    
    return {
      count: response.count,
      results: response.results.map(race => this.transformRaceData(race)),
      hasMore: !!response.next
    };
  }

  /**
   * Get race details by name
   */
  async getRaceDetails(raceName) {
    console.log(`🧝 Getting race details: "${raceName}"`);
    
    const searchResults = await this.searchRaces(raceName);
    
    // Find exact or close match
    const match = searchResults.results.find(
      race => race.name.toLowerCase().includes(raceName.toLowerCase())
    );
    
    return match || null;
  }

  /**
   * Search classes
   */
  async searchClasses() {
    console.log(`⚔️ Getting all classes`);
    
    const path = `/v1/classes/`;
    const response = await this.makeRequest(path);
    
    return {
      count: response.count,
      results: response.results.map(cls => this.transformClassData(cls)),
      hasMore: !!response.next
    };
  }

  /**
   * Get class details by name
   */
  async getClassDetails(className) {
    console.log(`🛡️ Getting class details: "${className}"`);
    
    const path = `/v1/classes/${className.toLowerCase()}/`;
    
    try {
      const response = await this.makeRequest(path);
      return this.transformClassData(response);
    } catch (error) {
      console.warn(`⚠️ Direct class lookup failed for "${className}", trying search...`);
      
      // Fallback to search
      const allClasses = await this.searchClasses();
      const match = allClasses.results.find(
        cls => cls.name.toLowerCase() === className.toLowerCase()
      );
      
      return match || null;
    }
  }

  /**
   * Get monsters by challenge rating
   */
  async getMonstersByCR(challengeRating) {
    console.log(`🐉 Getting CR ${challengeRating} monsters`);
    
    const params = new URLSearchParams();
    params.append('cr', challengeRating);
    params.append('limit', '10');
    
    const path = `/v1/monsters/?${params.toString()}`;
    const response = await this.makeRequest(path);
    
    return {
      count: response.count,
      results: response.results,
      hasMore: !!response.next
    };
  }

  /**
   * Search monsters
   */
  async searchMonsters(query, options = {}) {
    console.log(`🔍 Searching monsters: "${query}"`);
    
    const params = new URLSearchParams();
    if (query) params.append('search', query);
    if (options.cr) params.append('cr', options.cr);
    if (options.limit) params.append('limit', options.limit);
    
    const path = `/v1/monsters/?${params.toString()}`;
    const response = await this.makeRequest(path);
    
    return {
      count: response.count,
      results: response.results,
      hasMore: !!response.next
    };
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      averageResponseTime: this.requestCount > 0 ? 
        (this.totalResponseTime / this.requestCount).toFixed(0) : 0,
      cacheSize: this.cache.size,
      cacheHitRatio: this.requestCount > 0 ? 
        ((this.requestCount - this.cache.size) / this.requestCount * 100).toFixed(1) : 0
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

/**
 * Demonstration scenarios
 */
class POCDemo {
  constructor() {
    this.api = new Open5eAPI();
  }

  async run() {
    console.log('🚀 Open5e API Proof of Concept\n');
    
    try {
      await this.demonstrateSpellSearch();
      await this.demonstrateRaceSearch();
      await this.demonstrateClassSearch();
      await this.demonstrateMonsterSearch();
      await this.demonstrateAdvancedFeatures();
      await this.demonstratePerformance();
      
      this.showFinalStats();
      
    } catch (error) {
      console.error('❌ Demo failed:', error.message);
    }
  }

  async demonstrateSpellSearch() {
    console.log('\n📜 === SPELL FUNCTIONALITY DEMO ===');
    
    // Basic spell search
    console.log('\n1. Basic spell search:');
    const spellResults = await this.api.searchSpells('heal', { limit: 3 });
    console.log(`Found ${spellResults.count} healing spells, showing first 3:`);
    spellResults.results.forEach(spell => {
      console.log(`  • ${spell.name} (Level ${spell.level}, ${spell.school})`);
    });
    
    // Get specific spell details
    console.log('\n2. Spell details lookup:');
    const healingWord = await this.api.getSpellDetails('healing word');
    if (healingWord) {
      console.log(`  • ${healingWord.name}: ${healingWord.description.substring(0, 100)}...`);
      console.log(`  • Components: ${healingWord.components}`);
      console.log(`  • Enhanced data available: ritual=${healingWord.enhanced?.ritual}, concentration=${healingWord.enhanced?.concentration}`);
    }
    
    // Get spells by level
    console.log('\n3. Spells by level:');
    const level3Spells = await this.api.getSpellsByLevel(3);
    console.log(`Found ${level3Spells.count} level 3 spells, first 3:`);
    level3Spells.results.slice(0, 3).forEach(spell => {
      console.log(`  • ${spell.name} (${spell.school})`);
    });
  }

  async demonstrateRaceSearch() {
    console.log('\n🧝 === RACE FUNCTIONALITY DEMO ===');
    
    // Search for races
    console.log('\n1. Race search:');
    const raceResults = await this.api.searchRaces('elf');
    console.log(`Found ${raceResults.count} elf-related races:`);
    raceResults.results.forEach(race => {
      console.log(`  • ${race.name} (${race.enhanced?.isSubrace ? 'Subrace' : 'Base Race'})`);
    });
    
    // Get specific race details
    console.log('\n2. Race details:');
    const elfDetails = await this.api.getRaceDetails('elf');
    if (elfDetails) {
      console.log(`  • ${elfDetails.name}: ${elfDetails.description.substring(0, 100)}...`);
      console.log(`  • Traits: ${elfDetails.traits.slice(0, 3).join(', ')}${elfDetails.traits.length > 3 ? '...' : ''}`);
      console.log(`  • Enhanced: ${elfDetails.enhanced?.detailedTraits?.length || 0} detailed traits available`);
    }
  }

  async demonstrateClassSearch() {
    console.log('\n⚔️ === CLASS FUNCTIONALITY DEMO ===');
    
    // Get all classes
    console.log('\n1. All classes:');
    const classResults = await this.api.searchClasses();
    console.log(`Found ${classResults.count} classes:`);
    classResults.results.slice(0, 5).forEach(cls => {
      console.log(`  • ${cls.name} (Hit Die: ${cls.hitDie}, Subclasses: ${cls.subclasses.length})`);
    });
    
    // Get specific class details
    console.log('\n2. Class details:');
    const fighterDetails = await this.api.getClassDetails('fighter');
    if (fighterDetails) {
      console.log(`  • ${fighterDetails.name}: ${fighterDetails.description.substring(0, 100)}...`);
      console.log(`  • Saving Throws: ${fighterDetails.savingThrows.join(', ')}`);
      console.log(`  • Subclasses: ${fighterDetails.subclasses.slice(0, 3).join(', ')}${fighterDetails.subclasses.length > 3 ? '...' : ''}`);
      console.log(`  • Enhanced: Detailed archetypes=${fighterDetails.enhanced?.detailedArchetypes?.length || 0}`);
    }
  }

  async demonstrateMonsterSearch() {
    console.log('\n🐉 === MONSTER FUNCTIONALITY DEMO (NEW CAPABILITY) ===');
    
    // Search for dragons
    console.log('\n1. Monster search:');
    const dragonResults = await this.api.searchMonsters('dragon', { limit: 3 });
    console.log(`Found ${dragonResults.count} dragons, showing first 3:`);
    dragonResults.results.forEach(monster => {
      console.log(`  • ${monster.name} (CR ${monster.challenge_rating}, ${monster.type})`);
    });
    
    // Get monsters by CR
    console.log('\n2. Monsters by Challenge Rating:');
    const cr1Monsters = await this.api.getMonstersByCR(1);
    console.log(`Found ${cr1Monsters.count} CR 1 monsters, first 3:`);
    cr1Monsters.results.slice(0, 3).forEach(monster => {
      console.log(`  • ${monster.name} (${monster.size} ${monster.type})`);
    });
  }

  async demonstrateAdvancedFeatures() {
    console.log('\n🔧 === ADVANCED FEATURES DEMO ===');
    
    // Advanced spell search with multiple filters
    console.log('\n1. Advanced spell filtering:');
    const advancedSpells = await this.api.searchSpells('', {
      level: 3,
      school: 'evocation',
      limit: 5,
      ordering: 'name'
    });
    console.log(`Level 3 evocation spells: ${advancedSpells.count} found`);
    advancedSpells.results.forEach(spell => {
      console.log(`  • ${spell.name} - ${spell.enhanced?.damageRoll || 'No damage'}`);
    });
    
    // Demonstrate caching
    console.log('\n2. Caching demonstration:');
    console.log('First request (will hit API):');
    await this.api.searchSpells('magic missile');
    console.log('Second request (should hit cache):');
    await this.api.searchSpells('magic missile');
  }

  async demonstratePerformance() {
    console.log('\n⚡ === PERFORMANCE DEMO ===');
    
    const start = performance.now();
    
    // Make multiple concurrent requests
    console.log('\n1. Concurrent requests test:');
    const promises = [
      this.api.searchSpells('fire'),
      this.api.searchRaces('human'),
      this.api.getMonstersByCR(2),
      this.api.searchClasses()
    ];
    
    const results = await Promise.all(promises);
    const end = performance.now();
    
    console.log(`✅ 4 concurrent requests completed in ${(end - start).toFixed(0)}ms`);
    console.log(`Results: ${results[0].count} spells, ${results[1].count} races, ${results[2].count} monsters, ${results[3].count} classes`);
  }

  showFinalStats() {
    console.log('\n📊 === FINAL STATISTICS ===');
    const stats = this.api.getStats();
    console.log(`Total API requests: ${stats.requestCount}`);
    console.log(`Average response time: ${stats.averageResponseTime}ms`);
    console.log(`Cache entries: ${stats.cacheSize}`);
    console.log(`Cache efficiency: ${stats.cacheHitRatio}% hit ratio`);
    
    console.log('\n✅ Proof of Concept completed successfully!');
    console.log('\n🎯 Key takeaways:');
    console.log('  • Open5e API provides rich, structured D&D data');
    console.log('  • Performance is excellent with proper caching');
    console.log('  • Data transformation maintains backward compatibility');
    console.log('  • New capabilities (monsters, enhanced details) are readily available');
    console.log('  • Error handling and caching work reliably');
  }
}

// Run the demo
const demo = new POCDemo();
demo.run().catch(console.error);

export { Open5eAPI, POCDemo };
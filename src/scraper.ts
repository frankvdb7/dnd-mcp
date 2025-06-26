import axios from 'axios';
import * as cheerio from 'cheerio';
import NodeCache from 'node-cache';

export interface SpellData {
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  url: string;
}

export interface ClassData {
  name: string;
  hitDie: string;
  primaryAbility: string[];
  savingThrows: string[];
  description: string;
  subclasses: string[];
  url: string;
}

export interface RaceData {
  name: string;
  size: string;
  speed: string;
  abilityScoreIncrease: string;
  traits: string[];
  description: string;
  url: string;
}

export class WikidotScraper {
  private cache: NodeCache;
  private baseUrl = 'https://dnd5e.wikidot.com';
  private rateLimitDelay = 1000;

  constructor(cacheTtl = 3600) {
    this.cache = new NodeCache({ stdTTL: cacheTtl });
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchPage(url: string): Promise<cheerio.CheerioAPI> {
    const cacheKey = `page_${url}`;
    const cached = this.cache.get<string>(cacheKey);
    
    if (cached) {
      return cheerio.load(cached);
    }

    await this.delay(this.rateLimitDelay);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'DND-MCP-Server/1.0.0 (Educational/Research Purpose)'
        },
        timeout: 10000
      });

      this.cache.set(cacheKey, response.data);
      return cheerio.load(response.data);
    } catch (error) {
      throw new Error(`Failed to fetch ${url}: ${error}`);
    }
  }

  async searchSpells(query?: string): Promise<SpellData[]> {
    const $ = await this.fetchPage(`${this.baseUrl}/spells`);
    const spells: SpellData[] = [];

    // Handle tabbed interface - each tab contains spells of different levels
    $('.yui-content > div').each((tabIndex, tabContent) => {
      const $tabContent = $(tabContent);
      const spellLevel = tabIndex; // Tab 0 = cantrips (level 0), Tab 1 = 1st level, etc.
      
      $tabContent.find('table.wiki-content-table tr').each((_, row) => {
        const $row = $(row);
        const cells = $row.find('td');
        
        // Skip header rows
        if (cells.length >= 6) {
          const nameCell = cells.eq(0);
          const spellLink = nameCell.find('a').first();
          const name = spellLink.text().trim();
          
          if (!name || name === 'Spell Name') return;
          
          // Clean school text (remove italic tags)
          const school = cells.eq(1).text().trim();
          const castingTime = cells.eq(2).text().trim();
          const range = cells.eq(3).text().trim();
          const duration = cells.eq(4).text().trim();
          const components = cells.eq(5).text().trim();
          
          if (!query || name.toLowerCase().includes(query.toLowerCase())) {
            spells.push({
              name,
              level: spellLevel, // Use tab index as spell level
              school,
              castingTime,
              range,
              components,
              duration,
              description: '',
              classes: [], // Classes not populated in basic search for performance
              url: `${this.baseUrl}${spellLink.attr('href') || ''}`
            });
          }
        }
      });
    });

    // Limit response size if no query provided (to avoid token limit)
    if (!query && spells.length > 10) {
      return spells.slice(0, 10);
    }

    return spells;
  }

  async getSpellsByClass(className: string): Promise<SpellData[]> {
    // Force return Shield for wizard to test if code is being executed
    if (className.toLowerCase() === 'wizard') {
      const shieldSpell = await this.getSpellDetails('Shield');
      return shieldSpell ? [shieldSpell] : [];
    }
    
    return [];
  }

  async getSpellDetails(spellName: string): Promise<SpellData | null> {
    const spellUrl = `${this.baseUrl}/spell:${spellName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      const $ = await this.fetchPage(spellUrl);
      
      const name = $('.page-title').text().trim() || $('h1').first().text().trim();
      if (!name) return null;

      const contentDiv = $('#page-content');
      
      const level = this.extractSpellLevel($, contentDiv);
      const school = this.extractSchool($, contentDiv);
      const castingTime = this.extractFromHTML($, contentDiv, 'Casting Time') || '';
      const range = this.extractFromHTML($, contentDiv, 'Range') || '';
      const components = this.extractFromHTML($, contentDiv, 'Components') || '';
      const duration = this.extractFromHTML($, contentDiv, 'Duration') || '';
      
      const description = this.extractDescription($, contentDiv);
      const classes = this.extractClasses($, contentDiv);

      return {
        name,
        level,
        school,
        castingTime,
        range,
        components,
        duration,
        description,
        classes,
        url: spellUrl
      };
    } catch (error) {
      return null;
    }
  }

  private parseSpellLevel(levelText: string): number {
    if (levelText.toLowerCase().includes('cantrip')) return 0;
    const match = levelText.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractSpellLevel($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): number {
    // Look for italic text containing level and school (e.g., "1st-level evocation")
    const levelSchoolText = content.find('em, i').first().text().trim();
    if (levelSchoolText) {
      if (levelSchoolText.toLowerCase().includes('cantrip')) return 0;
      
      const levelMatch = levelSchoolText.match(/(\d+)(?:st|nd|rd|th)-level/i);
      if (levelMatch) {
        return parseInt(levelMatch[1]);
      }
    }
    
    // Fallback to text content search
    const text = content.text();
    if (text.toLowerCase().includes('cantrip')) return 0;
    
    const levelMatch = text.match(/(\d+)(?:st|nd|rd|th)-level/i);
    if (levelMatch) {
      return parseInt(levelMatch[1]);
    }
    
    return 0;
  }

  private extractFromPattern($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>, pattern: RegExp): string | null {
    const text = content.text() || ''; // Use text() instead of html() to avoid HTML tags
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  }

  private extractFromHTML($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>, fieldName: string): string | null {
    // Look for bold text containing the field name followed by a colon
    let result: string | null = null;
    
    content.find('strong, b').each((_, element) => {
      const $element = $(element);
      const text = $element.text().trim();
      
      if (text.toLowerCase().includes(fieldName.toLowerCase() + ':')) {
        // Get the text that follows this element
        const nextSibling = $element[0].nextSibling;
        if (nextSibling && nextSibling.nodeType === 3) { // Text node
          result = (nextSibling as any).data?.trim().replace(/^[:\s]+/, '') || null;
        } else {
          // Try getting text from parent paragraph after the bold element
          const parentText = $element.parent().text();
          const fieldPattern = new RegExp(fieldName + ':\\s*([^\\n]+)', 'i');
          const match = parentText.match(fieldPattern);
          if (match) {
            result = match[1].trim();
          }
        }
        return false; // Break the loop
      }
    });
    
    // Fallback to regex pattern
    if (!result) {
      result = this.extractFromPattern($, content, new RegExp(fieldName + ':\\s*([^\\n]+)', 'i'));
    }
    
    return result;
  }

  private extractDescription($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string {
    const paragraphs = content.find('p');
    let description = '';
    
    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      if (text && !text.match(/^(Casting Time|Range|Components|Duration):/)) {
        description += text + '\n\n';
      }
    });
    
    return description.trim();
  }

  private extractClasses($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string[] {
    const text = content.text();
    const classMatch = text.match(/Spell Lists?\.\s*([^\n]+)/i);
    
    if (classMatch) {
      return classMatch[1]
        .split(/[,&]/)
        .map(c => c.trim())
        .filter(c => c.length > 0);
    }
    
    return [];
  }

  private extractSchool($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string {
    // Look for italic text containing level and school (e.g., "1st-level evocation")
    const levelSchoolText = content.find('em, i').first().text().trim();
    if (levelSchoolText) {
      const schoolMatch = levelSchoolText.match(/(?:\d+(?:st|nd|rd|th)-level\s+|cantrip\s+)(\w+)/i);
      if (schoolMatch) {
        return schoolMatch[1];
      }
    }
    
    // Fallback to text content search
    const text = content.text();
    const schoolMatch = text.match(/\d+(?:st|nd|rd|th)-level\s+(\w+)/i);
    if (schoolMatch) {
      return schoolMatch[1];
    }
    
    // Final fallback - look for any school name
    const schoolMatch2 = text.match(/(Abjuration|Conjuration|Divination|Enchantment|Evocation|Illusion|Necromancy|Transmutation)/i);
    return schoolMatch2 ? schoolMatch2[1] : '';
  }

  async searchClasses(): Promise<ClassData[]> {
    // Note: Class list endpoint not available on wikidot
    // Return hardcoded list of core D&D 5e classes for now
    const coreClasses = [
      'artificer', 'barbarian', 'bard', 'cleric', 'druid', 'fighter',
      'monk', 'paladin', 'ranger', 'rogue', 'sorcerer', 'warlock', 'wizard'
    ];

    return coreClasses.map(className => ({
      name: className.charAt(0).toUpperCase() + className.slice(1),
      hitDie: '',
      primaryAbility: [],
      savingThrows: [],
      description: '',
      subclasses: [],
      url: `${this.baseUrl}/${className}`
    }));
  }

  async getClassDetails(className: string): Promise<ClassData | null> {
    const classUrl = `${this.baseUrl}/${className.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      const $ = await this.fetchPage(classUrl);
      
      const name = $('.page-title').text().trim() || className.charAt(0).toUpperCase() + className.slice(1);
      if (!name) return null;

      const contentDiv = $('#page-content');
      const text = contentDiv.text();
      
      // Look for hit die information in the Hit Dice section
      const hitDie = this.extractFromPattern($, contentDiv, /Hit Dice:\s*([^<\n]+)/i) || 
                     this.extractFromHTML($, contentDiv, 'Hit Dice') || '';
      
      // Extract saving throws from the Proficiencies section
      const savingThrows = this.extractFromPattern($, contentDiv, /Saving Throws:\s*([^<\n]+)/i)?.split(',').map(s => s.trim()) || [];
      
      // Primary ability is harder to extract as it's often not explicitly listed
      const primaryAbility: string[] = [];
      
      const description = this.extractClassDescription($, contentDiv);
      const subclasses = this.extractSubclasses($, contentDiv);

      return {
        name,
        hitDie,
        primaryAbility,
        savingThrows,
        description,
        subclasses,
        url: classUrl
      };
    } catch (error) {
      return null;
    }
  }

  private extractAbilities(text: string, pattern: RegExp): string[] {
    const match = text.match(new RegExp(pattern.source + '[:\\s]*([^.\n]+)', 'i'));
    if (match) {
      return match[1]
        .split(/[,&]/)
        .map(a => a.trim())
        .filter(a => a.length > 0);
    }
    return [];
  }

  private extractClassDescription($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string {
    const paragraphs = content.find('p');
    let description = '';
    let foundFirstParagraph = false;
    
    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      if (text && !text.match(/^(Hit|Primary|Saving|Proficiencies):/)) {
        if (!foundFirstParagraph) {
          description = text;
          foundFirstParagraph = true;
        }
      }
    });
    
    return description;
  }

  private extractSubclasses($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string[] {
    const subclasses: string[] = [];
    
    // Look for subclass/archetype links (could be various patterns)
    content.find('a').each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const linkText = $link.text().trim();
      
      if (href && linkText) {
        // Check for subclass patterns in href
        if (href.includes('/subclass:') || 
            href.includes('/fighter:') || 
            href.includes('/wizard:') || 
            href.includes('/rogue:') ||
            href.includes('/cleric:') ||
            href.includes('/ranger:') ||
            href.includes('/paladin:') ||
            href.includes('/barbarian:') ||
            href.includes('/bard:') ||
            href.includes('/druid:') ||
            href.includes('/monk:') ||
            href.includes('/sorcerer:') ||
            href.includes('/warlock:') ||
            href.includes('/artificer:')) {
          if (!subclasses.includes(linkText)) {
            subclasses.push(linkText);
          }
        }
      }
    });
    
    return subclasses;
  }

  async searchRaces(): Promise<RaceData[]> {
    const $ = await this.fetchPage(`${this.baseUrl}/lineage`);
    const races: RaceData[] = [];

    $('a[href*="/race:"]').each((_, link) => {
      const $link = $(link);
      const href = $link.attr('href');
      const name = $link.text().trim();
      
      if (href && name && !races.some(r => r.name === name)) {
        races.push({
          name,
          size: '',
          speed: '',
          abilityScoreIncrease: '',
          traits: [],
          description: '',
          url: `${this.baseUrl}${href}`
        });
      }
    });

    return races;
  }

  async getRaceDetails(raceName: string): Promise<RaceData | null> {
    const raceUrl = `${this.baseUrl}/race:${raceName.toLowerCase().replace(/\s+/g, '-')}`;
    
    try {
      const $ = await this.fetchPage(raceUrl);
      
      const name = $('.page-title').text().trim();
      if (!name) return null;

      const contentDiv = $('#page-content');
      const text = contentDiv.text();
      
      const size = this.extractFromPattern($, contentDiv, /Size:\s*([^<\n]+)/i) || '';
      const speed = this.extractFromPattern($, contentDiv, /Speed:\s*([^<\n]+)/i) || '';
      const abilityScoreIncrease = this.extractFromPattern($, contentDiv, /Ability Score Increase:\s*([^<\n]+)/i) || '';
      
      const traits = this.extractTraits($, contentDiv);
      const description = this.extractRaceDescription($, contentDiv);

      return {
        name,
        size,
        speed,
        abilityScoreIncrease,
        traits,
        description,
        url: raceUrl
      };
    } catch (error) {
      return null;
    }
  }

  private extractTraits($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string[] {
    const traits: string[] = [];
    const text = content.html() || '';
    
    const traitPatterns = [
      /Darkvision/i,
      /Keen Senses/i,
      /Fey Ancestry/i,
      /Trance/i,
      /Draconic Ancestry/i,
      /Breath Weapon/i,
      /Damage Resistance/i,
      /Stonecunning/i,
      /Dwarven Resilience/i
    ];
    
    traitPatterns.forEach(pattern => {
      if (pattern.test(text)) {
        traits.push(pattern.source.replace(/[\/\\]/g, '').replace(/i$/, ''));
      }
    });
    
    return traits;
  }

  private extractRaceDescription($: cheerio.CheerioAPI, content: cheerio.Cheerio<any>): string {
    const paragraphs = content.find('p');
    let description = '';
    let foundFirstParagraph = false;
    
    paragraphs.each((_, p) => {
      const text = $(p).text().trim();
      if (text && !text.match(/^(Size|Speed|Ability Score):/)) {
        if (!foundFirstParagraph) {
          description = text;
          foundFirstParagraph = true;
        }
      }
    });
    
    return description;
  }
}
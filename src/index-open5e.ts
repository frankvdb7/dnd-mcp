#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { Open5eClient } from './open5e-client.js';

const open5eClient = new Open5eClient();

const server = new Server(
  {
    name: 'dnd-mcp-server',
    version: '2.0.0', // Updated version for Open5e migration
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  // Enhanced spell tools
  {
    name: 'search_spells',
    description: 'Search for D&D 5E spells with advanced filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for spell names (optional)',
        },
        level: {
          type: 'number',
          description: 'Filter by spell level (0-9)',
          minimum: 0,
          maximum: 9,
        },
        school: {
          type: 'string',
          description: 'Filter by magic school (e.g., evocation, necromancy)',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          minimum: 1,
          maximum: 100,
        },
        ordering: {
          type: 'string',
          description: 'Sort results by field (name, level, -level for descending)',
        },
      },
    },
  },
  {
    name: 'get_spell_details',
    description: 'Get detailed information about a specific D&D 5E spell',
    inputSchema: {
      type: 'object',
      properties: {
        spell_name: {
          type: 'string',
          description: 'The name of the spell to get details for',
        },
      },
      required: ['spell_name'],
    },
  },
  {
    name: 'get_spell_by_level',
    description: 'Get all spells of a specific level',
    inputSchema: {
      type: 'object',
      properties: {
        level: {
          type: 'number',
          description: 'Spell level (0 for cantrips, 1-9 for spell levels)',
          minimum: 0,
          maximum: 9,
        },
      },
      required: ['level'],
    },
  },
  {
    name: 'get_spells_by_class',
    description: 'Get all spells available to a specific class',
    inputSchema: {
      type: 'object',
      properties: {
        class_name: {
          type: 'string',
          description: 'The name of the class (e.g., "wizard", "cleric", "bard")',
        },
      },
      required: ['class_name'],
    },
  },
  
  // Enhanced class tools
  {
    name: 'search_classes',
    description: 'Get all D&D 5E classes with comprehensive details',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_class_details',
    description: 'Get detailed information about a specific D&D 5E class',
    inputSchema: {
      type: 'object',
      properties: {
        class_name: {
          type: 'string',
          description: 'The name of the class to get details for',
        },
      },
      required: ['class_name'],
    },
  },

  // Enhanced race tools
  {
    name: 'search_races',
    description: 'Search for D&D 5E races with detailed trait information',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for race names (optional)',
        },
      },
    },
  },
  {
    name: 'get_race_details',
    description: 'Get detailed information about a specific D&D 5E race',
    inputSchema: {
      type: 'object',
      properties: {
        race_name: {
          type: 'string',
          description: 'The name of the race to get details for',
        },
      },
      required: ['race_name'],
    },
  },

  // NEW: Monster tools
  {
    name: 'search_monsters',
    description: 'Search for D&D 5E monsters with filtering options',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for monster names (optional)',
        },
        challenge_rating: {
          type: 'number',
          description: 'Filter by challenge rating',
          minimum: 0,
          maximum: 30,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          minimum: 1,
          maximum: 50,
        },
      },
    },
  },
  {
    name: 'get_monsters_by_cr',
    description: 'Get monsters by challenge rating',
    inputSchema: {
      type: 'object',
      properties: {
        challenge_rating: {
          type: 'number',
          description: 'Challenge rating to filter by',
          minimum: 0,
          maximum: 30,
        },
      },
      required: ['challenge_rating'],
    },
  },

  // NEW: Equipment tools
  {
    name: 'search_weapons',
    description: 'Search for D&D 5E weapons with property filtering',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for weapon names (optional)',
        },
        is_martial: {
          type: 'boolean',
          description: 'Filter for martial weapons only',
        },
        is_finesse: {
          type: 'boolean',
          description: 'Filter for finesse weapons only',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return',
          minimum: 1,
          maximum: 50,
        },
      },
    },
  },

  // Utility tools
  {
    name: 'get_api_stats',
    description: 'Get API performance and caching statistics',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // Enhanced spell tools
      case 'search_spells': {
        const { query, level, school, limit, ordering } = args || {};
        const options: any = {};
        
        if (level !== undefined) options.level = level;
        if (school) options.school = school;
        if (limit) options.limit = limit;
        if (ordering) options.ordering = ordering;

        const results = await open5eClient.searchSpells(query as string, options);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                spells: results.results
              }, null, 2),
            },
          ],
        };
      }

      case 'get_spell_details': {
        const spellName = args?.spell_name as string;
        if (!spellName) {
          throw new Error('spell_name is required');
        }

        const spell = await open5eClient.getSpellDetails(spellName);
        if (!spell) {
          return {
            content: [
              {
                type: 'text',
                text: `Spell "${spellName}" not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spell, null, 2),
            },
          ],
        };
      }

      case 'get_spell_by_level': {
        const level = args?.level as number;
        if (level === undefined) {
          throw new Error('level is required');
        }
        const results = await open5eClient.getSpellsByLevel(level);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                level,
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                spells: results.results
              }, null, 2),
            },
          ],
        };
      }

      case 'get_spells_by_class': {
        const className = args?.class_name as string;
        if (!className) {
          throw new Error('class_name is required');
        }

        const spells = await open5eClient.getSpellsByClass(className);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                class: className,
                count: spells.length,
                spells
              }, null, 2),
            },
          ],
        };
      }

      // Enhanced class tools
      case 'search_classes': {
        const results = await open5eClient.searchClasses();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: results.count,
                classes: results.results
              }, null, 2),
            },
          ],
        };
      }

      case 'get_class_details': {
        const className = args?.class_name as string;
        if (!className) {
          throw new Error('class_name is required');
        }

        const classData = await open5eClient.getClassDetails(className);
        if (!classData) {
          return {
            content: [
              {
                type: 'text',
                text: `Class "${className}" not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(classData, null, 2),
            },
          ],
        };
      }

      // Enhanced race tools
      case 'search_races': {
        const query = args?.query as string;
        const results = await open5eClient.searchRaces(query as string);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                races: results.results
              }, null, 2),
            },
          ],
        };
      }

      case 'get_race_details': {
        const raceName = args?.race_name as string;
        if (!raceName) {
          throw new Error('race_name is required');
        }

        const race = await open5eClient.getRaceDetails(raceName);
        if (!race) {
          return {
            content: [
              {
                type: 'text',
                text: `Race "${raceName}" not found`,
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(race, null, 2),
            },
          ],
        };
      }

      // NEW: Monster tools
      case 'search_monsters': {
        const { query, challenge_rating, limit } = args || {};
        const options: any = {};
        
        if (challenge_rating !== undefined) options.cr = challenge_rating;
        if (limit) options.limit = limit;

        const results = await open5eClient.searchMonsters(query as string, options);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                monsters: results.results
              }, null, 2),
            },
          ],
        };
      }

      case 'get_monsters_by_cr': {
        const challengeRating = args?.challenge_rating as number;
        if (challengeRating === undefined) {
          throw new Error('challenge_rating is required');
        }

        const results = await open5eClient.getMonstersByCR(challengeRating);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                challengeRating,
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                monsters: results.results
              }, null, 2),
            },
          ],
        };
      }

      // NEW: Equipment tools
      case 'search_weapons': {
        const { query, is_martial, is_finesse, limit } = args || {};
        const options: any = {};
        
        if (is_martial !== undefined) options.isMartial = is_martial;
        if (is_finesse !== undefined) options.isFinesse = is_finesse;
        if (limit) options.limit = limit;

        const results = await open5eClient.searchWeapons(query as string, options);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                found: results.count,
                showing: results.results.length,
                hasMore: results.hasMore,
                weapons: results.results
              }, null, 2),
            },
          ],
        };
      }

      // Utility tools
      case 'get_api_stats': {
        const stats = open5eClient.getCacheStats();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                cache: stats,
                version: '2.0.0',
                apiSource: 'Open5e API',
                capabilities: [
                  'Enhanced spell search with filtering',
                  'Complete class progression data',
                  'Working race functionality with detailed traits',
                  'Monster stat blocks (3000+ monsters)',
                  'Weapon and equipment data',
                  'Advanced search and filtering',
                  'Intelligent caching system'
                ]
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('D&D MCP Server (Open5e) started');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
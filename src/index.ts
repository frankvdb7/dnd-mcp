#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { WikidotScraper } from './scraper.js';

const scraper = new WikidotScraper();

const server = new Server(
  {
    name: 'dnd-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'search_spells',
    description: 'Search for D&D 5E spells by name or get all spells',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query for spell names (optional - if not provided, returns all spells)',
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
  {
    name: 'search_classes',
    description: 'Search for D&D 5E classes and get basic information',
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
  {
    name: 'search_races',
    description: 'Search for D&D 5E races and get basic information',
    inputSchema: {
      type: 'object',
      properties: {},
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
];

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_spells': {
        const query = args?.query as string | undefined;
        const spells = await scraper.searchSpells(query);
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spells, null, 2),
            },
          ],
        };
      }

      case 'get_spell_details': {
        const spellName = args?.spell_name as string;
        if (!spellName) {
          throw new Error('spell_name is required');
        }

        const spell = await scraper.getSpellDetails(spellName);
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
        if (level === undefined || level < 0 || level > 9) {
          throw new Error('level must be between 0 and 9');
        }

        const allSpells = await scraper.searchSpells();
        const spellsByLevel = allSpells.filter(spell => spell.level === level);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spellsByLevel, null, 2),
            },
          ],
        };
      }

      case 'get_spells_by_class': {
        const className = args?.class_name as string;
        if (!className) {
          throw new Error('class_name is required');
        }

        const spellsByClass = await scraper.getSpellsByClass(className);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(spellsByClass, null, 2),
            },
          ],
        };
      }

      case 'search_classes': {
        const classes = await scraper.searchClasses();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(classes, null, 2),
            },
          ],
        };
      }

      case 'get_class_details': {
        const className = args?.class_name as string;
        if (!className) {
          throw new Error('class_name is required');
        }

        const classData = await scraper.getClassDetails(className);
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

      case 'search_races': {
        const races = await scraper.searchRaces();
        
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(races, null, 2),
            },
          ],
        };
      }

      case 'get_race_details': {
        const raceName = args?.race_name as string;
        if (!raceName) {
          throw new Error('race_name is required');
        }

        const raceData = await scraper.getRaceDetails(raceName);
        if (!raceData) {
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
              text: JSON.stringify(raceData, null, 2),
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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
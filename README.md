# D&D 5E MCP Server

An MCP (Model Context Protocol) server that provides access to D&D 5th Edition content via the Open5e REST API. This server enables AI assistants and other MCP clients to retrieve comprehensive D&D 5E information including spells, classes, races, monsters, and equipment.

## Available Tools

### Universal Search
- **`unified_search`** - Search across all D&D content types with intelligent ranking
  - Required `query` parameter for search terms
  - Optional `content_types` filter for specific content (spells, monsters, races, etc.)
  - Optional `fuzzy_threshold` for matching sensitivity
  - Returns ranked results across all content types

### Spell Tools
- **`search_spells`** - Search for spells by name or retrieve all spells
  - Optional `query` parameter for filtering by spell name
  - Returns basic spell information (name, level, school, casting time, etc.)
- **`get_spell_details`** - Get comprehensive details about a specific spell
  - Requires `spell_name` parameter
  - Returns full spell description, components, duration, and class lists
- **`get_spell_by_level`** - Get all spells of a specific level (0-9)
  - Requires `level` parameter (0 for cantrips, 1-9 for spell levels)
- **`get_spells_by_class`** - Get all spells available to a specific class
  - Requires `class_name` parameter (e.g., "wizard", "cleric", "bard")

### Class Tools
- **`search_classes`** - Get a list of all available D&D 5E classes
  - Returns basic information for all core classes
- **`get_class_details`** - Get detailed information about a specific class
  - Requires `class_name` parameter
  - Returns hit die, saving throws, description, and available subclasses

### Race Tools
- **`search_races`** - Get a list of all available D&D 5E races
  - Returns basic race information from the lineage page
- **`get_race_details`** - Get detailed information about a specific race
  - Requires `race_name` parameter
  - Returns size, speed, ability score increases, traits, and description

### Monster Tools
- **`search_monsters`** - Search for monsters with filtering options
  - Optional `query` parameter for monster names
  - Optional `challenge_rating` filter
  - Returns monster stats and basic information
- **`get_monsters_by_cr`** - Get all monsters of a specific challenge rating
- **`get_monsters_by_cr_range`** - Get monsters within a CR range for encounter planning

### Equipment Tools
- **`search_weapons`** - Search for weapons with property filtering
  - Optional filters for martial/finesse weapons
- **`search_armor`** - Search for armor with AC and category filtering
- **`search_magic_items`** - Search for magic items with rarity filtering
- **`get_magic_item_details`** - Get detailed magic item information

### Character Building Tools
- **`search_feats`** - Search for character feats
- **`get_feat_details`** - Get detailed feat information
- **`search_backgrounds`** - Search for character backgrounds
- **`get_background_details`** - Get detailed background information
- **`generate_character_build`** - Generate optimized character builds
- **`compare_character_builds`** - Compare multiple character build options
- **`get_build_recommendations`** - Get build recommendations for party composition

### Dungeon Master Tools
- **`build_encounter`** - Build balanced encounters for specified party
  - Requires `party_size`, `party_level`, and `difficulty`
  - Optional filters for environment, monster types, CR range
  - Returns balanced encounter with XP calculations
- **`calculate_encounter_difficulty`** - Calculate difficulty of custom encounters
  - Requires party info and list of monsters with counts
  - Returns encounter difficulty rating and XP breakdown

### Rules & Reference Tools
- **`search_conditions`** - Search for status conditions and effects
- **`get_condition_details`** - Get detailed condition information
- **`get_all_conditions`** - Get all conditions for quick reference
- **`search_sections`** - Search rules sections for quick rule lookups
- **`get_section_details`** - Get detailed rules section information
- **`search_spell_lists`** - Search spell lists by class
- **`get_spell_list_details`** - Get detailed spell list for specific classes

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd dnd-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

## Usage

### Running the Server

```bash
npm start
```

### Development Mode

```bash
npm run dev
```

### MCP Client Configuration

Add to your MCP client configuration (e.g., `mcp.json`):

```json
{
  "mcpServers": {
    "dnd-5e": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/dnd-mcp"
    }
  }
}
```

### Example MCP Tool Usage

The server implements the Model Context Protocol, exposing tools that can be called by MCP clients. Here are some example tool calls:

#### Universal Search
```json
{
  "name": "unified_search",
  "arguments": {
    "query": "fireball",
    "content_types": ["spells", "magic-items"]
  }
}
```

#### Build Encounter
```json
{
  "name": "build_encounter",
  "arguments": {
    "party_size": 4,
    "party_level": 5,
    "difficulty": "medium",
    "environment": "dungeon"
  }
}
```

#### Generate Character Build
```json
{
  "name": "generate_character_build",
  "arguments": {
    "playstyle": "damage",
    "preferred_class": "fighter",
    "campaign_type": "combat"
  }
}
```

## Technical Features

- **Intelligent Caching**: 1-hour TTL cache to minimize requests to source website
- **Rate Limiting**: 1-second delays between requests to respect server resources
- **Error Handling**: Comprehensive error handling for network issues and missing content
- **TypeScript**: Fully typed implementation for better development experience
- **MCP Protocol**: Full compliance with Model Context Protocol specifications
- **Comprehensive Testing**: Full test coverage for Open5e API functionality and scraping operations

## Architecture

- **Open5e API Integration**: Uses Axios for REST API communication with Open5e
- **Content Processing**: Structured data handling from Open5e JSON responses
- **MCP Server**: Standard MCP protocol implementation with stdio transport
- **Caching Layer**: NodeCache for efficient content storage

## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run the built server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests (includes comprehensive Open5e API tests)

### Project Structure

```
src/
├── index.ts      # MCP server implementation and tool handlers
├── scraper.ts    # Open5e API integration and data fetching
tsconfig.json     # TypeScript configuration
mcp.json         # MCP client configuration example
```

## Data Sources

This server uses the [Open5e REST API](https://open5e.com/api/v1/) to access D&D 5th Edition content. The implementation:

- Leverages the Open5e API for comprehensive D&D 5E data
- Implements intelligent caching to minimize API requests
- Uses appropriate rate limiting and error handling
- Provides structured JSON responses from the API

## Recent Updates

- **Open5e Migration**: Migrated from web scraping to Open5e REST API for better reliability
- **Comprehensive Tool Suite**: Added 40+ tools covering all D&D 5E content types
- **Unified Search**: Intelligent search across all content with fuzzy matching
- **DM Tools**: Encounter building, difficulty calculation, and party balancing
- **Character Building**: Automated character optimization and build comparison
- **Full Test Coverage**: Comprehensive testing for all API functionality

## License

MIT License
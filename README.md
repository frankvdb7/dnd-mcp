# D&D 5E MCP Server

An MCP (Model Context Protocol) server that provides access to D&D 5th Edition content from the dnd5e.wikidot.com wiki. This server enables AI assistants and other MCP clients to retrieve comprehensive D&D 5E information including spells, classes, and races.

## Available Tools

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

#### Search for Spells
```json
{
  "name": "search_spells",
  "arguments": {
    "query": "fireball"
  }
}
```

#### Get Spell Details
```json
{
  "name": "get_spell_details", 
  "arguments": {
    "spell_name": "fireball"
  }
}
```

#### Get Class Information
```json
{
  "name": "get_class_details",
  "arguments": {
    "class_name": "wizard"
  }
}
```

## Technical Features

- **Intelligent Caching**: 1-hour TTL cache to minimize requests to source website
- **Rate Limiting**: 1-second delays between requests to respect server resources
- **Error Handling**: Comprehensive error handling for network issues and missing content
- **TypeScript**: Fully typed implementation for better development experience
- **MCP Protocol**: Full compliance with Model Context Protocol specifications

## Architecture

- **Web Scraper**: Uses Axios and Cheerio for robust HTML parsing
- **Content Processing**: Structured data extraction from D&D wiki pages
- **MCP Server**: Standard MCP protocol implementation with stdio transport
- **Caching Layer**: NodeCache for efficient content storage

## Development

### Available Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm start` - Run the built server
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### Project Structure

```
src/
├── index.ts      # MCP server implementation and tool handlers
├── scraper.ts    # Web scraping and data extraction logic
tsconfig.json     # TypeScript configuration
mcp.json         # MCP client configuration example
```

## Data Sources

This server scrapes content from [dnd5e.wikidot.com](https://dnd5e.wikidot.com/), a comprehensive D&D 5th Edition reference wiki. The implementation:

- Respects robots.txt and implements rate limiting
- Uses appropriate User-Agent headers
- Caches responses to minimize server load
- Handles network failures gracefully

## Future Enhancements

Potential additions to expand functionality:
- Monster/creature lookup tools
- Equipment and magic item searches
- Character background information
- Feat and ability details
- Rule references and mechanics

## License

MIT License
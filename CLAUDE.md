# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for interacting with the DND 5E Wiki site at https://dnd5e.wikidot.com/. The server will expose D&D 5th Edition content and functionality through MCP tools.

## Architecture

This MCP server should be structured as a TypeScript/Node.js application that:

1. **Web Scraping Module**: Handles fetching and parsing content from dnd5e.wikidot.com
2. **Content Processing**: Processes and structures D&D content (spells, classes, races, monsters, etc.)
3. **MCP Server Implementation**: Exposes tools following MCP protocol specifications
4. **Caching Layer**: Implements caching to avoid excessive requests to the wiki

## Key MCP Tools to Implement

Based on D&D 5E content structure, implement tools for:
- Spell lookup and search
- Class information retrieval
- Race and subrace details
- Monster stat blocks
- Equipment and item searches
- Rule references

## Development Setup

When setting up this project, you'll need:
- TypeScript configuration for Node.js
- MCP SDK dependencies (@modelcontextprotocol/sdk)
- Web scraping libraries (cheerio, axios/fetch)
- Testing framework (Jest recommended)
- Build and linting tools

## Important Implementation Notes

- Respect dnd5e.wikidot.com's robots.txt and rate limiting
- Implement proper error handling for network requests
- Cache frequently accessed content to reduce server load
- Structure MCP tool responses in a consistent, useful format
- Consider implementing fuzzy search for spell/monster names
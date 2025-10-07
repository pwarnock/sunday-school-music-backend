# MCP Integration Guide for Sunday School Music Creator

## Overview
Model Context Protocol (MCP) allows your application to use external tools and data sources. Here are the integration options:

## Option 1: Server-Side MCP Runner (Recommended)

### Setup Steps:

1. **Install MCP Server Dependencies**
```bash
npm install @modelcontextprotocol/server-bible
npm install @types/node
```

2. **Create MCP Service**
```typescript
// src/services/mcp-service.ts
import { spawn } from 'child_process'

export class MCPService {
  async callBibleMCP(tool: string, params: any) {
    // Spawn MCP server process
    // Execute tool with parameters  
    // Return structured result
  }
}
```

3. **Environment Variables**
```bash
# .env
MCP_BIBLE_SERVER_PATH=/path/to/mcp/server
MCP_TIMEOUT=30000
```

## Option 2: MCP Proxy Server

### Architecture:
```
Next.js App → MCP Proxy Server → Bible MCP Server
```

### Benefits:
- Centralized MCP management
- Better error handling
- Caching capabilities
- Multiple MCP server support

### Implementation:
1. Create separate Node.js service for MCP
2. Expose REST API endpoints
3. Your Next.js app calls the proxy

## Option 3: Direct Integration (Current Approach)

### What we implemented:
- Bible API integration (bible-api.com)
- MCP-style function signatures
- Drop-in replacement for actual MCP calls

### Benefits:
- ✅ Works immediately
- ✅ No complex setup
- ✅ Reliable external API
- ✅ Copyright-free WEB translation

### Current Status:
Your chatbot now has:
- Automatic Bible verse detection
- Scripture lookup with song generation
- Fallback to regular chat for non-Bible requests

## Recommendation: Stick with Current Approach

**Why Option 3 is best for your use case:**

1. **Immediate functionality** - Works right now
2. **Reliable** - External Bible API is stable
3. **Simple deployment** - No additional infrastructure
4. **Copyright compliant** - Uses public domain translations
5. **Same interface** - Easy to swap later if needed

## Future MCP Integration

If you want true MCP integration later:

```typescript
// Easy swap - same interface
// Current:
const verse = await bibleClient.getVerse(book, chapter, verse)

// Future MCP:
const verse = await mcpBibleServer.getVerse(book, chapter, verse)
```

## Testing Your Current Integration

Try these in your chat:
- "Phil 4:13"
- "Show me John 3:16" 
- "Psalm 23"
- "Create a song about Genesis 1:1"

The system will:
1. Detect Bible references
2. Fetch actual verse text
3. Generate child-friendly songs
4. Fall back to regular chat for other requests
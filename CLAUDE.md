# Sunday School Music Creator - Project Notes

## Production Deployment

**Current Production Domain**: `https://frontend-one-tau-55.vercel.app` (primary production URL)

## Environment Management

We use multiple environments for proper development workflow:

- **Local**: `http://127.0.0.1:3000` (Next.js dev server)
- **Production**: `https://frontend-one-tau-55.vercel.app` (Vercel deployment)

## Credentials Management

All credentials are stored in `.env` file in the project root.

**IMPORTANT**: Only Supabase URL and anon key are safe to expose to the browser with `NEXT_PUBLIC_` prefix. All other credentials must remain server-side only.

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (safe to expose to browser)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (safe to expose to browser)
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)
- `GLOO_CLIENT_ID` - Gloo AI client ID (server-side only)
- `GLOO_CLIENT_SECRET` - Gloo AI client secret (server-side only)
- `GLOO_MODEL` - Gloo AI model to use (currently set to GlooMax-Beacon)
- `ELEVENLABS_API_KEY` - ElevenLabs API key (server-side only)
- `ELEVENLABS_PROMPT_VERSION` - ElevenLabs prompt version to use (optional, defaults to "1.0")

Optional feature flags:
- `ENABLE_SCRIPTURE_API` - Enable external Scripture API for Bible verse content (default: false)

### Environment Variable Security Check
```bash
# Run this to verify environment variables are properly set
cd frontend && npm run env-check
```

## Quick Setup

```bash
# Load environment variables from .env
source .env

# Or run the setup script
./setup-environments.sh
```

## Project Structure

- `/supabase/migrations/` - Database migrations
- `/supabase/functions/` - Edge functions (if needed)
- `/.env` - Local environment variables (gitignored)
- `/opencode.json` - OpenCode configuration

## Development Commands

### Supabase CLI Commands
```bash
# Start local Supabase (requires Docker)
supabase start

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations locally
supabase db push

# Deploy to remote
supabase db push --linked

# Reset local database
supabase db reset

# Generate types
supabase gen types typescript --local > src/lib/supabase/types.ts
```

### Vercel CLI Commands
```bash
# Link project to Vercel
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Set environment variables
vercel env add SUPABASE_URL production
vercel env add SUPABASE_ANON_KEY production

# List environment variables
vercel env ls
```

### Environment Setup Commands
```bash
# Set up all environments (interactive)
./setup-environments.sh

# Manual Vercel environment setup
source .env
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "$GLOO_CLIENT_ID" | vercel env add GLOO_CLIENT_ID production
echo "$GLOO_CLIENT_SECRET" | vercel env add GLOO_CLIENT_SECRET production
echo "$GLOO_MODEL" | vercel env add GLOO_MODEL production
echo "$ELEVENLABS_API_KEY" | vercel env add ELEVENLABS_API_KEY production
echo "$ELEVENLABS_PROMPT_VERSION" | vercel env add ELEVENLABS_PROMPT_VERSION production
```

## Architecture Notes

1. **Frontend**: Next.js (deployed on Vercel)
2. **Backend**: Supabase (PostgreSQL + Auth + Realtime + Storage)
3. **AI Integration**: Gloo AI for chat (configurable model), ElevenLabs for music generation
4. **Credit System**: 3 free songs per user
5. **Authentication**: Supabase Auth with redirect URLs configured
6. **Documentation**: Context7 MCP available for library documentation lookup

## Auth Configuration

Supabase auth is configured with:
- **Site URL**: `https://frontend-one-tau-55.vercel.app`
- **Redirect URLs**: 
  - `https://frontend-one-tau-55.vercel.app` (production)
  - `https://*.vercel.app` (all Vercel deployments)
  - `http://127.0.0.1:3000` (local development)

## AI Model Configuration

The chat model is configurable via the `GLOO_MODEL` environment variable. Available models include:
- `us.anthropic.claude-sonnet-4-20250514-v1:0` (default)
- `GlooMax-Beacon` (Gloo's flagship model)
- `meta.llama3-70b-instruct-v1:0`
- `anthropic.claude-3-sonnet-20240229-v1:0`
- `anthropic.claude-3-haiku-20240307-v1:0`

You can change the model by:
1. Setting `GLOO_MODEL` in your `.env` file
2. Using the `setModel()` method on the glooClient instance
3. Setting the environment variable in your deployment platform

Example:
```bash
# In .env file
GLOO_MODEL=GlooMax-Beacon

# Or programmatically
import { glooClient } from '@/lib/gloo/client'
glooClient.setModel('GlooMax-Beacon')
```

## Chat Features

### Multi-Turn Bible Reference Handling
The chat system properly handles multiple Bible verses across conversation turns:

- **Conversation Context**: Preserves up to 400 characters per message to maintain Bible references
- **Reference Extraction**: Automatically identifies all Bible references from conversation history
- **Comprehensive Integration**: When generating songs, the AI considers ALL Bible references mentioned throughout the conversation
- **Reference Preservation**: Bible references are explicitly listed in the system prompt
- **Graceful Fallback**: When `ENABLE_SCRIPTURE_API=false` (default), references are listed without fetching verse content to avoid external API dependency

### System Prompt Structure
- **Initial Prompt**: Sets the Sunday School assistant context and guidelines
- **Follow-up**: Maintains conversation history and cumulative Bible references
- **Context Building**: Includes previous messages with preserved Bible verse content

## Development Notes

### File Write Limitations
When creating or editing large documentation files, be aware of potential timeout issues with file write operations. If you encounter timeouts:
- Break large documents into smaller chunks (< 1KB per write operation)
- Save incrementally rather than writing entire documents at once
- Use the Edit tool for modifications rather than rewriting entire files

## ElevenLabs Prompt System

The ElevenLabs music generation prompts are now versioned and customizable:

- **Prompt Location**: `/src/lib/prompts/elevenlabs/music-v{version}.md`
- **Default Version**: 1.0 (configurable via `ELEVENLABS_PROMPT_VERSION`)
- **Template System**: Uses Mustache-like syntax for dynamic values
- **Mood/Energy Mappings**: Defined in the markdown files
- **Truncation Priority**: Configurable order for handling long prompts

### Testing Prompts
```bash
# Test ElevenLabs prompt loading
cd frontend && node scripts/test-elevenlabs-prompt.js

# Check current prompt version
cd frontend && node scripts/elevenlabs-prompt-version.js

# Mock server testing (once implemented)
# Terminal 1: Start mock server
cd frontend && node scripts/mock-elevenlabs-server.js

# Terminal 2: Run tests against mock
cd frontend && ELEVENLABS_MOCK_URL=http://localhost:3001 npm test:elevenlabs

# Terminal 3: View captured requests
curl http://localhost:3001/requests | jq
```

## Current Status

- [x] Database schema created
- [x] Production domain configured
- [x] Configurable AI model implementation
- [x] Environment variables properly configured
- [x] Multi-turn Bible reference handling
- [x] Chat interface with conversation context
- [x] Gloo AI integration working
- [x] ElevenLabs versioned prompt system
- [ ] Supabase project linked to remote
- [ ] Authentication flow tested
- [ ] ElevenLabs integration
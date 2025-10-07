# Sunday School Music Creator - Project Notes

## Production Deployment

**Current Production Domain**: `frontend-1l3d90euj-pete-warnocks-projects.vercel.app` (latest deployment)

## Environment Management

We use multiple environments for proper development workflow:

- **Local**: `http://127.0.0.1:3000` (Next.js dev server)
- **Production**: `https://frontend-94z8sl5v1-pete-warnocks-projects.vercel.app` (Vercel deployment)

## Credentials Management

All credentials are stored in `.env` file in the project root.

Required environment variables:
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key  
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GLOO_CLIENT_ID` - Gloo AI client ID
- `GLOO_CLIENT_SECRET` - Gloo AI client secret
- `GLOO_MODEL` - Gloo AI model to use (defaults to us.anthropic.claude-sonnet-4-20250514-v1:0)
- `ELEVENLABS_API_KEY` - ElevenLabs API key

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
- **Site URL**: `https://frontend-94z8sl5v1-pete-warnocks-projects.vercel.app`
- **Redirect URLs**: 
  - `https://frontend-94z8sl5v1-pete-warnocks-projects.vercel.app` (production)
  - `https://*.vercel.app` (all Vercel deployments)
  - `http://127.0.0.1:3000` (local development)

## AI Model Configuration

The chat model is configurable via the `GLOO_MODEL` environment variable. Available models include:
- `us.anthropic.claude-sonnet-4-20250514-v1:0` (default)
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
GLOO_MODEL=us.anthropic.claude-sonnet-4-20250514-v1:0

# Or programmatically
import { glooClient } from '@/lib/gloo/client'
glooClient.setModel('us.anthropic.claude-sonnet-4-20250514-v1:0')
```

## Current Status

- [x] Database schema created
- [x] Production domain configured
- [x] Configurable AI model implementation
- [ ] Supabase project linked to remote
- [ ] Environment variables synced to Vercel
- [ ] Authentication flow tested
- [ ] Chat interface
- [ ] Gloo AI integration
- [ ] ElevenLabs integration
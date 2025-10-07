# Sunday School Music Creator - Project Notes

## Credentials Management

All credentials are stored in 1Password. Use the following references:

- `op://Development/Supabase-Sunday-School/SUPABASE_URL`
- `op://Development/Supabase-Sunday-School/SUPABASE_ANON_KEY`
- `op://Development/Supabase-Sunday-School/SUPABASE_SERVICE_ROLE_KEY`
- `op://Development/Gloo-API/CLIENT_ACCESS_TOKEN`
- `op://Development/ElevenLabs/ELEVENLABS_API_KEY`

## Quick Setup with 1Password CLI

```bash
# Export credentials from 1Password
export SUPABASE_URL=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_URL")
export SUPABASE_ANON_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_ANON_KEY")
export SUPABASE_SERVICE_ROLE_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_SERVICE_ROLE_KEY")
export CLIENT_ACCESS_TOKEN=$(op read "op://Development/Gloo-API/CLIENT_ACCESS_TOKEN")
export ELEVENLABS_API_KEY=$(op read "op://Development/ElevenLabs/ELEVENLABS_API_KEY")
```

## Project Structure

- `/supabase/migrations/` - Database migrations
- `/supabase/functions/` - Edge functions (if needed)
- `/.env` - Local environment variables (gitignored)
- `/opencode.json` - OpenCode configuration

## Development Commands

```bash
# Start local Supabase
supabase start

# Run migrations
supabase db push

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy to remote
supabase db push --linked
```

## Architecture Notes

1. **Frontend**: Lovable (React-based)
2. **Backend**: Supabase (PostgreSQL + Auth + Realtime)
3. **AI Integration**: Gloo AI for chat, ElevenLabs for music
4. **Credit System**: 3 free songs per user

## Current Status

- [x] Database schema created
- [ ] Supabase project linked
- [ ] Authentication setup
- [ ] Chat interface
- [ ] Gloo AI integration
- [ ] ElevenLabs integration
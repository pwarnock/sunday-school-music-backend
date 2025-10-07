# Environment Configuration for Sunday School Music Creator

## Current Setup

### Production Environment
- **Domain**: `frontend-one-tau-55.vercel.app`
- **Platform**: Vercel
- **Database**: Supabase (remote)

### Local Development
- **Domain**: `http://127.0.0.1:3000`
- **Platform**: Next.js dev server
- **Database**: Supabase (local via Docker)

## Environment Variables Required

### Frontend (Next.js)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
CLIENT_ACCESS_TOKEN=your-gloo-token
ELEVENLABS_API_KEY=your-elevenlabs-key
```

### Supabase Auth Configuration
- Site URL: `https://frontend-one-tau-55.vercel.app`
- Redirect URLs:
  - `https://frontend-one-tau-55.vercel.app` (production)
  - `http://127.0.0.1:3000` (local)

## Deployment Workflow

### Local Development
1. Start Supabase: `supabase start`
2. Run migrations: `supabase db push`
3. Start Next.js: `cd frontend && npm run dev`

### Production Deployment
1. Push migrations: `supabase db push --linked`
2. Deploy to Vercel: `vercel --prod`

## Environment Management Strategy

We should use:
1. **Local**: For development with local Supabase instance
2. **Production**: Single production environment on Vercel

This is sufficient for most projects. Additional staging environment can be added later if needed.

## Auth Flow Issues to Fix

1. **Environment Variables**: Ensure all required vars are set in Vercel
2. **Redirect URLs**: Already configured in supabase/config.toml
3. **JWT Configuration**: Verify JWT settings match between environments
4. **CORS Settings**: Ensure Supabase allows requests from production domain
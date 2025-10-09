# Sunday School Music Backend - Multi-Machine Setup Guide

This guide explains how to set up the Sunday School Music Backend project on multiple machines and keep them in sync.

## Prerequisites

- Node.js 18+ installed
- Supabase CLI installed (`npm install -g supabase`)
- Access to the Supabase project credentials

## Initial Setup on a New Machine

### 1. Clone the Repository
```bash
git clone [your-repo-url]
cd sunday-school-music-backend
```

### 2. Install Dependencies
```bash
cd frontend
npm install
```

### 3. Set Up Environment Variables
Create `.env.local` in the frontend directory:
```bash
cp ../.env frontend/.env.local
```

Make sure your `.env.local` contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GLOO_CLIENT_ID`
- `GLOO_CLIENT_SECRET`
- `ELEVENLABS_API_KEY`

### 4. Initialize Supabase
```bash
cd frontend
npx supabase init
```

### 5. Link to Remote Project
```bash
npx supabase link --project-ref rxnusbfhazatuklqoyot
```
You'll be prompted to enter your database password.

### 6. Pull Remote Database Schema
```bash
npx supabase db pull
```
This will create migration files matching the remote database.

## Syncing Between Machines

When switching between machines, always:

### 1. Pull Latest Code
```bash
git pull origin main
```

### 2. Pull Latest Database Changes
```bash
cd frontend
npx supabase db pull
```

### 3. Check Migration Status
```bash
npx supabase migration list
```

## Creating New Migrations

### 1. Create Migration File
```bash
npx supabase migration new your_migration_name
```

### 2. Edit the Migration
Add your SQL to the generated file in `supabase/migrations/`

### 3. Apply Locally (if running local Supabase)
```bash
npx supabase db push
```

### 4. Apply to Remote
```bash
npx supabase db push --linked
```

### 5. Commit and Push
```bash
git add supabase/migrations/
git commit -m "Add migration: your_migration_name"
git push origin main
```

## Troubleshooting

### Migration History Mismatch
If you get "migration history does not match" errors:

1. Check which migrations are missing locally:
```bash
npx supabase migration list
```

2. If migrations exist remotely but not locally:
```bash
npx supabase db pull
```

3. If you need to mark migrations as applied:
```bash
npx supabase migration repair --status applied [timestamp]
```

### Missing Tables
If tables are missing (like the streak tracking tables):

1. Check if feature is enabled in `.env.local`:
```
NEXT_PUBLIC_ENABLE_DAILY_STREAKS=true
ENABLE_DAILY_STREAKS=true
```

2. Run the migration manually in Supabase Dashboard:
   - Go to SQL Editor
   - Run the SQL from `create-streak-tables.sql`

### Schema Cache Issues
If you get "table not found in schema cache" errors:

1. The tables might not exist in the remote database
2. Run migrations to create them:
```bash
npx supabase db push --linked
```

## Best Practices

1. **Always pull before starting work**: `npx supabase db pull`
2. **Commit migrations with code**: Keep migrations in sync with code changes
3. **Test locally first**: Use `npx supabase start` for local testing
4. **Document migrations**: Add comments in your SQL files
5. **Use feature flags**: For features that require database changes

## Current Feature Flags

- `ENABLE_SCRIPTURE_API`: External Bible API integration (default: false)
- `ENABLE_DAILY_STREAKS`: Daily streak tracking feature (default: false)
# Deploy Sunday School Music Creator to Lovable

## Prerequisites
1. GitHub account
2. Lovable account at lovable.dev
3. Environment variables from 1Password

## Step 1: Create GitHub Repository
1. Go to GitHub.com → New Repository
2. Name: `sunday-school-music-creator`
3. Make it public (for easier Lovable integration)
4. Don't initialize with README (we have existing code)

## Step 2: Push Frontend to GitHub
```bash
cd frontend
git remote add origin https://github.com/YOUR_USERNAME/sunday-school-music-creator.git
git branch -M main
git push -u origin main
```

## Step 3: Get Environment Variables
Use 1Password CLI to get the values:
```bash
export NEXT_PUBLIC_SUPABASE_URL=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_URL")
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_ANON_KEY")
export SUPABASE_SERVICE_ROLE_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_SERVICE_ROLE_KEY")
export CLIENT_ACCESS_TOKEN=$(op read "op://Development/Gloo-API/CLIENT_ACCESS_TOKEN")
export ELEVENLABS_API_KEY=$(op read "op://Development/ElevenLabs/ELEVENLABS_API_KEY")
```

## Step 4: Deploy on Lovable
1. Go to [lovable.dev](https://lovable.dev)
2. Sign in with GitHub
3. Create New Project → Import from GitHub
4. Select your `sunday-school-music-creator` repository
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `CLIENT_ACCESS_TOKEN`
   - `ELEVENLABS_API_KEY`
6. Deploy!

## Step 5: Share with Team
Once deployed, Lovable will give you a shareable URL like:
`https://your-app-name.lovableproject.com`

You can share this URL with your team for testing and feedback.

## Notes
- The app will use your production Supabase database
- Make sure your Supabase project allows the Lovable domain in CORS settings
- Test all functionality after deployment
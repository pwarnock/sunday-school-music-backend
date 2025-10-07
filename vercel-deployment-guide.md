# Deploy Sunday School Music Creator to Vercel

## Why Vercel is Perfect for This Project

### ✅ **Vercel Free Tier Includes:**
- **100GB bandwidth/month** (more than enough for team sharing)
- **Unlimited static deployments**
- **Serverless functions** (perfect for your API routes)
- **Custom domains** (if you want to add one later)
- **Automatic SSL certificates**
- **Preview deployments** for every git push
- **Built-in analytics**

### ✅ **Perfect for Next.js Apps:**
- **Zero configuration** deployment
- **Automatic optimizations**
- **Edge functions** support
- **Built-in CI/CD** with GitHub

## Quick Deployment Steps

### 1. Push Frontend to GitHub (Required for Vercel)
```bash
cd frontend

# Create a new GitHub repository first at github.com
# Then connect it:
git remote add origin https://github.com/YOUR_USERNAME/sunday-school-music-creator.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Vercel
```bash
cd frontend
vercel login  # Login with GitHub account
vercel        # Follow prompts to deploy
```

### 3. Set Environment Variables
After deployment, add these in Vercel dashboard:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_ACCESS_TOKEN=your-gloo-token
ELEVENLABS_API_KEY=your-elevenlabs-key
```

## Get Your 1Password Values
```bash
# Run these to get your environment values:
export NEXT_PUBLIC_SUPABASE_URL=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_URL")
export NEXT_PUBLIC_SUPABASE_ANON_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_ANON_KEY")
export SUPABASE_SERVICE_ROLE_KEY=$(op read "op://Development/Supabase-Sunday-School/SUPABASE_SERVICE_ROLE_KEY")
export CLIENT_ACCESS_TOKEN=$(op read "op://Development/Gloo-API/CLIENT_ACCESS_TOKEN")
export ELEVENLABS_API_KEY=$(op read "op://Development/ElevenLabs/ELEVENLABS_API_KEY")

# Then add these values in Vercel dashboard
```

## Automatic Deployments
- **Every git push** triggers a new deployment
- **Preview URLs** for every branch/PR
- **Production URL** updates on main branch pushes

## Expected Free Tier Usage
For team sharing and testing:
- **~1-5GB bandwidth/month** (well under 100GB limit)
- **Serverless function calls** (within generous limits)
- **Perfect for demos and team collaboration**

## Vercel vs Lovable Comparison

| Feature | Vercel Free | Lovable |
|---------|-------------|---------|
| **Cost** | Free forever | Free tier + paid plans |
| **Setup** | CLI + GitHub | Web interface only |
| **Custom domains** | ✅ Free | ✅ Available |
| **Team sharing** | ✅ Preview URLs | ✅ Published URLs |
| **Code control** | ✅ Full control | Limited to web interface |
| **CI/CD** | ✅ Built-in | ✅ Built-in |
| **Performance** | ✅ Global CDN | ✅ Global CDN |

## Recommended: Use Vercel
- **Better for development teams**
- **More control over deployment**
- **Generous free tier**
- **Industry standard for Next.js**
- **Great for long-term projects**
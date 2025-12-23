# Sunday School Music Creator - Environment Configuration

## Monorepo Environment Variables

Environment variables are stored in root `.env` file and are inherited by all workspace packages.

### Required Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gloo AI Configuration (server-side only)
GLOO_CLIENT_ID=your_gloo_client_id
GLOO_CLIENT_SECRET=your_gloo_client_secret
GLOO_MODEL=GlooMax-Beacon

# ElevenLabs Configuration (server-side only)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
ELEVENLABS_PROMPT_VERSION=1.0

# Supabase Service Role (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional Feature Flags
ENABLE_SCRIPTURE_API=false
```

### Environment Variable Scopes

- `NEXT_PUBLIC_*`: Available to all packages (browser and server)
- Server-side only: Available to `apps/frontend` and API routes only

### Loading Environment Variables

```bash
# Source environment variables from .env
source .env

# Or use setup script
./setup-environments.sh
```

### Environment Setup in Development

1. **Root Directory**: Run all commands from project root (`/Users/peter/github/sunday-school-music-creator/`)
2. **Automatic Loading**: Bun workspaces automatically load root `.env` for all packages
3. **No Nesting**: Workspace packages cannot have their own `.env` files

### Environment Setup in Production

Production environment variables are configured via Vercel dashboard or CLI:

```bash
# Set environment variables via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add GLOO_CLIENT_ID production
vercel env add GLOO_CLIENT_SECRET production
vercel env add GLOO_MODEL production
vercel env add ELEVENLABS_API_KEY production
vercel env add ELEVENLABS_PROMPT_VERSION production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### Environment Setup for CI/CD

For GitHub Actions or other CI/CD systems, configure secrets in your repository settings and reference them in workflow files:

```yaml
# .github/workflows/deploy.yml
env:
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  GLOO_CLIENT_ID: ${{ secrets.GLOO_CLIENT_ID }}
  GLOO_CLIENT_SECRET: ${{ secrets.GLOO_CLIENT_SECRET }}
  GLOO_MODEL: ${{ secrets.GLOO_MODEL }}
  ELEVENLABS_API_KEY: ${{ secrets.ELEVENLABS_API_KEY }}
  ELEVENLABS_PROMPT_VERSION: "1.0"
  SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### Verifying Environment Variables

```bash
# Run environment check
cd apps/frontend && npm run env-check

# Or manually check
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### Common Issues

**Issue**: Environment variables not available in browser console

**Solution**: Ensure server-side only credentials are never used in client components. Only `NEXT_PUBLIC_*` variables should be accessed in client code.

**Issue**: Bun workspaces not resolving workspace dependencies

**Solution**: Run `bun install` from project root to ensure all workspace packages are properly linked:

```bash
cd /Users/peter/github/sunday-school-music-creator
bun install
```

### Environment Variable Security

- **Never commit**: Never commit `.env` file or any API keys
- **Use Vercel Dashboard**: Set production secrets via Vercel dashboard for better security
- **Use .gitignore**: Ensure `.env` is in `.gitignore` (it should be by default)

### Workspace-Specific Considerations

- **Package Imports**: Use `@sunday-school/ui` or `@sunday-school/lib` from `apps/frontend/package.json`
- **Local Development**: Run `bun run dev` from project root, not from `apps/frontend`
- **Building**: Run `bun run build` from project root for consistency

### Example: Setting Up a New Package

1. Create package directory:
   ```bash
   mkdir -p packages/my-package
   ```

2. Create package.json:
   ```json
   {
     "name": "@sunday-school/my-package",
     "version": "1.0.0",
     "main": "./index.ts",
     "types": "./index.ts"
   }
   ```

3. Create your code in `index.ts`

4. Update `apps/frontend/package.json`:
   ```json
   {
     "dependencies": {
       "@sunday-school/my-package": "workspace:*"
     }
   }
   ```

5. Install dependencies:
   ```bash
   bun install
   ```

6. Start dev server:
   ```bash
   bun run dev
   ```

# Sunday School Music Creator - Next Steps

## Date: October 9, 2025

## 🎯 **Current State Assessment**

### ✅ **Recently Completed**
- **Site-wide dark mode implementation** - Complete with consistent theming across all pages
- **Theme-aware components** - All static pages (about, terms, privacy, login, signup) now support dark mode
- **Consistent navigation** - SiteHeader component with theme toggle on every page
- **ESLint fixes** - Critical deployment-blocking errors resolved
- **Hard-coded color removal** - Dashboard and all components now use theme-aware CSS variables

### ✅ **What's Working Great**
- Core functionality - Chat, song generation, authentication all working
- Recent features - Time limits (30/60/90/120s), character limits (2000), streak tracking
- Production deployment - Successfully deployed to Vercel
- Theme system - Complete light/dark mode support with `next-themes`

### ⚠️ **Outstanding Issues to Address**

#### Code Quality Issues (Medium Priority)
- **2 ESLint errors** in `scripts/check-env.js` (require() imports)
- **14 warnings** for unused variables across the codebase:
  - `src/app/api/auth/resend-confirmation/route.ts` - unused _ipAddress, _userAgent
  - `src/app/api/check-streak-tables/route.ts` - unused _request
  - `src/app/api/generate-music/route.ts` - unused uploadData
  - `src/app/api/gloo/token/route.ts` - unused request
  - `src/app/api/music-config/route.ts` - unused request
  - `src/app/api/songs/route.ts` - unused request
  - `src/app/login/page.tsx` - unused _error
  - `src/components/Dashboard.tsx` - unused error variables
  - `src/lib/bible/client.ts` - unused translation parameters
  - `src/lib/gloo/client.ts` - unused OpenAI import

#### Technical Debt (Low Priority)
- Unused `/api/gloo/token` endpoint should be removed or protected
- Missing `getTokenDirect` method reference mentioned in CURRENT_STATUS.md
- OpenAI SDK imports that are no longer needed

## 📦 Monorepo Structure

### ✅ **Completed**
- Converted to Bun workspaces monorepo
- Separated code into `apps/` and `packages/` directories
- Shared packages: `@sunday-school/ui`, `@sunday-school/lib`, `@sunday-school/db`
- All imports updated to use workspace packages
- Build and deployment configuration updated
- Documentation updated for monorepo workflow

### Directory Layout

```
sunday-school-music-creator/
├── apps/
│   └── frontend/              # Next.js application (Vercel deployment target)
├── packages/
│   ├── ui/                   # Shared React components
│   ├── lib/                   # Shared library (supabase, gloo, elevenlabs, bible, prompts)
│   └── db/                    # Database scripts and migrations
├── package.json               # Root workspace configuration
└── bun.lockb               # Bun lockfile
```

### Root Package.json

The root `package.json` configures Bun workspaces:

```json
{
  "name": "sunday-school-music-creator",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

### Workspace Dependencies

Packages in `/apps/` directory reference shared packages using `workspace:*` syntax:

```json
// apps/frontend/package.json
{
  "dependencies": {
    "@sunday-school/ui": "workspace:*",
    "@sunday-school/lib": "workspace:*"
  }
}
```

## Development Workflow

### Starting Development Server

Run from **project root** to ensure all workspaces are recognized:

```bash
bun run dev
```

This command starts Next.js dev server in `apps/frontend/`.

### Building for Production

```bash
bun run build
```

This builds the frontend application and generates the `.next` directory.

## Vercel Deployment Configuration

### Overview

Vercel's build environment uses `npm install` by default, which doesn't support Bun's `workspace:*` dependencies. To deploy to Vercel, we use a custom configuration that skips `npm install` and uses Bun for building.

### Vercel Configuration File

`apps/frontend/vercel.json` configures Vercel to work with Bun workspaces:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": ".next",
  "installCommand": "echo 'Skipping npm install - using local bun.lockb'"
}
```

**Key points:**
- `installCommand`: Skips npm install since dependencies are already installed locally
- `buildCommand`: Uses Bun to build application
- `outputDirectory`: Specifies where Next.js outputs to build

### Deployment Process

```bash
# Option 1: Build and deploy from project root
bun run build
vercel --prod

# Option 2: Build and deploy from apps/frontend (recommended)
cd apps/frontend && bun run build && vercel --prod
```

### Keeping Production Domain

To maintain `frontend-pete-warnocks-projects.vercel.app`:
1. Project name in Vercel: `frontend` (under `pete-warnocks-projects` team)
2. Production URL: `https://frontend-pete-warnocks-projects.vercel.app`

### Next.js Configuration for Monorepo

If Next.js can't transpile packages from outside the project root, configure `transpilePackages` in `next.config.ts`:

```typescript
// apps/frontend/next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@sunday-school/ui'],
};

export default nextConfig;
```

## Common Patterns

### Adding a New Shared Package

1. Create package directory under `packages/`
2. Create `package.json` with appropriate dependencies
3. Export from `index.ts`:
   ```typescript
   export * from './my-feature'
   ```
4. Import in `apps/frontend/package.json`:
   ```json
   {
     "dependencies": {
       "@sunday-school/my-feature": "workspace:*"
     }
   }
   ```
5. Run `bun install` from project root
6. Restart dev server: `bun run dev`

### Importing from Shared Packages

In your application code:

```typescript
import { MyComponent } from '@sunday-school/my-feature'

export function MyPage() {
  return <MyComponent />
}
```

## Troubleshooting

### Vercel Deployment: "npm error Unsupported URL Type 'workspace:': workspace:*"

**Cause**: Vercel tries to run `npm install` which doesn't understand Bun's workspace syntax.

**Solution**: Always build locally before deploying:
```bash
cd apps/frontend && bun run build && vercel --prod
```

The `vercel.json` configuration file handles skipping the `npm install` step.

### Build Failures in Monorepo

If you encounter build errors after adding a new package:

1. **Check circular dependencies**: Ensure packages don't depend on each other
2. **Verify package names**: All workspace packages must have unique names
3. **Clear caches**:
   ```bash
   rm -rf node_modules
   rm -f bun.lockb
   bun install
   ```
4. **Run install from root**: Always run `bun install` from project root, not from individual package directories

### Type Errors with Workspace Packages

If TypeScript can't find types from a workspace package:

1. Ensure to package exports types in its `package.json`:
   ```json
   {
     "name": "@sunday-school/ui",
     "types": "./index.ts"
   }
   ```
2. Ensure root `tsconfig.json` has correct paths:
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@sunday-school/*": ["./packages/*/src"]
       }
     }
   }
   ```
3. Restart TypeScript server if using VS Code

### Environment Variable Security

- **Never commit**: Never commit `.env` file or any API keys
- **Use Vercel Dashboard**: Set production secrets via Vercel dashboard for better security
- **Use `.gitignore`**: Ensure `.env` is in `.gitignore` (it should be by default)
- **Workspace-Specific Considerations**:
   - **Package Imports**: Use `@sunday-school/ui` or `@sunday-school/lib` from `apps/frontend/package.json`
   - **Local Development**: Run `bun run dev` from project root, not from `apps/frontend`
   - **Building**: Run `bun run build` from project root for consistency

---

## Quick Reference Commands

### Development

```bash
# Development (from project root)
bun run dev

# Build for production (from project root)
bun run build

# Test build locally
cd apps/frontend && bun run build
ls -la apps/frontend/.next
```

### Deployment

```bash
# Build and deploy to Vercel
cd apps/frontend && bun run build && vercel --prod

# Set environment variables via Vercel CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env ls
```

### Testing

```bash
# Test build locally
cd apps/frontend && bun run build

# Verify production build output
ls -la apps/frontend/.next
```

---

## Current Status

- [x] Monorepo structure created
- [x] Bun workspaces configured
- [x] All imports updated to use workspace packages
- [x] Build and deployment configuration updated
- [x] Documentation updated for monorepo workflow

---

## Next Steps

- [ ] Test all deployment features (auth, music generation, chat)
- [ ] Verify environment variables are properly set in production
- [ ] Update API routes to use monorepo structure
- [ ] Consider setting up CI/CD with GitHub Actions
- [ ] Update performance monitoring and error tracking

---

*Last updated: December 22, 2025*

## 📋 **Quick Reference Commands**

### Development
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check for linting issues
npx tsc --noEmit     # Check TypeScript errors
```

### Deployment
```bash
cd frontend
git add -A && git commit -m "Your commit message"
git push origin main
vercel --prod        # Deploy to production
```

### Current Production URL
Latest deployment: Check Vercel dashboard or run `vercel ls`

## 🎨 **Theme System Details**

The newly implemented theme system uses:
- **Components**: `SiteHeader`, `PageLayout`, `ThemeToggle`
- **CSS Classes**: Theme-aware gradients (`.theme-gradient`)
- **CSS Variables**: All colors use semantic tokens (primary, secondary, accent, etc.)
- **Storage**: Theme preference persisted via `next-themes`

## 🔧 **Environment Variables Status**
All required environment variables are properly configured:
- Supabase integration ✅
- Gloo AI integration ✅  
- ElevenLabs integration ✅
- Optional features (Scripture API, Daily Streaks) ✅

## 💡 **Suggestions for Next Session**

1. **If you want quick wins**: Start with Option 1 (Clean Up & Polish)
2. **If you want user impact**: Go with Option 2 (UX Enhancements)  
3. **If you want to add features**: Choose Option 3 (New Features)
4. **If you want to optimize**: Pick Option 4 (Performance)

The codebase is in excellent shape with a solid foundation. The dark mode implementation provides a great user experience, and the core functionality is robust and deployed successfully.

---
*Last updated: October 9, 2025*
*Status: Ready for next development phase*
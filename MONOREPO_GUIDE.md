# Sunday School Music Creator - Monorepo Guide

## Monorepo Structure

This project uses **Bun workspaces** for code organization:

```
sunday-school-music-creator/
├── apps/
│   └── frontend/              # Next.js application
├── packages/
│   ├── ui/                   # Shared React components
│   ├── lib/                   # Shared library code
│   └── db/                    # Database scripts & migrations
├── package.json               # Root workspace configuration
└── bun.lockb               # Bun lockfile
```

## Root Package.json

The root `package.json` configures Bun workspaces:

```json
{
  "name": "sunday-school-music-creator",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["apps/*", "packages/*"]
}
```

## Workspace Dependencies

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

## Local Development Commands

### Starting Development Server

Run from **project root** to ensure all workspaces are recognized:

```bash
bun run dev
```

This command starts the Next.js dev server in `apps/frontend/`.

### Building for Production

```bash
bun run build
```

This builds the frontend application and generates the `.next` directory.

## Vercel Deployment Configuration

### Overview

Vercel's build environment uses `npm install` by default, which doesn't support Bun's `workspace:*` dependencies. To deploy to Vercel, we use a custom configuration that skips the npm install step.

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
- `buildCommand`: Uses Bun to build the application
- `outputDirectory`: Specifies where Next.js outputs the build
- `framework`: null - Prevents Vercel from auto-detecting framework

### Deployment Process

```bash
# From project root
bun run build
vercel --prod
```

### Keeping Production Domain

To maintain `frontend-pete-warnocks-projects.vercel.app`:
1. Project name in Vercel: `frontend` (under `pete-warnocks-projects` team)
2. Production URL: `https://frontend-pete-warnocks-projects.vercel.app`

Note: The original deployment URL (`frontend-one-tau-55.vercel.app`) is still active but redirects to the new production URL.

### Alternative: Build and Deploy in One Command

```bash
# From apps/frontend directory
cd apps/frontend && bun run build && vercel --prod
```

## Next.js Configuration for Monorepo

If Next.js can't transpile packages from outside the project root, configure `transpilePackages`:

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

1. Create the package directory under `packages/`
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
5. Run `bun install` from project root to link workspaces
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
bun run build
vercel --prod
```

The `vercel.json` configuration file handles skipping the npm install step.

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
4. **Run install from root**: Always run `bun install` from the project root, not from individual package directories

### Type Errors with Workspace Packages

If TypeScript can't find types from a workspace package:

1. Ensure the package exports types in its `package.json`:
   ```json
   {
     "name": "@sunday-school/ui",
     "types": "./index.ts"
   }
   ```
2. Ensure root `tsconfig.json` has the correct paths:
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

## Best Practices

### Package Organization

- **Keep shared packages thin**: Only put truly shared code in `/packages/`
- **App-specific code in `/apps/`**: Code that only belongs to one app
- **Use semantic versioning**: Follow semantic versioning (major.minor.patch)
- **Document shared APIs**: Add JSDoc comments to shared package exports

### Development Workflow

```bash
# 1. Install dependencies (first time or after changes)
bun install

# 2. Start development server
bun run dev

# 3. Build for production (when ready to deploy)
bun run build

# 4. Deploy to Vercel
cd apps/frontend && bun run build && vercel --prod
```

### Git Workflow

```bash
# After making changes
git add .
git commit -m "feat: your changes"

# Push to remote
git push origin main
```

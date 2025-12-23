# Sunday School Prompt System

This directory contains the versioned prompt system for the Sunday School Music Creator chatbot with **Markdown-first** approach for easy external editing.

## Structure

```
src/lib/prompts/
├── index.ts              # Main prompt manager and configuration
├── markdown-loader.ts    # Markdown file parsing utility
├── watcher.ts           # Development file watcher
├── markdown/            # 📝 Markdown prompt files (EDIT THESE!)
│   ├── sunday-school-v1.0.md
│   ├── sunday-school-v1.1.md
│   └── ...
├── versions/            # Legacy TypeScript versions (fallback)
│   └── v1.0.ts
└── README.md           # This file
```

## 🚀 Quick Start

### Using Existing Prompts

```typescript
import { createPromptManager } from '@/lib/prompts'

const promptManager = createPromptManager()
const systemPrompt = promptManager.getPrompt()
const metadata = promptManager.getMetadata()
```

### Configuration

Set the prompt version via environment variable:

```bash
SUNDAY_SCHOOL_PROMPT_VERSION=v1.1
```

## 📝 Creating New Prompts (Recommended: Markdown)

### Method 1: Markdown Files (Recommended)

1. **Create a new markdown file** following the naming convention:
   ```
   sunday-school-v{VERSION}.md
   ```

2. **Use frontmatter for metadata**:
   ```markdown
   ---
   version: "1.2"
   description: "Your prompt description"
   createdAt: "2024-10-09"
   author: "Your Name"
   features:
     - "Feature 1"
     - "Feature 2"
   ---

   # Your Prompt Content Here

   Your detailed prompt instructions...
   ```

3. **The system automatically detects** and loads the new version!

### Method 2: TypeScript Files (Legacy)

Create files in `versions/` directory - see existing examples.

## 🔧 Development Tools

### CLI Management Tool

```bash
# Validate all prompt files
node scripts/prompt-manager.js validate

# Validate specific file  
node scripts/prompt-manager.js validate sunday-school-v1.1.md

# List all available prompts
node scripts/prompt-manager.js list

# Test loading a specific version
node scripts/prompt-manager.js test v1.1
```

### File Watching (Development)

```typescript
import { enablePromptWatching } from '@/lib/prompts/watcher'

// Enable hot-reloading in development
enablePromptWatching()
```

This automatically:
- ✅ **Clears cache** when files change
- ✅ **Validates** modified files
- ✅ **Logs** changes and errors

## 📋 Available Versions

### v1.0 (Original)
- **Description**: Original Sunday School assistant prompt
- **Features**:
  - Age-appropriate content for children 5-12
  - Song creation with markdown formatting
  - Biblical themes and stories
  - Encouraging and positive tone

### v1.1 (Enhanced)  
- **Description**: Enhanced Sunday School assistant with improved song structure
- **Features**:
  - All v1.0 features
  - Enhanced song creation with bridge sections
  - Scripture reference handling
  - Memory verse incorporation
  - Interactive elements (clapping, pointing, actions)

### v2.0 (Scripture Memorization Specialist)
- **Description**: Expert Sunday School music creator with comprehensive Scripture memorization focus
- **Features**:
  - **Verbatim Scripture integration** with citations
  - **1500 character limit** for audio generation compatibility
  - **90-second song timing** optimization
  - **Scripture memorization** through joyful learning
  - **Age-appropriate content** for children 5-10
  - **Theological accuracy** and biblical soundness
  - **Musical pacing** and tempo guidance
  - **Character count tracking** and optimization

### v2.1 (Current - Focused Scripture Memorization)
- **Description**: Scripture memorization specialist focused exclusively on Bible verse memorization through song
- **Features**:
  - All v2.0 features
  - **Exclusive focus** on Scripture verse memorization (removes confusing Bible story guidance)
  - **Clear initial protocol** asking for specific verse and translation
  - **Streamlined interaction** focused solely on memorization goals
  - **Enhanced user guidance** toward verse selection

## 🔧 API Reference

### PromptManager Class

- `getPrompt()`: Returns the current prompt string
- `getMetadata()`: Returns metadata for the current version  
- `setVersion(version)`: Changes the active version
- `getAvailableVersions()`: Lists all available versions
- `validateCurrentPrompt()`: Validates the current prompt
- `clearCache()`: Clears the markdown cache
- `static getConfiguredVersion()`: Gets version from environment

### MarkdownPromptLoader Class

- `loadPrompt(filename)`: Load specific markdown file
- `loadPromptByVersion(version)`: Load by version number
- `getAvailablePrompts()`: List all markdown files
- `validatePrompt(filename)`: Validate specific file
- `clearCache()`: Clear parsing cache

### Functions

- `createPromptManager(version?)`: Creates a new PromptManager instance
- `getMarkdownPromptLoader()`: Gets singleton markdown loader
- `enablePromptWatching()`: Enable development file watching

## 🎯 Best Practices

1. **Use Markdown files** for new prompts (easier to edit externally)
2. **Follow naming convention**: `sunday-school-v{VERSION}.md`
3. **Include comprehensive frontmatter** metadata
4. **Test prompts** using the CLI tool before deployment
5. **Use semantic versioning** (1.0, 1.1, 2.0, etc.)
6. **Enable file watching** during development
7. **Validate frequently** to catch errors early

## 🔄 Migration from TypeScript

Existing TypeScript prompts automatically work as fallbacks. To migrate:

1. Copy your prompt content to a new `.md` file
2. Add proper frontmatter metadata
3. Test with `node scripts/prompt-manager.js test v{VERSION}`
4. The system will automatically prefer the markdown version
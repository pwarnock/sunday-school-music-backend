# ElevenLabs Prompt System

## Overview

The ElevenLabs music generation uses a versioned prompt system that allows customization without code changes.

## Quick Start

### Set Prompt Version
```bash
# In your .env file
ELEVENLABS_PROMPT_VERSION=2.0  # Default is 1.0
```

### Check Current Version
```bash
cd frontend && node scripts/elevenlabs-prompt-version.js
```

## Available Versions

- **v1.0**: Original format with inline template syntax
- **v2.0**: Improved format with clearer structure and chat-based extraction

## Testing the Prompt System

### 1. Test Prompt Loading
```bash
cd frontend && node scripts/test-elevenlabs-prompt.js
```

This shows:
- Loaded prompt template
- Mood/energy mappings
- Sample generated prompts
- Character counts

### 2. Mock Server Testing (Development)

To verify what's being sent to ElevenLabs:

```bash
# Terminal 1: Start mock server (once implemented)
cd frontend && node scripts/mock-elevenlabs-server.js

# Terminal 2: Set mock URL and run your app
export ELEVENLABS_MOCK_URL=http://localhost:3001
npm run dev

# Terminal 3: View captured requests
curl http://localhost:3001/requests | jq
```

## Prompt File Structure

Prompts are stored in `/src/lib/prompts/elevenlabs/music-v{version}.md`

```markdown
---
version: "2.0"
description: "Description of this version"
createdAt: "2025-01-09"
author: "Your Name"
features:
  - "Feature 1"
  - "Feature 2"
---

# Base Template

Your prompt template with {{placeholders}}...

# Mood Mappings

- happy: joyful, uplifting
- peaceful: calm, gentle

# Energy Mappings

- high: upbeat, energetic
- low: slow, gentle

# Truncation Priority

1. Base structure (always keep)
2. Theme
3. Lyrics
```

## Creating New Versions

1. Copy an existing version file
2. Update the version number in frontmatter
3. Modify the template and mappings
4. Set `ELEVENLABS_PROMPT_VERSION` to test

## Environment Variables

- `ELEVENLABS_API_KEY`: Your API key (required)
- `ELEVENLABS_PROMPT_VERSION`: Prompt version to use (default: "1.0")
- `ELEVENLABS_MOCK_URL`: Override API URL for testing (optional)

## Troubleshooting

### Prompt Not Loading
- Check file exists: `music-v{version}.md`
- Verify version format: "1.0", "2.0" (not "v1.0")
- Check file permissions

### Prompt Too Long
- Review truncation priority in your version
- Consider shorter base template
- Lyrics are automatically truncated at verse boundaries

### Mock Server Issues
- Ensure port 3001 is available
- Check `ELEVENLABS_MOCK_URL` is set correctly
- Verify Express is installed: `npm install express`
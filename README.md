# Gloo OpenCode Setup

This directory contains configuration and utilities for using opencode with Gloo AI.

## Files

- `opencode.json` - OpenCode configuration for Gloo AI
- `.env` - Environment variables (uses 1Password references locally, hardcoded values in cloud)
- `get_gloo_access_token.sh` - Core token fetching script
- `token-manager.sh` - Automatic token management with caching
- `opencode-auto` - Wrapper for opencode with automatic token refresh
- `run-with-token.sh` - Generic wrapper to run any command with token refresh

## Token Management

The token manager automatically handles OAuth token refresh with 1-hour caching.

### Quick Start

Use the opencode wrapper for automatic token refresh:
```bash
./opencode-auto "your prompt here"
```

Or add an alias to your shell profile:
```bash
alias opencode='/path/to/opencode-gloo/opencode-auto'
```

### Manual Token Management

Source the token manager and use its functions:
```bash
source ./token-manager.sh

# Get/refresh token manually
get_gloo_token

# Run command with auto-refresh
with_gloo_token your-command-here
```

### Environment Setup

For **local development** (using 1Password):
- The `.env` file contains 1Password references
- Token manager automatically uses `op run` to fetch credentials

For **cloud deployment**:
- Replace `.env` contents with actual values:
```bash
GLOO_CLIENT_ID=your_actual_client_id
GLOO_CLIENT_SECRET=your_actual_client_secret
```

### Generic Command Wrapper

Run any command with automatic token refresh:
```bash
./run-with-token.sh curl -H "Authorization: Bearer $CLIENT_ACCESS_TOKEN" https://api.example.com
```

## How It Works

1. Token manager checks for cached token (~/.gloo_token_cache)
2. If expired or missing, fetches new token using get_gloo_access_token.sh
3. Caches token for 1 hour (with 5-minute refresh buffer)
4. Automatically detects local vs cloud environment based on .env contents
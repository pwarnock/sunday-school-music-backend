#!/bin/bash

# Wrapper script for running commands with automatic token refresh
# Usage: ./run-with-token.sh <your-command>

# Source the token manager
source "$(dirname "$0")/token-manager.sh"

# Get/refresh token
if get_gloo_token; then
    # Run the provided command
    exec "$@"
else
    echo "Failed to get Gloo token" >&2
    exit 1
fi
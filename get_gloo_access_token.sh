#!/bin/bash

# Only enable strict mode when executed, not when sourced
# Exit on error, unset vars, and fail on pipe errors
(return 0 2>/dev/null) || set -euo pipefail

# Get credentials from environment variables (provided by op run or shell)

# Ensure GLOO_CLIENT_ID and GLOO_CLIENT_SECRET are set
if [ -z "${GLOO_CLIENT_ID:-}" ]; then
  echo "Error: GLOO_CLIENT_ID not set. Please set it in your environment or in a .env file." >&2
  exit 1
fi
if [ -z "${GLOO_CLIENT_SECRET:-}" ]; then
  echo "Error: GLOO_CLIENT_SECRET not set. Please set it in your environment or in a .env file." >&2
  exit 1
fi


# Debug output is disabled by default; enable with --debug
DEBUG=0
if [[ "${1:-}" == "--debug" ]]; then
  DEBUG=1
fi

if [[ $DEBUG -eq 1 ]]; then
  echo "GLOO_CLIENT_ID: $GLOO_CLIENT_ID"
  echo "GLOO_CLIENT_SECRET: ${GLOO_CLIENT_SECRET:0:2}******${GLOO_CLIENT_SECRET: -2}"
fi

# Assign and export CLIENT_ID and CLIENT_SECRET for use in subshells
export CLIENT_ID="$GLOO_CLIENT_ID"
export CLIENT_SECRET="$GLOO_CLIENT_SECRET"

# Debug: Show base64-encoded Authorization header
AUTH_HEADER=$(printf "%s:%s" "$CLIENT_ID" "$CLIENT_SECRET" | base64)
if [[ $DEBUG -eq 1 ]]; then
  echo "Authorization header: Basic ${AUTH_HEADER:0:6}******${AUTH_HEADER: -6}"
fi

# Request token and extract it with jq
RESPONSE=$(curl -s -X POST \
  https://platform.ai.gloo.com/oauth2/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -H "Authorization: Basic $AUTH_HEADER" \
  -d 'grant_type=client_credentials&scope=api/access')

# Debug: Show full response
if [[ $DEBUG -eq 1 ]]; then
  echo "Full response: $RESPONSE"
fi

CLIENT_ACCESS_TOKEN=$(echo "$RESPONSE" | jq -r '.access_token')

if [ -z "${CLIENT_ACCESS_TOKEN:-}" ] || [ "$CLIENT_ACCESS_TOKEN" = "null" ]; then
  echo "Error: Failed to retrieve access token"
  echo "$RESPONSE"
  exit 1
fi

if [[ $DEBUG -eq 1 ]]; then
  echo "CLIENT_ACCESS_TOKEN: $CLIENT_ACCESS_TOKEN"
fi
export CLIENT_ACCESS_TOKEN

# By default, print only the token for easy export
if [[ $DEBUG -eq 0 ]]; then
  echo "$CLIENT_ACCESS_TOKEN"
fi
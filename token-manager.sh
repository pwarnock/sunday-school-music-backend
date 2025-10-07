#!/bin/bash

# Simple token manager with automatic refresh
# Source this file to use: source token-manager.sh

# Cache file for storing token and expiry
TOKEN_CACHE_FILE="${HOME}/.gloo_token_cache"

# Get current timestamp
get_timestamp() {
    date +%s
}

# Get token from cache if valid
get_cached_token() {
    if [[ -f "$TOKEN_CACHE_FILE" ]]; then
        local cached_data=$(cat "$TOKEN_CACHE_FILE" 2>/dev/null)
        local cached_token=$(echo "$cached_data" | head -1)
        local cached_expiry=$(echo "$cached_data" | tail -1)
        local current_time=$(get_timestamp)
        
        # Check if token is still valid (with 5 minute buffer)
        if [[ -n "$cached_expiry" ]] && [[ "$cached_expiry" =~ ^[0-9]+$ ]] && [[ $current_time -lt $((cached_expiry - 300)) ]]; then
            echo "$cached_token"
            return 0
        fi
    fi
    return 1
}

# Save token to cache with expiry (1 hour from now)
save_token_to_cache() {
    local token="$1"
    local expiry=$(($(get_timestamp) + 3600))
    echo -e "$token\n$expiry" > "$TOKEN_CACHE_FILE"
    chmod 600 "$TOKEN_CACHE_FILE"
}

# Get new token using the existing script
get_new_token() {
    local script_dir="$(dirname "${BASH_SOURCE[0]}")"
    local token_output
    
    # Check if we're in cloud environment (hardcoded credentials in .env)
    if [[ -f "$script_dir/.env" ]] && grep -q "^GLOO_CLIENT_ID=" "$script_dir/.env" && ! grep -q "op://" "$script_dir/.env"; then
        # Cloud environment - use .env directly
        source "$script_dir/.env"
        token_output=$("$script_dir/get_gloo_access_token.sh" 2>&1)
    else
        # Local environment - use 1Password
        token_output=$(op run --env-file="$script_dir/.env" -- "$script_dir/get_gloo_access_token.sh" 2>&1)
    fi
    
    if [[ $? -eq 0 ]] && [[ -n "$token_output" ]]; then
        echo "$token_output"
        return 0
    else
        echo "Error getting token: $token_output" >&2
        return 1
    fi
}

# Main function to get token (with automatic refresh)
get_gloo_token() {
    # Try to get cached token first
    local token=$(get_cached_token)
    
    if [[ -n "$token" ]]; then
        export CLIENT_ACCESS_TOKEN="$token"
        return 0
    fi
    
    # Get new token
    echo "Refreshing Gloo token..." >&2
    token=$(get_new_token)
    
    if [[ $? -eq 0 ]] && [[ -n "$token" ]]; then
        save_token_to_cache "$token"
        export CLIENT_ACCESS_TOKEN="$token"
        return 0
    else
        echo "Failed to get token" >&2
        return 1
    fi
}

# Auto-refresh wrapper for commands
with_gloo_token() {
    get_gloo_token && "$@"
}

# Initialize on source
if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
    # Script is being sourced
    echo "Token manager loaded. Use 'get_gloo_token' to refresh token or 'with_gloo_token <command>' to run with auto-refresh." >&2
fi
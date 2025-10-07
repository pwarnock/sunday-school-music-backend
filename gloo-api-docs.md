# Gloo AI API Integration Documentation

**⚠️ IMPORTANT: Always check the official Gloo documentation for the latest updates:**
**https://docs.gloo.com/getting-started/quickstart-developers**

*Last verified: October 2025*

## OAuth2 Authentication

### Getting Access Token

The official TypeScript implementation from Gloo docs:

```typescript
import { Buffer } from 'buffer';

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(
    'https://platform.ai.gloo.com/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'scope': 'api/access'
      })
    }
  );

  const data = await response.json();
  return data.access_token;
}
```

### Key Points:
1. Use `URLSearchParams` for the body (not a plain string)
2. The scope is `api/access`
3. Tokens expire after 1 hour
4. No refresh tokens with client credentials flow

## Environment Variables Required

```bash
GLOO_CLIENT_ID=your_client_id
GLOO_CLIENT_SECRET=your_client_secret
```

## Making API Calls

Example chat completion request:

```typescript
const response = await fetch('https://platform.ai.gloo.com/ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    model: 'gloo-llama-3.1-70b',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant for Sunday School teachers...'
      },
      {
        role: 'user',
        content: userMessage
      }
    ]
  })
});
```

## Common Issues

1. **"invalid_client" error**: Check that client ID and secret are correct
2. **400 Bad Request**: Ensure using `URLSearchParams` for OAuth2 body
3. **Token expiration**: Tokens last 1 hour, need to request new ones

## Testing Authentication

Use the bash script for quick testing:
```bash
./get_gloo_access_token.sh --debug
```

## References

- Official Docs: https://docs.gloo.com
- API Reference: https://docs.gloo.com/api-reference
- Quickstart: https://docs.gloo.com/getting-started/quickstart-developers
# ElevenLabs Mock Server Plan

## Goal
Create a minimal mock server to verify that the ElevenLabs client is sending the correct prompt data to the API endpoint.

## Endpoint to Mock
- **URL**: `POST https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128`
- **Purpose**: Capture and log the request body to verify prompt formatting

## Implementation Plan

### 1. Mock Server Setup
```javascript
// mock-elevenlabs-server.js
const express = require('express')
const app = express()
app.use(express.json())

// Store received requests for inspection
const receivedRequests = []

app.post('/v1/music', (req, res) => {
  const timestamp = new Date().toISOString()
  const request = {
    timestamp,
    headers: req.headers,
    query: req.query,
    body: req.body
  }
  
  receivedRequests.push(request)
  
  // Log the prompt for immediate visibility
  console.log('\n=== ElevenLabs Request Received ===')
  console.log('Timestamp:', timestamp)
  console.log('Prompt:', req.body.prompt)
  console.log('Prompt Length:', req.body.prompt?.length || 0)
  console.log('Duration:', req.body.music_length_ms, 'ms')
  console.log('Instrumental:', req.body.force_instrumental)
  console.log('===================================\n')
  
  // Return mock audio data
  res.status(200).send(Buffer.from('mock-audio-data'))
})

// Endpoint to view all requests
app.get('/requests', (req, res) => {
  res.json(receivedRequests)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Mock ElevenLabs server running on http://localhost:${PORT}`)
})
```

### 2. Test Script
```javascript
// test-elevenlabs-prompts.js
// This script will test different prompt versions and inputs

const testCases = [
  {
    name: "Basic v1.0 prompt",
    env: { ELEVENLABS_PROMPT_VERSION: "1.0" },
    input: {
      theme: "God's Love",
      mood: "happy",
      energy: "high",
      lyrics: "God loves me..."
    }
  },
  {
    name: "Basic v2.0 prompt",
    env: { ELEVENLABS_PROMPT_VERSION: "2.0" },
    input: {
      theme: "God's Love",
      mood: "happy",
      energy: "high",
      lyrics: "God loves me..."
    }
  },
  {
    name: "Long lyrics truncation",
    env: { ELEVENLABS_PROMPT_VERSION: "2.0" },
    input: {
      lyrics: "Very long lyrics..." // 2000+ chars
    }
  }
]

// Run tests against mock server
```

### 3. Client Configuration Update
```javascript
// Add environment variable to override base URL for testing
const baseUrl = process.env.ELEVENLABS_MOCK_URL || 'https://api.elevenlabs.io'
```

## What to Verify

1. **Prompt Format**: Ensure v1.0 and v2.0 generate different prompt structures
2. **Character Limits**: Verify prompts stay under 2000 characters
3. **Truncation**: Check that long lyrics are properly truncated
4. **Template Substitution**: Confirm all placeholders are replaced correctly
5. **Chat Extraction**: For v2.0+, verify the chat completion is called and data is extracted

## Usage
```bash
# Terminal 1: Start mock server
node scripts/mock-elevenlabs-server.js

# Terminal 2: Run tests
ELEVENLABS_MOCK_URL=http://localhost:3001 node scripts/test-elevenlabs-prompts.js

# Terminal 3: View captured requests
curl http://localhost:3001/requests | jq
```

## Expected Output
The mock server will log each request showing:
- The complete prompt text
- Prompt length (must be ≤ 2000)
- Whether instrumental flag is set correctly
- Duration in milliseconds

This will allow us to verify that the versioned prompt system is working correctly without making actual API calls.
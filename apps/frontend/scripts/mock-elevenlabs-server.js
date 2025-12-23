#!/usr/bin/env node

/**
 * Mock ElevenLabs server for testing prompt generation
 */

const express = require('express')
const fs = require('fs')
const path = require('path')

const app = express()
app.use(express.json({ limit: '10mb' }))

// Store received requests for inspection
const receivedRequests = []

// Mock music generation endpoint
app.post('/v1/music', (req, res) => {
  const timestamp = new Date().toISOString()
  const request = {
    timestamp,
    headers: {
      'content-type': req.headers['content-type'],
      'xi-api-key': req.headers['xi-api-key'] ? '***hidden***' : undefined
    },
    query: req.query,
    body: req.body
  }
  
  receivedRequests.push(request)
  
  // Log the prompt for immediate visibility
  console.log('\n' + '='.repeat(80))
  console.log('🎵 ElevenLabs Music Generation Request')
  console.log('='.repeat(80))
  console.log('📅 Timestamp:', timestamp)
  console.log('🔑 API Key:', req.headers['xi-api-key'] ? 'Present' : 'Missing')
  console.log('📝 Output Format:', req.query.output_format)
  console.log('\n📄 PROMPT:')
  console.log('-'.repeat(80))
  console.log(req.body.prompt || '(no prompt provided)')
  console.log('-'.repeat(80))
  console.log(`\n📏 Prompt Length: ${req.body.prompt?.length || 0} characters`)
  console.log(`⏱️  Duration: ${req.body.music_length_ms}ms (${(req.body.music_length_ms / 1000).toFixed(1)}s)`)
  console.log(`🎹 Instrumental: ${req.body.force_instrumental ? 'Yes' : 'No'}`)
  console.log(`🎵 Model: ${req.body.model_id || '(not specified)'}`)
  
  // Check if prompt exceeds limits
  if (req.body.prompt?.length > 2000) {
    console.log('\n⚠️  WARNING: Prompt exceeds 2000 character limit!')
  }
  
  console.log('='.repeat(80) + '\n')
  
  // Simulate successful response with mock audio data
  const mockAudioData = Buffer.from('Mock MP3 audio data for testing')
  res.status(200).send(mockAudioData)
})

// Endpoint to view all requests
app.get('/requests', (req, res) => {
  res.json({
    total: receivedRequests.length,
    requests: receivedRequests
  })
})

// Endpoint to clear requests
app.delete('/requests', (req, res) => {
  receivedRequests.length = 0
  res.json({ message: 'Requests cleared' })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    requestsReceived: receivedRequests.length,
    uptime: process.uptime()
  })
})

const PORT = process.env.MOCK_PORT || 3001

app.listen(PORT, () => {
  console.log(`\n🚀 Mock ElevenLabs server started!`)
  console.log(`📡 Listening on: http://localhost:${PORT}`)
  console.log(`\n📋 Available endpoints:`)
  console.log(`   POST /v1/music?output_format=mp3_44100_128 - Music generation`)
  console.log(`   GET  /requests - View all received requests`)
  console.log(`   DELETE /requests - Clear request history`)
  console.log(`   GET  /health - Health check`)
  console.log(`\n💡 To use this mock server, set:`)
  console.log(`   export ELEVENLABS_MOCK_URL=http://localhost:${PORT}`)
  console.log(`\n`)
})
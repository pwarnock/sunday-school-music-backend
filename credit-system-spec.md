# Sunday School Music Creator - Credit System Specification

## Credit Model Overview

The Sunday School Music Creator uses a credit-based system to manage AI-powered music generation costs. Credits are consumed only when actual AI processing occurs, not for basic app usage.

## Credit Consumption Rules

### ✅ **FREE Operations (No Credits Used)**
- Creating an account
- Chatting with Gloo AI to generate song lyrics
- Saving song lyrics to your library
- Viewing your song library
- Deleting songs from your library
- Sharing songs

### 💳 **PAID Operations (Credits Required)**
- **Generating Music from Lyrics** - 1 credit per generation
  - Uses ElevenLabs API to convert lyrics to audio
  - Creates downloadable MP3 file
  - Stores audio file in user's library

## User Journey & Credit Flow

### New User Experience
1. **Sign Up** → Receives 3 free credits
2. **Chat & Create Lyrics** → FREE (unlimited)
3. **Generate Music** → Auto-saves song + generates audio (1 credit per song, limited to 3)
4. **Manage Library** → View, share, delete saved songs (FREE)

### Credit Depletion
- Users can create unlimited lyrics but only generate 3 audio files
- When credits reach 0, music generation is disabled
- Lyrics creation and management remains fully functional

## Business Rationale

### Cost Alignment
- **Gloo AI (Lyrics)**: Lower cost per API call, encourage usage
- **ElevenLabs (Audio)**: Higher cost per generation, meter usage
- Credits protect against expensive AI audio generation costs

### User Experience
- **Low Friction**: Users can explore and create lyrics freely
- **Value Demonstration**: Users experience full value before hitting paywall
- **Clear Value Prop**: Credits are tied to tangible output (audio files)

## Technical Implementation

### Credit Deduction Points
```
Lyrics Generation (Gloo AI) → No credit check
Generate Music Button → Check credits > 0 AND not circuit breaker blocked AND rate limit not exceeded → Auto-save song if not saved
ElevenLabs API Call → Generate audio
Audio File Storage → Save audio to database
Success → Reset consecutive_failures, deduct 1 credit
Failure → Increment consecutive_failures, block if >= 3, notify admin
Rate Limit → Max 10 generations per hour per user
```

### Error Handling
- **No Credits**: Disable "Generate Music" button, show upgrade message
- **API Failure**: Don't deduct credits if music generation fails
- **Storage Failure**: Don't deduct credits if audio file save fails
- **Success Only**: Credits deducted only after both generation AND database save complete
- **Circuit Breaker**: After 3 consecutive save failures, disable music generation for 5 minutes to prevent resource waste
- **User Messaging**: Show "Music generation temporarily unavailable, please try again in 5 minutes" when circuit breaker active
- **Admin Alert**: Send immediate notification to admin when circuit breaker activates (email/Slack/webhook)
- **Partial Success**: If song saves but audio fails, mark song as "pending audio" and allow retry without re-saving
- **Credit Refunds**: Admin interface to manually refund credits for legitimate failures

### Database Schema Impact
```sql
-- Generate Music button triggers both song save AND music generation
-- Transaction flow: Save song → Generate audio → Save audio_url → Deduct credit
-- Credits deducted in generate-music API only after complete success
-- songs table tracks which songs have generated audio via audio_url field
-- users_profile.credits_remaining decrements as final step
-- If song already exists, only generate music (no duplicate save)

-- Circuit Breaker Implementation
-- users_profile.generation_blocked_until (timestamp, nullable)
-- users_profile.consecutive_failures (integer, default 0)
-- Reset consecutive_failures on successful generation
-- Block generation for 5 minutes after 3 consecutive failures
-- Trigger admin notification when circuit breaker activates (email/webhook)

-- Rate Limiting
-- Track generation timestamps in separate table or cache
-- Enforce max 10 generations per hour per user

-- Partial Success Handling
-- songs.audio_generation_status: 'pending', 'generating', 'completed', 'failed'
-- Allow retry for 'failed' status without re-saving song
```

## Future Enhancements

### Credit Packages
- **Starter Pack**: 10 credits for $4.99
- **Creator Pack**: 25 credits for $9.99  
- **Unlimited**: Monthly subscription for unlimited generations

### Credit Earning
- **Referral Bonus**: 1 free credit per successful referral
- **Social Sharing**: Bonus credits for sharing songs
- **Feedback**: Credits for rating/reviewing generated songs

### Graceful Degradation
- **Retry Queue**: Failed generations queued for automatic retry
- **Status Updates**: Email users when queued songs are completed
- **Bulk Recovery**: Admin tool to retry all failed generations after outage

## Monitoring & Admin (Separate Application)

### Admin Dashboard Features
- **Circuit Breaker Status**: Real-time view of all active circuit breakers
- **Failure Analytics**: Track failure rates by type (API, storage, etc.)
- **Credit Management**: Manual credit refunds and adjustments
- **User Activity**: Generation patterns, rate limit violations
- **System Health**: API response times, storage availability

### Monitoring Metrics
- **Real-time Alerts**: Circuit breaker activations, high failure rates
- **Usage Analytics**: Credits consumed, generation success rates
- **Cost Tracking**: ElevenLabs API usage vs revenue
- **User Behavior**: Conversion funnel visualization

### Admin Actions
- **Manual Credit Refund**: Issue credits for legitimate failures
- **Circuit Breaker Override**: Reset user's circuit breaker manually
- **Rate Limit Adjustment**: Modify limits for specific users
- **Failure Investigation**: Detailed logs for debugging

## Success Metrics

### Conversion Funnel
1. **Lyrics Created** (Free) → High volume expected
2. **Songs Saved** (Free) → Moderate conversion from lyrics
3. **Music Generated** (Paid) → Target 60%+ of saved songs
4. **Credit Purchase** (Revenue) → Target 40%+ of users who exhaust free credits

### Key Performance Indicators
- Average lyrics per user before first music generation
- Conversion rate from saved song to generated music
- Credit exhaustion to purchase conversion rate
- User retention after credit depletion
- Circuit breaker activation frequency
- Average time to resolution for failures
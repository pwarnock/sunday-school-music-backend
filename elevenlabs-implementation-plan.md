# Technical Implementation Plan for ElevenLabs API Integration

## 1. Technical Implementation Plan

### API Endpoint Evaluation

#### Cost Analysis Comparison

Based on the ElevenLabs pricing structure:

**Text-to-Speech API:**
- **Cost**: ~$0.06-$0.15 per minute (depending on plan)
- **Free tier**: 10 minutes/month (~20 songs at 30s each)
- **Starter tier ($5)**: 30 minutes/month (~60 songs at 30s each)
- **Creator tier ($11)**: 100 minutes/month (~200 songs at 30s each)

**Music Generation API:**
- **Cost**: Higher than TTS (exact pricing not publicly listed, requires custom quote)
- **Features**: Full compositional control, instrumental/vocal options
- **Quality**: Professional-grade music generation

#### Feature Comparison

**Text-to-Speech (TTS) Endpoint:**
- ✅ Lower cost for MVP validation
- ✅ Can generate sung lyrics with voice selection
- ✅ Faster generation times (5-10 seconds)
- ❌ Limited musical control (no instrumental backing)
- ❌ May sound more like spoken/chanted lyrics than true singing
- ❌ Limited to voice-only output

**Music Generation Endpoint:**
- ✅ Full musical composition with instruments
- ✅ Professional song structure (verse/chorus/bridge)
- ✅ Style and mood control
- ✅ Instrumental or vocal options
- ❌ Higher cost per generation
- ❌ Longer generation times (20-60 seconds)
- ❌ More complex API integration

#### Recommendation for Sunday School Use Case

**Initial Implementation: Music Generation API**

Rationale:
1. **Quality Requirements**: Sunday School teachers need actual music, not just spoken lyrics
2. **Use Case Fit**: Children need engaging musical backing for participation
3. **Feature Completeness**: Supports all required features (instrumental, vocals, duration, style)
4. **User Expectations**: Teachers expect generated "music," not spoken word
5. **Credit Value**: Higher quality output justifies the 1-credit cost

**Migration Path**: Not applicable - start with Music Generation API directly

### Architecture Overview

The ElevenLabs integration fits within the existing architecture as follows:

```
Frontend (Next.js/React)
    ↓
API Route Handler (/api/generate-music)
    ↓
Credit Validation (Supabase)
    ↓
ElevenLabs Music API Client
    ↓
Audio Storage (Supabase Storage)
    ↓
Database Update (Supabase)
```

### API Integration Layer

#### ElevenLabs Client Implementation

**File: `frontend/src/lib/elevenlabs/client.ts`**

```typescript
interface ElevenLabsMusicConfig {
  apiKey: string
  baseUrl?: string
  timeout?: number
  maxRetries?: number
}

interface MusicGenerationParams {
  prompt?: string
  composition_plan?: CompositionPlan
  music_length_ms: number
  force_instrumental: boolean
  output_format?: string
}

interface CompositionPlan {
  positive_global_styles: string[]
  negative_global_styles: string[]
  sections: SongSection[]
}

interface SongSection {
  section_name: string
  positive_local_styles: string[]
  negative_local_styles: string[]
  duration_ms: number
  lines: string[]
}

class ElevenLabsMusicClient {
  private apiKey: string
  private baseUrl: string
  private timeout: number
  private maxRetries: number

  constructor(config: ElevenLabsMusicConfig) {
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || 'https://api.elevenlabs.io'
    this.timeout = config.timeout || 120000 // 2 minutes
    this.maxRetries = config.maxRetries || 3
  }

  async generateMusic(params: MusicGenerationParams): Promise<Buffer> {
    // Implementation with retry logic, timeout handling, and error mapping
  }

  private mapSundaySchoolToElevenLabs(input: SundaySchoolMusicInput): MusicGenerationParams {
    // Map Sunday School inputs to ElevenLabs parameters
  }

  private handleApiError(error: any): Error {
    // Map ElevenLabs errors to user-friendly messages
  }
}
```

### Time Limit Configuration System

#### Database Schema

**Migration: `supabase/migrations/[timestamp]_add_music_generation_config.sql`**

```sql
-- Configuration table for admin-editable settings
CREATE TABLE IF NOT EXISTS public.music_generation_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default time limit configuration
INSERT INTO music_generation_config (key, value, description) 
VALUES (
  'time_limits',
  '{"max_duration_seconds": 60, "available_durations": [30, 60, 90, 120]}',
  'Maximum duration and available duration options for music generation'
);

-- Create index for fast lookups
CREATE INDEX idx_music_config_key ON music_generation_config(key);

-- RLS policies
ALTER TABLE music_generation_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config readable by all authenticated users" 
ON music_generation_config FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Admin-only update policy (implement role check as needed)
CREATE POLICY "Config updatable by admins only" 
ON music_generation_config FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM users_profile 
  WHERE id = auth.uid() AND is_admin = true
));

-- Cache table for performance
CREATE TABLE IF NOT EXISTS public.music_config_cache (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Function to get config with caching
CREATE OR REPLACE FUNCTION get_music_config(p_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_cached JSONB;
  v_config JSONB;
BEGIN
  -- Check cache first
  SELECT value INTO v_cached
  FROM music_config_cache
  WHERE key = p_key AND expires_at > NOW();
  
  IF v_cached IS NOT NULL THEN
    RETURN v_cached;
  END IF;
  
  -- Get from config table
  SELECT value INTO v_config
  FROM music_generation_config
  WHERE key = p_key;
  
  -- Update cache (5 minute expiry)
  INSERT INTO music_config_cache (key, value, expires_at)
  VALUES (p_key, v_config, NOW() + INTERVAL '5 minutes')
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value, expires_at = EXCLUDED.expires_at;
  
  RETURN v_config;
END;
$$ LANGUAGE plpgsql;
```

#### Configuration Management Tools

**Admin SQL Script: `scripts/update-time-limits.sql`**

```sql
-- Example: Update maximum duration to 90 seconds
UPDATE music_generation_config 
SET value = jsonb_set(value, '{max_duration_seconds}', '90')
WHERE key = 'time_limits';

-- Example: Update available durations
UPDATE music_generation_config 
SET value = jsonb_set(value, '{available_durations}', '[30, 60, 90]'::jsonb)
WHERE key = 'time_limits';

-- Clear cache after update
DELETE FROM music_config_cache WHERE key = 'time_limits';
```

### Credit System Integration

The integration follows the existing credit system patterns:

1. **Pre-validation**: Check credits before API call
2. **Deduction Timing**: After successful audio generation and storage
3. **Rollback**: On any failure, no credit deduction
4. **Circuit Breaker**: Existing system applies to ElevenLabs failures

**Updated Flow in `/api/generate-music/route.ts`:**

```typescript
// 1. Validate credits (existing)
// 2. Check time limits
// 3. Call ElevenLabs API
try {
  const audio = await elevenLabsClient.generateMusic({
    prompt: buildPromptFromInputs(songData),
    music_length_ms: finalDuration * 1000,
    force_instrumental: songData.instrumental,
    output_format: 'mp3_44100_128'
  })
  
  // 4. Store audio
  // 5. Deduct credit atomically (existing RPC)
} catch (error) {
  // No credit deduction on failure
  // Increment consecutive_failures
  // Check circuit breaker
}
```

### Request Flow

1. **Client-side validation**
   - Duration within available options
   - Required fields present
   - Credit balance > 0

2. **Server-side processing**
   ```
   POST /api/generate-music
   ├── Authenticate user
   ├── Validate credits
   ├── Fetch time limit config (cached)
   ├── Validate duration against config
   ├── Track generation attempt
   ├── Build ElevenLabs prompt
   ├── Call ElevenLabs API (with timeout)
   ├── Store audio file
   ├── Update song record
   └── Deduct credit (atomic transaction)
   ```

3. **Error handling with rollback**
   - ElevenLabs API failure → No credit deduction
   - Storage failure → No credit deduction  
   - Timeout → Cancel request, no credit deduction

### State Management

**Frontend State Updates:**

```typescript
interface MusicGenerationState {
  isGenerating: boolean
  progress: number // 0-100
  statusMessage: string
  error: string | null
  audioUrl: string | null
  duration: {
    requested: number
    actual: number
    wasLimited: boolean
  }
}

// Status messages during generation
const statusMessages = {
  validating: "Checking your credits...",
  preparing: "Preparing your song request...",
  generating: "Creating your music (this may take 30-60 seconds)...",
  storing: "Saving your song...",
  complete: "Your song is ready!"
}
```

### Error Handling

**User-Friendly Error Messages:**

```typescript
const errorMessages = {
  'auth_error': 'Please sign in to generate music',
  'no_credits': 'You\'ve used all your free songs. Contact your administrator for more.',
  'duration_exceeded': `Songs can be up to ${maxDuration} seconds long. We\'ve adjusted your request.`,
  'generation_failed': 'We couldn\'t create your song right now. Please try again in a few minutes.',
  'network_timeout': 'The music generation is taking longer than expected. Please try again.',
  'invalid_content': 'Some words in your song might not be appropriate. Please check your lyrics.',
  'service_unavailable': 'Our music service is temporarily busy. Please try again in a few minutes.'
}
```

### Validation Requirements

**Input Sanitization:**

```typescript
function sanitizeLyrics(lyrics: string): string {
  // Remove potentially harmful content
  let sanitized = lyrics
    .replace(/<[^>]*>/g, '') // Remove HTML
    .replace(/[^\w\s\-.,!?'"]/g, '') // Keep only safe characters
    .trim()
  
  // Check vocabulary level
  const complexWords = checkVocabularyComplexity(sanitized, ageGroup)
  if (complexWords.length > 0) {
    // Suggest simpler alternatives
  }
  
  return sanitized
}

function validateBibleReference(reference: string): boolean {
  const pattern = /^(\d?\s?[A-Za-z]+)\s+(\d+):?(\d+)?(-(\d+))?$/
  return pattern.test(reference)
}
```

### UI/UX Specifications

**Duration Selector Component:**

```tsx
interface DurationOption {
  value: number
  label: string
  description: string
}

const durationOptions: DurationOption[] = [
  { value: 30, label: "30 sec", description: "Perfect for a simple chorus" },
  { value: 60, label: "1 min", description: "Good for verse and chorus" },
  { value: 90, label: "1.5 min", description: "Full song with bridge" },
  { value: 120, label: "2 min", description: "Extended worship song" }
]

// Component renders only available options based on config
```

**Loading State with Progress:**

```tsx
<div className="space-y-4">
  <Progress value={progress} className="w-full" />
  <p className="text-center text-sm text-gray-600">
    {statusMessage}
  </p>
  <p className="text-center text-xs text-gray-500">
    This usually takes 30-60 seconds. Please don't close this window.
  </p>
</div>
```

### Testing Strategy

**Unit Tests:**
```typescript
describe('ElevenLabs Integration', () => {
  test('maps Sunday School inputs to ElevenLabs parameters correctly')
  test('handles timeout gracefully')
  test('validates duration against configuration')
  test('sanitizes lyrics appropriately')
})
```

**Integration Tests:**
```typescript
describe('Music Generation Flow', () => {
  test('complete flow with successful generation')
  test('credit rollback on ElevenLabs failure')
  test('circuit breaker activation after failures')
  test('time limit enforcement')
})
```

### Deployment Steps

1. **Database Migration**
   ```bash
   supabase db push --linked
   ```

2. **Environment Variables**
   ```bash
   vercel env add ELEVENLABS_API_KEY production
   ```

3. **Feature Flag Rollout**
   ```typescript
   const ENABLE_ELEVENLABS = process.env.ENABLE_ELEVENLABS === 'true'
   ```

4. **Rollback Plan**
   - Keep mock generation as fallback
   - Feature flag to disable ElevenLabs
   - Database migration is backward compatible

### Monitoring and Logging

**Metrics to Track:**
```typescript
interface GenerationMetrics {
  user_id: string
  song_id: string
  duration_requested: number
  duration_generated: number
  generation_time_ms: number
  elevenlabs_response_time_ms: number
  storage_time_ms: number
  total_time_ms: number
  success: boolean
  error_type?: string
  error_message?: string
}
```

**Cost Monitoring:**
```sql
-- Daily ElevenLabs usage report
SELECT 
  DATE(created_at) as date,
  COUNT(*) as generations,
  SUM(generated_duration_seconds) as total_seconds,
  SUM(generated_duration_seconds) / 60.0 as total_minutes,
  -- Estimate cost based on tier
  (SUM(generated_duration_seconds) / 60.0) * 0.10 as estimated_cost_usd
FROM songs
WHERE audio_url IS NOT NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 2. Input Requirements Clarification Questions

### API Endpoint Selection
- **Cost-Quality Trade-off**: Given that the Music Generation API provides full instrumental backing essential for children's engagement, should we proceed with this higher-quality option despite the increased cost? The TTS endpoint would only provide spoken/chanted lyrics without musical accompaniment.
- **User Expectations**: Should the system transparently communicate to users whether their generation uses the premium Music API or a basic TTS fallback (if implemented for cost savings)?

### Musical Attributes
- **Style Granularity**: Should we expand beyond "upbeat/calm" to include specific children's music styles like "action song," "lullaby," "marching song," or "gentle worship"?
- **Tempo Specification**: Should tempo be user-selectable as descriptive terms (slow/medium/fast) with hidden BPM mappings (60-80/80-120/120-140)?
- **Energy vs Mood**: How should the system resolve conflicts between energy level and mood (e.g., "high energy" + "reflective mood")?

### Thematic Elements
- **Theme Specificity**: Should free-text theme input be guided by suggestions/categories to ensure age-appropriate content?
- **Bible Verse Handling**: When a verse is provided, should it be:
  - Incorporated as sung lyrics directly
  - Used as thematic inspiration only
  - Offered as both options for teacher selection

### Audience Considerations
- **Age Sub-groups**: Should the 5-10 range be split into 5-7 (younger) and 8-10 (older) with different complexity defaults?
- **Vocabulary Checking**: Should the system automatically flag complex words and suggest simpler alternatives?

### Lyrics Handling
- **Length Validation**: Should lyrics be validated against duration (approximately 2-3 words per second of music)?
- **Structure Enforcement**: Should the system guide users to create verse/chorus structure or accept free-form lyrics?

### Duration Conflicts
- **Auto-adjustment**: When requested duration exceeds the limit, should the system:
  - Automatically cap at maximum and notify
  - Refuse generation and require user to reselect
  - Offer to truncate lyrics to fit

### Instrumental vs Vocal
- **Conflict Resolution**: If "instrumental" is selected but lyrics are provided, should the system:
  - Generate instrumental only (ignore lyrics)
  - Generate with humming/vocalization
  - Prompt user to clarify intent

### Style Conflicts
- **Parameter Priority**: When conflicting parameters are selected, which takes precedence:
  - Mood over tempo
  - Energy over style
  - Theme over all musical parameters

### Multiple Variations
- **Regeneration**: Should regenerating the same song with identical parameters:
  - Produce a different variation
  - Cost another credit
  - Offer a "tweak" option for minor adjustments

### Output Format
- **Audio Quality**: Should the system use:
  - MP3 128kbps for smaller file sizes (better for slow internet)
  - MP3 192kbps for higher quality (Creator tier required)
  - Offer quality selection based on user's internet speed

### Batch Generation
- **Bulk Features**: Should teachers be able to:
  - Queue multiple songs for generation
  - Save "song templates" for quick regeneration
  - Generate variations of the same theme

### Content Moderation
- **Theological Screening**: Should the system:
  - Flag concepts like "hell," "death," "judgment" for age review
  - Maintain a list of denominationally sensitive terms
  - Allow administrators to configure acceptable content

These clarification questions will help refine the implementation to best serve Sunday School teachers' needs while maintaining appropriate guardrails for children's content.

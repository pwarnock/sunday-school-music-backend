# 🎵 Configurable Time Limit Feature - Implementation Plan

## Overview
Implement a configurable time limit feature for music generation in the Sunday School Music Creator, allowing administrators to set maximum duration limits (30, 60, 90, or 120 seconds) while ensuring seamless integration with the existing credit system and maintaining an intuitive interface for Sunday School teachers and church volunteers.

## Feature Requirements
1. **Time Limit Configuration**: Admin-configurable maximum duration (30, 60, 90, or 120 seconds)
2. **User Experience**: Clear duration selection in music generation interface
3. **Validation**: Prevent users from requesting durations exceeding configured limits
4. **Credit System Integration**: Maintain existing 1 credit per generation regardless of duration
5. **Error Handling**: 
   - Duration exceeds limit: Show clear message with maximum allowed
   - Invalid duration input: Default to safe value (30 seconds)
   - Conflict resolution: When requested > limit, auto-adjust to limit
6. **Default Behavior**: System defaults to 60 seconds if not configured
7. **UI Accessibility**: Large, clear buttons suitable for users with minimal technical experience
8. **Analytics**: Track duration selections and limit violations

## Technical Implementation

### Database Schema Updates

Create a migration to add time limit configuration:

**File: `supabase/migrations/[timestamp]_add_music_generation_config.sql`**
```sql
-- Create system configuration table for music generation settings
CREATE TABLE IF NOT EXISTS public.music_generation_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  max_duration_seconds INTEGER NOT NULL DEFAULT 60 CHECK (max_duration_seconds IN (30, 60, 90, 120)),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default configuration
INSERT INTO music_generation_config (max_duration_seconds) VALUES (60);

-- Add duration tracking to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS requested_duration_seconds INTEGER DEFAULT 60;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS generated_duration_seconds INTEGER;

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_songs_duration ON songs(requested_duration_seconds, generated_duration_seconds);

-- RLS policies for configuration
ALTER TABLE music_generation_config ENABLE ROW LEVEL SECURITY;

-- Only admins can view/update config (implement admin role check as needed)
CREATE POLICY "Config viewable by authenticated users" ON music_generation_config
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Track duration selection attempts
CREATE TABLE IF NOT EXISTS public.music_generation_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  requested_duration INTEGER NOT NULL,
  allowed_duration INTEGER NOT NULL,
  was_limited BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for analytics
CREATE INDEX idx_generation_attempts_user_created 
ON music_generation_attempts(user_id, created_at DESC);

-- RLS for attempts table
ALTER TABLE music_generation_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts" ON music_generation_attempts
  FOR SELECT USING (auth.uid() = user_id);
```

### API Modifications

#### 1. Create Configuration API Endpoint
**File: `frontend/src/app/api/music-config/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current configuration
    const { data: config, error } = await supabase
      .from('music_generation_config')
      .select('max_duration_seconds')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Config fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
    }
    
    // Return config or default
    return NextResponse.json({ 
      maxDurationSeconds: config?.max_duration_seconds || 60 
    })
    
  } catch (error) {
    console.error('Music config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### 2. Update Generate Music API
**File: `frontend/src/app/api/generate-music/route.ts`** (modifications)

Add duration validation to the existing endpoint:

```typescript
// Add to the POST handler after line 68
const { songId, lyrics, duration = 60 } = await request.json()

// Add validation after checking credits (around line 88)
// Fetch current time limit configuration
const { data: config } = await supabase
  .from('music_generation_config')
  .select('max_duration_seconds')
  .order('updated_at', { ascending: false })
  .limit(1)
  .single()

const maxDuration = config?.max_duration_seconds || 60
const finalDuration = Math.min(duration, maxDuration)
const wasLimited = duration > maxDuration

// Track the attempt
await supabase
  .from('music_generation_attempts')
  .insert({
    user_id: user.id,
    song_id: songId,
    requested_duration: duration,
    allowed_duration: finalDuration,
    was_limited: wasLimited
  })

// Update the song record with duration info
await supabase
  .from('songs')
  .update({ 
    requested_duration_seconds: duration,
    generated_duration_seconds: finalDuration 
  })
  .eq('id', songId)
  .eq('user_id', user.id)

// Pass duration to ElevenLabs when implemented
// For now, include in response for UI feedback
```

### Frontend Component Updates

#### 1. Create Duration Selector Component
**File: `frontend/src/components/DurationSelector.tsx`**

```tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface DurationSelectorProps {
  onDurationSelect: (duration: number) => void
  maxDuration: number
  disabled?: boolean
}

export function DurationSelector({ onDurationSelect, maxDuration, disabled }: DurationSelectorProps) {
  const [selectedDuration, setSelectedDuration] = useState(60)
  const durations = [30, 60, 90, 120].filter(d => d <= maxDuration)
  
  const handleSelect = (duration: number) => {
    setSelectedDuration(duration)
    onDurationSelect(duration)
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Clock className="w-4 h-4" />
        <span>Select song duration:</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {durations.map(duration => (
          <Button
            key={duration}
            type="button"
            variant={selectedDuration === duration ? 'default' : 'outline'}
            onClick={() => handleSelect(duration)}
            disabled={disabled}
            className="h-12 text-lg font-medium"
          >
            {duration} seconds
          </Button>
        ))}
      </div>
      {maxDuration < 120 && (
        <p className="text-xs text-gray-500 text-center">
          Maximum duration is limited to {maxDuration} seconds
        </p>
      )}
    </div>
  )
}
```

#### 2. Update Dashboard Component
**File: `frontend/src/components/Dashboard.tsx`** (modifications)

Add duration selection to the music generation flow:

```tsx
// Add state for duration management (around line 30)
const [selectedDuration, setSelectedDuration] = useState(60)
const [maxDuration, setMaxDuration] = useState(60)

// Add useEffect to fetch configuration
useEffect(() => {
  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/music-config')
      const data = await response.json()
      setMaxDuration(data.maxDurationSeconds || 60)
    } catch (error) {
      console.error('Failed to fetch music config:', error)
    }
  }
  fetchConfig()
}, [])

// Update saveAndGenerateMusic to include duration
const saveAndGenerateMusic = async () => {
  // ... existing code ...
  
  const musicResponse = await fetch('/api/generate-music', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      songId: savedSong.id, 
      lyrics: currentLyrics,
      duration: selectedDuration 
    })
  })
  
  // ... rest of existing code ...
}

// Add duration selector to the UI before the generate button
// Insert around line 495, before the Save & Generate Music button
<DurationSelector
  onDurationSelect={setSelectedDuration}
  maxDuration={maxDuration}
  disabled={isGenerating || !currentLyrics || (profile?.credits_remaining || 0) <= 0}
/>
```

### Error Handling & Validation

#### Client-Side Validation
```typescript
// Add to DurationSelector component
const validateDuration = (duration: number): number => {
  if (!duration || duration < 30) return 30
  if (duration > maxDuration) return maxDuration
  // Round to nearest valid duration
  const validDurations = [30, 60, 90, 120]
  return validDurations.reduce((prev, curr) => 
    Math.abs(curr - duration) < Math.abs(prev - duration) ? curr : prev
  )
}
```

#### Server-Side Response Enhancement
```typescript
// In generate-music route, add to response
if (wasLimited) {
  return NextResponse.json({ 
    success: true, 
    audioUrl,
    message: `Music generated successfully at ${finalDuration} seconds (limited from ${duration} seconds). 1 credit used.`,
    actualDuration: finalDuration,
    wasLimited: true
  })
}
```

### Deployment Considerations

1. **Migration Order**: 
   - Deploy database migrations first
   - Ensure default config exists before deploying frontend
   
2. **Environment Variables**: 
   - Add `NEXT_PUBLIC_DEFAULT_DURATION=60` for fallback
   
3. **Rollback Plan**:
   - Keep duration column nullable initially
   - Frontend gracefully handles missing config
   
4. **Monitoring**:
   - Track `was_limited` occurrences
   - Monitor average requested vs actual durations

### Testing Plan

1. **Configuration Testing**:
   - Verify default 60-second limit works
   - Test all duration options (30, 60, 90, 120)
   - Confirm limit enforcement
   
2. **User Flow Testing**:
   - Test with various credit amounts
   - Verify duration persists across regenerations
   - Check error messages clarity
   
3. **Edge Cases**:
   - No configuration record exists
   - User requests 45 seconds (non-standard)
   - Rapid duration changes during generation

### Implementation Status

- [ ] Create database migration
- [ ] Implement configuration API endpoint
- [ ] Create DurationSelector component
- [ ] Update Dashboard with duration selection
- [ ] Modify generate-music API for duration
- [ ] Add analytics tracking
- [ ] Test with various configurations
- [ ] Update documentation
- [ ] Deploy to production

### Success Criteria

- [ ] Teachers can easily select song duration
- [ ] System respects configured maximum limits
- [ ] Clear feedback when duration is limited
- [ ] No impact on existing credit system
- [ ] Analytics show duration preference patterns
- [ ] Zero errors from invalid duration inputs

### Future Enhancements

1. **Variable Credit Costs**: Different credits for different durations
2. **Duration Templates**: Pre-sets for common use cases (verse, chorus, full song)
3. **Batch Generation**: Generate multiple durations in one credit
4. **Smart Duration**: AI suggests optimal duration based on lyrics length

---

## Input Requirements Questions

### Musical Attributes
1. **Tempo Specification**:
   - Should tempo be specified as BPM (beats per minute) or descriptive terms (slow, medium, fast)?
   - What BPM ranges are appropriate for each age group within 5-10 years?
   - How should the system handle tempo conflicts with energy level (e.g., slow tempo + high energy)?
   - Should there be tempo presets for common Sunday School activities (circle time, craft time, cleanup)?

2. **Musical Style Details**:
   - Beyond "upbeat/calm", what specific genres work for Sunday School (folk, contemporary worship, traditional hymn style)?
   - Should instrumental style differ from vocal style options?
   - Are there styles to explicitly avoid for this age group?
   - How should "transition music" between activities be categorized?

3. **Instrumentation Preferences**:
   - Which instruments are most appropriate for children's worship music?
   - Should there be an option to exclude certain instruments (drums for quiet time)?
   - How should the system handle "simple accompaniment" vs "full orchestration"?
   - Are there specific instrument combinations that work best for group singing?

### Thematic Elements
4. **Bible Verse Integration**:
   - When a verse doesn't match the theme, should the system prioritize the verse or theme?
   - How should the system handle multiple verse references in one song?
   - Should Old Testament vs New Testament verses influence musical style?
   - What if the verse is too complex for the target age group?

5. **Lesson Topic Alignment**:
   - How specific should lesson topics be (e.g., "God's Love" vs "God loves me when I make mistakes")?
   - Should seasonal themes (Christmas, Easter) automatically adjust musical style?
   - How should abstract concepts (faith, hope) be made concrete for 5-10 year olds?
   - Should the system suggest complementary themes based on the primary topic?

### Audience Considerations
6. **Age-Specific Adaptations**:
   - Should 5-6 year olds have different defaults than 9-10 year olds?
   - How should vocabulary complexity adjust within the age range?
   - What's the maximum appropriate song length for each age sub-group?
   - Should melody complexity vary by age?

7. **Group Size & Setting**:
   - Should the system ask about group size (small group vs large assembly)?
   - How should acoustics assumptions change for different venues?
   - Should there be options for "movement songs" vs "sitting songs"?
   - How does outdoor vs indoor setting affect the generation?

### Technical Specifications
8. **Vocal Specifications**:
   - Should there be options for male/female/child vocals?
   - How should harmonies be handled for group singing?
   - Should there be a "call and response" format option?
   - What about spoken word sections or narration?

9. **Repetition & Structure**:
   - How many times should the chorus repeat for memorability?
   - Should verses progressively build on concepts?
   - Is there a preferred song structure (verse-chorus-verse-chorus-bridge-chorus)?
   - Should there be options for "echo songs" where children repeat lines?

### Content Validation
10. **Lyrical Content Screening**:
    - What theological concepts might be too advanced for 5-10 year olds?
    - Should the system flag potentially scary imagery (even from Bible stories)?
    - How should the system handle user-provided lyrics that aren't age-appropriate?
    - What words/phrases should be automatically simplified?

11. **Cultural Sensitivity**:
    - Should there be options for different cultural musical styles?
    - How should the system handle names and places from the Bible?
    - Should pronunciation guides be considered for difficult Biblical terms?
    - Are there cultural considerations for rhythm and movement?

### Practical Usage
12. **Teacher Resources**:
    - Should the system generate suggested hand motions or movements?
    - Would chord charts or simple musical notation be helpful?
    - Should there be printable lyrics with large fonts?
    - How about suggested discussion questions related to the song?

13. **Reusability Options**:
    - Should teachers be able to request variations of the same song?
    - How should the system handle requests for "shorter version for closing"?
    - Should there be options to generate complementary songs on the same theme?
    - Can songs be tagged for specific uses (opening, teaching, closing)?

### Edge Cases
14. **Special Needs Considerations**:
    - Should there be sensory-friendly options (less stimulating)?
    - How should the system handle requests for very simple, repetitive songs?
    - Are there considerations for children with auditory processing challenges?
    - Should volume dynamics be controllable?

15. **Seasonal & Special Events**:
    - How should holiday-specific songs differ from regular songs?
    - Should VBS (Vacation Bible School) songs have different energy defaults?
    - What about songs for special services (baptisms, dedications)?
    - How should the system handle requests for "performance" vs "participation" songs?

These questions will help ensure the ElevenLabs integration creates appropriate, engaging, and educationally valuable music for Sunday School contexts while maintaining ease of use for teachers with minimal musical or technical experience.
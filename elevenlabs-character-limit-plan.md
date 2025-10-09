# ElevenLabs 2000 Character Limit Implementation Plan

## Overview
Implement a 2000 character limit for ElevenLabs music generation prompts to ensure compatibility with their API constraints.

## Current Status
- [x] Analyze current ElevenLabs implementation to understand prompt handling
- [x] Design character limit validation and handling strategy
- [x] Implement frontend validation for 2000 char limit
- [x] Implement backend validation and truncation logic
- [x] Add user feedback for character limit
- [x] Test the character limit implementation

## Implementation Complete! ✅

The 2000 character limit has been successfully implemented with:
- Frontend validation that prevents API calls when over limit
- Visual feedback showing character count when approaching limit
- Backend smart truncation as a safety net
- Comprehensive testing showing the validation works correctly

## Implementation Tasks

### 1. Analyze Current Implementation (HIGH PRIORITY)
**Status**: Completed

Findings:
- Prompts are built in `/frontend/src/lib/elevenlabs/client.ts` using the `buildPrompt()` method
- The prompt includes: base context, theme, Bible reference, mood, energy, instrumental preference, lyrics, and age-appropriate guidance
- Typical prompt length with normal lyrics: ~900 characters
- With longer lyrics (doubled): ~1400 characters
- No current character limit validation in place
- The prompt is sent to ElevenLabs API in the `callMusicAPI()` method

### 2. Design Character Limit Strategy (HIGH PRIORITY)
**Status**: Completed

Design decisions:
- **Enforcement**: Both frontend and backend for defense in depth
- **Handling strategy**: 
  - Frontend: Prevent submission if over 2000 chars, show real-time counter
  - Backend: Smart truncation at sentence boundaries as fallback
- **Truncation priority**: Preserve in order:
  1. Base context and age-appropriate guidance (essential)
  2. Theme and Bible reference (important context)
  3. Mood and energy settings (important for style)
  4. Lyrics (truncate if needed, preserving complete verses)
- **Character counting**: Use JavaScript `.length` (UTF-16 code units)
- **User feedback**: Real-time character counter, warning at 1800 chars

### 3. Frontend Validation Implementation (MEDIUM PRIORITY)
**Status**: Completed

Implemented:
- Added `estimatePromptLength()` function to calculate prompt length
- Visual indicator in song cards showing character count when > 1800 chars
- Prevent music generation when prompt > 2000 chars
- Disable generate button with appropriate tooltip
- Show error toast when attempting to generate with too-long prompt

### 4. Backend Validation Implementation (MEDIUM PRIORITY)
**Status**: Completed

Implemented:
- Added validation in `generateMusic()` method to check 2000 char limit
- Implemented smart `truncatePrompt()` method that:
  - Preserves essential context (base prompt, age guidance)
  - Prioritizes theme and Bible references
  - Truncates lyrics at verse/sentence boundaries when needed
  - Logs truncation events for monitoring
- Added `checkPromptLength()` public method for testing

### 5. User Feedback Implementation (MEDIUM PRIORITY)
**Status**: Pending

UI/UX improvements:
- Character count display (e.g., "1850/2000 characters")
- Warning when approaching limit (e.g., at 1800 chars)
- Error message if limit exceeded
- Tooltip explaining the limitation
- Suggestions for reducing prompt length

### 6. Testing (LOW PRIORITY)
**Status**: Pending

Test scenarios:
- Prompts under 2000 characters
- Prompts exactly at 2000 characters
- Prompts over 2000 characters
- Special characters and Unicode handling
- Multi-byte character counting
- Edge cases (empty prompts, whitespace-only)
- API error handling

## Technical Considerations

### Character Counting
- JavaScript `.length` counts UTF-16 code units
- Consider using proper Unicode-aware counting if needed
- Decide if whitespace and newlines count toward limit

### Truncation Strategy
Options:
1. **Simple truncation**: Cut at 2000 chars exactly
2. **Word boundary truncation**: Cut at last complete word before 2000
3. **Sentence boundary truncation**: Cut at last complete sentence
4. **Smart summarization**: Use AI to condense if over limit

### Error Handling
- Frontend validation prevents most cases
- Backend validation as safety net
- Graceful degradation if truncation needed
- Clear error messages to users

## Implementation Order
1. Analyze current code
2. Design and document approach
3. Implement backend validation first (safety net)
4. Add frontend validation and UI
5. Extensive testing
6. Documentation updates

## Notes
- ElevenLabs may have specific prompt format requirements
- Consider future extensibility for different limits
- Monitor actual prompt lengths in production
- Consider A/B testing different truncation strategies
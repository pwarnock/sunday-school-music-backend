# TODO: Lyrics Editing Feature

## Overview
Implement the ability for users to edit song lyrics after creation, with edit history tracking.

## Requirements

### 1. Make Lyrics Editable
- Add an "Edit" button to song cards in the Dashboard
- Create an inline editor or modal for editing lyrics
- Show character count in real-time while editing
- Validate against 2000 character limit during editing
- Save edited lyrics to database

### 2. Edit History
- Track all versions of lyrics for each song
- Store edit timestamp and user who made the edit
- Allow users to view previous versions
- Option to revert to a previous version

### 3. UI/UX Considerations
- Clear indication when lyrics have been edited
- Show "Last edited: [date]" on song cards
- Character counter during editing (with color coding)
- Warning before saving if lyrics are truncated for music generation
- Diff view to compare versions (optional)

## Database Schema Changes Needed

### Option 1: Separate History Table
```sql
CREATE TABLE song_lyrics_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  lyrics TEXT NOT NULL,
  edited_by UUID REFERENCES profiles(id),
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version_number INTEGER NOT NULL,
  is_current BOOLEAN DEFAULT FALSE
);
```

### Option 2: JSON Array in Songs Table
- Add `lyrics_history` JSONB column to songs table
- Store array of {lyrics, edited_at, edited_by, version}

## Implementation Notes

### Frontend
- Update Dashboard component to handle edit mode
- Create LyricsEditor component with character counting
- Add history viewer component

### Backend
- API endpoint for updating lyrics
- API endpoint for fetching lyrics history
- Ensure proper authorization (only song owner can edit)

### Character Limit Handling
- Show real-time character count during editing
- If edited lyrics exceed 2000 chars when generating music:
  - Use truncated version for ElevenLabs
  - Show clear message about truncation
  - Store full version in database

## Priority
Medium - This enhances user experience but system works without it

## Related Issues
- Character limit implementation (completed)
- Regenerate button missing character limit check (identified bug)
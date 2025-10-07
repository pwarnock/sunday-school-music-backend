# Spec-Driven Prompt: Sunday School Music Creator

## Application Overview
**Product**: Interactive music creation tool for school-age children with guided chat interface, verse identification, lyric development, and AI song generation.

**Core User Journey**: 
1. Child + adult guardian open app → 2. Guided chat helps identify/create verse → 3. Collaborative lyric development → 4. Song generation via ElevenLabs → 5. Playback and sharing

## Technical Architecture

**Frontend (Lovable)**
- React-based responsive design (mobile-first)
- Real-time chat interface with typing indicators
- Audio player component for generated songs
- Credit/usage tracking dashboard
- Simple authentication flow

**Backend (Supabase)**
- User management with email capture
- Conversation persistence
- Credit system tracking
- Song generation queue management
- Usage analytics

**External Integrations**
- Gloo AI for Sunday school teacher agent
- ElevenLabs for song generation
- Email service for opt-in communications

## Development Chunks (<1 hour each)

### Chunk 1: Core Setup & Authentication (45-50 min)
- Initialize Lovable project with responsive layout
- Set up Supabase project with basic auth
- Implement email/password signup with opt-in checkbox
- Create simple landing page with "Start Creating" CTA

### Chunk 2: Basic Chat Interface (45-50 min)
- Build chat UI component with message bubbles
- Implement real-time message display
- Add typing indicators and basic animations
- Create conversation persistence in Supabase

### Chunk 3: Gloo AI Integration (45-50 min)
- Set up Gloo AI API connection with Sunday school teacher persona
- Implement message routing to/from Gloo AI
- Add conversation context management
- Handle API authentication and error states

### Chunk 4: Credit System Foundation (45-50 min)
- Design credits table in Supabase
- Implement credit allocation for new users
- Create credit tracking middleware
- Build basic credit display component

### Chunk 5: ElevenLabs Integration (45-50 min)
- Set up ElevenLabs API integration
- Create song generation queue system
- Implement audio file storage in Supabase
- Add generation status tracking

### Chunk 6: Audio Playback & Polish (45-50 min)
- Build audio player component
- Add song history/library view
- Implement basic error handling
- Mobile responsiveness testing and fixes

## Database Schema (Supabase)

```sql
-- Users table (extends Supabase auth.users)
users_profile (
  id uuid references auth.users,
  email text,
  opted_in_communications boolean,
  credits_remaining integer default 3,
  created_at timestamp
);

-- Conversations
conversations (
  id uuid primary key,
  user_id uuid references users_profile(id),
  title text,
  status text, -- 'active', 'completed'
  created_at timestamp
);

-- Messages
messages (
  id uuid primary key,
  conversation_id uuid references conversations(id),
  role text, -- 'user', 'assistant', 'system'
  content text,
  created_at timestamp
);

-- Generated Songs
generated_songs (
  id uuid primary key,
  conversation_id uuid references conversations(id),
  user_id uuid references users_profile(id),
  lyrics text,
  audio_url text,
  credits_used integer default 1,
  generation_status text, -- 'pending', 'completed', 'failed'
  created_at timestamp
);
```

## Key Technical Decisions

**Authentication Strategy**: Supabase Auth with email/password, optional social login later
**State Management**: React Context for chat state, Supabase real-time for persistence
**Audio Storage**: Supabase Storage buckets with CDN delivery
**Credit System**: Simple integer-based with Supabase RLS policies
**Mobile Strategy**: Progressive Web App with responsive design

## Gloo AI Agent Persona Prompt
```
You are a warm, encouraging Sunday school teacher helping children create meaningful songs. Guide conversations to:
1. Identify biblical verses or themes the child connects with
2. Ask simple questions to understand their interests
3. Help develop age-appropriate lyrics with positive messages
4. Keep interactions safe, educational, and fun
5. Always involve the supervising adult in decisions
6. Suggest rhyming words and simple song structures
Maintain a patient, nurturing tone while being creative and engaging.
```

## Cost Optimization Strategy
- Free tier: 3 song generations per user
- Credit purchase options for additional generations
- Queue system to batch ElevenLabs requests
- Caching for repeated verse/theme combinations

## Success Metrics for Hackathon
- **Functionality**: Complete user journey from signup to song generation
- **Scalability**: Database design supports 1000+ concurrent users
- **Cost Efficiency**: Credit system prevents runaway API costs
- **User Experience**: <3 second response times, intuitive mobile interface
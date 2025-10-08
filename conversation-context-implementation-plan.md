# Conversation Context Implementation Plan

## Current Analysis Status: PARTIAL - In Progress

### Completed Analysis:
✅ **Current Chat Implementation Structure**
- Found two chat APIs: `/api/chat/route.ts` (basic) and `/api/chat-enhanced/route.ts` (with Bible integration)
- Database schema exists with `chat_sessions` and `chat_messages` tables
- Messages are being saved but not used for context in AI responses
- Current flow: User message → Save to DB → Generate AI response (stateless) → Save AI response

### Key Problem Identified:
**No conversation context is passed to the AI model**. Each request to Gloo AI is independent, causing the agent to lose track of previous conversation topics, user preferences, and ongoing discussions.

## Implementation Plan Overview

### Phase 1: Basic Context Implementation
1. **Retrieve Conversation History**
   - Modify API to load recent messages from current session
   - Limit to last 10-15 messages to avoid token limits
   - Format messages for AI model consumption

2. **Build Contextual System Prompt**
   - Create system prompt that includes conversation history
   - Add context about the user's age/preferences (when available)
   - Include Sunday School teaching guidelines

3. **Update Gloo Client**
   - Modify `generateSongLyrics` method to accept conversation context
   - Use `chat()` method instead for better context handling
   - Implement proper message formatting

### Phase 2: Enhanced Context Management
1. **Conversation Summarization**
   - Add table for storing conversation summaries
   - Periodically summarize long conversations
   - Include key topics, preferences, and learning progress

2. **User Profile Integration**
   - Add age and preferences to user profiles
   - Adapt language complexity based on age
   - Track learning progress and interests

## Detailed Technical Plan

### Database Schema Changes (Optional Enhancement)
```sql
-- Add conversation context table for summaries
CREATE TABLE conversation_context (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    context_summary TEXT,
    topics_discussed TEXT[],
    user_preferences JSONB,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user profile enhancements
ALTER TABLE auth.users ADD COLUMN age INTEGER;
ALTER TABLE auth.users ADD COLUMN interests TEXT[];
ALTER TABLE auth.users ADD COLUMN learning_progress JSONB;
```

### API Modifications Required

#### 1. Update Chat API Endpoint
**File**: `frontend/src/app/api/chat-enhanced/route.ts` (or create new endpoint)

**Changes needed**:
```typescript
// Add function to retrieve conversation history
async function getConversationHistory(sessionId: string, limit = 10) {
  const { data: messages } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return messages?.reverse() || []; // Reverse to get chronological order
}

// Add function to build contextual system prompt
function buildSystemPrompt(conversationHistory: any[], userAge?: number) {
  let prompt = `You are a Sunday School assistant helping children learn about faith through songs and Bible stories. `;
  
  if (userAge) {
    prompt += `The child you're talking to is ${userAge} years old, so adjust your language accordingly. `;
  }
  
  if (conversationHistory.length > 0) {
    prompt += `Here's our conversation so far:\n\n`;
    conversationHistory.forEach(msg => {
      prompt += `${msg.role}: ${msg.content}\n`;
    });
    prompt += `\nPlease continue the conversation naturally, remembering what we've discussed.`;
  }
  
  return prompt;
}
```

#### 2. Update Gloo Client Usage
**File**: `frontend/src/lib/gloo/client.ts`

**Changes needed**:
```typescript
// Add new method for contextual chat
async chatWithContext(
  userMessage: string, 
  conversationHistory: any[] = [], 
  userAge?: number
): Promise<GlooResponse> {
  const systemPrompt = buildSystemPrompt(conversationHistory, userAge);
  const messages = [
    { role: 'user' as const, content: userMessage }
  ];
  
  return this.chat(messages, systemPrompt);
}
```

### Implementation Steps

#### Step 1: Basic Context (Immediate)
1. **Modify chat-enhanced API**:
   - Add `getConversationHistory()` function
   - Add `buildSystemPrompt()` function
   - Update POST handler to use context

2. **Update Gloo client**:
   - Add `chatWithContext()` method
   - Ensure proper message formatting

3. **Test basic context**:
   - Verify AI remembers previous messages
   - Check conversation flow feels natural

#### Step 2: Enhanced Context (Follow-up)
1. **Add user age tracking**:
   - Update user profile schema
   - Collect age during onboarding
   - Use age for language adaptation

2. **Implement conversation summarization**:
   - Add context table
   - Summarize long conversations
   - Store key topics and preferences

#### Step 3: Advanced Features (Future)
1. **Learning progress tracking**
2. **Personalized content recommendations**
3. **Safety monitoring and alerts**

## How to Resume Implementation

### Immediate Next Steps:
1. **Choose which API to enhance**: 
   - Recommend using `chat-enhanced` as the base
   - It already has Bible integration

2. **Implement Step 1 changes**:
   ```bash
   # Start with the API modification
   # Edit frontend/src/app/api/chat-enhanced/route.ts
   
   # Then update the Gloo client
   # Edit frontend/src/lib/gloo/client.ts
   
   # Test the changes
   cd frontend && npm run dev
   ```

3. **Test conversation flow**:
   - Start a chat session
   - Send multiple messages
   - Verify AI remembers context

### Files to Modify (Priority Order):
1. `frontend/src/app/api/chat-enhanced/route.ts` - Add context retrieval
2. `frontend/src/lib/gloo/client.ts` - Add contextual chat method
3. `frontend/src/components/ChatInterface.tsx` - Update to use enhanced API
4. Database migrations (optional) - Add context tables

### Success Criteria:
- [ ] AI remembers previous messages in same session
- [ ] Conversation feels natural and continuous
- [ ] No performance degradation
- [ ] Context is properly formatted for AI model

## Current Status: Ready to Begin Implementation

**Last Updated**: 2025-10-07  
**Next Action**: Implement Step 1 - Basic Context in chat-enhanced API  
**Estimated Time**: 2-3 hours for basic implementation  

---

## Notes:
- Current implementation saves messages but doesn't use them for context
- Database schema already supports conversation sessions
- Main work is in API logic and Gloo client integration
- Should maintain backward compatibility with existing chat functionality
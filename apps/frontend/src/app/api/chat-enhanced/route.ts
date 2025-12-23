// Enhanced chat API with MCP-style Bible integration
import { NextRequest, NextResponse } from 'next/server'
import { createClient, glooClient, detectBibleReferences, shouldLookupBibleVerse } from '@sunday-school/lib'
import { getMarkdownPromptLoader } from '@sunday-school/lib/prompts/markdown-loader'

/**
 * Bible MCP-style functions
 * These simulate MCP calls but use external APIs for reliability
 */
class ChatBibleMCP {
  private async getBibleVerse(book: string, chapter: number, verse: number, translation = 'web') {
    try {
      const reference = `${book} ${chapter}:${verse}`
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch verse: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.text?.trim() || 'Verse not found'
    } catch (error) {
      console.error('Bible API error:', error)
      return `Could not fetch ${book} ${chapter}:${verse}`
    }
  }

  private async getBibleChapter(book: string, chapter: number, translation = 'web') {
    try {
      const reference = `${book} ${chapter}`
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(reference)}?translation=${translation}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch chapter: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data.text?.trim() || 'Chapter not found'
    } catch (error) {
      console.error('Bible API error:', error)
      return `Could not fetch ${book} ${chapter}`
    }
  }

  /**
   * Process Bible references in message
   */
  async processBibleReferences(message: string): Promise<string> {
    const references = detectBibleReferences(message)
    
    if (references.length === 0) {
      return ''
    }

    const scriptureApiEnabled = process.env.ENABLE_SCRIPTURE_API === 'true'
    
    if (!scriptureApiEnabled) {
      // Fallback: Just list the references without fetching content
      let bibleText = '**Scripture References:**\n\n'
      references.forEach(ref => {
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
        bibleText += `**${reference}**\n\n`
      })
      return bibleText
    }

    let bibleText = '**Scripture References:**\n\n'
    
    for (const ref of references) {
      try {
        let verseText: string
        
        if (ref.verse) {
          verseText = await this.getBibleVerse(ref.book, ref.chapter, ref.verse)
        } else {
          verseText = await this.getBibleChapter(ref.book, ref.chapter)
        }
        
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
          
        bibleText += `**${reference} (WEB)**\n"${verseText}"\n\n`
        
      } catch (error) {
        console.error('Error processing Bible reference:', error)
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
        bibleText += `**${reference}** - Reference noted\n\n`
      }
    }
    
    return bibleText
  }

  /**
   * Process ALL Bible references from entire conversation
   */
  async processAllReferences(allMessages: string[]): Promise<string> {
    // Collect all unique Bible references from all messages
    const allReferences: ReturnType<typeof detectBibleReferences> = []
    const seenReferences = new Set<string>()
    
    for (const message of allMessages) {
      const refs = detectBibleReferences(message)
      for (const ref of refs) {
        const refKey = `${ref.book}-${ref.chapter}-${ref.verse || 0}-${ref.endVerse || 0}`
        if (!seenReferences.has(refKey)) {
          seenReferences.add(refKey)
          allReferences.push(ref)
        }
      }
    }
    
    if (allReferences.length === 0) {
      return ''
    }

    const scriptureApiEnabled = process.env.ENABLE_SCRIPTURE_API === 'true'
    
    if (!scriptureApiEnabled) {
      // Fallback: Just list the references without fetching content
      let bibleText = '**Scripture References:**\n\n'
      allReferences.forEach(ref => {
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
        bibleText += `**${reference}**\n\n`
      })
      return bibleText
    }

    let bibleText = '**Scripture References:**\n\n'
    
    for (const ref of allReferences) {
      try {
        let verseText: string
        
        if (ref.verse) {
          verseText = await this.getBibleVerse(ref.book, ref.chapter, ref.verse)
        } else {
          verseText = await this.getBibleChapter(ref.book, ref.chapter)
        }
        
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
          
        bibleText += `**${reference} (WEB)**\n"${verseText}"\n\n`
        
      } catch (error) {
        console.error('Error processing Bible reference:', error)
        const reference = ref.verse 
          ? `${ref.book} ${ref.chapter}:${ref.verse}${ref.endVerse ? `-${ref.endVerse}` : ''}`
          : `${ref.book} ${ref.chapter}`
        bibleText += `**${reference}** - Reference noted\n\n`
      }
    }
    
    return bibleText
  }
}

const chatBibleMCP = new ChatBibleMCP()

interface ChatMessage {
  role: string
  content: string
  created_at: string
}

/**
 * Retrieve conversation context from database
 */
async function getConversationContext(supabase: Awaited<ReturnType<typeof createClient>>, sessionId: string, limit = 10): Promise<ChatMessage[]> {
  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('role, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching conversation context:', error)
    return []
  }

  return messages || []
}

/**
 * Build system prompt with conversation context
 */
/**
 * Extract all Bible references from conversation history
 */
function extractBibleReferencesFromHistory(conversationHistory: ChatMessage[]): string[] {
  const allReferences: string[] = []
  const referencePattern = /\*\*([^*]+(?:\d+:\d+(?:-\d+)?)?)\s*\([^)]+\)\*\*/g
  
  conversationHistory.forEach(msg => {
    // Only extract references from user messages to avoid picking up examples from assistant
    if (msg.role === 'user') {
      const matches = [...msg.content.matchAll(referencePattern)]
      matches.forEach(match => {
        const reference = match[1].trim()
        if (!allReferences.includes(reference)) {
          allReferences.push(reference)
        }
      })
    }
  })
  
  return allReferences
}

function buildSystemPrompt(conversationHistory: ChatMessage[], hasBibleContent: boolean): string {
  const loader = getMarkdownPromptLoader()
  const prompt = loader.loadPromptByVersion('2.1')
  let systemPrompt = prompt?.content || ''
  
  // Debug logging to verify which prompt is being used
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🔍 CHAT API DEBUG - Prompt Being Used:`)
    console.log(`   Version: ${prompt?.metadata.version}`)
    console.log(`   Description: ${prompt?.metadata.description}`)
    console.log(`   First 200 chars: ${systemPrompt.substring(0, 200)}...`)
    console.log(`   Total length: ${systemPrompt.length} characters\n`)
  }

  if (hasBibleContent || conversationHistory.length > 0) {
    const allBibleRefs = extractBibleReferencesFromHistory(conversationHistory)
    if (allBibleRefs.length > 0) {
      systemPrompt += `\n\nBible verses referenced in this conversation: ${allBibleRefs.join(', ')}. When creating songs, incorporate ALL these Bible references, not just the most recent one. Include all scripture references in your response.`
    } else if (hasBibleContent) {
      systemPrompt += `\n\nBible verses have been provided as context. Use them to create relevant songs or discussions.`
    }
  }

  if (conversationHistory.length > 0) {
    systemPrompt += `\n\nConversation context:\n`
    conversationHistory.forEach((msg, index) => {
      if (index < 8) { // Limit context to prevent token overflow
        // Extract and preserve Bible references from previous messages
        const content = msg.content
        const bibleReferencePattern = /\*\*([^*]+(?:\d+:\d+(?:-\d+)?)?)\s*\([^)]+\)\*\*/g
        const bibleReferences = [...content.matchAll(bibleReferencePattern)]
        
        let contextContent = content.substring(0, 400) // Increased from 200 to preserve more context
        
        // If we found Bible references, make sure they're included
        if (bibleReferences.length > 0 && contextContent.length < content.length) {
          const allRefs = bibleReferences.map(match => match[1]).join(', ')
          contextContent += `... [Also referenced: ${allRefs}]`
        }
        
        systemPrompt += `${msg.role}: ${contextContent}${content.length > 400 ? '...' : ''}\n`
      }
    })
  }

  return systemPrompt
}

/**
 * Enhanced chat endpoint with Bible MCP integration and conversation context
 */
export async function POST(request: NextRequest) {
  console.log('\n🚀 CHAT-ENHANCED API CALLED')
  
  // Test prompt loading immediately
  const loader = getMarkdownPromptLoader()
  const prompt = loader.loadPromptByVersion('2.1')
  console.log(`📋 Prompt System Check:`)
  console.log(`   Version: ${prompt?.metadata.version}`)
  console.log(`   Description: ${prompt?.metadata.description}`)
  console.log(`   Author: ${prompt?.metadata.author}\n`)
  
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, sessionId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Create or get session ID
    let activeSessionId = sessionId
    if (!activeSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id })
        .select()
        .single()
      
      if (sessionError) {
        console.error('Session creation error:', sessionError)
        return NextResponse.json({ error: 'Failed to create chat session' }, { status: 500 })
      }
      
      activeSessionId = newSession.id
    }

    // Get conversation context BEFORE saving the new message
    const conversationHistory = await getConversationContext(supabase, activeSessionId, 10)

    // Save user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        role: 'user',
        content: message
      })

    let responseContent = ''
    let bibleContent = ''

    // Check if this is a Bible-related request
    const hasBibleContent = shouldLookupBibleVerse(message)
    
    // Collect all Bible references from conversation history
    const historicalRefs = extractBibleReferencesFromHistory(conversationHistory)
    
    if (hasBibleContent || historicalRefs.length > 0) {
      // Always show ALL Bible references (current + historical) in the Scripture References block
      const allMessages = [...conversationHistory.map(msg => msg.content), message]
      bibleContent = await chatBibleMCP.processAllReferences(allMessages)
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(conversationHistory, hasBibleContent)

    // Prepare the current message with any Bible content
    const currentMessage = bibleContent 
      ? `${message}\n\n${bibleContent}`
      : message

    try {
      // Use the working client approach
      const messages = [{ role: 'user' as const, content: currentMessage }]
      
      const glooResponse = await glooClient.chat(messages, systemPrompt)
      
      if (glooResponse.error) {
        console.error('Gloo API returned error:', glooResponse.error)
        responseContent = 'Sorry, I encountered an error generating a response.'
      } else {
        responseContent = glooResponse.message || 'Sorry, I encountered an error generating a response.'
        
        // If we have Bible content, prepend it to the response for display
        if (bibleContent && hasBibleContent) {
          responseContent = bibleContent + '\n---\n\n' + responseContent
        }
      }
    } catch (error) {
      console.error('Chat generation error:', error)
      responseContent = 'Sorry, I encountered an error generating a response.'
    }

    // Save assistant response
    await supabase
      .from('chat_messages')
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        role: 'assistant',
        content: responseContent
      })

    return NextResponse.json({
      message: responseContent,
      sessionId: activeSessionId,
      hasBibleContent: hasBibleContent
    })

  } catch (error) {
    console.error('Enhanced chat API error:', error)
    return NextResponse.json({ 
      error: 'Failed to process chat message' 
    }, { status: 500 })
  }
}
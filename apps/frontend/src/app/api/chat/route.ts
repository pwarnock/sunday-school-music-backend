import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sunday-school/lib'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, role, content } = await request.json()

    // If no sessionId, create a new session
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

    // Save the message
    const { data: message, error: messageError } = await supabase
      .from('chat_messages')
      .insert({
        session_id: activeSessionId,
        user_id: user.id,
        role,
        content
      })
      .select()
      .single()

    if (messageError) {
      console.error('Message save error:', messageError)
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    return NextResponse.json({ 
      message,
      sessionId: activeSessionId 
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (sessionId) {
      // Get messages for a specific session
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
      }

      return NextResponse.json({ messages })
    } else {
      // Get all sessions for the user
      const { data: sessions, error } = await supabase
        .from('chat_sessions')
        .select('*, chat_messages(count)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Database error:', error)
        return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
      }

      return NextResponse.json({ sessions })
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '@sunday-school/ui'
import { Send, Music } from 'lucide-react'
import MarkdownRenderer from './MarkdownRenderer'
import { trackActivity } from '@/hooks/useStreakTracker'
import { siteConfig } from '@sunday-school/lib'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onSongGenerated?: (lyrics: string, theme: string) => void
}

export default function ChatInterface({ onSongGenerated }: ChatInterfaceProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Track chat start when component mounts and get AI greeting
  useEffect(() => {
    trackActivity('chat_started')
    
    // Get initial greeting from AI based on current prompt
    const getInitialGreeting = async () => {
      try {
        const response = await fetch('/api/chat-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: "Please introduce yourself and explain how you can help create Sunday School songs. Be welcoming and specific about your capabilities.",
            sessionId: null
          })
        })

        if (response.ok) {
          const data = await response.json()
          setSessionId(data.sessionId)
          setMessages([{
            role: 'assistant',
            content: data.message,
            timestamp: new Date()
          }])
        } else {
          // Fallback greeting if API fails
          setMessages([{
            role: 'assistant',
            content: "Hello! I'm here to help you create Scripture memorization songs for Sunday School. Share a Bible verse you'd like children to memorize, and I'll create a joyful song that makes learning God's Word fun and easy!",
            timestamp: new Date()
          }])
        }
      } catch (error) {
        console.error('Failed to get initial greeting:', error)
        // Fallback greeting
        setMessages([{
          role: 'assistant',
          content: "Hello! I'm here to help you create Scripture memorization songs for Sunday School. Share a Bible verse you'd like children to memorize, and I'll create a joyful song that makes learning God's Word fun and easy!",
          timestamp: new Date()
        }])
      } finally {
        setInitializing(false)
      }
    }

    getInitialGreeting()
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input.trim()
    setInput('')
    setLoading(true)

    try {
      // Use the enhanced chat API with conversation context
      const response = await fetch('/api/chat-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userInput,
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Update session ID if this is a new session
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId)
      }

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Track message sent activity
      trackActivity('message_sent', { 
        messageLength: userInput.length,
        sessionId: sessionId || data.sessionId 
      })

      // Check if this looks like song lyrics and notify parent
      if (data.message.toLowerCase().includes('verse') || 
          data.message.toLowerCase().includes('chorus') ||
          data.message.toLowerCase().includes('title')) {
        onSongGenerated?.(data.message, userInput)
      }

    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card className="h-[600px] flex flex-col shadow-lg border-0 overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground px-6 py-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Music className="w-5 h-5" />
          {siteConfig.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-6 space-y-4 bg-background chat-scroll">
        {initializing ? (
          <div className="flex justify-center items-center h-full">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Preparing your Scripture song assistant...</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
              >
                <div
                  className={`chat-bubble ${
                    message.role === 'user'
                      ? 'chat-bubble-user'
                      : 'chat-bubble-assistant'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <div className="text-[15px]">{message.content}</div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
        {loading && (
          <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <div className="chat-bubble chat-bubble-assistant flex items-center gap-2">
              <span className="loading-dots flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full"></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full"></span>
                <span className="w-2 h-2 bg-muted-foreground/50 rounded-full"></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <div className="border-t border-border bg-card p-4">
        <div className="flex space-x-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="✨ Share a Bible verse for children to memorize..."
            disabled={loading}
            className="flex-1 text-[15px] border-border focus:border-ring focus:ring-ring"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  )
}
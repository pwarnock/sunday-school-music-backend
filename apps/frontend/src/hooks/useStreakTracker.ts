'use client'

import { useEffect, useRef, useCallback } from 'react'

export type ActivityEventType = 'visit' | 'message_sent' | 'song_generated' | 'chat_started' | 'session_ended'

interface UseStreakTrackerOptions {
  trackVisits?: boolean
  trackPageChanges?: boolean
}

export function useStreakTracker(options: UseStreakTrackerOptions = {}) {
  const { trackVisits = true, trackPageChanges = false } = options
  const hasTrackedVisit = useRef(false)
  
  // Check if feature is enabled
  const isEnabled = process.env.NEXT_PUBLIC_ENABLE_DAILY_STREAKS === 'true'

  const trackActivity = useCallback(async (eventType: ActivityEventType, eventData?: unknown) => {
    // Skip if feature is disabled
    if (!isEnabled) return
    
    try {
      const response = await fetch('/api/streaks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: eventType,
          event_data: eventData
        })
      })

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, silently skip tracking
          return
        }
        console.warn('Failed to track activity:', await response.text())
      }
    } catch (error) {
      console.warn('Error tracking activity:', error)
    }
  }, [isEnabled])

  // Track user visit when component mounts
  useEffect(() => {
    if (isEnabled && trackVisits && !hasTrackedVisit.current) {
      trackActivity('visit')
      hasTrackedVisit.current = true
    }
  }, [trackVisits, isEnabled, trackActivity])

  // Track page visibility changes (optional)
  useEffect(() => {
    if (!trackPageChanges) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        trackActivity('visit')
      } else {
        trackActivity('session_ended')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [trackPageChanges, trackActivity])

  return { trackActivity }
}

// Standalone function for tracking activities
export async function trackActivity(eventType: ActivityEventType, eventData?: unknown) {
  try {
    const response = await fetch('/api/streaks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        event_data: eventData
      })
    })

    if (!response.ok) {
      // Silently fail if streak tracking isn't available yet
      console.warn('Streak tracking not available:', await response.text())
    }
  } catch (error) {
    // Silently fail - don't break the app if streak tracking fails
    console.warn('Streak tracking error:', error)
  }
}
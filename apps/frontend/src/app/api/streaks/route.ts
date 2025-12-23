import { NextRequest, NextResponse } from 'next/server'
import { createClient, streakTracker, ActivityEventType } from '@sunday-school/lib'

export async function GET(request: NextRequest) {
  // Check if feature is enabled
  if (process.env.ENABLE_DAILY_STREAKS !== 'true') {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const url = new URL(request.url)
    const action = url.searchParams.get('action')

    switch (action) {
      case 'stats':
        try {
          const stats = await streakTracker.getStreakStats(userId)
          return NextResponse.json(stats)
        } catch (statsError) {
          console.error('Error getting streak stats:', statsError)
          return NextResponse.json(
            { error: 'Failed to get streak stats', details: statsError instanceof Error ? statsError.message : 'Unknown error' },
            { status: 500 }
          )
        }

      case 'daily':
        const startDate = url.searchParams.get('start_date') || 
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const endDate = url.searchParams.get('end_date') || 
          new Date().toISOString().split('T')[0]
        
        const dailyActivities = await streakTracker.getDailyActivities(userId, startDate, endDate)
        return NextResponse.json(dailyActivities)

      case 'events':
        const limit = parseInt(url.searchParams.get('limit') || '20')
        const events = await streakTracker.getRecentEvents(userId, limit)
        return NextResponse.json(events)

      default:
        const streakData = await streakTracker.getStreakData(userId)
        return NextResponse.json(streakData)
    }

  } catch (error) {
    console.error('Error in streak API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Check if feature is enabled
  if (process.env.ENABLE_DAILY_STREAKS !== 'true') {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const { event_type, event_data } = body

    // Validate event type
    const validEventTypes: ActivityEventType[] = ['visit', 'message_sent', 'song_generated', 'chat_started', 'session_ended']
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      )
    }

    await streakTracker.logActivity(userId, event_type, event_data)

    // Return updated streak data
    const updatedStreakData = await streakTracker.getStreakData(userId)
    
    return NextResponse.json({
      success: true,
      streak_data: updatedStreakData
    })

  } catch (error) {
    console.error('Error logging activity:', error)
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  // Check if feature is enabled
  if (process.env.ENABLE_DAILY_STREAKS !== 'true') {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id
    const body = await request.json()
    const { action, date } = body

    if (action === 'recalculate') {
      await streakTracker.recalculateStreaks(userId, date)
      const updatedStreakData = await streakTracker.getStreakData(userId)
      
      return NextResponse.json({
        success: true,
        streak_data: updatedStreakData
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error in streak PUT API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
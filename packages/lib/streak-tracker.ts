import { createClient } from './supabase/server'

export interface StreakData {
  currentVisitStreak: number
  longestVisitStreak: number
  currentActivityStreak: number
  longestActivityStreak: number
  lastVisitDate: string | null
  lastActivityDate: string | null
  totalVisits: number
  totalActivities: number
}

export interface DailyActivity {
  activityDate: string
  visitCount: number
  messagesSent: number
  songsGenerated: number
  chatSessions: number
  totalTimeMinutes: number
  firstVisitAt: string | null
  lastActivityAt: string | null
}

export type ActivityEventType = 'visit' | 'message_sent' | 'song_generated' | 'chat_started' | 'session_ended'

export class StreakTracker {
  private async getSupabase() {
    return await createClient()
  }

  /**
   * Log an activity event and update streak calculations
   */
  async logActivity(userId: string, eventType: ActivityEventType, eventData?: unknown): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const today = new Date().toISOString().split('T')[0]
      const now = new Date().toISOString()

      // Log the event
      const { error: eventError } = await supabase
        .from('activity_events')
        .insert({
          user_id: userId,
          event_type: eventType,
          event_data: eventData || null,
          created_at: now
        })

      if (eventError) {
        console.error('Error logging activity event:', eventError)
        // Continue even if event logging fails
      }

      // Update daily activity stats
      const updateData: Record<string, unknown> = {
        user_id: userId,
        activity_date: today,
        last_activity_at: now,
        updated_at: now
      }

      switch (eventType) {
        case 'visit':
          updateData.visit_count = 1
          updateData.first_visit_at = now
          break
        case 'message_sent':
          updateData.messages_sent = 1
          break
        case 'song_generated':
          updateData.songs_generated = 1
          break
        case 'chat_started':
          updateData.chat_sessions = 1
          break
      }

      // Upsert daily activity - first try to update existing record
      const { data: existing } = await supabase
        .from('daily_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('activity_date', today)
        .single()

      if (existing) {
        // Update existing record
        const updates: Record<string, unknown> = {
          last_activity_at: now,
          updated_at: now
        }
        
        switch (eventType) {
          case 'visit':
            updates.visit_count = (existing.visit_count || 0) + 1
            if (!existing.first_visit_at) {
              updates.first_visit_at = now
            }
            break
          case 'message_sent':
            updates.messages_sent = (existing.messages_sent || 0) + 1
            break
          case 'song_generated':
            updates.songs_generated = (existing.songs_generated || 0) + 1
            break
          case 'chat_started':
            updates.chat_sessions = (existing.chat_sessions || 0) + 1
            break
        }
        
        const { error: updateError } = await supabase
          .from('daily_activities')
          .update(updates)
          .eq('user_id', userId)
          .eq('activity_date', today)
        
        if (updateError) {
          console.error('Error updating daily activities:', updateError)
          throw updateError
        }
      } else {
        // Insert new record
        const { error: insertError } = await supabase
          .from('daily_activities')
          .insert(updateData)
        
        if (insertError) {
          console.error('Error inserting daily activities:', insertError)
          throw insertError
        }
      }

      // Update streak calculations (simplified version)
      await this.updateStreakCalculations(userId, today)

    } catch (error) {
      console.error('Failed to log activity:', error)
      throw error
    }
  }

  /**
   * Update streak calculations (simplified TypeScript version)
   */
  private async updateStreakCalculations(userId: string, date: string): Promise<void> {
    try {
      const supabase = await this.getSupabase()
      const yesterday = new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000)
        .toISOString().split('T')[0]

      // Get today's activity
      const { data: todayActivity } = await supabase
        .from('daily_activities')
        .select('visit_count, messages_sent, songs_generated, chat_sessions')
        .eq('user_id', userId)
        .eq('activity_date', date)
        .single()

      const hasVisit = (todayActivity?.visit_count || 0) > 0
      const hasActivity = ((todayActivity?.messages_sent || 0) + 
                          (todayActivity?.songs_generated || 0) + 
                          (todayActivity?.chat_sessions || 0)) > 0

      // Get current streak data
      const { data: currentStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single()

      let visitStreak = 0
      let activityStreak = 0

      if (hasVisit) {
        if (currentStreak?.last_visit_date === yesterday) {
          visitStreak = (currentStreak.current_visit_streak || 0) + 1
        } else {
          visitStreak = 1
        }
      } else {
        visitStreak = currentStreak?.current_visit_streak || 0
      }

      if (hasActivity) {
        if (currentStreak?.last_activity_date === yesterday) {
          activityStreak = (currentStreak.current_activity_streak || 0) + 1
        } else {
          activityStreak = 1
        }
      } else {
        activityStreak = currentStreak?.current_activity_streak || 0
      }

      // Upsert streak data
      const streakData = {
        user_id: userId,
        current_visit_streak: visitStreak,
        current_activity_streak: activityStreak,
        longest_visit_streak: Math.max(visitStreak, currentStreak?.longest_visit_streak || 0),
        longest_activity_streak: Math.max(activityStreak, currentStreak?.longest_activity_streak || 0),
        last_visit_date: hasVisit ? date : currentStreak?.last_visit_date,
        last_activity_date: hasActivity ? date : currentStreak?.last_activity_date,
        total_visits: (currentStreak?.total_visits || 0) + (hasVisit ? 1 : 0),
        total_activities: (currentStreak?.total_activities || 0) + (hasActivity ? 1 : 0),
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('user_streaks')
        .upsert(streakData, { onConflict: 'user_id' })

      if (error) {
        console.error('Error updating streaks:', error)
        throw error
      }

    } catch (error) {
      console.error('Failed to update streak calculations:', error)
      throw error
    }
  }

  /**
   * Get current streak data for a user
   */
  async getStreakData(userId: string): Promise<StreakData | null> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('user_streaks')
        .select(`
          current_visit_streak,
          longest_visit_streak,
          current_activity_streak,
          longest_activity_streak,
          last_visit_date,
          last_activity_date,
          total_visits,
          total_activities
        `)
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching streak data:', error)
        throw error
      }

      if (!data) {
        return {
          currentVisitStreak: 0,
          longestVisitStreak: 0,
          currentActivityStreak: 0,
          longestActivityStreak: 0,
          lastVisitDate: null,
          lastActivityDate: null,
          totalVisits: 0,
          totalActivities: 0
        }
      }

      return {
        currentVisitStreak: data.current_visit_streak || 0,
        longestVisitStreak: data.longest_visit_streak || 0,
        currentActivityStreak: data.current_activity_streak || 0,
        longestActivityStreak: data.longest_activity_streak || 0,
        lastVisitDate: data.last_visit_date,
        lastActivityDate: data.last_activity_date,
        totalVisits: data.total_visits || 0,
        totalActivities: data.total_activities || 0
      }
    } catch (error) {
      console.error('Failed to get streak data:', error)
      throw error
    }
  }

  /**
   * Get daily activity data for a user within a date range
   */
  async getDailyActivities(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<DailyActivity[]> {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('daily_activities')
        .select(`
          activity_date,
          visit_count,
          messages_sent,
          songs_generated,
          chat_sessions,
          total_time_minutes,
          first_visit_at,
          last_activity_at
        `)
        .eq('user_id', userId)
        .gte('activity_date', startDate)
        .lte('activity_date', endDate)
        .order('activity_date', { ascending: false })

      if (error) {
        console.error('Error fetching daily activities:', error)
        throw error
      }

      return (data || []).map((activity: {
        activity_date: string;
        visit_count: number;
        messages_sent: number;
        songs_generated: number;
        chat_sessions: number;
        total_time_minutes: number;
        first_visit_at: string | null;
        last_activity_at: string | null;
      }) => ({
        activityDate: activity.activity_date,
        visitCount: activity.visit_count || 0,
        messagesSent: activity.messages_sent || 0,
        songsGenerated: activity.songs_generated || 0,
        chatSessions: activity.chat_sessions || 0,
        totalTimeMinutes: activity.total_time_minutes || 0,
        firstVisitAt: activity.first_visit_at,
        lastActivityAt: activity.last_activity_at
      }))
    } catch (error) {
      console.error('Failed to get daily activities:', error)
      throw error
    }
  }

  /**
   * Get recent activity events for a user
   */
  async getRecentEvents(userId: string, limit: number = 20) {
    try {
      const supabase = await this.getSupabase()
      const { data, error } = await supabase
        .from('activity_events')
        .select(`
          event_type,
          event_data,
          created_at
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent events:', error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Failed to get recent events:', error)
      throw error
    }
  }

  /**
   * Force recalculate streaks for a user (useful for data fixes)
   */
  async recalculateStreaks(userId: string, date?: string): Promise<void> {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0]
      await this.updateStreakCalculations(userId, targetDate)
    } catch (error) {
      console.error('Failed to recalculate streaks:', error)
      throw error
    }
  }

  /**
   * Get streak statistics for analytics
   */
  async getStreakStats(userId: string) {
    try {
      const [streakData, recentActivities] = await Promise.all([
        this.getStreakData(userId),
        this.getDailyActivities(
          userId,
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
          new Date().toISOString().split('T')[0] // today
        )
      ])

      const activeDays = recentActivities.filter(
        activity => activity.visitCount > 0 || 
        activity.messagesSent > 0 || 
        activity.songsGenerated > 0 || 
        activity.chatSessions > 0
      ).length

      return {
        ...streakData,
        activeDaysLast30: activeDays,
        averageActivitiesPerDay: recentActivities.length > 0 
          ? recentActivities.reduce((sum, activity) => 
              sum + activity.messagesSent + activity.songsGenerated + activity.chatSessions, 0
            ) / recentActivities.length 
          : 0
      }
    } catch (error) {
      console.error('Failed to get streak stats:', error)
      throw error
    }
  }
}

// Create a singleton instance
export const streakTracker = new StreakTracker()
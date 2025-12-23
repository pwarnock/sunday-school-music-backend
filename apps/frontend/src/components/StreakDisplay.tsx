'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@sunday-school/ui'

interface StreakData {
  currentVisitStreak: number
  longestVisitStreak: number
  currentActivityStreak: number
  longestActivityStreak: number
  lastVisitDate: string | null
  lastActivityDate: string | null
  totalVisits: number
  totalActivities: number
  activeDaysLast30?: number
  averageActivitiesPerDay?: number
}

interface StreakDisplayProps {
  className?: string
}

export function StreakDisplay({ className }: StreakDisplayProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStreakData()
  }, [])

  const fetchStreakData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/streaks?action=stats')
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, show default data
          setStreakData({
            currentVisitStreak: 0,
            longestVisitStreak: 0,
            currentActivityStreak: 0,
            longestActivityStreak: 0,
            lastVisitDate: null,
            lastActivityDate: null,
            totalVisits: 0,
            totalActivities: 0
          })
          setError(null) // Clear error for unauthenticated state
          return
        }
        if (response.status === 500) {
          // Database error, show default data
          setStreakData({
            currentVisitStreak: 0,
            longestVisitStreak: 0,
            currentActivityStreak: 0,
            longestActivityStreak: 0,
            lastVisitDate: null,
            lastActivityDate: null,
            totalVisits: 0,
            totalActivities: 0
          })
          return
        }
        throw new Error('Failed to fetch streak data')
      }
      
      const data = await response.json()
      setStreakData(data)
    } catch (err) {
      console.error('Error fetching streak data:', err)
      // Show default data instead of error for better UX
      setStreakData({
        currentVisitStreak: 0,
        longestVisitStreak: 0,
        currentActivityStreak: 0,
        longestActivityStreak: 0,
        lastVisitDate: null,
        lastActivityDate: null,
        totalVisits: 0,
        totalActivities: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'text-green-600'
    if (streak >= 3) return 'text-yellow-600'
    if (streak >= 1) return 'text-blue-600'
    return 'text-gray-400'
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥'
    if (streak >= 14) return '⭐'
    if (streak >= 7) return '✨'
    if (streak >= 3) return '🌟'
    if (streak >= 1) return '💫'
    return '🌱'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Daily Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Daily Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchStreakData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!streakData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Daily Streaks</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No streak data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Daily Streaks
          <span className="text-2xl">{getStreakEmoji(Math.max(streakData.currentVisitStreak, streakData.currentActivityStreak))}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Streaks */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStreakColor(streakData.currentVisitStreak)}`}>
              {streakData.currentVisitStreak}
            </div>
            <p className="text-sm text-gray-600">Visit Streak</p>
            <p className="text-xs text-gray-500">
              Last: {formatDate(streakData.lastVisitDate)}
            </p>
          </div>
          <div className="text-center">
            <div className={`text-3xl font-bold ${getStreakColor(streakData.currentActivityStreak)}`}>
              {streakData.currentActivityStreak}
            </div>
            <p className="text-sm text-gray-600">Activity Streak</p>
            <p className="text-xs text-gray-500">
              Last: {formatDate(streakData.lastActivityDate)}
            </p>
          </div>
        </div>

        {/* Best Streaks */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Personal Best</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-xl font-semibold text-purple-600">
                {streakData.longestVisitStreak}
              </div>
              <p className="text-gray-600">Best Visit Streak</p>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-purple-600">
                {streakData.longestActivityStreak}
              </div>
              <p className="text-gray-600">Best Activity Streak</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm text-gray-700 mb-2">Statistics</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-semibold text-blue-600">{streakData.totalVisits}</div>
              <p className="text-gray-600">Total Visits</p>
            </div>
            <div>
              <div className="font-semibold text-blue-600">{streakData.totalActivities}</div>
              <p className="text-gray-600">Total Activities</p>
            </div>
            {streakData.activeDaysLast30 !== undefined && (
              <div>
                <div className="font-semibold text-green-600">{streakData.activeDaysLast30}</div>
                <p className="text-gray-600">Active Days (30d)</p>
              </div>
            )}
            {streakData.averageActivitiesPerDay !== undefined && (
              <div>
                <div className="font-semibold text-green-600">
                  {streakData.averageActivitiesPerDay.toFixed(1)}
                </div>
                <p className="text-gray-600">Avg Activities/Day</p>
              </div>
            )}
          </div>
        </div>

        {/* Motivation Messages */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg">
          <p className="text-sm text-center">
            {streakData.currentVisitStreak === 0 && streakData.currentActivityStreak === 0 && (
              "🌱 Start your streak today! Visit and create something amazing."
            )}
            {streakData.currentVisitStreak >= 1 && streakData.currentVisitStreak < 3 && (
              "💫 Great start! Keep coming back to build your streak."
            )}
            {streakData.currentVisitStreak >= 3 && streakData.currentVisitStreak < 7 && (
              "🌟 You're building momentum! Keep up the great work."
            )}
            {streakData.currentVisitStreak >= 7 && streakData.currentVisitStreak < 14 && (
              "✨ Amazing! You're on a roll. One week strong!"
            )}
            {streakData.currentVisitStreak >= 14 && streakData.currentVisitStreak < 30 && (
              "⭐ Incredible dedication! Two weeks and counting!"
            )}
            {streakData.currentVisitStreak >= 30 && (
              "🔥 Streak legend! You're absolutely crushing it!"
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
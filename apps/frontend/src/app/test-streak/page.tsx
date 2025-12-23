'use client'

import { useEffect, useState } from 'react'

export default function TestStreakPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<{checkData: unknown, streakData: unknown} | null>(null)

  useEffect(() => {
    async function testStreak() {
      try {
        // Test if tables exist
        const checkResponse = await fetch('/api/check-streak-tables')
        const checkData = await checkResponse.json()
        console.log('Table check:', checkData)
        
        // Test streak API
        const streakResponse = await fetch('/api/streaks')
        const streakData = await streakResponse.json()
        console.log('Streak API response:', streakData)
        
        setData({ checkData, streakData })
      } catch (err) {
        console.error('Test error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    
    testStreak()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Streak System Test</h1>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive-foreground px-4 py-3 rounded">
          Error: {error}
        </div>
      )}
      
      {data && (
        <div className="space-y-4">
          <div className="bg-green-500/10 border border-green-500/20 text-foreground px-4 py-3 rounded">
            <h2 className="font-bold">Table Check Results:</h2>
            <pre>{JSON.stringify(data.checkData, null, 2)}</pre>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/20 text-foreground px-4 py-3 rounded">
            <h2 className="font-bold">Streak API Results:</h2>
            <pre>{JSON.stringify(data.streakData, null, 2)}</pre>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <p className="text-muted-foreground">Check browser console for detailed logs.</p>
      </div>
    </div>
  )
}
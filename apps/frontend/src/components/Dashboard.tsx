'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@sunday-school/lib'
import { User } from '@supabase/supabase-js'
import Image from 'next/image'
import ChatInterface from './ChatInterface'
import MarkdownRenderer from './MarkdownRenderer'
import { DurationSelector } from './DurationSelector'
import { StreakDisplay } from './StreakDisplay'
import { Button, Card, CardContent, CardHeader, CardTitle, ThemeToggle, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@sunday-school/ui'
import { toast } from 'sonner'
import { siteConfig } from '@sunday-school/lib'
import { useStreakTracker } from '@/hooks/useStreakTracker'

interface DashboardProps {
  user?: User
}

interface UserProfile {
  credits_remaining: number
  email: string
}

interface Song {
  id: string
  title: string
  lyrics: string
  theme: string
  audio_url?: string
  created_at: string
}

export default function Dashboard({ user: propUser }: DashboardProps = {}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(propUser || null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [generatedSong, setGeneratedSong] = useState<string | null>(null)
  const [generatedTheme, setGeneratedTheme] = useState<string | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [activeTab, setActiveTab] = useState<'create' | 'library' | 'history'>('create')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [generatingMusic, setGeneratingMusic] = useState<string | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const [maxDuration, setMaxDuration] = useState(60)
  const supabase = createClient()
  
  // Track user activity for streaks (only if feature is enabled)
  const streaksEnabled = process.env.NEXT_PUBLIC_ENABLE_DAILY_STREAKS === 'true'
  const { trackActivity } = useStreakTracker({ 
    trackVisits: streaksEnabled 
  })

  useEffect(() => {
    // Check authentication on mount
    async function checkAuth() {
      if (propUser) {
        setUser(propUser)
        return
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    
    checkAuth()
  }, [propUser, supabase, router])

  useEffect(() => {
    if (!user) return

    async function getProfile() {
      const { data, error } = await supabase
        .from('users_profile')
        .select('credits_remaining, email')
        .eq('id', user!.id)
        .single()

      if (data) {
        setProfile(data)
      }
      setLoading(false)
    }

    async function getSongs() {
      const response = await fetch('/api/songs')
      if (response.ok) {
        const data = await response.json()
        setSongs(data.songs || [])
      }
    }

    getProfile()
    getSongs()
  }, [user !== null, supabase])

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/music-config')
        const data = await response.json()
        setMaxDuration(data.maxDurationSeconds || 60)
      } catch (error) {
        console.error('Failed to fetch music config:', error)
      }
    }
    fetchConfig()
  }, [])

  useEffect(() => {
    // Check and refresh session every 10 minutes
    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        console.error('Session check failed:', error)
        return
      }
      
      // Check if we need to refresh the session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Refresh session if it's close to expiring (within 15 minutes)
        const expiresAt = new Date(session.expires_at! * 1000)
        const now = new Date()
        const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60)
        
        if (minutesUntilExpiry < 15) {
          const { error: refreshError } = await supabase.auth.refreshSession()
          if (refreshError) {
            console.error('Session refresh failed:', refreshError)
          }
          toast.warning('Your session is expiring soon. Please save your work.')
        }
      }
    }

    // Check immediately
    checkSession()

    // Check every 10 minutes
    const interval = setInterval(checkSession, 10 * 60 * 1000)

    return () => clearInterval(interval)
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const handleSongGenerated = (lyrics: string, theme: string) => {
    setGeneratedSong(lyrics)
    setGeneratedTheme(theme)
  }

  const saveSong = async () => {
    if (!generatedSong || !generatedTheme) return
    
    setSaving(true)
    try {
      // Extract title from lyrics (handle markdown formatting)
      const lines = generatedSong.split('\n')
      const titleLine = lines.find(line => 
        line.includes('Title:') || 
        line.includes('Song:') ||
        (line.includes('**') && (line.includes('Title') || line.includes('Song')))
      )
      const title = titleLine
        ?.replace(/\*\*/g, '') // Remove markdown bold
        ?.replace(/^(.*Title:|.*Song:)/i, '') // Remove prefix
        ?.trim() || 'Untitled Song'

      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          lyrics: generatedSong,
          theme: generatedTheme
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSongs(prev => [data.song, ...prev])
        
        // Update credits in profile
        setProfile(prev => prev ? {
          ...prev,
          credits_remaining: prev.credits_remaining - 1
        } : null)
        
        setGeneratedSong(null)
        setGeneratedTheme(null)
        setActiveTab('library')
      } else {
        const errorData = await response.json()
        if (errorData.error === 'No credits remaining') {
          toast.error('You have no credits remaining! You cannot create more songs.')
        } else {
          toast.error('Failed to save song')
        }
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save song')
    } finally {
      setSaving(false)
    }
  }

  const saveAndGenerateMusic = async () => {
    if (!generatedSong || !generatedTheme) return
    
    setSaving(true)
    let savedSong: Song | null = null
    
    try {
      // Refresh session before making API calls
      const { data: { session }, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !session) {
        toast.error('Session expired. Please log in again.')
        window.location.href = '/login'
        return
      }
      // STEP 1: Always save the song first (this preserves user work)
      // Extract title from lyrics (handle markdown formatting)
      const lines = generatedSong.split('\n')
      const titleLine = lines.find(line => 
        line.includes('Title:') || 
        line.includes('Song:') ||
        (line.includes('**') && (line.includes('Title') || line.includes('Song')))
      )
      const title = titleLine
        ?.replace(/\*\*/g, '') // Remove markdown bold
        ?.replace(/^(.*Title:|.*Song:)/i, '') // Remove prefix
        ?.trim() || 'Untitled Song'

      const saveResponse = await fetch('/api/songs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          lyrics: generatedSong,
          theme: generatedTheme
        })
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        if (errorData.error === 'No credits remaining') {
          toast.error('You have no credits remaining! You cannot create more songs.')
        } else {
          toast.error('Failed to save song')
        }
        return
      }

      const saveData = await saveResponse.json()
      savedSong = saveData.song

      // Add to songs list and update UI immediately after successful save
      if (savedSong) {
        setSongs(prev => [savedSong!, ...prev])
      }
      
      // Don't update credits here - saving is free!
      // Credits are only deducted when generating music

      // Clear the generated song since it's now saved
      setGeneratedSong(null)
      setGeneratedTheme(null)
      setSaving(false) // Save is complete

      // STEP 2: Now attempt music generation (this can fail without losing the song)
      if (savedSong) {
        setGeneratingMusic(savedSong.id)
        
        const musicResponse = await fetch('/api/generate-music', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            songId: savedSong.id,
            lyrics: savedSong.lyrics,
            duration: selectedDuration
          })
        })

      if (musicResponse.ok) {
        const musicData = await musicResponse.json()
        // Update the song in our state with the new audio URL
        if (savedSong) {
          setSongs(prev => prev.map(s => 
            s.id === savedSong!.id 
              ? { ...s, audio_url: musicData.audioUrl }
              : s
          ))
        }
        
        // Update credits only after successful music generation
        setProfile(prev => prev ? {
          ...prev,
          credits_remaining: prev.credits_remaining - 1
        } : null)
        
        toast.success('Song saved and music generated successfully! 1 credit used.')
        
        // Track song generation activity
        trackActivity('song_generated', { 
          songId: savedSong!.id, 
          duration: selectedDuration 
        })
      } else {
        const errorData = await musicResponse.json()
        console.error('Music generation failed:', errorData)
        if (musicResponse.status === 401) {
          toast.warning('Song saved successfully! Session expired during music generation. Please refresh the page and try generating music from your library.')
          // Attempt to refresh the session
          await supabase.auth.refreshSession()
        } else {
          toast.warning(`Song saved successfully! Music generation failed: ${errorData.error || 'Unknown error'}. You can try generating music from your library.`)
        }
        }
        
        // Always switch to library to show the saved song
        setActiveTab('library')
      }

    } catch (error) {
      console.error('Save and generate error:', error)
      if (savedSong) {
        // Song was saved but music generation failed
        toast.warning('Song saved successfully, but music generation encountered an error. You can try generating music from your library.')
        setActiveTab('library')
      } else {
        // Song save failed
        toast.error('Failed to save song. Please try again.')
      }
    } finally {
      setSaving(false)
      setGeneratingMusic(null)
    }
  }

  const deleteSong = async (songId: string) => {
    setDeleting(songId)
    try {
      const response = await fetch(`/api/songs?id=${songId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setSongs(prev => prev.filter(song => song.id !== songId))
      } else {
        toast.error('Failed to delete song')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete song')
    } finally {
      setDeleting(null)
    }
  }

  // Helper to estimate prompt length for a song
  const estimatePromptLength = (song: Song): number => {
    // Approximate the prompt structure from ElevenLabs client
    let length = 0
    
    // Base context
    length += 'Create a Sunday School song for children aged 5-10'.length
    
    // Theme
    if (song.theme) {
      length += `, with the theme: "${song.theme}"`.length
    }
    
    // Default mood/energy/instrumental (approximate)
    length += ', with a joyful and uplifting feeling, that is energetic and fun, with vocals included'.length
    
    // Lyrics
    if (song.lyrics) {
      length += `, Lyrics: "${song.lyrics}"`.length
    }
    
    // Age guidance
    length += ', Make it simple, engaging, and appropriate for young children in a Christian educational setting'.length
    
    return length
  }

  const generateMusic = async (song: Song) => {
    if ((profile?.credits_remaining || 0) <= 0) {
      toast.error('You have no credits remaining!')
      return
    }

    // Check prompt length
    const promptLength = estimatePromptLength(song)
    if (promptLength > 2000) {
      toast.error(`Song description is too long (${promptLength} characters). Maximum is 2000 characters. Please shorten the lyrics.`)
      return
    }

    setGeneratingMusic(song.id)
    try {
      const response = await fetch('/api/generate-music', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songId: song.id,
          lyrics: song.lyrics,
          theme: song.theme,
          duration: selectedDuration
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Music generation response:', data)
        console.log('Updating song', song.id, 'with new audio URL:', data.audioUrl)
        
        // Update the song in our state with the new audio URL
        setSongs(prev => {
          const updated = prev.map(s => 
            s.id === song.id 
              ? { ...s, audio_url: data.audioUrl }
              : s
          )
          console.log('Updated songs state:', updated.find(s => s.id === song.id))
          return updated
        })
        
        // Update credits in profile (music generation used 1 credit)
        setProfile(prev => prev ? {
          ...prev,
          credits_remaining: prev.credits_remaining - 1
        } : null)
        
        toast.success('Music generated successfully! 1 credit used.')
        
        // Track song generation activity
        trackActivity('song_generated', { 
          songId: song.id, 
          duration: selectedDuration 
        })
      } else {
        const errorData = await response.json()
        if (response.status === 401) {
          toast.error('Session expired. Please refresh the page and try again.')
          // Attempt to refresh the session
          await supabase.auth.refreshSession()
          // Redirect to login if session can't be refreshed
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            window.location.href = '/login'
          }
        } else if (errorData.error === 'No credits remaining for music generation') {
          toast.error('You have no credits remaining! You cannot generate more music.')
        } else {
          toast.error(`Failed to generate music: ${errorData.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Generate music error:', error)
      toast.error('Failed to generate music')
    } finally {
      setGeneratingMusic(null)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => {
                  setActiveTab('create')
                  setShowChat(false)
                }}
                className="flex items-center hover:opacity-80 transition-opacity cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md p-1"
                aria-label="Return to home screen"
              >
                <div className="relative w-[150px] h-[84px]">
                  <Image 
                    src="/images/logo-150.png" 
                    alt={`${siteConfig.name} - AI-Powered Sunday School Music`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
                ✨ Credits: {profile?.credits_remaining || 0}
              </span>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/dev/update-credits', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ credits: 99 })
                      })
                      if (response.ok) {
                        setProfile(prev => prev ? { ...prev, credits_remaining: 99 } : null)
                        toast.success('Credits updated to 99 for testing')
                      } else {
                        toast.error('Failed to update credits')
                      }
                    } catch (error) {
                      toast.error('Failed to update credits')
                    }
                  }}
                >
                  Add Test Credits
                </Button>
              )}
              <ThemeToggle />
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2">
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    Welcome, {profile?.email}!
                  </h2>
                  <p className="text-muted-foreground">
                    You have {profile?.credits_remaining || 0} songs remaining. 
                    Start a conversation below to create your first Sunday School song!
                  </p>
                </div>
                {process.env.NEXT_PUBLIC_ENABLE_DAILY_STREAKS === 'true' && (
                  <div className="lg:col-span-1">
                    <StreakDisplay />
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b border-border mb-6">
                <nav className="-mb-px flex space-x-8">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('create')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'create'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Create Song
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('library')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'library'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    My Songs ({songs.length})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab('history')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Chat History
                  </Button>
                </nav>
              </div>

              {activeTab === 'create' ? (
                <div>
                {(profile?.credits_remaining || 0) > 0 ? (
                  !showChat ? (
                    <Card className="bg-primary/10 border-primary/20">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-medium text-primary mb-2">
                          Ready to create a song?
                        </h3>
                        <p className="text-primary/80 mb-4">
                          Tell me about the Bible story, lesson, or theme you&apos;d like to turn into a song. 
                          I&apos;ll help you create lyrics and generate the music!
                        </p>
                        <Button 
                          onClick={() => setShowChat(true)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          Start Creating
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-foreground">
                          Create Your Song
                        </h3>
                        <Button
                          variant="ghost"
                          onClick={() => setShowChat(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Close Chat
                        </Button>
                      </div>
                      
                      <ChatInterface onSongGenerated={handleSongGenerated} />
                      
                      {generatedSong && (
                        <Card className="bg-accent/10 border-accent/20">
                          <CardHeader>
                            <CardTitle className="text-lg text-accent-foreground">
                              Generated Song Lyrics
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-accent-foreground text-sm mb-4 bg-card p-4 rounded border border-accent/20 song-lyrics">
                              <MarkdownRenderer content={generatedSong} />
                            </div>
                            <Card className="bg-primary/10 border-primary/20 mb-4">
                              <CardContent className="p-3">
                                <p className="text-sm text-primary">
                                  💡 Saving this song will use 1 credit. You will have{' '}
                                  <strong>{Math.max(0, (profile?.credits_remaining || 0) - 1)}</strong>{' '}
                                  credits remaining.
                                </p>
                              </CardContent>
                            </Card>
                            <div className="mb-4">
                              <DurationSelector
                                onDurationSelect={setSelectedDuration}
                                maxDuration={maxDuration}
                                disabled={saving || !!generatingMusic || (profile?.credits_remaining || 0) <= 0}
                              />
                            </div>
                            <div className="space-x-2">
                              <Button 
                                onClick={saveAndGenerateMusic}
                                disabled={saving || !!generatingMusic || (profile?.credits_remaining || 0) <= 0}
                                className="bg-accent hover:bg-accent/90 text-sm"
                                size="sm"
                              >
                                {(saving || generatingMusic) ? 'Processing...' : 
                                 (profile?.credits_remaining || 0) <= 0 ? 'No Credits' : 'Save & Generate Music'}
                              </Button>
                              <Button 
                                onClick={saveSong}
                                disabled={saving || (profile?.credits_remaining || 0) <= 0}
                                variant="secondary"
                                size="sm"
                              >
                                {saving ? 'Saving...' : 
                                 (profile?.credits_remaining || 0) <= 0 ? 'No Credits' : 'Save Only'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )
                ) : (
                  <Card className="bg-destructive/10 border-destructive/20">
                    <CardHeader>
                      <CardTitle className="text-lg text-destructive">
                        No credits remaining
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-destructive/80">
                        You&apos;ve used all your free songs. Contact us to get more credits!
                      </p>
                    </CardContent>
                  </Card>
                )}
                </div>
              ) : activeTab === 'library' ? (
                /* Song Library */
                <div className="space-y-4">
                  {songs.length === 0 ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        No songs yet
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Create your first Sunday School song to see it here!
                      </p>
                      <Button
                        onClick={() => setActiveTab('create')}
                        className="bg-primary hover:bg-primary/90"
                      >
                        Create Your First Song
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {songs.map((song) => (
                        <Card key={song.id} className="bg-muted">
                          <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-lg font-medium text-foreground">
                              {song.title}
                            </h4>
                            <span className="text-sm text-muted-foreground">
                              {new Date(song.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            Theme: {song.theme}
                          </p>
                          <details className="mb-3">
                            <summary className="cursor-pointer text-primary hover:text-primary/80 text-sm font-medium">
                              View Lyrics
                            </summary>
                            <div className="mt-2 text-sm text-foreground bg-card p-3 rounded border border-border song-lyrics">
                              <MarkdownRenderer content={song.lyrics} />
                            </div>
                          </details>
                          
                           {/* Audio Player */}
                           {song.audio_url && (
                             <div className="mb-3 p-3 bg-primary/10 rounded border border-primary/20">
                               <p className="text-sm font-medium text-primary mb-2">🎵 Generated Music</p>
                               <audio key={song.audio_url} controls className="w-full">
                                 <source src={`${song.audio_url}?v=${Date.now()}`} type="audio/wav" />
                                 Your browser does not support the audio element.
                               </audio>
                             </div>
                           )}
                          
                          <div className="flex space-x-2">
                            {!song.audio_url ? (
                              <Button 
                                onClick={() => generateMusic(song)}
                                disabled={generatingMusic === song.id || (profile?.credits_remaining || 0) <= 0 || estimatePromptLength(song) > 2000}
                                className="bg-accent hover:bg-accent/90"
                                size="sm"
                                title={
                                  estimatePromptLength(song) > 2000 
                                    ? 'Song description is too long. Please shorten the lyrics.'
                                    : `Generate music (uses 1 credit, ${profile?.credits_remaining || 0} remaining)`
                                }
                              >
                                {generatingMusic === song.id ? 'Generating...' : 
                                 estimatePromptLength(song) > 2000 ? 'Too Long' :
                                 (profile?.credits_remaining || 0) <= 0 ? 'No Credits' : 'Generate Music (1 credit)'}
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => generateMusic(song)}
                                disabled={generatingMusic === song.id || (profile?.credits_remaining || 0) <= 0}
                                className="bg-primary hover:bg-primary/90"
                                size="sm"
                                title={`Regenerate music (uses 1 credit, ${profile?.credits_remaining || 0} remaining)`}
                              >
                                {generatingMusic === song.id ? 'Regenerating...' : 
                                 (profile?.credits_remaining || 0) <= 0 ? 'No Credits' : 'Regenerate Music (1 credit)'}
                              </Button>
                            )}
                            <Button variant="secondary" size="sm">
                              Share
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  disabled={deleting === song.id}
                                  variant="destructive"
                                  size="sm"
                                >
                                  {deleting === song.id ? 'Deleting...' : 'Delete'}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your song &quot;{song.title}&quot;.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteSong(song.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Chat History */
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Chat History
                    </h3>
                    <p className="text-muted-foreground">
                      Chat history feature coming soon!
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>


    </div>
  )
}
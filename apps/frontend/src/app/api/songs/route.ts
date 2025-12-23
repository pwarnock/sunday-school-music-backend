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

    const { title, lyrics, theme } = await request.json()

    if (!lyrics) {
      return NextResponse.json({ error: 'Lyrics are required' }, { status: 400 })
    }

    // Save song without deducting credits (credits are only deducted when generating music)
    const { data: song, error } = await supabase
      .rpc('save_song_without_credit_deduction', {
        p_user_id: user.id,
        p_title: title || 'Untitled Song',
        p_lyrics: lyrics,
        p_theme: theme
      })

    if (error) {
      console.error('Database error:', error)
      // Note: Credit errors should not occur when saving songs, only when generating music
      return NextResponse.json({ error: 'Failed to save song' }, { status: 500 })
    }

    // The function returns an array, get the first item
    const savedSong = song?.[0]
    if (!savedSong) {
      return NextResponse.json({ error: 'Failed to save song' }, { status: 500 })
    }

    return NextResponse.json({ song: savedSong })

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

    // Get user's songs
    const { data: songs, error } = await supabase
      .from('songs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
    }

    return NextResponse.json({ songs })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const songId = searchParams.get('id')

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 })
    }

    // Delete the song (RLS policy ensures user can only delete their own songs)
    // Note: We don't restore credits when deleting songs to prevent gaming the system
    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('id', songId)
      .eq('user_id', user.id) // Extra safety check

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
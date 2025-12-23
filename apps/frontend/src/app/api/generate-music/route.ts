import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sunday-school/lib'
import { getElevenLabsClient, type SundaySchoolMusicInput } from '@sunday-school/lib/elevenlabs/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json({ 
        error: 'Authentication required. Please log in and try again.',
        details: authError?.message 
      }, { status: 401 })
    }

    const { songId, lyrics, duration = 30 } = await request.json()

    if (!songId || !lyrics) {
      return NextResponse.json({ error: 'Song ID and lyrics are required' }, { status: 400 })
    }

    // Get full song data for ElevenLabs prompt building
    const { data: songData, error: songError } = await supabase
      .from('songs')
      .select('*')
      .eq('id', songId)
      .eq('user_id', user.id)
      .single()

    if (songError || !songData) {
      console.error('Song fetch error:', songError)
      return NextResponse.json({ error: 'Song not found' }, { status: 404 })
    }

    // Check if user has credits remaining
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('credits_remaining')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to check credits' }, { status: 500 })
    }

    if (profile.credits_remaining <= 0) {
      return NextResponse.json({ error: 'No credits remaining for music generation' }, { status: 403 })
    }

    // Fetch current time limit configuration
    const { data: config } = await supabase
      .from('music_generation_config')
      .select('max_duration_seconds')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    const maxDuration = config?.max_duration_seconds || 30
    const finalDuration = Math.min(duration, maxDuration)
    const wasLimited = duration > maxDuration

    // Track the attempt
    await supabase
      .from('music_generation_attempts')
      .insert({
        user_id: user.id,
        song_id: songId,
        requested_duration: duration,
        allowed_duration: finalDuration,
        was_limited: wasLimited
      })

    // Update the song record with duration info
    await supabase
      .from('songs')
      .update({ 
        requested_duration_seconds: duration,
        generated_duration_seconds: finalDuration 
      })
      .eq('id', songId)
      .eq('user_id', user.id)

    // Prepare ElevenLabs input
    const elevenLabsInput: SundaySchoolMusicInput = {
      lyrics: songData.lyrics || lyrics,
      theme: songData.theme,
      mood: songData.mood,
      energy: songData.energy,
      tempo: songData.tempo,
      ageGroup: songData.age_group || '5-10',
      bibleReference: songData.bible_reference,
      instrumental: songData.instrumental || false
    }

    // Generate music with ElevenLabs
    let audioBuffer: Buffer
    try {
      const elevenLabsClient = getElevenLabsClient()
      audioBuffer = await elevenLabsClient.generateMusic(elevenLabsInput, finalDuration)
    } catch (elevenLabsError) {
      console.error('ElevenLabs generation error:', elevenLabsError)
      console.error('Song ID:', songId, 'User ID:', user.id)
      return NextResponse.json({ 
        error: elevenLabsError instanceof Error ? elevenLabsError.message : 'Failed to generate music',
        details: 'ElevenLabs API error'
      }, { status: 500 })
    }
    
    // For regeneration, first check if there's an existing audio file to replace
    const { data: existingSong } = await supabase
      .from('songs')
      .select('audio_url')
      .eq('id', songId)
      .eq('user_id', user.id)
      .single()

    let fileName: string
    
    if (existingSong?.audio_url) {
      // Extract filename from existing URL for replacement
      const urlParts = existingSong.audio_url.split('/')
      const existingFileName = urlParts[urlParts.length - 1]
      // Keep the same filename but ensure it's in the right path
      fileName = `${user.id}/${existingFileName}`
    } else {
      // Generate new filename for first-time generation
      fileName = `${user.id}/${songId}-${Date.now()}.mp3`
    }
    
    console.log('Uploading audio file:', fileName, 'for song:', songId)
    
    // Upload to Supabase Storage with upsert to allow regeneration
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true // Allow overwriting for regeneration
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json({ error: 'Failed to save audio file' }, { status: 500 })
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('audio')
      .getPublicUrl(fileName)

    const audioUrl = urlData.publicUrl
    console.log('Generated audio URL:', audioUrl)

    // Use transaction to update song and deduct credit atomically
    const { error: transactionError } = await supabase.rpc('generate_music_with_credit_deduction', {
      p_user_id: user.id,
      p_song_id: songId,
      p_audio_url: audioUrl
    })

    if (transactionError) {
      console.error('Transaction error:', transactionError)
      return NextResponse.json({ error: 'Failed to complete music generation' }, { status: 500 })
    }

    console.log('Successfully updated song', songId, 'with audio URL:', audioUrl)

    if (wasLimited) {
      return NextResponse.json({ 
        success: true, 
        audioUrl,
        message: `Music generated successfully at ${finalDuration} seconds (limited from ${duration} seconds). 1 credit used.`,
        actualDuration: finalDuration,
        wasLimited: true
      })
    }

    return NextResponse.json({ 
      success: true, 
      audioUrl,
      message: 'Music generated successfully! 1 credit used.',
      actualDuration: finalDuration
    })

  } catch (error) {
    console.error('Generate music API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
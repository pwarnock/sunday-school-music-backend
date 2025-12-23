import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sunday-school/lib'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current configuration
    const { data: config, error } = await supabase
      .from('music_generation_config')
      .select('max_duration_seconds')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('Config fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch configuration' }, { status: 500 })
    }
    
    // Return config or default
    return NextResponse.json({ 
      maxDurationSeconds: config?.max_duration_seconds || 30 
    })
    
  } catch (error) {
    console.error('Music config API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
import { createClient } from '@sunday-school/lib'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Test each table
    const tables = ['user_streaks', 'daily_activities', 'activity_events', 'users_profile']
    const results: Record<string, unknown> = {}
    
    for (const table of tables) {
      try {
        const { error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results[table] = { 
            exists: false, 
            error: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          }
        } else {
          results[table] = { 
            exists: true, 
            count: count || 0 
          }
        }
      } catch (e) {
        results[table] = { 
          exists: false, 
          error: e instanceof Error ? e.message : 'Unknown error' 
        }
      }
    }
    
    // Test if we can get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    return NextResponse.json({
      success: true,
      tables: results,
      currentUser: user ? { id: user.id, email: user.email } : null,
      authError: userError?.message || null
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
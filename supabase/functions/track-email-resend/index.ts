import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, attempt_type, ip_address, user_agent } = await req.json()

    if (!email || !attempt_type) {
      return new Response(
        JSON.stringify({ error: 'Email and attempt_type are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert tracking record
    const { error } = await supabaseClient
      .from('email_resend_attempts')
      .insert({
        email,
        attempt_type,
        ip_address,
        user_agent
      })

    if (error) {
      console.error('Database insert error:', error)
      throw error
    }

    // Get count of recent attempts for analytics
    const { count, error: countError } = await supabaseClient
      .from('email_resend_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('email', email)
      .eq('attempt_type', attempt_type)
      .gte('created_at', new Date(Date.now() - 3600000).toISOString()) // Last hour

    if (countError) {
      console.error('Count query error:', countError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        recentAttempts: count || 0,
        message: 'Email resend attempt tracked successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
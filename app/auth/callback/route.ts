import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('OAuth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-error`)
      }

      if (data.user) {
        // Check if user has a profile, if not redirect to profile setup
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', data.user.id)
          .single()

        if (!profile) {
          // New user from OAuth - redirect to profile setup
          return NextResponse.redirect(`${origin}/auth/setup-profile`)
        }

        // Existing user - redirect to their profile page (better UX than homepage)
        return NextResponse.redirect(`${origin}/${profile.username}`)
      }
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}${next}`)
}

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const flow = searchParams.get('flow') // 'signup' or 'signin'
  const next = searchParams.get('next') ?? '/'
  
  console.log('OAuth callback called with:', { code: !!code, flow, next, origin })

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

        console.log('Profile lookup result:', { hasProfile: !!profile, username: profile?.username })

        if (!profile) {
          // New user from OAuth - redirect to profile setup
          console.log('Redirecting new user to profile setup')
          return NextResponse.redirect(`${origin}/auth/setup-profile`)
        }

        // Existing user - redirect based on their intent
        const redirectUrl = `${origin}/${profile.username}`
        if (flow === 'signup') {
          // User clicked "Get Started" -> "Sign Up" but already has account
          // Take them to their profile page (what they expected from signup flow)
          console.log('Redirecting existing user from signup flow to profile:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        } else {
          // User clicked "Sign In" - take them to their profile page
          console.log('Redirecting existing user from signin flow to profile:', redirectUrl)
          return NextResponse.redirect(redirectUrl)
        }
      }
    } catch (error) {
      console.error('OAuth exchange error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-error`)
    }
  }

  // Fallback redirect
  return NextResponse.redirect(`${origin}${next}`)
}

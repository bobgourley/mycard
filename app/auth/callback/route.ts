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
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', data.user.id)
            .single()

          console.log('Profile lookup result:', { hasProfile: !!profile, username: profile?.username, error: profileError ? String(profileError) : null })

          // If profile doesn't exist OR there's a database error, redirect to setup
          if (!profile || profileError) {
            console.log('Redirecting to profile setup - reason:', !profile ? 'no profile found' : `database error: ${String(profileError)}`)
            return NextResponse.redirect(`${origin}/auth/setup-profile`)
          }

          // Existing user with valid profile - redirect based on their intent
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
        } catch (dbError) {
          // Database connection or other error - default to profile setup
          console.error('Database error during profile lookup, redirecting to setup:', dbError)
          return NextResponse.redirect(`${origin}/auth/setup-profile`)
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

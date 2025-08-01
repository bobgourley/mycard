import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Create a Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function DELETE(request: NextRequest) {
  try {
    // Verify the request is from an authenticated admin user
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Get the current user to verify admin access
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header required' }, { status: 401 })
    }

    // Create regular supabase client to verify the requesting user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Get the user from the auth header
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin access (only bob@bobgourley.com)
    if (user.email !== 'bob@bobgourley.com') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Delete user's links first
    const { error: linksError } = await supabaseAdmin
      .from('links')
      .delete()
      .eq('user_id', userId)

    if (linksError) {
      console.error('Error deleting links:', linksError)
      return NextResponse.json({ error: 'Failed to delete user links' }, { status: 500 })
    }

    // Delete user's profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (profileError) {
      console.error('Error deleting profile:', profileError)
      return NextResponse.json({ error: 'Failed to delete user profile' }, { status: 500 })
    }

    // Delete the auth user (this requires service role key)
    const { error: userError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (userError) {
      console.error('Error deleting auth user:', userError)
      return NextResponse.json({ error: 'Failed to delete auth user' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' })

  } catch (error) {
    console.error('Error in delete user API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

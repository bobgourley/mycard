"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthForm } from "@/components/auth/auth-form"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { 
  Link, 
  Palette, 
  Upload, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
  Edit
} from "lucide-react"

export function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        console.log('Initial user check:', { hasUser: !!user })
        setUser(user)
        
        if (user) {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (error) {
            console.error('Error fetching profile:', error)
            setUserProfile(null)
          } else {
            setUserProfile(profile)
          }
        } else {
          // Explicitly clear profile when no user
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Error in getUser:', error)
        setUser(null)
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }
    
    // Ensure loading is never stuck - timeout fallback
    const loadingTimeout = setTimeout(() => {
      console.log('Loading timeout reached, forcing loading to false')
      setLoading(false)
    }, 3000)
    
    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state change:', { event, hasUser: !!session?.user })
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (error) {
            console.error('Error fetching profile in auth change:', error)
            setUserProfile(null)
          } else {
            setUserProfile(profile)
          }
        } else {
          // Explicitly clear user profile on logout
          console.log('Clearing user profile on logout')
          setUserProfile(null)
        }
        
        // Ensure loading is false after auth state change
        setLoading(false)
      } catch (error) {
        console.error('Error in auth state change:', error)
        setUser(null)
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const handleEditProfile = () => {
    if (userProfile?.username) {
      window.location.href = `/${userProfile.username}`
    } else {
      // If no username, redirect to create profile
      setShowAuth(true)
    }
  }

  if (showAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setShowAuth(false)}
              className="mb-4"
            >
              ← Back to Home
            </Button>
            <h1 className="text-2xl font-bold">Join 123l.ink</h1>
            <p className="text-muted-foreground">Create your personalized link-in-bio page</p>
          </div>
          <AuthForm />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            🚀 Your Personal Link Hub
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            One Link to Rule
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-700 font-extrabold">
              {" "}Them All
            </span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto font-medium">
            Create a beautiful, customizable landing page that houses all your important links. 
            Perfect for social media bios, business cards, and everywhere you need to share multiple links.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {loading ? (
              <div className="animate-pulse bg-gray-200 h-12 w-48 rounded-lg"></div>
            ) : (
              <>
                {user ? (
                  <>
                    <Button 
                      size="lg" 
                      onClick={handleEditProfile}
                      className="text-lg px-8 py-3"
                    >
                      Edit Profile
                      <Edit className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => window.open('https://123l.ink/bob', '_blank')}
                      className="text-lg px-8 py-3"
                    >
                      View Demo
                      <Globe className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      onClick={() => setShowAuth(true)}
                      className="text-lg px-8 py-3"
                    >
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={() => window.open('https://123l.ink/bob', '_blank')}
                      className="text-lg px-8 py-3"
                    >
                      View Demo
                      <Globe className="ml-2 h-5 w-5" />
                    </Button>
                  </>
                )}
              </>
            )}
            

            

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need in One Place
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to make sharing your links effortless and professional.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Link className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Unlimited Links</CardTitle>
              <CardDescription>
                Add as many links as you want - social media, websites, portfolios, and more.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Palette className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Custom Themes</CardTitle>
              <CardDescription>
                Personalize your page with beautiful themes and colors that match your brand.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Profile Images</CardTitle>
              <CardDescription>
                Upload your photo or logo to make your page more personal and recognizable.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Mobile Optimized</CardTitle>
              <CardDescription>
                Your page looks perfect on all devices - desktop, tablet, and mobile.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Lightning Fast</CardTitle>
              <CardDescription>
                Built with modern technology for instant loading and smooth performance.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your data is protected with enterprise-grade security and privacy controls.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-16 bg-white/50 rounded-3xl mx-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-xl text-gray-600">
            Creating your link-in-bio page has never been easier
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Sign Up</h3>
            <p className="text-gray-600">
              Create your free account with just your email and choose a unique username.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Customize</h3>
            <p className="text-gray-600">
              Add your links, upload a profile photo, write your bio, and choose your theme.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Share</h3>
            <p className="text-gray-600">
              Get your personalized 123l.ink/username link and share it everywhere!
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose 123l.ink?
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of creators, businesses, and professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Perfect for Social Media</h3>
                  <p className="text-gray-700">Use your 123l.ink link in Instagram, TikTok, Twitter, and LinkedIn bios.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Business Professional</h3>
                  <p className="text-gray-700">Share your portfolio, contact info, and services in one clean page.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Content Creator Ready</h3>
                  <p className="text-gray-700">Link to your YouTube, podcast, blog, store, and more in one place.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Always Free</h3>
                  <p className="text-gray-700">Core features are completely free forever. No hidden costs or limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Easy to Update</h3>
                  <p className="text-gray-700">Add, remove, or reorder links anytime with our simple editor.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Professional Look</h3>
                  <p className="text-gray-700">Clean, modern design that makes you look professional and trustworthy.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Create Your Link Hub?
          </h2>
          <p className="text-xl text-gray-700 mb-8 font-medium">
            Join thousands of users who have simplified their online presence with 123l.ink
          </p>
          {user ? (
            <Button 
              size="lg" 
              onClick={handleEditProfile}
              className="text-lg px-12 py-4"
            >
              Edit Your Profile
              <Edit className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => setShowAuth(true)}
              className="text-lg px-12 py-4"
            >
              Create Your Free Page Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Set up in under 2 minutes
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 text-center text-gray-600">
        <p>&copy; 2024 123l.ink. Made with ❤️ for creators and professionals.</p>
      </footer>
    </div>
  )
}

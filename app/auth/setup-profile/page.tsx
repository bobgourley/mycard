"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { validateUsername } from "@/lib/username-utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle, AlertCircle, Eye } from "lucide-react"
import type { User } from "@supabase/supabase-js"

export default function SetupProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [usernameInput, setUsernameInput] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  // Validate username
  const usernameValidation = validateUsername(usernameInput)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/')
        return
      }

      setUser(user)
      
      // Pre-fill display name from OAuth data
      const name = user.user_metadata?.full_name || user.user_metadata?.name || ""
      setDisplayName(name)
      
      // Suggest username from email or name
      const email = user.email || ""
      const suggestedUsername = name.toLowerCase().replace(/\s+/g, '-') || 
                               email.split('@')[0].toLowerCase()
      setUsernameInput(suggestedUsername)
      
      setInitialLoading(false)
    }

    getUser()
  }, [router])

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !usernameValidation.isValid) {
      return
    }

    setLoading(true)

    try {
      const sanitizedUsername = usernameValidation.sanitized

      // Check if username is available
      const { data: existingUsers, error: checkError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", sanitizedUsername)
        .limit(1)

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Username check error:', checkError)
      }

      if (existingUsers && existingUsers.length > 0) {
        toast({
          title: "Username taken",
          description: "Please choose a different username",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      // Create profile
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: sanitizedUsername,
          display_name: displayName || sanitizedUsername,
          bio: null,
          avatar_url: user.user_metadata?.avatar_url || null,
          verified: false,
          theme_settings: {}
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      toast({
        title: "Profile created!",
        description: "Welcome to 123l.ink! Your profile is ready.",
      })

      // Redirect to their new profile
      router.push(`/${sanitizedUsername}`)

    } catch (error: any) {
      console.error('Profile setup error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
          <CardDescription>
            Choose your username to finish setting up your 123l.ink profile
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="your username"
                required
                className={!usernameValidation.isValid && usernameInput ? "border-red-500" : ""}
              />
              
              {/* URL Preview and Validation */}
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  Your profile will be available at: <span className="font-mono font-medium">{usernameValidation.preview}</span>
                </p>
                
                {/* Validation feedback */}
                {!usernameValidation.isValid && usernameInput && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {usernameValidation.errors[0]}
                  </p>
                )}
                
                {usernameValidation.isValid && usernameInput && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Username is available
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !usernameValidation.isValid}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Profile
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Trash2, User, Shield, LogOut, Search, RefreshCw, ExternalLink, Eye } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatarUrl: string | null
  verified: boolean
  created_at: string
  updated_at: string
}

interface UserWithProfile extends SupabaseUser {
  profile?: Profile
}

export default function AdminPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Only allow bob@bobgourley.com to access admin
  const ADMIN_EMAIL = "bob@bobgourley.com"

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        // Only allow bob@bobgourley.com to access admin
        const isUserAdmin = user.email === ADMIN_EMAIL
        setIsAdmin(isUserAdmin)
        
        if (isUserAdmin) {
          loadProfiles()
        }
      }
    } catch (error) {
      console.error("Error checking user:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminLogin = () => {
    // This function is no longer needed since we authenticate via email
    // But keeping it for any edge cases where manual login might be needed
    if (user?.email === ADMIN_EMAIL) {
      loadProfiles()
      toast({
        title: "Admin Access Granted",
        description: "Welcome to the admin panel",
      })
    } else {
      toast({
        title: "Access Denied",
        description: "Only bob@bobgourley.com can access admin panel",
        variant: "destructive",
      })
    }
  }

  const loadProfiles = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profiles: " + error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteProfile = async (profileId: string, username: string) => {
    try {
      // Delete associated links first
      const { error: linksError } = await supabase
        .from("links")
        .delete()
        .eq("user_id", profileId)

      if (linksError) throw linksError

      // Delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", profileId)

      if (profileError) throw profileError

      // Delete the user from auth (requires service role key in production)
      // For now, we'll just delete the profile
      
      setProfiles(profiles.filter(p => p.id !== profileId))
      
      toast({
        title: "Profile Deleted",
        description: `Profile "${username}" has been deleted successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete profile: " + error.message,
        variant: "destructive",
      })
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  const viewProfile = (username: string) => {
    const profileUrl = `${window.location.origin}/${username}`
    window.open(profileUrl, '_blank')
  }

  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.bio && profile.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Admin access check
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Access Required
            </CardTitle>
            <CardDescription>
              Please sign in to access the admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Admin access is restricted to authorized users only.
            </p>
            <Button onClick={() => window.location.href = '/'} className="w-full">
              Go to Home Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user is authorized admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-destructive">
              <Shield className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              You are not authorized to access this admin panel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Signed in as: {user.email}
              </p>
              <p className="text-sm text-destructive">
                Only bob@bobgourley.com can access this admin panel.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/'} className="w-full">
                Go to Home Page
              </Button>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage user profiles and accounts
            </p>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Badge variant="secondary">
                {user.email}
              </Badge>
            )}
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search profiles by username, display name, or bio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={loadProfiles} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{profiles.length}</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profiles List */}
        <div className="grid gap-4">
          {filteredProfiles.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? "No profiles found matching your search" : "No profiles found"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredProfiles.map((profile) => (
              <Card key={profile.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{profile.display_name}</h3>
                        <Badge variant="outline">@{profile.username}</Badge>
                        {profile.verified && (
                          <Badge variant="default">Verified</Badge>
                        )}
                      </div>
                      {profile.bio && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.bio}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>ID: {profile.id}</span>
                        <span>Created: {new Date(profile.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(profile.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewProfile(profile.username)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete the profile for "{profile.username}"? 
                              This will also delete all associated links and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteProfile(profile.id, profile.username)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Profile
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

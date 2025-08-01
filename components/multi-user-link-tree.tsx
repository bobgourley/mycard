"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useDebouncedProfile } from "@/hooks/use-debounced-profile"
import { AuthForm } from "@/components/auth/auth-form"
import { CardFlip } from "@/components/ui/card-flip"
import { Header } from "@/components/link-tree/header"
import { ProfileView } from "@/components/link-tree/profile-view"
import { EditView } from "@/components/link-tree/edit-view"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface MultiUserLinkTreeProps {
  username?: string
}

export default function MultiUserLinkTree({ username }: MultiUserLinkTreeProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [newLink, setNewLink] = useState({ title: "", url: "" })
  
  // Check if current user is admin
  const isAdmin = user?.email === 'bob@bobgourley.com'
  const { toast } = useToast()
  const { theme } = useTheme()
  const { themeSettings } = useThemeSettings()

  const {
    profile: originalProfile,
    links,
    loading: profileLoading,
    isOwner,
    updateProfile: updateProfileImmediate,
    addLink,
    updateLink,
    deleteLink,
  } = useUserProfile(username, user?.id)

  // Define handleSave before using it in useDebouncedProfile
  const handleSave = () => {
    toast({
      title: "Changes Saved!",
      description: "Your profile changes have been saved successfully.",
    })
  }

  // Use debounced profile for better typing experience
  const {
    profile: debouncedProfile,
    updateProfile: updateDebouncedProfile,
    handleProfileChange,
    handleProfileBlur,
    manualSave,
    hasUnsavedChanges,
    isSaving: isProfileSaving,
  } = useDebouncedProfile({ profile: originalProfile, onProfileUpdate: handleSave })

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Supabase connection timeout - continuing without auth')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null)
        setLoading(false)
        clearTimeout(loadingTimeout)
      })
      .catch((error) => {
        console.error('Supabase auth error:', error)
        setLoading(false)
        clearTimeout(loadingTimeout)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(loadingTimeout)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast({
      title: "Signed out",
      description: "You've been signed out successfully",
    })
  }



  const handleToggleVerified = () => {
    if (originalProfile) {
      updateProfileImmediate({ verified: !originalProfile.verified })
    }
  }

  const handleUpdateSecondaryBg = (bgColor: string) => {
    if (originalProfile) {
      const updatedTheme = { ...originalProfile.theme_settings, secondary_bg: bgColor }
      updateProfileImmediate({ theme_settings: updatedTheme })
    }
  }

  const handleNewLinkChange = (field: "title" | "url", value: string) => {
    setNewLink((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddLink = async () => {
    if (newLink.title.trim() && newLink.url.trim()) {
      await addLink(newLink.title, newLink.url)
      setNewLink({ title: "", url: "" })
    }
  }

  const handleUpdateLink = async (linkData: { id: string; title: string; url: string }) => {
    await updateLink(linkData.id, { title: linkData.title, url: linkData.url })
  }

  const handleReorderLinks = async (reorderedLinks: any[]) => {
    // Update positions in database
    try {
      const updatePromises = reorderedLinks.map((link, index) => 
        supabase
          .from('links')
          .update({ position: index })
          .eq('id', link.id)
      )
      
      await Promise.all(updatePromises)
      
      // Refresh the links to get updated order
      if (originalProfile) {
        // This will trigger a re-fetch of links with updated positions
        window.location.reload()
      }
    } catch (error) {
      console.error('Error reordering links:', error)
      toast({
        title: "Error",
        description: "Failed to reorder links",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLink = async (linkId: string) => {
    await deleteLink(linkId)
  }

  const handleImageUpload = (url: string) => {
    if (originalProfile) {
      updateProfileImmediate({ avatar_url: url })
      toast({
        title: "Profile Image Updated",
        description: "Your profile image has been updated successfully",
      })
    }
  }

  const handleImageRemove = () => {
    if (originalProfile) {
      updateProfileImmediate({ avatar_url: null })
      toast({
        title: "Profile Image Removed",
        description: "Your profile image has been removed",
      })
    }
  }

  const handleViewProfile = () => {
    if (originalProfile?.username) {
      // Open profile in new tab
      window.open(`/${encodeURIComponent(originalProfile.username)}`, '_blank')
    }
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  const handleDeleteProfile = async () => {
    if (!user || !originalProfile) return

    try {
      // Delete all user's links first
      const { error: linksError } = await supabase
        .from('links')
        .delete()
        .eq('user_id', user.id)

      if (linksError) {
        console.error('Error deleting links:', linksError)
      }

      // Delete the user's profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      if (profileError) {
        throw profileError
      }

      // Delete the user's auth account
      const { error: authError } = await supabase.auth.admin.deleteUser(user.id)
      
      if (authError) {
        console.error('Error deleting auth user:', authError)
        // Continue anyway - profile is deleted
      }

      toast({
        title: "Profile deleted",
        description: "Your profile has been permanently deleted.",
      })

      // Sign out and redirect to home
      await supabase.auth.signOut()
      window.location.href = '/'

    } catch (error: any) {
      console.error('Delete profile error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete profile",
        variant: "destructive",
      })
    }
  }

  // Debug logging
  console.log('MultiUserLinkTree render:', { loading, profileLoading, user: !!user, username, profile: !!originalProfile })

  // Show loading state
  if (loading || profileLoading) {
    console.log('Showing loading spinner:', { loading, profileLoading })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show auth form if no user and no username provided (home page)
  if (!user && !username) {
    console.log('Showing AuthForm:', { user: !!user, username })
    return <AuthForm />
  }

  // Handle case where user is logged in but has no profile yet
  if (user && !username && !originalProfile) {
    console.log('User logged in but no profile found, redirecting to create profile')
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome!</h1>
          <p className="text-muted-foreground mb-4">
            Let's set up your profile. Please sign out and create a new account with a username.
          </p>
          <Button onClick={handleSignOut}>Sign Out & Start Over</Button>
        </div>
      </div>
    )
  }

  // Show profile not found if username provided but no profile found
  if (username && !originalProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">@{username} not found</h1>
            <p className="text-gray-600 mb-6">
              This profile doesn't exist yet. Would you like to claim this username and create your own 123l.ink page?
            </p>
            
            <div className="space-y-3">
              {user ? (
                <Button 
                  onClick={() => (window.location.href = "/auth/setup-profile")} 
                  className="w-full"
                >
                  Claim @{username}
                </Button>
              ) : (
                <Button 
                  onClick={() => (window.location.href = "/")} 
                  className="w-full"
                >
                  Create Your Free Page
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => (window.location.href = "/")} 
                className="w-full"
              >
                Go Home
              </Button>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Why create a 123l.ink page?</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Share all your links in one place</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Perfect for social media bios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Professional and customizable</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Always free to use</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Convert database types to component props
  const profileData = originalProfile
    ? {
        name: originalProfile.display_name || originalProfile.username,
        bio: originalProfile.bio || "",
        avatar_url: originalProfile.avatar_url || "",
        secondaryBg: originalProfile.theme_settings?.secondaryBg || "bg-secondary",
        verified: originalProfile.verified,
      }
    : null

  const linksData = links.map((link) => ({
    id: link.id,
    title: link.title,
    url: link.url,
  }))

  return (
    <div className={cn("w-full max-w-3xl mx-auto", themeSettings.font)}>
      <div className="flex justify-between items-center mb-6 px-4">
        {username && <h1 className="text-2xl font-bold">@{username}</h1>}
        <div className="flex gap-2">
          {user && (
            <>
              {!username && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => (window.location.href = `/${user.user_metadata?.username}`)}
                >
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          )}
        </div>
      </div>

      {profileData && (
        <div className="w-full max-w-md mx-auto">
          <CardFlip
            isFlipped={isEditMode && isOwner}
            onFlip={toggleEditMode}
            frontContent={
              <div className="relative">
                <ProfileView profile={profileData} links={linksData} />
                {isOwner && (
                  <div className="absolute top-4 right-4">
                    <Header isEditMode={isEditMode} onToggleEditMode={toggleEditMode} />
                  </div>
                )}
              </div>
            }
            backContent={
              isOwner ? (
                <EditView
                  profile={profileData}
                  links={linksData}
                  newLink={newLink}
                  onProfileChange={handleProfileChange}
                  onProfileBlur={handleProfileBlur}
                  onToggleVerified={handleToggleVerified}
                  onUpdateSecondaryBg={handleUpdateSecondaryBg}
                  onNewLinkChange={handleNewLinkChange}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onUpdateLink={handleUpdateLink}
                  onReorderLinks={handleReorderLinks}
                  onImageUpload={handleImageUpload}
                  onImageRemove={handleImageRemove}
                  onSave={handleSave}
                  onViewProfile={handleViewProfile}
                  onDeleteProfile={handleDeleteProfile}
                  isAdmin={isAdmin}
                />
              ) : (
                <div>Not authorized</div>
              )
            }
          />
        </div>
      )}
      

    </div>
  )
}

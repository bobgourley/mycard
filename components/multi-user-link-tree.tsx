"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useUserProfile } from "@/hooks/use-user-profile"
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
  const { toast } = useToast()
  const { theme } = useTheme()
  const { themeSettings } = useThemeSettings()

  const {
    profile,
    links,
    loading: profileLoading,
    isOwner,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
  } = useUserProfile(username)

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

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (profile) {
      updateProfile({ [name]: value })
    }
  }

  const handleToggleVerified = () => {
    if (profile) {
      updateProfile({ verified: !profile.verified })
    }
  }

  const handleUpdateSecondaryBg = (bgColor: string) => {
    if (profile) {
      const currentSettings = profile.theme_settings || {}
      updateProfile({
        theme_settings: {
          ...currentSettings,
          secondaryBg: bgColor,
        },
      })
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

  const handleDeleteLink = async (linkId: string) => {
    await deleteLink(linkId)
  }

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode)
  }

  // Show loading state
  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Show auth form if no user and no username provided (home page)
  if (!user && !username) {
    return <AuthForm />
  }

  // Show profile not found if username provided but no profile found
  if (username && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile not found</h1>
          <p className="text-muted-foreground mb-4">
            The user @{username} doesn't exist or hasn't set up their profile yet.
          </p>
          <Button onClick={() => (window.location.href = "/")}>Go Home</Button>
        </div>
      </div>
    )
  }

  // Convert database types to component props
  const profileData = profile
    ? {
        name: profile.display_name || profile.username,
        bio: profile.bio || "",
        avatarUrl: profile.avatar_url || "",
        secondaryBg: profile.theme_settings?.secondaryBg || "bg-secondary",
        verified: profile.verified,
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
        <h1 className="text-2xl font-bold">{username ? `@${username}` : "v0.me"}</h1>
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
                  onToggleVerified={handleToggleVerified}
                  onUpdateSecondaryBg={handleUpdateSecondaryBg}
                  onNewLinkChange={handleNewLinkChange}
                  onAddLink={handleAddLink}
                  onDeleteLink={handleDeleteLink}
                  onUpdateLink={handleUpdateLink}
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

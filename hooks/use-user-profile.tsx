"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"]

export function useUserProfile(username?: string, userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (username) {
      fetchProfile(username)
    } else if (userId) {
      fetchProfileByUserId(userId)
    } else {
      // If no username or userId provided, stop loading
      setLoading(false)
    }
  }, [username, userId])

  const fetchProfile = async (username: string) => {
    try {
      setLoading(true)

      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
      })

      // Get profile with timeout
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (profileError) throw profileError

      setProfile(profileData)

      // Get links with timeout
      const linksPromise = supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .order("position", { ascending: true })

      const { data: linksData, error: linksError } = await Promise.race([
        linksPromise,
        timeoutPromise
      ]) as any

      if (linksError) throw linksError

      setLinks(linksData || [])

      // Check if current user is the owner
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        const ownershipStatus = user?.id === profileData.id
        console.log('Ownership check:', { userId: user?.id, profileId: profileData.id, isOwner: ownershipStatus })
        setIsOwner(ownershipStatus)
      } catch (authError) {
        console.warn('Auth check failed:', authError)
        setIsOwner(false)
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchProfileByUserId = async (userId: string) => {
    try {
      setLoading(true)

      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000) // 10 second timeout
      })

      // Get profile by user ID with timeout
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      const { data: profileData, error: profileError } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any

      if (profileError) throw profileError

      setProfile(profileData)

      // Get links with timeout
      const linksPromise = supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .order("position", { ascending: true })

      const { data: linksData, error: linksError } = await Promise.race([
        linksPromise,
        timeoutPromise
      ]) as any

      if (linksError) throw linksError

      setLinks(linksData || [])

      // Check if current user is the owner
      const { data: { user } } = await supabase.auth.getUser()
      const ownershipStatus = user?.id === profileData.id
      console.log('Ownership check (by userId):', { userId: user?.id, profileId: profileData.id, isOwner: ownershipStatus })
      setIsOwner(ownershipStatus)
    } catch (error: any) {
      console.error("Error fetching profile by user ID:", error)
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id)

      if (error) throw error

      const updatedProfile = { ...profile, ...updates }
      setProfile(updatedProfile)
      
      // Re-check ownership after profile update to ensure isOwner stays correct
      try {
        const { data: { user } } = await supabase.auth.getUser()
        const ownershipStatus = user?.id === updatedProfile.id
        console.log('Ownership re-check after update:', { userId: user?.id, profileId: updatedProfile.id, isOwner: ownershipStatus })
        setIsOwner(ownershipStatus)
      } catch (authError) {
        console.warn('Auth re-check failed after update:', authError)
      }
      
      toast({
        title: "Profile updated",
        description: "Your changes have been saved",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const addLink = async (title: string, url: string) => {
    if (!profile) return

    // Normalize URL to ensure it has a protocol
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    try {
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: profile.id,
          title,
          url: normalizedUrl,
          position: links.length,
        })
        .select()
        .single()

      if (error) throw error

      setLinks([...links, data])
      toast({
        title: "Link added",
        description: "Your new link has been added",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const updateLink = async (linkId: string, updates: Partial<Link>) => {
    // Normalize URL if it's being updated
    if (updates.url) {
      let normalizedUrl = updates.url.trim()
      if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
        normalizedUrl = 'https://' + normalizedUrl
      }
      updates = { ...updates, url: normalizedUrl }
    }

    try {
      const { error } = await supabase.from("links").update(updates).eq("id", linkId)

      if (error) throw error

      setLinks(links.map((link) => (link.id === linkId ? { ...link, ...updates } : link)))

      toast({
        title: "Link updated",
        description: "Your link has been updated",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase.from("links").delete().eq("id", linkId)

      if (error) throw error

      setLinks(links.filter((link) => link.id !== linkId))
      toast({
        title: "Link deleted",
        description: "The link has been removed",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return {
    profile,
    links,
    loading,
    isOwner,
    updateProfile,
    addLink,
    updateLink,
    deleteLink,
    refetch: () => username && fetchProfile(username),
  }
}

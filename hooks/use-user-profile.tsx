"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]
type Link = Database["public"]["Tables"]["links"]["Row"]

export function useUserProfile(username?: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [links, setLinks] = useState<Link[]>([])
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (username) {
      fetchProfile(username)
    }
  }, [username])

  const fetchProfile = async (username: string) => {
    try {
      setLoading(true)

      // Get profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single()

      if (profileError) throw profileError

      setProfile(profileData)

      // Get links
      const { data: linksData, error: linksError } = await supabase
        .from("links")
        .select("*")
        .eq("user_id", profileData.id)
        .order("position", { ascending: true })

      if (linksError) throw linksError

      setLinks(linksData || [])

      // Check if current user is the owner
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsOwner(user?.id === profileData.id)
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

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    try {
      const { error } = await supabase.from("profiles").update(updates).eq("id", profile.id)

      if (error) throw error

      setProfile({ ...profile, ...updates })
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

    try {
      const { data, error } = await supabase
        .from("links")
        .insert({
          user_id: profile.id,
          title,
          url,
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

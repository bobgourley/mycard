"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/lib/supabase"

type Profile = Database["public"]["Tables"]["profiles"]["Row"]

interface UseDebouncedProfileProps {
  profile: Profile | null
  onProfileUpdate?: (profile: Profile) => void
}

export function useDebouncedProfile({ profile, onProfileUpdate }: UseDebouncedProfileProps) {
  const [localProfile, setLocalProfile] = useState<Profile | null>(profile)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pendingChangesRef = useRef<Partial<Profile>>({})

  // Update local profile when prop changes
  useEffect(() => {
    setLocalProfile(profile)
  }, [profile])

  const debouncedSave = useCallback(async (updates: Partial<Profile>) => {
    if (!profile) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profile.id)

      if (error) throw error

      // Update the profile with all pending changes
      const updatedProfile = { ...profile, ...updates }
      setLocalProfile(updatedProfile)
      onProfileUpdate?.(updatedProfile)

      // Clear pending changes
      pendingChangesRef.current = {}

      // Show success toast only for significant saves (not every keystroke)
      if (Object.keys(updates).length > 0) {
        toast({
          title: "Profile saved",
          description: "Your changes have been saved",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }, [profile, onProfileUpdate, toast])

  const updateProfile = useCallback((updates: Partial<Profile>) => {
    if (!profile) return

    // Update local state immediately for responsive UI
    setLocalProfile(prev => ({ ...prev, ...updates } as Profile))

    // Accumulate pending changes but don't auto-save anything
    // All saves will be manual via save button
    pendingChangesRef.current = { ...pendingChangesRef.current, ...updates }
  }, [localProfile, profile])

  const handleProfileChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    // Map form field names to database field names
    const fieldMapping: Record<string, keyof Profile> = {
      'name': 'display_name',
      'bio': 'bio',
      'username': 'username'
    }
    
    const dbFieldName = fieldMapping[name] || name
    updateProfile({ [dbFieldName]: value } as Partial<Profile>)
  }, [updateProfile])

  // No longer auto-save on blur - user must manually save
  const handleProfileBlur = useCallback(() => {
    // This function is kept for compatibility but does nothing
  }, [])

  // Manual save function for user-triggered saves
  const manualSave = useCallback(async () => {
    if (Object.keys(pendingChangesRef.current).length > 0) {
      await debouncedSave(pendingChangesRef.current)
    }
  }, [debouncedSave])

  // Check if there are unsaved changes
  const hasUnsavedChanges = useCallback(() => {
    return Object.keys(pendingChangesRef.current).length > 0
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  // Force save any pending changes when component unmounts or profile changes
  useEffect(() => {
    return () => {
      if (Object.keys(pendingChangesRef.current).length > 0) {
        debouncedSave(pendingChangesRef.current)
      }
    }
  }, [profile?.id, debouncedSave])

  return {
    profile: localProfile,
    updateProfile,
    handleProfileChange,
    handleProfileBlur,
    manualSave,
    hasUnsavedChanges,
    isSaving,
  }
}

"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useProfile } from "@/hooks/use-profile"
import { useLinks } from "@/hooks/use-links"
import { CardFlip } from "@/components/ui/card-flip"
import { Header } from "@/components/link-tree/header"
import { ProfileView } from "@/components/link-tree/profile-view"
import { EditView } from "@/components/link-tree/edit-view"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// Default profile data
const defaultProfile = {
  name: "Hayden Bleasel",
  bio: "I'm an Australian Design Engineer living in 🇺🇸 Delray Beach, Florida. I love creating beautiful software that delights users and reimagines the way we interact with technology. I'm also an avid drone pilot, gamer and open source maintainer.",
  avatarUrl: "https://github.com/haydenbleasel.png",
  secondaryBg: "bg-secondary",
  verified: true,
}

// Default links data
const defaultLinks = [
  {
    id: "1",
    title: "Personal Website",
    url: "https://www.haydenbleasel.com/",
  },
  {
    id: "2",
    title: "X / Twitter",
    url: "https://x.com/haydenbleasel",
  },
  {
    id: "3",
    title: "GitHub",
    url: "https://github.com/haydenbleasel",
  },
  {
    id: "4",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/haydenbleasel",
  },
]

export default function LinkTree() {
  const { toast } = useToast()
  const [isEditMode, setIsEditMode] = useState(false)
  const { theme } = useTheme()

  // Use custom hooks for profile and links management
  const { profile, handleProfileChange, toggleVerified, updateSecondaryBg, saveProfileChanges } =
    useProfile(defaultProfile)

  const { links, newLink, addLink, deleteLink, updateLink, handleNewLinkChange } = useLinks(defaultLinks)

  const { themeSettings } = useThemeSettings()

  const toggleEditMode = () => {
    if (isEditMode) {
      saveProfileChanges()
      toast({
        title: "Changes saved",
        description: "Your profile has been updated",
      })
    }
    setIsEditMode(!isEditMode)
  }

  // Apply font family to the entire application when it changes
  useEffect(() => {
    // Apply the selected font to the root element
    document.documentElement.classList.remove("font-sans", "font-serif", "font-mono")
    document.documentElement.classList.add(themeSettings.font)
  }, [themeSettings.font, theme])

  return (
    <div className={cn("w-full max-w-3xl mx-auto", themeSettings.font)}>
      <Header isEditMode={isEditMode} onToggleEditMode={toggleEditMode} />

      <div className="w-full max-w-md mx-auto">
        <CardFlip
          isFlipped={isEditMode}
          onFlip={toggleEditMode}
          frontContent={<ProfileView profile={profile} links={links} />}
          backContent={
            <EditView
              profile={profile}
              links={links}
              newLink={newLink}
              onProfileChange={handleProfileChange}
              onToggleVerified={toggleVerified}
              onUpdateSecondaryBg={updateSecondaryBg}
              onNewLinkChange={handleNewLinkChange}
              onAddLink={addLink}
              onDeleteLink={deleteLink}
              onUpdateLink={updateLink}
            />
          }
        />
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { LinksForm } from "@/components/link-tree/links-form"
import { ProfileForm } from "@/components/link-tree/profile-form"
import { ThemeForm } from "@/components/link-tree/theme-form"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { cn } from "@/lib/utils"
import type { Profile } from "@/hooks/use-profile"
import type { LinkItemProps } from "@/hooks/use-links"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Eye, Save, Trash2 } from "lucide-react"

interface EditViewProps {
  profile: Profile
  links: LinkItemProps[]
  newLink: { title: string; url: string }
  onProfileChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  onToggleVerified: () => void
  onUpdateSecondaryBg: (bgColor: string) => void
  onNewLinkChange: (field: "title" | "url", value: string) => void
  onAddLink: () => void
  onDeleteLink: (id: string) => void
  onUpdateLink: (link: LinkItemProps) => void
  onImageUpload: (url: string) => void
  onImageRemove: () => void
  onSave: () => void
  onViewProfile: () => void
  onDeleteProfile: () => void
  isAdmin?: boolean
}

export function EditView({
  profile,
  links,
  newLink,
  onProfileChange,
  onToggleVerified,
  onUpdateSecondaryBg,
  onNewLinkChange,
  onAddLink,
  onDeleteLink,
  onUpdateLink,
  onImageUpload,
  onImageRemove,
  onSave,
  onViewProfile,
  onDeleteProfile,
  isAdmin = false,
}: EditViewProps) {
  const [activeTab, setActiveTab] = useState("links")
  const { themeSettings } = useThemeSettings()
  const { theme, setTheme } = useTheme()

  return (
    <Card
      className={cn(
        "shadow-lg border-2 bg-background",
        themeSettings.borderRadius,
        themeSettings.effects.shadow ? "shadow-lg" : "shadow-none",
        themeSettings.effects.glassmorphism && "glassmorphism",
      )}
      style={{ opacity: themeSettings.effects.cardOpacity }}
    >
      <CardContent className="p-6">
        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button onClick={onSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <Button onClick={onViewProfile} variant="outline" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className={cn("w-full", themeSettings.font)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="links">Links</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="links" className="space-y-4">
            <LinksForm
              links={links}
              newLink={newLink}
              onNewLinkChange={onNewLinkChange}
              onAddLink={onAddLink}
              onDeleteLink={onDeleteLink}
              onUpdateLink={onUpdateLink}
            />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <ProfileForm 
              profile={profile} 
              onProfileChange={onProfileChange} 
              onToggleVerified={onToggleVerified}
              onImageUpload={onImageUpload}
              onImageRemove={onImageRemove}
              isAdmin={isAdmin}
            />
            
            {/* Delete Profile Section */}
            <div className="pt-6 border-t border-destructive/20">
              <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
              <p className="text-xs text-muted-foreground mb-4">
                Once you delete your profile, there is no going back. This will permanently delete your profile, all your links, and remove all data associated with your account.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Profile
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your profile
                      and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete Profile
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4">
            <ThemeForm
              profile={profile}
              onUpdateSecondaryBg={onUpdateSecondaryBg}
              currentTheme={theme}
              onThemeChange={setTheme}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { VerifiedBadge } from "@/components/verified-badge"
import { LinkItem } from "@/components/link-item"
import { useThemeSettings } from "@/hooks/use-theme-settings"
import { cn } from "@/lib/utils"
import Link from "next/link"
import type { Profile } from "@/hooks/use-profile"
import type { LinkItemProps } from "@/hooks/use-links"

interface ProfileViewProps {
  profile: Profile
  links: LinkItemProps[]
}

export function ProfileView({ profile, links }: ProfileViewProps) {
  const { themeSettings } = useThemeSettings()

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
        <div className={cn("flex flex-col items-center space-y-4", themeSettings.font)}>
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.name} />
            <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <h2 className="text-xl font-bold">{profile.name}</h2>
              {profile.verified && <VerifiedBadge />}
            </div>
            <p className="text-muted-foreground mt-1 text-sm max-w-md">{profile.bio}</p>
          </div>

          <div className="w-full space-y-3 mt-6">
            {links.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No links added yet. Click the edit button to add links.
              </p>
            ) : (
              links.map((link) => <LinkItem key={link.id} {...link} isEditMode={false} />)
            )}
          </div>

          {/* Get your own 123l.ink link */}
          <div className="mt-8 pt-4 border-t border-border/50">
            <Link 
              href="/" 
              className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Get your own <span className="font-semibold">123l.ink</span>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Save } from "lucide-react"

interface HeaderProps {
  isEditMode: boolean
  onToggleEditMode: () => void
}

export function Header({ isEditMode, onToggleEditMode }: HeaderProps) {
  return (
    <div className="flex justify-end items-center mb-6 px-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onToggleEditMode}
          aria-label={isEditMode ? "Save changes" : "Edit profile and links"}
        >
          {isEditMode ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}

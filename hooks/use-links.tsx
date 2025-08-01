"use client"

import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export interface LinkItemProps {
  id: string
  title: string
  url: string
}

export function useLinks(initialLinks: LinkItemProps[]) {
  const { toast } = useToast()
  const [links, setLinks] = useState<LinkItemProps[]>(initialLinks)
  const [newLink, setNewLink] = useState({ title: "", url: "" })

  // Add a new link
  const addLink = () => {
    if (newLink.title.trim() === "" || newLink.url.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter both a title and URL",
        variant: "destructive",
      })
      return
    }

    // Normalize URL to ensure it has a protocol
    let normalizedUrl = newLink.url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Validate URL format
    try {
      new URL(normalizedUrl)
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL (e.g., example.com or https://example.com)",
        variant: "destructive",
      })
      return
    }

    const updatedLinks = [
      ...links,
      {
        id: Date.now().toString(),
        title: newLink.title,
        url: normalizedUrl,
      },
    ]

    setLinks(updatedLinks)
    setNewLink({ title: "", url: "" })

    toast({
      title: "Link added",
      description: "Your new link has been added successfully",
    })
  }

  // Delete a link
  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
    toast({
      title: "Link deleted",
      description: "The link has been removed",
    })
  }

  // Update a link
  const updateLink = (updatedLink: LinkItemProps) => {
    setLinks(links.map((link) => (link.id === updatedLink.id ? updatedLink : link)))
    toast({
      title: "Link updated",
      description: "Your link has been updated successfully",
    })
  }

  // Handle new link input changes
  const handleNewLinkChange = (field: "title" | "url", value: string) => {
    setNewLink((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return {
    links,
    newLink,
    addLink,
    deleteLink,
    updateLink,
    handleNewLinkChange,
  }
}

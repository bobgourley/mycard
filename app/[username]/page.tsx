import MultiUserLinkTree from "@/components/multi-user-link-tree"
import type { Metadata } from "next"

interface UserPageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const decodedUsername = decodeURIComponent(params.username)
  return {
    title: `@${decodedUsername} - v0.me`,
    description: `Check out @${decodedUsername}'s links on v0.me`,
  }
}

export default function UserPage({ params }: UserPageProps) {
  // Decode the username to handle spaces and special characters
  const decodedUsername = decodeURIComponent(params.username)
  
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-secondary">
      <MultiUserLinkTree username={decodedUsername} />
    </main>
  )
}

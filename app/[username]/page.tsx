import MultiUserLinkTree from "@/components/multi-user-link-tree"
import type { Metadata } from "next"

interface UserPageProps {
  params: {
    username: string
  }
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  return {
    title: `@${params.username} - v0.me`,
    description: `Check out @${params.username}'s links on v0.me`,
  }
}

export default function UserPage({ params }: UserPageProps) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-secondary">
      <MultiUserLinkTree username={params.username} />
    </main>
  )
}

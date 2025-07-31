import MultiUserLinkTree from "@/components/multi-user-link-tree"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "v0.me - Create Your Personal Link Page",
  description: "Create a customizable link sharing page for all your important links",
}

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 bg-secondary">
      <MultiUserLinkTree />
    </main>
  )
}

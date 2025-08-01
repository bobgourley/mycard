import { LandingPage } from "@/components/landing-page"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "123l.ink - Create Your Personal Link Page | Free Link-in-Bio Tool",
  description: "Create a beautiful, customizable link-in-bio page for free. Perfect for social media, business cards, and sharing all your important links in one place.",
}

export default function Home() {
  return <LandingPage />
}

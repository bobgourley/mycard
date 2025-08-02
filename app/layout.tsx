import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import Script from "next/script"
import { Inter, Merriweather, JetBrains_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeSettingsProvider } from "@/hooks/use-theme-settings"
import { Toaster } from "@/components/ui/toaster"

// Load fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"],
  variable: "--font-serif",
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "123l.ink",
  description: "Your personal link sharing platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="font-sans">
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-595M7MMBLW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-595M7MMBLW');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${merriweather.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ThemeSettingsProvider>
            {children}
            <Toaster />
          </ThemeSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

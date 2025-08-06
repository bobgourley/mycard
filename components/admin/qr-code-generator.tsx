"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import html2canvas from "html2canvas"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, QrCode, Eye, EyeOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeGeneratorProps {
  username: string
  displayName: string
}

export function QRCodeGenerator({ username, displayName }: QRCodeGeneratorProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const profileUrl = `https://123l.ink/${username}`

  const downloadQRCode = async () => {
    if (!qrRef.current) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(qrRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher resolution
        width: 256,
        height: 256,
      })

      // Create download link
      const link = document.createElement("a")
      link.download = `${username}-qr-code.png`
      link.href = canvas.toDataURL("image/png")
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "QR Code Downloaded",
        description: `QR code for @${username} saved as PNG`,
      })
    } catch (error) {
      console.error("Error downloading QR code:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download QR code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4" />
          <span className="text-sm font-medium">QR Code</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <EyeOff className="h-4 w-4 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-1" />
                Show
              </>
            )}
          </Button>
          {isExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadQRCode}
              disabled={isDownloading}
            >
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Downloading..." : "Download PNG"}
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <Card className="mt-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Profile QR Code</CardTitle>
            <CardDescription className="text-xs">
              Scan to visit {displayName}'s profile
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div
              ref={qrRef}
              className="bg-white p-4 rounded-lg border"
              style={{ width: "fit-content" }}
            >
              <QRCodeSVG
                value={profileUrl}
                size={128}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {profileUrl}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

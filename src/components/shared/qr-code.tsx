'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateQRCodeDataUrl } from '@/lib/qr'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface QRCodeProps {
  url: string
  size?: number
  downloadable?: boolean
  className?: string
}

export function QRCode({
  url,
  size = 256,
  downloadable = false,
  className,
}: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    generateQRCodeDataUrl(url, size)
      .then((result) => {
        if (!cancelled) {
          setDataUrl(result)
          setIsLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to generate QR code')
          setIsLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [url, size])

  const handleDownload = useCallback(() => {
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = 'threshold-qr-code.png'
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [dataUrl])

  if (error) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-xl border border-alert/20 bg-alert/5 p-4 text-sm text-alert',
          className
        )}
        style={{ width: size, height: size }}
      >
        Failed to generate QR code
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {isLoading ? (
        <Skeleton
          className="rounded-xl"
          style={{ width: size, height: size }}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-clay/30 bg-linen p-3 shadow-sm">
          <img
            src={dataUrl!}
            alt={`QR code for ${url}`}
            width={size}
            height={size}
            className="block"
          />
        </div>
      )}

      {downloadable && !isLoading && dataUrl && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          className="gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Download QR Code
        </Button>
      )}
    </div>
  )
}

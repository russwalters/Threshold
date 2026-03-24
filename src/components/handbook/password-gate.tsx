'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { Lock, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

interface HandbookPasswordGateProps {
  shareId: string
  children: React.ReactNode
}

export function HandbookPasswordGate({ shareId, children }: HandbookPasswordGateProps) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)

  // Check sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`handbook-verified-${shareId}`)
      if (stored === 'true') {
        setVerified(true)
      }
    } catch {
      // sessionStorage unavailable (SSR, privacy mode, etc.)
    }
  }, [shareId])

  if (verified) {
    return <>{children}</>
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/handbook/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareId, password }),
      })
      const data = await res.json()

      if (data.verified) {
        try {
          sessionStorage.setItem(`handbook-verified-${shareId}`, 'true')
        } catch {
          // ignore
        }
        setVerified(true)
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="bg-white border-clay/20 shadow-xl">
          <CardContent className="p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="h-16 w-16 rounded-2xl bg-hearth/10 flex items-center justify-center mx-auto mb-5">
                <Lock className="h-8 w-8 text-hearth" />
              </div>
              <h1 className="font-heading text-2xl font-semibold text-hearth mb-2">
                Protected Handbook
              </h1>
              <p className="text-stone text-sm">
                This handbook is password protected. Enter the password provided by your property manager to continue.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="handbook-password" className="text-hearth font-medium">
                  Password
                </Label>
                <Input
                  id="handbook-password"
                  type="password"
                  placeholder="Enter handbook password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (error) setError(null)
                  }}
                  autoFocus
                  autoComplete="off"
                  className="h-12 text-base border-clay/30 focus:border-ember"
                />
                {error && (
                  <p className="text-sm text-alert font-medium animate-fade-in">{error}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 text-base font-medium bg-ember hover:bg-ember-dark text-white rounded-xl transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Verifying...
                  </>
                ) : (
                  'Access Handbook'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <div className="font-heading text-sm font-semibold text-stone/60">
            <span className="text-ember/60">t</span>hreshold
          </div>
        </div>
      </div>
    </div>
  )
}

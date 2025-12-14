'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Send } from 'lucide-react'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#111827]">
      <Card className="w-full max-w-md bg-[#1f2937] border-[#374151]">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#4f46e5] rounded-full flex items-center justify-center">
              <Send className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl text-[#f9fafb]">RCS Blaster</CardTitle>
          <CardDescription className="text-[#9ca3af]">
            Sign in to access the control panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#9ca3af]">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-[#374151] border-[#374151] text-[#f9fafb] placeholder-[#6b7280] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#9ca3af]">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-[#374151] border-[#374151] text-[#f9fafb] placeholder-[#6b7280] focus:border-[#4f46e5] focus:ring-[#4f46e5]"
              />
            </div>
            {error && (
              <Alert variant="destructive" className="bg-[#ef4444]/10 border-[#ef4444] text-[#ef4444]">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              type="submit"
              className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#374151]">
            <p className="text-xs text-center text-[#6b7280]">
              Default credentials: xcl991 / copolatos123
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

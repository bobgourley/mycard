"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function TestPage() {
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    setStatus("Testing connection...")
    
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1)
      
      if (error) {
        setStatus(`Connection Error: ${error.message}`)
      } else {
        setStatus("✅ Supabase connection successful!")
      }
    } catch (err: any) {
      setStatus(`Network Error: ${err.message}`)
    }
    
    setLoading(false)
  }

  const testAuth = async () => {
    setLoading(true)
    setStatus("Testing auth...")
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: 'test@example.com',
        password: 'testpassword123',
        options: {
          data: {
            username: 'testuser',
            display_name: 'Test User'
          }
        }
      })
      
      if (error) {
        setStatus(`Auth Error: ${error.message}`)
      } else {
        setStatus("✅ Auth test successful!")
      }
    } catch (err: any) {
      setStatus(`Auth Network Error: ${err.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-2xl font-bold mb-8">Supabase Connection Test</h1>
      
      <div className="space-y-4 w-full max-w-md">
        <div className="text-sm space-y-2">
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
          <p><strong>Key:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set ✅' : 'Not set ❌'}</p>
        </div>
        
        <Button onClick={testConnection} disabled={loading} className="w-full">
          Test Database Connection
        </Button>
        
        <Button onClick={testAuth} disabled={loading} className="w-full">
          Test Auth Signup
        </Button>
        
        <div className="p-4 bg-gray-100 rounded min-h-[100px]">
          <p className="text-sm">{status || "Click a button to test..."}</p>
        </div>
      </div>
    </div>
  )
}

import { useState, type ReactNode } from 'react'

const STORAGE_KEY = 'tabi_auth'
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD

function isAuthenticated(): boolean {
  if (!APP_PASSWORD) return true
  return localStorage.getItem(STORAGE_KEY) === 'true'
}

export function PasswordGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(isAuthenticated)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  if (!APP_PASSWORD || authed) return <>{children}</>

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value === APP_PASSWORD) {
      localStorage.setItem(STORAGE_KEY, 'true')
      setAuthed(true)
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="min-h-screen bg-[#fdf9f3] flex items-center justify-center">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 w-80 text-center">
        <h1 className="text-xl font-bold text-[#534434] mb-1 font-heading">tabi</h1>
        <p className="text-sm text-[#8a7a6a] mb-6">Enter password to continue</p>
        <input
          type="password"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(false) }}
          placeholder="Password"
          autoFocus
          className="w-full px-4 py-2.5 text-sm rounded-lg border border-[#e0d5c7] bg-[#fdf9f3] text-[#534434] placeholder:text-[#bfb09e] focus:outline-none focus:ring-2 focus:ring-[#d4a574]/40 focus:border-[#d4a574] transition-all"
        />
        {error && (
          <p className="text-xs text-red-500 mt-2">Incorrect password</p>
        )}
        <button
          type="submit"
          className="w-full mt-4 py-2.5 text-sm font-semibold text-white bg-[#d4a574] rounded-lg hover:bg-[#c4956a] transition-colors cursor-pointer"
        >
          Enter
        </button>
      </form>
    </div>
  )
}

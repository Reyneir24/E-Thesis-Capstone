import React, { createContext, useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'

// Mock user database (no Supabase Auth)
const MOCK_USERS = {
  'student@example.com': {
    id: 'student-001',
    name: 'John Student',
    email: 'student@example.com',
    password: 'password123',
    role: 'student',
  },
  'adviser@example.com': {
    id: 'adviser-001',
    name: 'Dr. Jane Adviser',
    email: 'adviser@example.com',
    password: 'password123',
    role: 'adviser',
  },
  'admin@example.com': {
    id: 'admin-001',
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
  },
}

export const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for logged in user
    const storedUser = localStorage.getItem('currentUser')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setProfile(parsedUser)
        setUser({ id: parsedUser.id, email: parsedUser.email })
      } catch (error) {
        console.error('Error parsing stored user:', error)
      }
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      // First try quick-login with MOCK_USERS for testing convenience
      const mockUser = MOCK_USERS[email]
      if (mockUser && mockUser.password === password) {
        // Try to fetch profile from Supabase; create if missing
        const { data: existing, error: fetchErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', email)
          .maybeSingle()

        if (fetchErr) {
          console.error('Supabase fetch profile error:', fetchErr)
        }

        let profileData = existing

        if (!existing) {
          const toInsert = {
            id: mockUser.id,
            name: mockUser.name,
            email: mockUser.email,
            role: mockUser.role,
          }
          const { data: inserted, error: insertErr } = await supabase
            .from('profiles')
            .insert([toInsert])
            .select()
            .maybeSingle()

          if (insertErr) console.error('Supabase insert profile error:', insertErr)
          profileData = inserted || toInsert
        }

        const userData = {
          id: profileData.id,
          name: profileData.name,
          email: profileData.email,
          role: profileData.role,
        }

        localStorage.setItem('currentUser', JSON.stringify(userData))
        setUser({ id: userData.id, email: userData.email })
        setProfile(userData)

        return { data: { user: userData }, error: null }
      }

      // If not a quick-login, try to find profile directly in Supabase (no auth)
      const { data: profileFromDb, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (profileErr) {
        return { data: null, error: profileErr }
      }

      if (!profileFromDb) {
        return { data: null, error: { message: 'Invalid email or password' } }
      }

      // If profile exists and we are not enforcing password, allow login for demo
      const userData = {
        id: profileFromDb.id,
        name: profileFromDb.name,
        email: profileFromDb.email,
        role: profileFromDb.role,
      }

      localStorage.setItem('currentUser', JSON.stringify(userData))
      setUser({ id: userData.id, email: userData.email })
      setProfile(userData)

      return { data: { user: userData }, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function logout() {
    localStorage.removeItem('currentUser')
    setUser(null)
    setProfile(null)
    return { error: null }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

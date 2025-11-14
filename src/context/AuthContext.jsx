import React, { createContext, useState, useEffect } from 'react'

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

      const mockUser = MOCK_USERS[email]

      if (!mockUser || mockUser.password !== password) {
        return {
          data: null,
          error: { message: 'Invalid email or password' },
        }
      }

      // Success - store user in localStorage
      const userData = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      }

      localStorage.setItem('currentUser', JSON.stringify(userData))
      setUser({ id: mockUser.id, email: mockUser.email })
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

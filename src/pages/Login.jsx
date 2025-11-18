import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import logo from '../components/logo.png'

export function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: loginError } = await login(email, password)

      if (loginError) {
        setError(loginError.message || 'Failed to login')
        return
      }

      // Redirect based on role
      if (data?.user?.role === 'student') {
        navigate('/student/dashboard')
      } else if (data?.user?.role === 'adviser') {
        navigate('/adviser/dashboard')
      } else if (data?.user?.role === 'admin') {
        navigate('/admin/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (cred) => {
    setEmail(cred.email)
    setPassword(cred.password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-gray via-neutral-white to-escr-yellow bg-opacity-10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="East System Colleges of Rizal" className="w-16 h-16" />
          </div>
          <h1 className="text-4xl font-bold text-escr-red mb-2">East System Colleges of Rizal</h1>
          <p className="text-gray-600">E-Thesis & Capstone Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition"
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-escr-red hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Quick Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3 font-medium">Quick Login:</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin({ email: 'student@example.com', password: 'password123' })}
                className="w-full p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-sm font-medium text-blue-800 transition"
              >
                👨‍🎓 Student Login
              </button>
              <button
                onClick={() => quickLogin({ email: 'adviser@example.com', password: 'password123' })}
                className="w-full p-3 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg text-sm font-medium text-orange-800 transition"
              >
                👨‍🏫 Adviser Login
              </button>
              <button
                onClick={() => quickLogin({ email: 'admin@example.com', password: 'password123' })}
                className="w-full p-3 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg text-sm font-medium text-red-800 transition"
              >
                ⚙️ Admin Login
              </button>
            </div>
          </div>

          {/* Test Credentials */}
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
            <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-green-700">
              <p className="font-medium">All accounts use: password123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Powered by Thesis Pro • Built with React & TailwindCSS
        </p>
      </div>
    </div>
  )
}

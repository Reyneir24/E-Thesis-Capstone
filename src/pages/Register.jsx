import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabase'
import { Mail, Lock, User, CheckCircle, AlertCircle } from 'lucide-react'
import logo from '../components/logo.png'

export function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', program: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      setError('Please fill in all required fields')
      return
    }
    if (!validateEmail(form.email)) {
      setError('Please enter a valid email address')
      return
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Sign up with Supabase Auth
      const { data: signData, error: signError } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password })
      if (signError) {
        setError(signError.message || 'Failed to register')
        setLoading(false)
        return
      }

      const user = signData?.user
      if (!user?.id) {
        setError('Could not create user account')
        setLoading(false)
        return
      }

      // Insert profile row in profiles table
      const profileRow = {
        id: user.id,
        name: form.name.trim(),
        email: form.email.trim(),
        role: 'student',
        program: form.program ? form.program.trim() : null,
        created_at: new Date().toISOString(),
      }

      const { data: inserted, error: insertErr } = await supabase.from('profiles').insert([profileRow]).select().maybeSingle()
      if (insertErr) {
        // If profile insert fails, show error. Consider rolling back auth user in production.
        setError(insertErr.message || 'Failed to create profile')
        setLoading(false)
        return
      }

      setSuccess('Registration successful — check your email to confirm (if required). Redirecting to login...')
      setForm({ name: '', program: '', email: '', password: '', confirm: '' })

      setTimeout(() => navigate('/login'), 1600)
    } catch (err) {
      console.error('Register error:', err)
      setError(err?.message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img src={logo} alt="ESCR" className="w-16 h-16 mx-auto" />
          <h1 className="text-2xl font-bold text-escr-red mt-3">Student Registration</h1>
          <p className="text-sm text-gray-600">Create your ESCR student account</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded flex items-start gap-3">
              <CheckCircle size={18} className="text-green-600" />
              <div className="text-sm text-green-700">{success}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red outline-none"
                  placeholder="Juan Dela Cruz"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Program (optional)</label>
              <input
                name="program"
                value={form.program}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-yellow outline-none"
                placeholder="e.g. BS Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red outline-none"
                  placeholder="you@example.edu.ph"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red outline-none"
                  placeholder="At least 8 characters"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  name="confirm"
                  type="password"
                  value={form.confirm}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red outline-none"
                  placeholder="Repeat your password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 bg-escr-red hover:bg-escr-orange text-white rounded-lg shadow-md font-medium transition disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <button onClick={() => navigate('/login')} className="text-escr-yellow hover:underline font-medium mt-2">
              Sign in
            </button>
          </div>
        </div>

        <p className="text-center text-gray-500 text-xs mt-4">Powered by East System Colleges of Rizal</p>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import logo from '../components/logo.png'

export function ChangePassword() {
  const navigate = useNavigate()
  const { profile, updatePassword } = useAuth()
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character (!@#$%^&*)'
    }
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // Validate new password
      const passwordError = validatePassword(formData.newPassword)
      if (passwordError) {
        setError(passwordError)
        setLoading(false)
        return
      }

      // Check passwords match
      if (formData.newPassword !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      // Update password in database
      const { error: updateErr } = await updatePassword(formData.newPassword)

      if (updateErr) {
        setError(updateErr.message || 'Failed to update password')
        return
      }

      setSuccess('Password changed successfully! Redirecting...')
      setFormData({ newPassword: '', confirmPassword: '' })

      // Redirect based on role after 1.5 seconds
      setTimeout(() => {
        if (profile?.role === 'student') {
          navigate('/student/dashboard')
        } else if (profile?.role === 'adviser') {
          navigate('/adviser/dashboard')
        } else if (profile?.role === 'admin') {
          navigate('/admin/dashboard')
        } else {
          navigate('/login')
        }
      }, 1500)
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-gray via-neutral-white to-escr-yellow bg-opacity-10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="East System Colleges of Rizal" className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold text-escr-red mb-2">Change Password</h1>
          <p className="text-gray-600">Please update your temporary password</p>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-lg shadow-soft p-8">
          {/* Info Alert */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700">
              You are logging in for the first time. Please change your temporary password to continue.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
              <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character (!@#$%^&*)
              </p>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.newPassword || !formData.confirmPassword}
              className="w-full py-2 px-4 bg-escr-red hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Updating Password...
                </>
              ) : (
                '🔐 Update Password'
              )}
            </button>
          </form>

          {/* Password Requirements */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700 mb-3">Password Requirements:</p>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex gap-2">
                <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>✓</span>
                At least 8 characters
              </li>
              <li className="flex gap-2">
                <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                One uppercase letter (A-Z)
              </li>
              <li className="flex gap-2">
                <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                One lowercase letter (a-z)
              </li>
              <li className="flex gap-2">
                <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                One number (0-9)
              </li>
              <li className="flex gap-2">
                <span className={/[!@#$%^&*]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>✓</span>
                One special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Powered by East System Colleges of Rizal • Built with React & TailwindCSS
        </p>
      </div>
    </div>
  )
}

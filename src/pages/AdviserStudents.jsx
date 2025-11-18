import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { Users, RefreshCw, AlertCircle, Plus, CheckCircle, X, Copy } from 'lucide-react'

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function generatePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export function AdviserStudents() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [showPasswordAlert, setShowPasswordAlert] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    fetchStudents(true)
    const channel = supabase
      .channel(`adviser-students-${profile.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'adviser_assignments',
        filter: `adviser_id=eq.${profile.id}`,
      }, () => fetchStudents())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStudents())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [profile?.id])

  async function fetchStudents(showSpinner = false) {
    if (!profile?.id) return
    if (showSpinner) setLoading(true)
    setError('')
    try {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('adviser_assignments')
        .select('student_id')
        .eq('adviser_id', profile.id)
      if (assignmentsError) throw assignmentsError
      const studentIds = assignments?.map((a) => a.student_id) || []
      if (studentIds.length === 0) {
        setStudents([])
        localStorage.setItem('assignedStudents', JSON.stringify([]))
        if (showSpinner) setLoading(false)
        return
      }
      const { data: studentProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, email, role')
        .in('id', studentIds)
      if (profilesError) throw profilesError
      const sorted = (studentProfiles || []).sort((a, b) => a.name.localeCompare(b.name))
      setStudents(sorted)
      localStorage.setItem('assignedStudents', JSON.stringify(sorted))
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students')
      try {
        const cached = JSON.parse(localStorage.getItem('assignedStudents') || '[]')
        setStudents(cached)
      } catch (cacheError) {
        console.error('Cache error:', cacheError)
      }
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  async function handleAddStudent(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (!formData.name || !formData.email) {
        setError('Please fill in all fields')
        return
      }
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle()
      if (existing) {
        setError('A student with that email already exists')
        return
      }

      const tempPassword = generatePassword()
      const newStudent = {
        id: generateUUID(),
        name: formData.name,
        email: formData.email,
        password: tempPassword,
        role: 'student',
        first_login: true,
        created_at: new Date().toISOString(),
      }

      const { data: createdStudent, error: createError } = await supabase
        .from('profiles')
        .insert([newStudent])
        .select()
        .single()
      if (createError) throw createError

      const { error: assignError } = await supabase
        .from('adviser_assignments')
        .insert([{ student_id: createdStudent.id, adviser_id: profile.id }])
      if (assignError) throw assignError

      setGeneratedPassword(tempPassword)
      setShowPasswordAlert(true)
      setFormData({ name: '', email: '' })
      setShowForm(false)
      setTimeout(() => fetchStudents(true), 1000)
    } catch (err) {
      console.error('Error adding student:', err)
      setError(err.message || 'Failed to add student')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assigned students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Students</h1>
          <p className="text-sm opacity-90">Manage and review your assigned student submissions</p>
        </div>
        <button
          onClick={() => fetchStudents(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-semibold"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
          <CheckCircle className="text-green-600" size={20} />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Password Alert */}
      {showPasswordAlert && generatedPassword && (
        <div className="p-6 bg-blue-50 border-2 border-blue-400 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🔐 Temporary Password Generated</h3>
          <p className="text-sm text-blue-800 mb-4">Share this password with the student. They will be required to change it on first login.</p>
          <div className="bg-white p-4 rounded border border-blue-300 mb-4">
            <p className="text-xs text-gray-600 mb-2">Temporary Password:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 font-mono text-lg font-bold text-blue-600 bg-gray-100 p-3 rounded">{generatedPassword}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedPassword)
                  alert('Password copied!')
                }}
                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowPasswordAlert(false)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
          >
            Done
          </button>
        </div>
      )}

      {/* Add Student Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium"
        >
          <Plus size={18} />
          Add New Student
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Add New Student</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium"
              >
                Add Student
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-soft">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No assigned students yet</p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition border border-transparent hover:border-escr-yellow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-escr-yellow rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-escr-red">{student.name?.[0]?.toUpperCase()}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                  <p className="text-xs text-gray-400 capitalize">{student.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  try {
                    localStorage.setItem('selectedStudentId', student.id)
                    localStorage.setItem('selectedStudentName', student.name || '')
                  } catch (e) {
                    console.error('Storage error:', e)
                  }
                  navigate('/adviser/reviews')
                }}
                className="w-full py-2 px-4 bg-escr-red text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
              >
                View Submissions
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

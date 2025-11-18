import React, { useState, useEffect } from 'react'
import { Users, Mail, Trash2, AlertCircle, Edit2 } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

// Function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { profile: currentProfile } = useAuth()

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      // Try to fetch users from Supabase
      const { data, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchErr) {
        console.error('Supabase fetch users error:', fetchErr)
        setError(fetchErr.message || 'Failed to fetch users')
        // Fallback to localStorage mock
        const stored = localStorage.getItem('users')
        if (stored) {
          setUsers(JSON.parse(stored))
        }
        return
      }

      // If no users in DB yet, seed with mock users (dev only)
      if (!data || data.length === 0) {
        const timestamp = new Date().toISOString()
        const mockUsers = [
          { id: '550e8400-e29b-41d4-a716-446655440001', name: 'John Student', email: 'student@example.com', role: 'student', created_at: timestamp },
          { id: '550e8400-e29b-41d4-a716-446655440004', name: 'Dr. Jane Adviser', email: 'adviser@example.com', role: 'adviser', created_at: timestamp },
          { id: '550e8400-e29b-41d4-a716-446655440006', name: 'Admin User', email: 'admin@example.com', role: 'admin', created_at: timestamp },
        ]
        const { data: inserted, error: insertErr } = await supabase.from('profiles').insert(mockUsers)
        if (insertErr) {
          console.error('Error seeding users:', insertErr)
          setError(insertErr.message)
        } else {
          setUsers(inserted)
        }
        return
      }

      setUsers(data)
    } catch (error) {
      console.error('Error fetching users:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }
  async function saveUser(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      // Email uniqueness check
      if (!editingUserId) {
        // When creating new user - check if email exists
        const { data: existing } = await supabase.from('profiles').select('id').eq('email', formData.email).maybeSingle()
        if (existing) {
          setError('A user with that email already exists')
          return
        }
      } else {
        // When editing - check if new email is different and unique
        const currentUser = users.find(u => u.id === editingUserId)
        if (formData.email !== currentUser?.email) {
          const { data: existing } = await supabase.from('profiles').select('id').eq('email', formData.email).maybeSingle()
          if (existing) {
            setError('A user with that email already exists')
            return
          }
        }
      }

      if (editingUserId) {
        // Update existing user in Supabase
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          updated_at: new Date().toISOString()
        }
        
        const { data: updated, error: updateErr } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingUserId)
          .select()
          .single()
        
        if (updateErr) {
          console.error('Update error:', updateErr)
          setError(updateErr.message || 'Failed to update user')
        } else {
          setSuccess('User updated successfully!')
          await fetchUsers()
          setFormData({ name: '', email: '', password: '', role: 'student' })
          setShowForm(false)
          setEditingUserId(null)
        }
      } else {
        // Create new user in Supabase
        const newUser = {
          id: generateUUID(),
          name: formData.name,
          email: formData.email,
          role: formData.role,
          created_at: new Date().toISOString(),
        }

        const { data: inserted, error: insertErr } = await supabase.from('profiles').insert([newUser]).select().single()
        if (insertErr) {
          console.error('Insert error:', insertErr)
          setError(insertErr.message || 'Failed to create user')
        } else {
          setSuccess('User created successfully!')
          await fetchUsers()
          setFormData({ name: '', email: '', password: '', role: 'student' })
          setShowForm(false)
          setEditingUserId(null)
        }
      }
    } catch (err) {
      console.error('Save user error:', err)
      setError(err.message || 'An error occurred while saving')
    }
  }

  function startEdit(user) {
    setEditingUserId(user.id)
    setFormData({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'student' })
    setShowForm(true)
    setError('')
    setSuccess('')
  }

  async function handleDelete(userId) {
    if (!confirm('Delete this user? This action cannot be undone.')) return

    // Prevent deleting currently logged-in admin
    if (currentProfile && currentProfile.id === userId) {
      setError('You cannot delete your own account while logged in')
      return
    }

    try {
      const { error: delErr } = await supabase.from('profiles').delete().eq('id', userId)
      if (delErr) {
        setError(delErr.message)
      } else {
        setSuccess('User deleted')
        await fetchUsers()
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'adviser':
        return 'bg-orange-100 text-orange-800'
      case 'student':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white flex-1">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-sm opacity-90">Create and manage system users</p>
        </div>
        <button
          onClick={() => {
            // Toggle form; cancel edit if open
            if (showForm) {
              setShowForm(false)
              setEditingUserId(null)
              setFormData({ name: '', email: '', password: '', role: 'student' })
              setError('')
              setSuccess('')
            } else {
              setShowForm(true)
            }
          }}
          className="ml-6 px-6 py-3 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium"
        >
          {showForm ? (editingUserId ? 'Cancel Edit' : 'Cancel') : 'Create User'}
        </button>
      </div>

      {/* Create User Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-soft p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={saveUser} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
                // password not required on edit
                required={!editingUserId}
              />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
              >
                <option value="student">Student</option>
                <option value="adviser">Adviser</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium"
            >
              {editingUserId ? 'Save Changes' : 'Create User'}
            </button>
          </form>
        </div>
      )}

      {/* Users List */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">All Users ({users.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-gray border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Role</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-neutral-gray transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-escr-yellow rounded-full flex items-center justify-center text-sm font-bold text-escr-red">
                        {getInitials(user.name)}
                      </div>
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button onClick={() => startEdit(user)} className="text-gray-600 hover:text-gray-800 transition">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-800 transition">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

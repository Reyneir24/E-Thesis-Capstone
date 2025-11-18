import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { Users, RefreshCw, AlertCircle } from 'lucide-react'

export function AdviserStudents() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile?.id) return

    fetchStudents(true)

    const channel = supabase
      .channel(`adviser-students-${profile.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'adviser_assignments',
          filter: `adviser_id=eq.${profile.id}`,
        },
        () => fetchStudents()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        () => fetchStudents()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  async function fetchStudents(showSpinner = false) {
    if (!profile?.id) return
    if (showSpinner) {
      setLoading(true)
    }
    setError('')

    try {
      const { data: assignments, error: assignmentsError } = await supabase
        .from('adviser_assignments')
        .select('student_id')
        .eq('adviser_id', profile.id)

      if (assignmentsError) throw assignmentsError

      const studentIds = assignments?.map((assignment) => assignment.student_id) || []

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

      const sortedStudents = (studentProfiles || []).sort((a, b) => a.name.localeCompare(b.name))
      setStudents(sortedStudents)
      localStorage.setItem('assignedStudents', JSON.stringify(sortedStudents))
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Failed to load students')

      // Fallback to cached data
      try {
        const cached = JSON.parse(localStorage.getItem('assignedStudents') || '[]')
        setStudents(cached)
      } catch (cacheError) {
        console.error('Error loading cached students:', cacheError)
      }
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
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
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Assigned Students</h1>
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

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-soft">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No assigned students yet</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition border border-transparent hover:border-escr-yellow">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-escr-yellow rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-escr-red">
                    {student.name?.[0]?.toUpperCase()}
                  </span>
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
                  } catch (storageError) {
                    console.error('Failed to cache student filter:', storageError)
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

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { Users, BookOpen, AlertCircle, CheckCircle } from 'lucide-react'

export function AdminAssignments() {
  const { profile } = useAuth()
  const [assignments, setAssignments] = useState([])
  const [students, setStudents] = useState([])
  const [advisers, setAdvisers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    student_id: '',
    adviser_id: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      // Fetch assignments
      const { data: assignData, error: assignError } = await supabase
        .from('adviser_assignments')
        .select('*')
        .order('created_at', { ascending: false })

      if (assignError) throw assignError

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')

      if (studentsError) throw studentsError

      // Fetch advisers
      const { data: advisersData, error: advisersError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'adviser')

      if (advisersError) throw advisersError

      setAssignments(assignData || [])
      setStudents(studentsData || [])
      setAdvisers(advisersData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleAssign(e) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!formData.student_id || !formData.adviser_id) {
      setError('Please select both student and adviser')
      return
    }

    try {
      const { error: insertError } = await supabase.from('adviser_assignments').insert([
        {
          student_id: formData.student_id,
          adviser_id: formData.adviser_id,
        },
      ])

      if (insertError) throw insertError

      setSuccess('Assignment created successfully!')
      setFormData({ student_id: '', adviser_id: '' })
      setShowForm(false)
      fetchData()
    } catch (error) {
      console.error('Error creating assignment:', error)
      setError(error.message)
    }
  }

  async function handleDelete(assignmentId) {
    if (!window.confirm('Are you sure you want to remove this assignment?')) return

    try {
      const { error: deleteError } = await supabase
        .from('adviser_assignments')
        .delete()
        .eq('id', assignmentId)

      if (deleteError) throw deleteError

      setSuccess('Assignment removed successfully!')
      fetchData()
    } catch (error) {
      console.error('Error deleting assignment:', error)
      setError(error.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignments...</p>
        </div>
      </div>
    )
  }

  const getStudentName = (id) => students.find((s) => s.id === id)?.name || 'Unknown'
  const getAdviserName = (id) => advisers.find((a) => a.id === id)?.name || 'Unknown'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Manage Assignments</h1>
        <p className="text-sm opacity-90">Assign students to advisers</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Create Assignment Form */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium"
        >
          New Assignment
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Assignment</h2>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <select
                value={formData.student_id}
                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select a student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adviser</label>
              <select
                value={formData.adviser_id}
                onChange={(e) => setFormData({ ...formData, adviser_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select an adviser</option>
                {advisers.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-escr-red hover:bg-red-700 text-white rounded-lg transition"
              >
                Create Assignment
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Adviser</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Assigned Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignments.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                  No assignments yet
                </td>
              </tr>
            ) : (
              assignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">{getStudentName(assignment.student_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{getAdviserName(assignment.adviser_id)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Assignments</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{assignments.length}</p>
            </div>
            <BookOpen className="text-escr-red" size={32} />
          </div>
        </div>
      </div>
    </div>
  )
}

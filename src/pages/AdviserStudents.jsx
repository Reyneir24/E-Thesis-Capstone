import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Users } from 'lucide-react'

export function AdviserStudents() {
  const { profile } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStudents()
  }, [profile?.id])

  function fetchStudents() {
    try {
      // Get demo student data
      setStudents([
        {
          id: 'student-001',
          name: 'John Student',
          email: 'student@example.com',
          role: 'student',
        },
      ])
    } catch (error) {
      console.error('Error fetching students:', error)
    } finally {
      setLoading(false)
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
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Assigned Students</h1>
        <p className="text-sm opacity-90">Manage and review your assigned student submissions</p>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-soft">
            <Users size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No assigned students yet</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow-soft p-6 hover:shadow-md transition">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-escr-yellow rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold text-escr-red">
                    {student.name?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.email}</p>
                </div>
              </div>
              <button className="w-full py-2 px-4 bg-escr-red text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
                View Submissions
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

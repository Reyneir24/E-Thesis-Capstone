import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export function AdviserDashboard() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [profile?.id])

  function fetchData() {
    try {
      // Get all submissions (for demo, adviser sees all)
      const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      setSubmissions(allSubmissions)

      // Count feedback given by this adviser
      const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
      const adviserFeedback = allFeedback.filter((f) => f.adviser_id === profile?.id)
      setFeedbackCount(adviserFeedback.length)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Total Submissions', value: submissions.length, icon: FileText, color: 'escr-red' },
    { label: 'Pending Reviews', value: submissions.filter((s) => s.status === 'Submitted').length, icon: Clock, color: 'escr-orange' },
    { label: 'Feedback Given', value: feedbackCount, icon: CheckCircle, color: 'green-600' },
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800'
      case 'For Revision':
        return 'bg-yellow-100 text-yellow-800'
      case 'Rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
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
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome, {profile?.name}!</h1>
        <p className="text-sm opacity-90">Review thesis submissions and provide feedback</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 bg-${stat.color} bg-opacity-10 rounded-lg`}>
                  <Icon className={`text-${stat.color}`} size={32} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Pending Reviews */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Reviews</h2>
        {submissions.filter((s) => s.status === 'Submitted').length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">All submissions reviewed</p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions
              .filter((s) => s.status === 'Submitted')
              .map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-neutral-gray transition">
                  <div>
                    <p className="font-medium text-gray-800">{submission.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-escr-red text-white rounded-lg hover:bg-red-700 transition text-sm font-medium">
                    Review
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">All Submissions</h2>
        <div className="space-y-3">
          {submissions.slice(0, 5).map((submission) => (
            <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium text-gray-800">{submission.title}</p>
                <p className="text-sm text-gray-500">
                  {new Date(submission.created_at).toLocaleDateString()}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { FileText, MessageSquare, Calendar } from 'lucide-react'

export function StudentSubmissions() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubmissions()
  }, [profile?.id])

  async function fetchSubmissions() {
    try {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('thesis_submissions')
        .select('*')
        .eq('student_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      // Fallback to localStorage
      try {
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        const userSubmissions = allSubmissions.filter((s) => s.student_id === profile?.id)
        setSubmissions(userSubmissions)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  async function fetchFeedback(submissionId) {
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFeedback(data || [])
      setSelectedSubmission(submissionId)
    } catch (error) {
      console.error('Error fetching feedback:', error)
      // Fallback to localStorage
      try {
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
        const submissionFeedback = allFeedback.filter((f) => f.submission_id === submissionId)
        setFeedback(submissionFeedback)
        setSelectedSubmission(submissionId)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    }
  }

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
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submissions List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Submissions</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => fetchFeedback(submission.id)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedSubmission === submission.id
                      ? 'border-escr-red bg-red-50'
                      : 'border-gray-200 hover:border-escr-yellow bg-neutral-gray'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{submission.title}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(submission.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Feedback
          </h3>
          {selectedSubmission && feedback.length > 0 ? (
            <div className="space-y-4">
              {feedback.map((fb) => (
                <div key={fb.id} className="p-4 bg-neutral-gray rounded-lg">
                  <p className="text-sm text-gray-800">{fb.comment}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(fb.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : selectedSubmission ? (
            <p className="text-sm text-gray-500 text-center py-8">No feedback yet</p>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Select a submission to view feedback</p>
          )}
        </div>
      </div>
    </div>
  )
}

import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { MessageSquare, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export function AdviserReviews() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('Submitted')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [profile?.id])

  async function fetchSubmissions() {
    try {
      // Get all submissions for review
      const { data, error: fetchError } = await supabase
        .from('thesis_submissions')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setSubmissions(data || [])
    } catch (error) {
      console.error('Error fetching submissions:', error)
      setError(error.message)
      
      // Fallback to localStorage
      try {
        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        setSubmissions(allSubmissions)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmitFeedback() {
    if (!selectedSubmission) return

    setSubmitting(true)
    setError('')

    try {
      // Add feedback to Supabase
      if (feedback.trim()) {
        const { error: feedbackError } = await supabase
          .from('feedback')
          .insert([
            {
              id: `feedback-${Date.now()}`,
              submission_id: selectedSubmission.id,
              adviser_id: profile.id,
              comment: feedback,
            },
          ])

        if (feedbackError) throw feedbackError
      }

      // Update submission status in Supabase
      const { error: updateError } = await supabase
        .from('thesis_submissions')
        .update({
          status,
          adviser_id: profile.id,
        })
        .eq('id', selectedSubmission.id)

      if (updateError) throw updateError

      // Refresh submissions
      await fetchSubmissions()
      setSelectedSubmission(null)
      setFeedback('')
      setStatus('Submitted')
    } catch (err) {
      console.error('Submit feedback error:', err)
      setError(err.message)
      
      // Fallback to localStorage
      try {
        if (feedback.trim()) {
          const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
          allFeedback.push({
            id: `feedback-${Date.now()}`,
            submission_id: selectedSubmission.id,
            adviser_id: profile.id,
            comment: feedback,
            created_at: new Date().toISOString(),
          })
          localStorage.setItem('feedback', JSON.stringify(allFeedback))
        }

        const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        const updatedSubmissions = allSubmissions.map((s) =>
          s.id === selectedSubmission.id
            ? { ...s, status, adviser_id: profile.id }
            : s
        )
        localStorage.setItem('submissions', JSON.stringify(updatedSubmissions))
        
        await fetchSubmissions()
        setSelectedSubmission(null)
        setFeedback('')
        setStatus('Submitted')
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setSubmitting(false)
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
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Submissions List */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Review Queue</h2>
          {submissions.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No submissions to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => {
                    setSelectedSubmission(submission)
                    setStatus(submission.status)
                  }}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedSubmission?.id === submission.id
                      ? 'border-escr-red bg-red-50'
                      : 'border-gray-200 hover:border-escr-yellow'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{submission.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{submission.description}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
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

      {/* Review Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MessageSquare size={20} />
            Add Feedback
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {selectedSubmission ? (
            <div className="space-y-4">
              {/* Feedback Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide constructive feedback..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
                >
                  <option>Submitted</option>
                  <option>For Revision</option>
                  <option>Approved</option>
                  <option>Rejected</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                className="w-full py-2 px-4 bg-escr-red hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Select a submission to review</p>
          )}
        </div>
      </div>
    </div>
  )
}

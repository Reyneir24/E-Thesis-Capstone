import React, { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { MessageSquare, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export function AdviserReviews() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedback, setFeedback] = useState('')
  const [status, setStatus] = useState('Submitted')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const pendingSelectionId = useRef(localStorage.getItem('selectedSubmissionId'))
  const studentFilterRef = useRef(localStorage.getItem('selectedStudentId'))
  const studentFilterNameRef = useRef(localStorage.getItem('selectedStudentName'))
  const activeSubmissionRef = useRef(null)

  useEffect(() => {
    activeSubmissionRef.current = selectedSubmission?.id || null
  }, [selectedSubmission])

  useEffect(() => {
    if (!profile?.id) return

    fetchSubmissions()

    const channel = supabase
      .channel(`adviser-reviews-${profile.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'thesis_submissions' },
        () => fetchSubmissions(activeSubmissionRef.current || undefined)
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'feedback' },
        () => fetchSubmissions(activeSubmissionRef.current || undefined)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id])

  function normalizeFeedback(entries = []) {
    return entries.map((entry) => ({
      id: entry.id,
      comment: entry.comment,
      created_at: entry.created_at,
      author_id: entry.adviser_id,
      authorName: entry.profiles?.name || entry.authorName || (entry.adviser_id === profile?.id ? profile?.name : 'Student'),
      authorRole: entry.profiles?.role || entry.authorRole || (entry.adviser_id === profile?.id ? 'adviser' : 'student'),
    }))
  }

  async function loadFeedbackHistory(submissionId) {
    if (!submissionId) {
      setFeedbackHistory([])
      return
    }
    setHistoryLoading(true)
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select(
          `
            id,
            comment,
            created_at,
            adviser_id,
            profiles:adviser_id (
              name,
              role
            )
          `
        )
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      setFeedbackHistory(normalizeFeedback(data))
    } catch (error) {
      console.error('Error loading feedback history:', error)
      setError('Unable to load feedback history.')
      try {
        const cached = JSON.parse(localStorage.getItem('feedback') || '[]')
        const submissionFeedback = cached.filter((f) => f.submission_id === submissionId)
        setFeedbackHistory(normalizeFeedback(submissionFeedback))
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  async function fetchSubmissions(targetSelectionId) {
    try {
      // Get all submissions for review
      let query = supabase
        .from('thesis_submissions')
        .select(
          `
            *,
            student:profiles!thesis_submissions_student_id_fkey (
              name,
              email
            )
          `
        )

      if (studentFilterRef.current) {
        query = query.eq('student_id', studentFilterRef.current)
      }

      const { data, error: fetchError } = await query.order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setSubmissions(data || [])
      const activeSelectionId = targetSelectionId || pendingSelectionId.current
      if (activeSelectionId) {
        const preselect = (data || []).find((submission) => submission.id === activeSelectionId)
        if (preselect) {
          setSelectedSubmission(preselect)
          setStatus(preselect.status || 'Submitted')
          await loadFeedbackHistory(preselect.id)
          try {
            localStorage.removeItem('selectedSubmissionId')
          } catch (storageError) {
            console.error('Failed to clear cached selection:', storageError)
          }
        }
        pendingSelectionId.current = null
      } else if (studentFilterRef.current && data && data.length > 0) {
        setSelectedSubmission(data[0])
        setStatus(data[0].status || 'Submitted')
        await loadFeedbackHistory(data[0].id)
      } else if (!targetSelectionId) {
        setSelectedSubmission(null)
        setFeedbackHistory([])
      }
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

  function clearStudentFilter() {
    try {
      localStorage.removeItem('selectedStudentId')
      localStorage.removeItem('selectedStudentName')
    } catch (error) {
      console.error('Failed to clear student filter:', error)
    }
    studentFilterRef.current = null
    studentFilterNameRef.current = null
    pendingSelectionId.current = null
    fetchSubmissions()
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
            authorName: profile?.name,
            authorRole: profile?.role,
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
        
        setStatus('Submitted')
        setFeedback('')
        await fetchSubmissions(selectedSubmission.id)
        await loadFeedbackHistory(selectedSubmission.id)
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
          {studentFilterRef.current && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center justify-between text-sm">
              <div>
                Viewing submissions for{' '}
                <span className="font-semibold text-gray-800">
                  {studentFilterNameRef.current || 'selected student'}
                </span>
              </div>
              <button
                onClick={clearStudentFilter}
                className="text-escr-red font-semibold text-xs hover:underline"
              >
                Clear filter
              </button>
            </div>
          )}
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
                    try {
                      localStorage.removeItem('selectedSubmissionId')
                    } catch (storageError) {
                      console.error('Failed to clear cached selection:', storageError)
                    }
                    setSelectedSubmission(submission)
                    setStatus(submission.status || 'Submitted')
                    loadFeedbackHistory(submission.id)
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
                      <p className="text-xs text-gray-500 mt-2">
                        Student: {submission.student?.name || 'Unknown'} ({submission.student?.email || 'N/A'})
                      </p>
                      <p className="text-xs text-gray-400">
                        Submitted: {new Date(submission.created_at).toLocaleString()}
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

              {/* History */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-700">Conversation History</p>
                  {historyLoading && <Loader2 className="animate-spin text-escr-red" size={18} />}
                </div>
                {feedbackHistory.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">No comments yet.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {feedbackHistory.map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-3 rounded-lg border text-sm ${
                          entry.author_id === profile?.id ? 'bg-escr-red/10 border-escr-red/30' : 'bg-neutral-gray border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span className="font-semibold text-gray-700">
                            {entry.authorName}{' '}
                            <span className="uppercase tracking-wide text-[10px] text-gray-400">
                              {entry.authorRole}
                            </span>
                          </span>
                          <span>{new Date(entry.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-gray-800 whitespace-pre-line">{entry.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">Select a submission to review</p>
          )}
        </div>
      </div>
    </div>
  )
}

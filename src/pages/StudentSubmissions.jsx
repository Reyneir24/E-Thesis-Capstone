import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { FileText, MessageSquare, Calendar, Send, Loader2 } from 'lucide-react'

export function StudentSubmissions() {
  const { profile } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [comment, setComment] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

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

  function normalizeFeedback(data = []) {
    return data.map((entry) => ({
      id: entry.id,
      comment: entry.comment,
      created_at: entry.created_at,
      author_id: entry.adviser_id,
      authorName: entry.profiles?.name || entry.authorName || 'Unknown User',
      authorRole: entry.profiles?.role || entry.authorRole || (entry.adviser_id === profile?.id ? profile.role : 'adviser'),
    }))
  }

  async function fetchFeedback(submission) {
    if (!submission?.id) return
    setError('')
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
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setFeedbackHistory(normalizeFeedback(data))
      setSelectedSubmission(submission)
    } catch (error) {
      console.error('Error fetching feedback:', error)
      setError('Unable to load feedback history.')
      try {
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
        const submissionFeedback = allFeedback.filter((f) => f.submission_id === submission.id)
        setFeedbackHistory(normalizeFeedback(submissionFeedback))
        setSelectedSubmission(submission)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setHistoryLoading(false)
    }
  }

  async function handleAddComment() {
    if (!selectedSubmission || !comment.trim()) return
    setSending(true)
    setError('')

    try {
      const { error: insertError } = await supabase
        .from('feedback')
        .insert([
          {
            submission_id: selectedSubmission.id,
            adviser_id: profile.id,
            comment: comment.trim(),
          },
        ])

      if (insertError) throw insertError

      setComment('')
      await fetchFeedback(selectedSubmission)
    } catch (err) {
      console.error('Student feedback error:', err)
      setError(err.message || 'Unable to send comment.')

      // Fallback to localStorage for offline dev scenarios
      try {
        const newEntry = {
          id: `feedback-${Date.now()}`,
          submission_id: selectedSubmission.id,
          adviser_id: profile.id,
          comment: comment.trim(),
          created_at: new Date().toISOString(),
          authorName: profile?.name,
          authorRole: profile?.role,
        }
        const allFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
        allFeedback.push(newEntry)
        localStorage.setItem('feedback', JSON.stringify(allFeedback))
        setComment('')
        setFeedbackHistory((prev) => [...prev, normalizeFeedback([newEntry])[0]])
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setSending(false)
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
                  onClick={() => fetchFeedback(submission)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition ${
                    selectedSubmission?.id === submission.id
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

      {/* Conversation Panel */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-soft p-6 sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={20} />
              Feedback Conversation
            </h3>
            {historyLoading && (
              <Loader2 className="animate-spin text-escr-red" size={18} />
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {!selectedSubmission ? (
            <p className="text-sm text-gray-500 text-center py-8">Select a submission to view the conversation.</p>
          ) : (
            <>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {feedbackHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No feedback yet. Start the conversation!</p>
                ) : (
                  feedbackHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-lg border ${
                        entry.author_id === profile?.id ? 'bg-escr-red/10 border-escr-red/30' : 'bg-neutral-gray border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-semibold text-gray-700">
                          {entry.authorName}{' '}
                          <span className="uppercase tracking-wide text-[10px] text-gray-400">
                            {entry.authorRole || (entry.author_id === profile?.id ? 'student' : 'adviser')}
                          </span>
                        </span>
                        <span>{new Date(entry.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{entry.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Comment Box */}
              <div className="mt-6 border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add your comment
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share updates or ask questions..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none resize-none"
                  disabled={sending}
                />
                <button
                  onClick={handleAddComment}
                  disabled={sending || !comment.trim()}
                  className="mt-3 w-full py-2 px-4 bg-escr-red text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Send Comment
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

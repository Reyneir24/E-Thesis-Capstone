import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { BarChart3, TrendingUp, Users, FileText, CheckCircle, Clock, XCircle, Calendar, Download } from 'lucide-react'

export function AdminReports() {
  const { profile } = useAuth()
  const [reports, setReports] = useState({
    totalSubmissions: 0,
    approvedSubmissions: 0,
    pendingSubmissions: 0,
    rejectedSubmissions: 0,
    totalFeedback: 0,
    avgFeedbackPerSubmission: 0,
    studentCount: 0,
    adviserCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [error, setError] = useState('')
  const [profiles, setProfiles] = useState([])
  const [feedback, setFeedback] = useState([])

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      // Fetch all submissions
      const { data: allSubmissions, error: submissionsError } = await supabase
        .from('thesis_submissions')
        .select('*')

      if (submissionsError) throw submissionsError

      // Fetch feedback
      const { data: allFeedback, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')

      if (feedbackError) throw feedbackError

      // Fetch profiles
      const { data: allProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')

      if (profilesError) throw profilesError

      const approved = allSubmissions?.filter((s) => s.status === 'Approved').length || 0
      const pending = allSubmissions?.filter((s) => s.status === 'Submitted').length || 0
      const rejected = allSubmissions?.filter((s) => s.status === 'Rejected').length || 0
      const students = allProfiles?.filter((p) => p.role === 'student').length || 0
      const advisers = allProfiles?.filter((p) => p.role === 'adviser').length || 0

      setReports({
        totalSubmissions: allSubmissions?.length || 0,
        approvedSubmissions: approved,
        pendingSubmissions: pending,
        rejectedSubmissions: rejected,
        totalFeedback: allFeedback?.length || 0,
        avgFeedbackPerSubmission: allSubmissions?.length ? (allFeedback?.length || 0) / allSubmissions.length : 0,
        studentCount: students,
        adviserCount: advisers,
      })

      setSubmissions(allSubmissions || [])
      setProfiles(allProfiles || [])
      setFeedback(allFeedback || [])
    } catch (error) {
      console.error('Error fetching reports:', error)
      setError(error.message)
      
      // Fallback to localStorage
      try {
        const localSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        const localFeedback = JSON.parse(localStorage.getItem('feedback') || '[]')
        setSubmissions(localSubmissions)
        setFeedback(localFeedback)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  function exportReport() {
    try {
      const reportData = {
        generatedAt: new Date().toISOString(),
        summary: {
          totalSubmissions: reports.totalSubmissions,
          approved: reports.approvedSubmissions,
          pending: reports.pendingSubmissions,
          rejected: reports.rejectedSubmissions,
          approvalRate: approvalRate,
        },
        submissions: submissions.map(sub => ({
          title: sub.title,
          status: sub.status,
          submittedAt: sub.created_at,
          student: profiles.find(p => p.id === sub.student_id)?.name || 'Unknown',
        })),
      }

      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `thesis-report-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
      setError('Failed to export report')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Submissions',
      value: reports.totalSubmissions,
      icon: FileText,
      color: 'escr-red',
    },
    {
      label: 'Approved',
      value: reports.approvedSubmissions,
      icon: CheckCircle,
      color: 'green-600',
    },
    {
      label: 'Pending',
      value: reports.pendingSubmissions,
      icon: TrendingUp,
      color: 'escr-yellow',
    },
    {
      label: 'Rejected',
      value: reports.rejectedSubmissions,
      icon: Users,
      color: 'red-600',
    },
  ]

  const approvalRate = reports.totalSubmissions > 0 
    ? ((reports.approvedSubmissions / reports.totalSubmissions) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">System Reports</h1>
            <p className="text-sm opacity-90">Comprehensive analytics and statistics</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchReports}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
            >
              <BarChart3 size={18} />
              Refresh
            </button>
            <button
              onClick={exportReport}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submission Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Approval Rate</h3>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold text-escr-red">{approvalRate}%</div>
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-escr-red h-2 rounded-full transition-all"
                  style={{ width: `${approvalRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Users Overview</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{reports.studentCount}</span> Students
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{reports.adviserCount}</span> Advisers
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{reports.studentCount + reports.adviserCount + 1}</span> Total
              Users
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Feedback Statistics</h3>
          <div className="space-y-2">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{reports.totalFeedback}</span> Total Feedback
            </p>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-800">{reports.avgFeedbackPerSubmission.toFixed(2)}</span> Avg per
              Submission
            </p>
          </div>
        </div>
      </div>

      {/* Status Distribution Chart */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Status Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-escr-yellow bg-opacity-10 rounded-lg">
            <div className="text-2xl font-bold text-escr-yellow">{reports.pendingSubmissions}</div>
            <div className="text-sm text-gray-600 mt-1">Pending</div>
          </div>
          <div className="text-center p-4 bg-escr-orange bg-opacity-10 rounded-lg">
            <div className="text-2xl font-bold text-escr-orange">
              {submissions.filter(s => s.status === 'For Revision').length}
            </div>
            <div className="text-sm text-gray-600 mt-1">For Revision</div>
          </div>
          <div className="text-center p-4 bg-green-100 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{reports.approvedSubmissions}</div>
            <div className="text-sm text-gray-600 mt-1">Approved</div>
          </div>
          <div className="text-center p-4 bg-red-100 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{reports.rejectedSubmissions}</div>
            <div className="text-sm text-gray-600 mt-1">Rejected</div>
          </div>
        </div>
      </div>

      {/* Submissions Breakdown Table */}
      <div className="bg-white rounded-lg shadow-soft overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800">Recent Submissions</h3>
          <span className="text-sm text-gray-500">{submissions.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No submissions yet
                  </td>
                </tr>
              ) : (
                submissions.slice(0, 10).map((sub) => {
                  const student = profiles.find(p => p.id === sub.student_id)
                  const submissionFeedback = feedback.filter(f => f.submission_id === sub.id)
                  
                  return (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-700 font-medium">{sub.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {student?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            sub.status === 'Approved'
                              ? 'bg-green-100 text-green-800'
                              : sub.status === 'Submitted'
                              ? 'bg-escr-yellow bg-opacity-20 text-gray-800'
                              : sub.status === 'For Revision'
                              ? 'bg-escr-orange bg-opacity-20 text-gray-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {submissionFeedback.length > 0 ? (
                          <span className="text-escr-red font-medium">{submissionFeedback.length}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

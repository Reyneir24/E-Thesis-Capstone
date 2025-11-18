import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { BarChart3, TrendingUp, Users, FileText, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react'

export function AdminAnalytics() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analytics, setAnalytics] = useState({
    // Overview Stats
    totalSubmissions: 0,
    approvedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    forRevisionCount: 0,
    
    // User Stats
    totalStudents: 0,
    totalAdvisers: 0,
    activeStudents: 0,
    activeAdvisers: 0,
    
    // Feedback Stats
    totalFeedback: 0,
    avgFeedbackPerSubmission: 0,
    avgResponseTime: 0,
    
    // Time-based Stats
    submissionsThisMonth: 0,
    submissionsLastMonth: 0,
    approvalsThisMonth: 0,
    approvalsLastMonth: 0,
    
    // Status Breakdown
    statusBreakdown: {},
    
    // Recent Activity
    recentSubmissions: [],
    topAdvisers: [],
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  async function fetchAnalytics() {
    try {
      setLoading(true)
      setError('')

      // Fetch all data
      const [submissionsResult, feedbackResult, profilesResult, assignmentsResult] = await Promise.all([
        supabase.from('thesis_submissions').select('*'),
        supabase.from('feedback').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('adviser_assignments').select('*'),
      ])

      const allSubmissions = submissionsResult.data || []
      const allFeedback = feedbackResult.data || []
      const allProfiles = profilesResult.data || []
      const allAssignments = assignmentsResult.data || []

      // Calculate stats
      const students = allProfiles.filter(p => p.role === 'student')
      const advisers = allProfiles.filter(p => p.role === 'adviser')
      
      // Status breakdown
      const statusBreakdown = {
        'Submitted': allSubmissions.filter(s => s.status === 'Submitted').length,
        'For Revision': allSubmissions.filter(s => s.status === 'For Revision').length,
        'Approved': allSubmissions.filter(s => s.status === 'Approved').length,
        'Rejected': allSubmissions.filter(s => s.status === 'Rejected').length,
      }

      // Time-based calculations
      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const submissionsThisMonth = allSubmissions.filter(s => 
        new Date(s.created_at) >= thisMonth
      ).length

      const submissionsLastMonth = allSubmissions.filter(s => {
        const date = new Date(s.created_at)
        return date >= lastMonth && date <= lastMonthEnd
      }).length

      const approvalsThisMonth = allSubmissions.filter(s => 
        s.status === 'Approved' && new Date(s.created_at) >= thisMonth
      ).length

      const approvalsLastMonth = allSubmissions.filter(s => {
        const date = new Date(s.created_at)
        return s.status === 'Approved' && date >= lastMonth && date <= lastMonthEnd
      }).length

      // Active users (users with submissions or feedback)
      const activeStudentIds = new Set(allSubmissions.map(s => s.student_id))
      const activeAdviserIds = new Set(allFeedback.map(f => f.adviser_id))

      // Top advisers by feedback count
      const adviserFeedbackCount = {}
      allFeedback.forEach(f => {
        adviserFeedbackCount[f.adviser_id] = (adviserFeedbackCount[f.adviser_id] || 0) + 1
      })

      const topAdvisers = Object.entries(adviserFeedbackCount)
        .map(([id, count]) => {
          const adviser = advisers.find(a => a.id === id)
          return adviser ? { ...adviser, feedbackCount: count } : null
        })
        .filter(Boolean)
        .sort((a, b) => b.feedbackCount - a.feedbackCount)
        .slice(0, 5)

      // Calculate average response time (time between submission and first feedback)
      let totalResponseTime = 0
      let responseTimeCount = 0
      
      allSubmissions.forEach(submission => {
        const firstFeedback = allFeedback
          .filter(f => f.submission_id === submission.id)
          .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))[0]
        
        if (firstFeedback) {
          const submissionTime = new Date(submission.created_at)
          const feedbackTime = new Date(firstFeedback.created_at)
          const hours = (feedbackTime - submissionTime) / (1000 * 60 * 60)
          totalResponseTime += hours
          responseTimeCount++
        }
      })

      const avgResponseTime = responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0

      // Recent submissions (last 10)
      const recentSubmissions = allSubmissions
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10)
        .map(s => ({
          ...s,
          student: students.find(st => st.id === s.student_id),
        }))

      setAnalytics({
        totalSubmissions: allSubmissions.length,
        approvedCount: statusBreakdown['Approved'],
        pendingCount: statusBreakdown['Submitted'],
        rejectedCount: statusBreakdown['Rejected'],
        forRevisionCount: statusBreakdown['For Revision'],
        totalStudents: students.length,
        totalAdvisers: advisers.length,
        activeStudents: activeStudentIds.size,
        activeAdvisers: activeAdviserIds.size,
        totalFeedback: allFeedback.length,
        avgFeedbackPerSubmission: allSubmissions.length > 0 
          ? (allFeedback.length / allSubmissions.length).toFixed(2) 
          : 0,
        avgResponseTime: avgResponseTime.toFixed(1),
        submissionsThisMonth,
        submissionsLastMonth,
        approvalsThisMonth,
        approvalsLastMonth,
        statusBreakdown,
        recentSubmissions,
        topAdvisers,
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  const submissionGrowth = analytics.submissionsLastMonth > 0
    ? (((analytics.submissionsThisMonth - analytics.submissionsLastMonth) / analytics.submissionsLastMonth) * 100).toFixed(1)
    : 0

  const approvalGrowth = analytics.approvalsLastMonth > 0
    ? (((analytics.approvalsThisMonth - analytics.approvalsLastMonth) / analytics.approvalsLastMonth) * 100).toFixed(1)
    : 0

  const approvalRate = analytics.totalSubmissions > 0
    ? ((analytics.approvedCount / analytics.totalSubmissions) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-sm opacity-90">Comprehensive system analytics and insights</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.totalSubmissions}</p>
              <p className="text-xs text-gray-500 mt-1">
                {submissionGrowth >= 0 ? '+' : ''}{submissionGrowth}% vs last month
              </p>
            </div>
            <div className="p-3 bg-escr-red bg-opacity-10 rounded-lg">
              <FileText className="text-escr-red" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Approval Rate</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{approvalRate}%</p>
              <p className="text-xs text-gray-500 mt-1">
                {analytics.approvedCount} of {analytics.totalSubmissions} approved
              </p>
            </div>
            <div className="p-3 bg-green-600 bg-opacity-10 rounded-lg">
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.activeStudents}</p>
              <p className="text-xs text-gray-500 mt-1">
                of {analytics.totalStudents} total
              </p>
            </div>
            <div className="p-3 bg-escr-orange bg-opacity-10 rounded-lg">
              <Users className="text-escr-orange" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{analytics.avgResponseTime}h</p>
              <p className="text-xs text-gray-500 mt-1">
                Time to first feedback
              </p>
            </div>
            <div className="p-3 bg-escr-yellow bg-opacity-10 rounded-lg">
              <Clock className="text-escr-yellow" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Submission Status Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => {
              const percentage = analytics.totalSubmissions > 0
                ? ((count / analytics.totalSubmissions) * 100).toFixed(1)
                : 0
              
              const colorClass = {
                'Submitted': 'bg-escr-yellow',
                'For Revision': 'bg-escr-orange',
                'Approved': 'bg-green-600',
                'Rejected': 'bg-red-600',
              }[status] || 'bg-gray-400'

              return (
                <div key={status}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{status}</span>
                    <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${colorClass} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Monthly Trends</h3>
          <div className="space-y-4">
            <div className="p-4 bg-neutral-gray rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Submissions</span>
                <span className="text-lg font-bold text-gray-800">{analytics.submissionsThisMonth}</span>
              </div>
              <p className="text-xs text-gray-500">
                {submissionGrowth >= 0 ? '+' : ''}{submissionGrowth}% vs last month ({analytics.submissionsLastMonth})
              </p>
            </div>

            <div className="p-4 bg-neutral-gray rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Approvals</span>
                <span className="text-lg font-bold text-gray-800">{analytics.approvalsThisMonth}</span>
              </div>
              <p className="text-xs text-gray-500">
                {approvalGrowth >= 0 ? '+' : ''}{approvalGrowth}% vs last month ({analytics.approvalsLastMonth})
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Advisers & Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800">Top Advisers</h3>
            <p className="text-sm text-gray-500">By feedback count</p>
          </div>
          <div className="p-6">
            {analytics.topAdvisers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No feedback data yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.topAdvisers.map((adviser, index) => (
                  <div key={adviser.id} className="flex items-center justify-between p-3 bg-neutral-gray rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-escr-red rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{adviser.name}</p>
                        <p className="text-xs text-gray-500">{adviser.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-escr-red">{adviser.feedbackCount}</p>
                      <p className="text-xs text-gray-500">feedback</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800">Recent Submissions</h3>
            <p className="text-sm text-gray-500">Latest activity</p>
          </div>
          <div className="p-6">
            {analytics.recentSubmissions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No submissions yet</p>
            ) : (
              <div className="space-y-3">
                {analytics.recentSubmissions.map((submission) => (
                  <div key={submission.id} className="p-3 bg-neutral-gray rounded-lg">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-medium text-gray-800 text-sm">{submission.title}</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        submission.status === 'Approved' ? 'bg-green-100 text-green-800' :
                        submission.status === 'Submitted' ? 'bg-escr-yellow bg-opacity-20 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {submission.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {submission.student?.name || 'Unknown'} • {new Date(submission.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">User Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Students</span>
              <span className="font-bold text-gray-800">{analytics.totalStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Students</span>
              <span className="font-bold text-escr-red">{analytics.activeStudents}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Advisers</span>
              <span className="font-bold text-gray-800">{analytics.totalAdvisers}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Active Advisers</span>
              <span className="font-bold text-escr-orange">{analytics.activeAdvisers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Feedback Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Feedback</span>
              <span className="font-bold text-gray-800">{analytics.totalFeedback}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg per Submission</span>
              <span className="font-bold text-escr-yellow">{analytics.avgFeedbackPerSubmission}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Response Time</span>
              <span className="font-bold text-escr-red">{analytics.avgResponseTime}h</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-soft p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Status Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-escr-yellow">{analytics.pendingCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">For Revision</span>
              <span className="font-bold text-escr-orange">{analytics.forRevisionCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Approved</span>
              <span className="font-bold text-green-600">{analytics.approvedCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Rejected</span>
              <span className="font-bold text-red-600">{analytics.rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


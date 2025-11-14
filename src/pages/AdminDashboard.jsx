import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Users, FileText, CheckCircle, TrendingUp } from 'lucide-react'

export function AdminDashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 1,
    totalAdvisers: 1,
    totalSubmissions: 0,
    approvedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  function fetchStats() {
    try {
      // Get submissions from localStorage
      const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
      const approved = submissions.filter((s) => s.status === 'Approved').length

      setStats({
        totalStudents: 1, // Mock: 1 student demo account
        totalAdvisers: 1, // Mock: 1 adviser demo account
        totalSubmissions: submissions.length,
        approvedCount: approved,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'escr-red' },
    { label: 'Total Advisers', value: stats.totalAdvisers, icon: Users, color: 'escr-orange' },
    { label: 'Total Submissions', value: stats.totalSubmissions, icon: FileText, color: 'escr-yellow' },
    { label: 'Approved', value: stats.approvedCount, icon: CheckCircle, color: 'green-600' },
  ]

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
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-sm opacity-90">System overview and management</p>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-escr-red hover:bg-red-700 text-white rounded-lg transition font-medium">
              Create New User
            </button>
            <button className="w-full py-3 px-4 bg-escr-yellow hover:bg-yellow-600 text-gray-800 rounded-lg transition font-medium">
              Manage Assignments
            </button>
            <button className="w-full py-3 px-4 bg-escr-orange hover:bg-orange-700 text-white rounded-lg transition font-medium">
              View Reports
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-gray rounded-lg">
              <span className="text-gray-700">Database</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Connected
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-gray rounded-lg">
              <span className="text-gray-700">Storage</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Active
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-neutral-gray rounded-lg">
              <span className="text-gray-700">Auth</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                ✓ Operational
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Login } from './pages/Login'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { Navbar } from './components/Navbar'
import { Sidebar } from './components/Sidebar'
import { RightPanel } from './components/RightPanel'

// Student Pagess
import { StudentDashboard } from './pages/StudentDashboard'
import { StudentUpload } from './pages/StudentUpload'
import { StudentSubmissions } from './pages/StudentSubmissions'

// Adviser Pages
import { AdviserDashboard } from './pages/AdviserDashboard'
import { AdviserReviews } from './pages/AdviserReviews'
import { AdviserStudents } from './pages/AdviserStudents'

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminUsers } from './pages/AdminUsers'
import { AdminAssignments } from './pages/AdminAssignments'
import { AdminReports } from './pages/AdminReports'

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen bg-neutral-gray">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">{children}</div>
              <div className="lg:col-span-1">
                <RightPanel />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <StudentDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/upload"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <StudentUpload />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/submissions"
            element={
              <ProtectedRoute requiredRole="student">
                <DashboardLayout>
                  <StudentSubmissions />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Adviser Routes */}
          <Route
            path="/adviser/dashboard"
            element={
              <ProtectedRoute requiredRole="adviser">
                <DashboardLayout>
                  <AdviserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/reviews"
            element={
              <ProtectedRoute requiredRole="adviser">
                <DashboardLayout>
                  <AdviserReviews />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/adviser/students"
            element={
              <ProtectedRoute requiredRole="adviser">
                <DashboardLayout>
                  <AdviserStudents />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminUsers />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/assignments"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminAssignments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute requiredRole="admin">
                <DashboardLayout>
                  <AdminReports />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App

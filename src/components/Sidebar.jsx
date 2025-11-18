import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Upload, FileText, Users, Settings, X } from 'lucide-react'
import logo from './logo.png'

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation()
  const { profile } = useAuth()

  const isActive = (path) => location.pathname === path

  const navigationItems = {
    student: [
      { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
      { label: 'Upload Thesis', path: '/student/upload', icon: Upload },
      { label: 'My Submissions', path: '/student/submissions', icon: FileText },
    ],
    adviser: [
      { label: 'Dashboard', path: '/adviser/dashboard', icon: LayoutDashboard },
      { label: 'Review Queue', path: '/adviser/reviews', icon: FileText },
      { label: 'Students', path: '/adviser/students', icon: Users },
    ],
    admin: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Analytics', path: '/admin/analytics', icon: FileText },
      { label: 'Settings', path: '/admin/settings', icon: Settings },
    ],
  }

  const items = navigationItems[profile?.role] || []

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-soft lg:relative lg:z-auto z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="East System Colleges of Rizal" className="w-8 h-8" />
              <h2 className="text-xl font-bold text-escr-red">ESCR</h2>
            </div>
            <button onClick={onClose} className="lg:hidden">
              <X size={24} />
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.path)
                    ? 'bg-escr-red text-white'
                    : 'text-gray-600 hover:bg-neutral-gray'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

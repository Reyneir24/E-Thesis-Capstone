import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogOut, Menu } from 'lucide-react'

export function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { logout, profile } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow-soft border-b border-gray-200">
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-escr-red transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-bold text-escr-red">Thesis Pro</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:block">
            <p className="text-sm text-gray-600">Welcome, {profile?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{profile?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-neutral-gray rounded-lg transition"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

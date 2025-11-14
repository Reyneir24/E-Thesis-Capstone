import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Bell, Check } from 'lucide-react'

export function RightPanel() {
  const { profile } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [profile?.id])

  function fetchNotifications() {
    try {
      // Get notifications from localStorage
      const storedNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      )
      
      // Filter for current user and limit to 10
      const userNotifications = storedNotifications
        .filter((n) => n.user_id === profile?.id)
        .slice(0, 10)

      setNotifications(userNotifications)

      const unread = userNotifications.filter((n) => !n.is_read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  function markAsRead(notificationId) {
    try {
      const storedNotifications = JSON.parse(
        localStorage.getItem('notifications') || '[]'
      )

      const updated = storedNotifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
      
      localStorage.setItem('notifications', JSON.stringify(updated))

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 h-full overflow-y-auto">
      {/* Profile Card */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-escr-yellow rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-escr-red">
              {profile?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">{profile?.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>
          <p className="text-xs text-gray-400 mt-1">{profile?.email}</p>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Notifications</h4>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:bg-neutral-gray rounded-lg transition"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-escr-red text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showNotifications && (
          <div className="bg-neutral-gray rounded-lg p-4 space-y-3 max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 rounded-lg text-sm ${
                    notif.is_read
                      ? 'bg-white text-gray-600'
                      : 'bg-escr-yellow bg-opacity-20 text-gray-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium">{notif.type}</p>
                      <p className="text-xs mt-1">{notif.message}</p>
                    </div>
                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="text-escr-red hover:text-escr-orange transition"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

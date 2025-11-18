import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { Settings, Save, AlertCircle, CheckCircle, Database, Mail, Bell, Shield, FileText } from 'lucide-react'

export function AdminSettings() {
  const { profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // System Settings
  const [settings, setSettings] = useState({
    // File Upload Settings
    maxFileSize: 50, // MB
    allowedFileTypes: ['pdf'],
    autoApprove: false,
    
    // Notification Settings
    emailNotifications: true,
    notifyOnSubmission: true,
    notifyOnFeedback: true,
    notifyOnApproval: true,
    
    // System Settings
    maintenanceMode: false,
    allowRegistration: true,
    requireEmailVerification: false,
    
    // Display Settings
    itemsPerPage: 10,
    showNotifications: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      // Try to load from Supabase (if you have a settings table)
      // For now, load from localStorage
      const savedSettings = localStorage.getItem('adminSettings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function saveSettings() {
    try {
      setSaving(true)
      setError('')
      setSuccess('')
      
      // Save to localStorage (you can extend this to save to Supabase)
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      
      // If you have a settings table in Supabase, save there too:
      // const { error } = await supabase
      //   .from('system_settings')
      //   .upsert({ id: 'main', ...settings })
      
      setSuccess('Settings saved successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setError('Failed to save settings')
      setTimeout(() => setError(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-escr-red mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">System Settings</h1>
        <p className="text-sm opacity-90">Configure system preferences and options</p>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
          <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* File Upload Settings */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-escr-red" size={24} />
          <h2 className="text-xl font-bold text-gray-800">File Upload Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum File Size (MB)
            </label>
            <input
              type="number"
              value={settings.maxFileSize}
              onChange={(e) => handleChange('maxFileSize', parseInt(e.target.value) || 0)}
              min="1"
              max="100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Maximum allowed file size in megabytes</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed File Types
            </label>
            <input
              type="text"
              value={settings.allowedFileTypes.join(', ')}
              onChange={(e) => handleChange('allowedFileTypes', e.target.value.split(',').map(t => t.trim()))}
              placeholder="pdf, doc, docx"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Comma-separated list of allowed file extensions</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoApprove"
              checked={settings.autoApprove}
              onChange={(e) => handleChange('autoApprove', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="autoApprove" className="text-sm font-medium text-gray-700">
              Auto-approve submissions (skip review process)
            </label>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <Bell className="text-escr-orange" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Notification Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
              Enable email notifications
            </label>
          </div>

          <div className="ml-7 space-y-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyOnSubmission"
                checked={settings.notifyOnSubmission}
                onChange={(e) => handleChange('notifyOnSubmission', e.target.checked)}
                disabled={!settings.emailNotifications}
                className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red disabled:opacity-50"
              />
              <label htmlFor="notifyOnSubmission" className={`text-sm text-gray-700 ${!settings.emailNotifications ? 'opacity-50' : ''}`}>
                Notify on new submission
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyOnFeedback"
                checked={settings.notifyOnFeedback}
                onChange={(e) => handleChange('notifyOnFeedback', e.target.checked)}
                disabled={!settings.emailNotifications}
                className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red disabled:opacity-50"
              />
              <label htmlFor="notifyOnFeedback" className={`text-sm text-gray-700 ${!settings.emailNotifications ? 'opacity-50' : ''}`}>
                Notify on feedback received
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="notifyOnApproval"
                checked={settings.notifyOnApproval}
                onChange={(e) => handleChange('notifyOnApproval', e.target.checked)}
                disabled={!settings.emailNotifications}
                className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red disabled:opacity-50"
              />
              <label htmlFor="notifyOnApproval" className={`text-sm text-gray-700 ${!settings.emailNotifications ? 'opacity-50' : ''}`}>
                Notify on approval/rejection
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* System Settings */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database className="text-escr-yellow" size={24} />
          <h2 className="text-xl font-bold text-gray-800">System Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="maintenanceMode" className="text-sm font-medium text-gray-700">
              Maintenance mode (disable access for non-admins)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="allowRegistration"
              checked={settings.allowRegistration}
              onChange={(e) => handleChange('allowRegistration', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="allowRegistration" className="text-sm font-medium text-gray-700">
              Allow new user registration
            </label>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onChange={(e) => handleChange('requireEmailVerification', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="requireEmailVerification" className="text-sm font-medium text-gray-700">
              Require email verification for new users
            </label>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="text-gray-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Display Settings</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Items Per Page
            </label>
            <select
              value={settings.itemsPerPage}
              onChange={(e) => handleChange('itemsPerPage', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="showNotifications"
              checked={settings.showNotifications}
              onChange={(e) => handleChange('showNotifications', e.target.checked)}
              className="w-4 h-4 text-escr-red border-gray-300 rounded focus:ring-escr-red"
            />
            <label htmlFor="showNotifications" className="text-sm font-medium text-gray-700">
              Show notification badges
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-3 bg-escr-red hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            <>
              <Save size={18} />
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  )
}


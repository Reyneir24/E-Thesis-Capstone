import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { Upload, File, AlertCircle, CheckCircle } from 'lucide-react'

// Function to generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function StudentUpload() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf')) {
        setFile(selectedFile)
        setError('')
      } else {
        setError('Please select a PDF file')
        setFile(null)
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!profile?.id) {
        setError('User profile not found')
        setLoading(false)
        return
      }

      // Create new submission in Supabase
      const newSubmission = {
        id: generateUUID(),
        student_id: profile.id,
        title,
        description,
        file_url: `/uploads/${file?.name}`,
        status: 'Submitted',
        adviser_id: null,
        created_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase
        .from('thesis_submissions')
        .insert([newSubmission])

      if (insertError) throw insertError

      setSuccess('Thesis submitted successfully!')
      
      // Fallback: also save to localStorage for offline support
      try {
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        submissions.push(newSubmission)
        localStorage.setItem('submissions', JSON.stringify(submissions))
      } catch (localStorageError) {
        console.warn('Could not save to localStorage:', localStorageError)
      }

      setTimeout(() => {
        navigate('/student/submissions')
      }, 2000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload thesis')
      
      // Fallback: save to localStorage if Supabase fails
      try {
        const submission = {
          id: generateUUID(),
          student_id: profile.id,
          title,
          description,
          file_name: file?.name,
          status: 'Submitted',
          created_at: new Date().toISOString(),
        }
        const submissions = JSON.parse(localStorage.getItem('submissions') || '[]')
        submissions.push(submission)
        localStorage.setItem('submissions', JSON.stringify(submissions))
        setSuccess('Saved locally (Supabase connection failed)')
        setTimeout(() => {
          navigate('/student/submissions')
        }, 2000)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-escr-red to-escr-orange rounded-lg shadow-soft p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Upload Your Thesis</h1>
        <p className="text-sm opacity-90">Submit your capstone or thesis project for review</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-lg shadow-soft p-8 max-w-2xl">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Thesis Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter your thesis title"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of your thesis"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-escr-red focus:border-transparent outline-none transition resize-none"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF File *
            </label>
            <div className="border-2 border-dashed border-escr-yellow rounded-lg p-8 text-center hover:bg-neutral-gray transition cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="flex justify-center mb-3">
                  {file ? (
                    <File size={40} className="text-escr-red" />
                  ) : (
                    <Upload size={40} className="text-escr-yellow" />
                  )}
                </div>
                <p className="font-medium text-gray-800">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500 mt-1">PDF files only (Max 50MB)</p>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !title || !file}
            className="w-full py-3 px-4 bg-escr-red hover:bg-red-700 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={18} />
                Submit Thesis
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

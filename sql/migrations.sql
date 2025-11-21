-- ============================================================================
-- THESIS MANAGEMENT SYSTEM - SUPABASE SQL MIGRATIONS
-- Copy and paste each section into Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE PROFILES TABLE
-- ============================================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'adviser', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. CREATE THESIS_SUBMISSIONS TABLE
-- ============================================================================
CREATE TABLE thesis_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  adviser_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'For Revision', 'Approved', 'Rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. CREATE FEEDBACK TABLE
-- ============================================================================
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  adviser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 4. CREATE NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Approved', 'For Revision', 'New Feedback', 'Submission Received')),
  message TEXT NOT NULL,
  related_submission_id UUID REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. CREATE ADVISER_STUDENT ASSIGNMENT TABLE
-- ============================================================================
CREATE TABLE adviser_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(adviser_id, student_id)
);

-- ============================================================================
-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_thesis_submissions_student_id ON thesis_submissions(student_id);
CREATE INDEX idx_thesis_submissions_adviser_id ON thesis_submissions(adviser_id);
CREATE INDEX idx_feedback_submission_id ON feedback(submission_id);
CREATE INDEX idx_feedback_adviser_id ON feedback(adviser_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_adviser_assignments_adviser_id ON adviser_assignments(adviser_id);
CREATE INDEX idx_adviser_assignments_student_id ON adviser_assignments(student_id);

-- ============================================================================
-- 7. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adviser_assignments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. RLS POLICIES - PROFILES TABLE
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Advisers can view student profiles
CREATE POLICY "Advisers can view student profiles" 
ON profiles FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'adviser')
  OR auth.uid() IN (SELECT adviser_id FROM adviser_assignments WHERE student_id = id)
);

-- Admin can view all profiles
CREATE POLICY "Admin can view all profiles" 
ON profiles FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Admin can insert profiles
CREATE POLICY "Admin can insert profiles" 
ON profiles FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- ============================================================================
-- 9. RLS POLICIES - THESIS_SUBMISSIONS TABLE
-- ============================================================================

-- Students can view their own submissions
CREATE POLICY "Students can view their own submissions" 
ON thesis_submissions FOR SELECT 
USING (auth.uid() = student_id);

-- Advisers can view assigned student submissions
CREATE POLICY "Advisers can view assigned submissions" 
ON thesis_submissions FOR SELECT 
USING (
  auth.uid() IN (
    SELECT adviser_id FROM adviser_assignments 
    WHERE student_id = thesis_submissions.student_id
  )
);

-- Admin can view all submissions
CREATE POLICY "Admin can view all submissions" 
ON thesis_submissions FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Students can insert their own submissions
CREATE POLICY "Students can insert their own submissions" 
ON thesis_submissions FOR INSERT 
WITH CHECK (auth.uid() = student_id);

-- Students can update their own submissions
CREATE POLICY "Students can update their own submissions" 
ON thesis_submissions FOR UPDATE 
USING (auth.uid() = student_id);

-- Advisers can update submission status
CREATE POLICY "Advisers can update submission status" 
ON thesis_submissions FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT adviser_id FROM adviser_assignments 
    WHERE student_id = thesis_submissions.student_id
  )
);

-- ============================================================================
-- 10. RLS POLICIES - FEEDBACK TABLE
-- ============================================================================

-- Students can view feedback on their submissions
CREATE POLICY "Students can view feedback on their submissions" 
ON feedback FOR SELECT 
USING (
  auth.uid() IN (
    SELECT student_id FROM thesis_submissions 
    WHERE id = submission_id
  )
);

-- Advisers can view their own feedback
CREATE POLICY "Advisers can view their own feedback" 
ON feedback FOR SELECT 
USING (auth.uid() = adviser_id);

-- Admin can view all feedback
CREATE POLICY "Admin can view all feedback" 
ON feedback FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Advisers can insert feedback
CREATE POLICY "Advisers can insert feedback" 
ON feedback FOR INSERT 
WITH CHECK (auth.uid() = adviser_id);

-- Advisers can update their own feedback
CREATE POLICY "Advisers can update their own feedback" 
ON feedback FOR UPDATE 
USING (auth.uid() = adviser_id);

-- ============================================================================
-- 11. RLS POLICIES - NOTIFICATIONS TABLE
-- ============================================================================

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Admin can view all notifications
CREATE POLICY "Admin can view all notifications" 
ON notifications FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- System can insert notifications (use service role)
CREATE POLICY "Notifications can be inserted" 
ON notifications FOR INSERT 
WITH CHECK (TRUE);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- ============================================================================
-- 12. RLS POLICIES - ADVISER_ASSIGNMENTS TABLE
-- ============================================================================

-- Advisers can view their assignments
CREATE POLICY "Advisers can view their assignments" 
ON adviser_assignments FOR SELECT 
USING (auth.uid() = adviser_id);

-- Students can view their adviser assignments
CREATE POLICY "Students can view their adviser" 
ON adviser_assignments FOR SELECT 
USING (auth.uid() = student_id);

-- Admin can view all assignments
CREATE POLICY "Admin can view all assignments" 
ON adviser_assignments FOR SELECT 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Admin can insert assignments
CREATE POLICY "Admin can insert assignments" 
ON adviser_assignments FOR INSERT 
WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- Admin can delete assignments
CREATE POLICY "Admin can delete assignments" 
ON adviser_assignments FOR DELETE 
USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- ============================================================================
-- 13. STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================================================
-- Go to Storage > Buckets > Create a new bucket
-- Name: thesis-files
-- Make it PRIVATE
-- Add the following policy:

/*
-- RLS Policy for Storage Bucket: thesis-files

-- Students can upload to their own folder
CREATE POLICY "Students can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'thesis-files' 
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Users can view and download their own files
CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'thesis-files'
  AND auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Advisers can view assigned student files
CREATE POLICY "Advisers can view assigned student files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'thesis-files'
  AND (string_to_array(name, '/'))[1]::uuid IN (
    SELECT student_id FROM adviser_assignments 
    WHERE adviser_id = auth.uid()
  )
);

-- Admin can view all files
CREATE POLICY "Admin can view all files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'thesis-files'
  AND auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
*/

-- ============================================================================
-- 14. ADD PASSWORD AND FIRST_LOGIN COLUMNS TO PROFILES (SAFE)
-- Run this migration to ensure the `profiles` table contains the
-- `password` (TEXT) and `first_login` (BOOLEAN) columns required
-- by the client-side onboarding flow. Uses IF NOT EXISTS so it is safe
-- to run multiple times.
-- ============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password TEXT;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT FALSE;

-- Backfill existing rows to ensure explicit default values
UPDATE profiles SET first_login = FALSE WHERE first_login IS NULL;

-- Ensure profiles has a `program` column for student program/major
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS program TEXT;



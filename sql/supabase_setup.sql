-- ============================================
-- E-THESIS CAPSTONE SUPABASE SETUP
-- Created: November 18, 2025
-- Database: PostgreSQL (Supabase)
-- Schema matches actual Supabase tables
-- ============================================

-- ============================================
-- STEP 1: REMOVE AUTH CONSTRAINTS (Development Only)
-- ============================================

-- Drop foreign key constraint from profiles to auth.users
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- ============================================
-- STEP 2: CLEAR EXISTING DUMMY DATA
-- ============================================

-- Clear all data (in order to respect foreign keys)
DELETE FROM public.adviser_assignments;
DELETE FROM public.notifications;
DELETE FROM public.feedback;
DELETE FROM public.thesis_submissions;
DELETE FROM public.profiles;

-- ============================================
-- STEP 3: INSERT DUMMY DATA INTO EXISTING TABLES
-- ============================================

-- Insert Profiles (Users)
-- Note: UUIDs are used instead of text
INSERT INTO public.profiles (id, name, email, role, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'Juan dela Cruz', 'student@escr.edu.ph', 'student', now()),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'Maria Santos', 'maria.santos@escr.edu.ph', 'student', now()),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'Pedro Reyes', 'pedro.reyes@escr.edu.ph', 'student', now()),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'Dr. Jane Smith', 'adviser@escr.edu.ph', 'adviser', now()),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'Prof. Robert Johnson', 'robert.johnson@escr.edu.ph', 'adviser', now()),
  ('550e8400-e29b-41d4-a716-446655440006'::uuid, 'Admin User', 'admin@escr.edu.ph', 'admin', now())
ON CONFLICT (id) DO NOTHING;

-- Insert Thesis Submissions
INSERT INTO public.thesis_submissions (id, student_id, title, description, file_url, status, adviser_id, created_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'AI-Powered Learning Management System', 'Developing an intelligent LMS using machine learning algorithms for personalized student learning paths.', '/uploads/thesis_juan.pdf', 'Approved', '550e8400-e29b-41d4-a716-446655440004'::uuid, now() - interval '30 days'),
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'Cloud-Based Document Management Portal', 'Building a secure cloud storage solution with role-based access control and real-time collaboration features.', '/uploads/thesis_maria.pdf', 'For Revision', '550e8400-e29b-41d4-a716-446655440004'::uuid, now() - interval '20 days'),
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Mobile App for Healthcare Monitoring', 'Creating a cross-platform mobile application for remote patient health monitoring and telemedicine consultations.', '/uploads/thesis_pedro.pdf', 'Submitted', NULL, now() - interval '5 days'),
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Blockchain-Based Supply Chain Tracking', 'Implementing blockchain technology for transparent and secure supply chain management across multiple vendors.', '/uploads/thesis_juan_v2.pdf', 'Submitted', NULL, now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Feedback
INSERT INTO public.feedback (id, submission_id, adviser_id, comment, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Excellent work! Well-researched and clearly written. Minor revisions needed in chapter 3.', now() - interval '25 days'),
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, '650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Final approval granted. Congratulations on completing your thesis.', now() - interval '20 days'),
  ('750e8400-e29b-41d4-a716-446655440003'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Good progress. Please address the security concerns in Section 4.2 and provide more detailed test results.', now() - interval '15 days'),
  ('750e8400-e29b-41d4-a716-446655440004'::uuid, '650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'The revised sections are much improved. Please make final edits and resubmit.', now() - interval '10 days')
ON CONFLICT (id) DO NOTHING;

-- Insert Notifications
INSERT INTO public.notifications (id, user_id, type, message, related_submission_id, is_read, created_at) VALUES
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Approved', 'Your thesis submission has been approved!', '650e8400-e29b-41d4-a716-446655440001'::uuid, true, now() - interval '20 days'),
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'New Feedback', 'Your adviser has left feedback on your submission.', '650e8400-e29b-41d4-a716-446655440002'::uuid, true, now() - interval '15 days'),
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, 'For Revision', 'Please revise your thesis based on the feedback provided.', '650e8400-e29b-41d4-a716-446655440002'::uuid, false, now() - interval '10 days'),
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, 'Submission Received', 'Your submission was received. Adviser will review soon.', '650e8400-e29b-41d4-a716-446655440003'::uuid, false, now() - interval '5 days'),
  ('850e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, 'Submission Received', 'New thesis submission from Pedro Reyes awaiting review.', '650e8400-e29b-41d4-a716-446655440003'::uuid, false, now() - interval '4 days'),
  ('850e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440006'::uuid, 'Submission Received', 'System backup completed successfully.', NULL, true, now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Insert Adviser Assignments
INSERT INTO public.adviser_assignments (id, adviser_id, student_id, assigned_at) VALUES
  ('950e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, now()),
  ('950e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, now()),
  ('950e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440003'::uuid, now())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 4: VERIFY DATA
-- ============================================

-- Check profiles count
SELECT 'Profiles' as table_name, COUNT(*) as record_count FROM public.profiles;

-- Check thesis_submissions count
SELECT 'Submissions' as table_name, COUNT(*) as record_count FROM public.thesis_submissions;

-- Check feedback count
SELECT 'Feedback' as table_name, COUNT(*) as record_count FROM public.feedback;

-- Check notifications count
SELECT 'Notifications' as table_name, COUNT(*) as record_count FROM public.notifications;

-- Check adviser_assignments count
SELECT 'Adviser Assignments' as table_name, COUNT(*) as record_count FROM public.adviser_assignments;

-- ============================================
-- STEP 5: VIEW SAMPLE DATA
-- ============================================

-- View all profiles
SELECT * FROM public.profiles ORDER BY created_at DESC;

-- View all submissions with student and adviser names
SELECT 
  s.id,
  s.title,
  s.status,
  p1.name as student_name,
  p2.name as adviser_name,
  s.created_at
FROM public.thesis_submissions s
LEFT JOIN public.profiles p1 ON s.student_id = p1.id
LEFT JOIN public.profiles p2 ON s.adviser_id = p2.id
ORDER BY s.created_at DESC;

-- View feedback with names
SELECT 
  f.id,
  f.comment,
  p.name as adviser_name,
  s.title as submission_title,
  f.created_at
FROM public.feedback f
LEFT JOIN public.profiles p ON f.adviser_id = p.id
LEFT JOIN public.thesis_submissions s ON f.submission_id = s.id
ORDER BY f.created_at DESC;

-- ============================================
-- NOTES FOR DEVELOPMENT
-- ============================================
-- 
-- 1. This script removes auth.users foreign key constraint (development only)
--    For production, re-enable it:
--    ALTER TABLE public.profiles ADD CONSTRAINT profiles_id_fkey 
--      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- 2. Dummy Profile IDs (for reference):
--    Student 1: 550e8400-e29b-41d4-a716-446655440001 (Juan dela Cruz)
--    Student 2: 550e8400-e29b-41d4-a716-446655440002 (Maria Santos)
--    Student 3: 550e8400-e29b-41d4-a716-446655440003 (Pedro Reyes)
--    Adviser 1: 550e8400-e29b-41d4-a716-446655440004 (Dr. Jane Smith)
--    Adviser 2: 550e8400-e29b-41d4-a716-446655440005 (Prof. Robert Johnson)
--    Admin:     550e8400-e29b-41d4-a716-446655440006 (Admin User)
--
-- 3. App Quick Login still works - these emails are mapped in AuthContext
--
-- 4. For RLS Security (Development):
--    Disable RLS on all tables in Supabase Dashboard
--    (Authentication → Policies → Toggle "Disable RLS" for each table)
--
-- 5. For Production:
--    - Re-enable RLS with strict policies
--    - Re-enable auth.users foreign key constraint
--    - Implement proper Supabase Auth
--
-- ============================================

-- ============================================
-- DISABLE RLS - FIX 500 ERRORS
-- ============================================
-- RLS policies are blocking all queries
-- Disable RLS on all tables for development

-- Disable RLS on profiles table
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on thesis_submissions table
ALTER TABLE public.thesis_submissions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on feedback table
ALTER TABLE public.feedback DISABLE ROW LEVEL SECURITY;

-- Disable RLS on notifications table
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- Disable RLS on adviser_assignments table
ALTER TABLE public.adviser_assignments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFY RLS IS DISABLED
-- ============================================

-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('profiles', 'thesis_submissions', 'feedback', 'notifications', 'adviser_assignments')
ORDER BY tablename;

-- Expected result: All should show rowsecurity = false (or no)

-- ============================================
-- NOTES:
-- rowsecurity = false means RLS is DISABLED ✅
-- rowsecurity = true means RLS is ENABLED ❌
-- ============================================

-- ============================================
-- DISABLE AUTH CONSTRAINT - Run This First!
-- ============================================
-- This removes the foreign key that blocks dummy data insertion

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Verify constraint is removed
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- ============================================
-- Note: After this runs, you should see NO constraints
-- related to profiles_id_fkey in the output
-- ============================================

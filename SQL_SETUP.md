# 🗄️ SUPABASE SQL SETUP INSTRUCTIONS

## ⚠️ IMPORTANT: Copy-Paste Each Section Into Supabase SQL Editor

Go to: **SQL Editor → New Query** and execute each section below.

---

## 📋 SECTION 1: CREATE TABLES

Copy and paste this ENTIRE section into a NEW SQL query:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'adviser', 'admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create thesis submissions table
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

-- Create feedback table
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  adviser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('Approved', 'For Revision', 'New Feedback', 'Submission Received')),
  message TEXT NOT NULL,
  related_submission_id UUID REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create adviser assignments table
CREATE TABLE adviser_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  adviser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(adviser_id, student_id)
);
```

✅ **Execute this query**

---

## 📋 SECTION 2: CREATE INDEXES

Copy and paste into a NEW SQL query:

```sql
CREATE INDEX idx_thesis_submissions_student_id ON thesis_submissions(student_id);
CREATE INDEX idx_thesis_submissions_adviser_id ON thesis_submissions(adviser_id);
CREATE INDEX idx_feedback_submission_id ON feedback(submission_id);
CREATE INDEX idx_feedback_adviser_id ON feedback(adviser_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_adviser_assignments_adviser_id ON adviser_assignments(adviser_id);
CREATE INDEX idx_adviser_assignments_student_id ON adviser_assignments(student_id);
```

✅ **Execute this query**

---

## 📋 SECTION 3: ENABLE RLS

Copy and paste into a NEW SQL query:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE thesis_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE adviser_assignments ENABLE ROW LEVEL SECURITY;
```

✅ **Execute this query**

---

## 📋 SECTION 4: RLS POLICIES FOR PROFILES

Copy and paste into a NEW SQL query:

```sql
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
```

✅ **Execute this query**

---

## 📋 SECTION 5: RLS POLICIES FOR THESIS_SUBMISSIONS

Copy and paste into a NEW SQL query:

```sql
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
```

✅ **Execute this query**

---

## 📋 SECTION 6: RLS POLICIES FOR FEEDBACK

Copy and paste into a NEW SQL query:

```sql
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
```

✅ **Execute this query**

---

## 📋 SECTION 7: RLS POLICIES FOR NOTIFICATIONS

Copy and paste into a NEW SQL query:

```sql
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

-- Notifications can be inserted
CREATE POLICY "Notifications can be inserted" 
ON notifications FOR INSERT 
WITH CHECK (TRUE);

-- Users can update their own notifications
CREATE POLICY "Users can update their own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);
```

✅ **Execute this query**

---

## 📋 SECTION 8: RLS POLICIES FOR ADVISER_ASSIGNMENTS

Copy and paste into a NEW SQL query:

```sql
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
```

✅ **Execute this query**

---

## 📦 SECTION 9: STORAGE BUCKET (Manual Setup)

### Do this in Supabase Dashboard:

1. Go to **Storage** in left sidebar
2. Click **Create a new bucket**
3. Name: `thesis-files`
4. Privacy: **PRIVATE**
5. Click **Create bucket**

✅ **Bucket created**

---

## ✅ ALL DONE!

Your database is now fully set up with:
- ✔ 5 tables
- ✔ 7 indexes for performance
- ✔ Row Level Security enabled
- ✔ 20+ RLS policies
- ✔ 1 storage bucket

---

## 🧪 Verify Setup (Optional)

Run this query to test:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show:
- profiles
- thesis_submissions
- feedback
- notifications
- adviser_assignments

✅ **All tables exist!**

---

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Start app: `npm run dev`
3. Login and test the system
4. Create demo users via Admin panel

**Enjoy! 🎓**

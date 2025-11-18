# 🚀 Supabase Integration Guide

**Project:** E-Thesis Capstone Management System  
**Supabase URL:** `https://wjbzfwieoopcrzbydfnc.supabase.co`  
**Status:** Ready to configure tables and policies

---

## 📋 Step 1: Create Tables in Supabase

Go to **Supabase Dashboard** → **SQL Editor** and run these SQL blocks in order:

### 1.1 Profiles Table (Users)
```sql
CREATE TABLE profiles (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('student', 'adviser', 'admin')),
  password text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
```

### 1.2 Thesis Submissions Table
```sql
CREATE TABLE thesis_submissions (
  id text PRIMARY KEY,
  student_id text REFERENCES profiles(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  file_name text,
  file_url text,
  status text NOT NULL DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'For Revision', 'Approved', 'Rejected')),
  adviser_id text REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_submissions_student ON thesis_submissions(student_id);
CREATE INDEX idx_submissions_adviser ON thesis_submissions(adviser_id);
CREATE INDEX idx_submissions_status ON thesis_submissions(status);
```

### 1.3 Feedback Table
```sql
CREATE TABLE feedback (
  id text PRIMARY KEY,
  submission_id text NOT NULL REFERENCES thesis_submissions(id) ON DELETE CASCADE,
  adviser_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  comment text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_feedback_submission ON feedback(submission_id);
CREATE INDEX idx_feedback_adviser ON feedback(adviser_id);
```

### 1.4 Notifications Table
```sql
CREATE TABLE notifications (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

---

## 🔐 Step 2: Disable RLS (Development Only)

Go to **Supabase Dashboard** → **Authentication** → **Policies** and disable Row Level Security for each table temporarily:

```
For each table (profiles, thesis_submissions, feedback, notifications):
1. Click table name
2. Click "Disable RLS" (top right)
```

⚠️ **Note:** For production, re-enable RLS with proper policies later.

---

## 📊 Step 3: What to Migrate to Supabase

### From localStorage to Supabase Tables

| localStorage Key | Target Supabase Table | What to Migrate |
|------------------|----------------------|-----------------|
| `currentUser` | `profiles` | User session data (read from table on login) |
| `submissions` | `thesis_submissions` | All thesis submission records |
| `feedback` | `feedback` | All adviser feedback records |
| `notifications` | `notifications` | All notification records |
| `users` | `profiles` | All user/profile records (admin management) |

### Migration Steps

#### Option A: Automatic Migration (Recommended)
I can add a migration helper page in the admin panel that:
1. Reads localStorage data
2. Validates it
3. Inserts into Supabase tables
4. Confirms migration completion

#### Option B: Manual SQL Import
In Supabase SQL Editor, insert your data:

**Example: Seed initial users**
```sql
INSERT INTO profiles (id, name, email, role, created_at) VALUES
  ('student-001', 'John Student', 'student@example.com', 'student', now()),
  ('adviser-001', 'Dr. Jane Adviser', 'adviser@example.com', 'adviser', now()),
  ('admin-001', 'Admin User', 'admin@example.com', 'admin', now());
```

---

## 🔗 Step 4: Supabase Queries by Component

### **AuthContext.jsx** ✅ (Already Updated)
- ✅ Fetch profile by email
- ✅ Create profile if missing
- ✅ Store in localStorage for session

### **AdminUsers.jsx** ✅ (Already Updated)
- ✅ Fetch all users from `profiles`
- ✅ Create new user
- ✅ Update user (name, email, role)
- ✅ Delete user
- ✅ Email uniqueness validation

### **StudentDashboard.jsx** (To Update)
```javascript
// Fetch submissions for current student
const { data: submissions } = await supabase
  .from('thesis_submissions')
  .select('*')
  .eq('student_id', userId)
  .order('created_at', { ascending: false })

// Count feedback for student's submissions
const { data: feedback } = await supabase
  .from('feedback')
  .select('submission_id')
  .in('submission_id', submissionIds)
```

### **StudentUpload.jsx** (To Update)
```javascript
// Create new submission
const { data, error } = await supabase
  .from('thesis_submissions')
  .insert([{
    id: `submission-${Date.now()}`,
    student_id: profile.id,
    title,
    description,
    file_name,
    file_url,
    status: 'Submitted'
  }])
  .select()
```

### **StudentSubmissions.jsx** (To Update)
```javascript
// Fetch submissions with feedback
const { data: submissions } = await supabase
  .from('thesis_submissions')
  .select('*')
  .eq('student_id', userId)

const { data: feedback } = await supabase
  .from('feedback')
  .select('*')
  .eq('submission_id', submissionId)
```

### **AdviserDashboard.jsx** (To Update)
```javascript
// Fetch all submissions (adviser sees all for review)
const { data: allSubmissions } = await supabase
  .from('thesis_submissions')
  .select('*')
  .order('created_at', { ascending: false })

// Count feedback given by this adviser
const { data: adviserFeedback } = await supabase
  .from('feedback')
  .select('id')
  .eq('adviser_id', adviserId)
```

### **AdviserReviews.jsx** (To Update)
```javascript
// Fetch submissions for review
const { data: submissions } = await supabase
  .from('thesis_submissions')
  .select('*')

// Add feedback
const { data } = await supabase
  .from('feedback')
  .insert([{
    id: `feedback-${Date.now()}`,
    submission_id: submissionId,
    adviser_id: adviserId,
    comment
  }])
  .select()

// Update submission status
const { data } = await supabase
  .from('thesis_submissions')
  .update({ status, adviser_id: adviserId })
  .eq('id', submissionId)
  .select()
```

### **AdviserStudents.jsx** (To Update)
```javascript
// Fetch students (advisers see all students for demo)
const { data: students } = await supabase
  .from('profiles')
  .select('*')
  .eq('role', 'student')
  .order('created_at', { ascending: false })
```

### **AdminDashboard.jsx** (To Update)
```javascript
// System statistics
const { data: submissions } = await supabase
  .from('thesis_submissions')
  .select('*')

const { data: profiles } = await supabase
  .from('profiles')
  .select('*')

const approved = submissions.filter(s => s.status === 'Approved').length
const totalStudents = profiles.filter(p => p.role === 'student').length
const totalAdvisers = profiles.filter(p => p.role === 'adviser').length
```

### **RightPanel.jsx** (To Update)
```javascript
// Fetch notifications for current user
const { data: notifications } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10)

// Mark notification as read
const { data } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
```

---

## 🎯 Step 5: Quick Login Flow (Preserved)

Quick login buttons still work as before:

1. User clicks "Student Login" button
2. AuthContext validates email/password against `MOCK_USERS`
3. If valid, Supabase checks if profile exists
4. If not exists, Supabase creates profile automatically
5. Session stored in localStorage
6. User navigated to dashboard

**Benefits:**
- ✅ Quick testing (no need to manually create users)
- ✅ Real data in Supabase (profiles auto-created)
- ✅ Can create new users via Admin panel and they go to Supabase
- ✅ Seamless migration from localStorage to Supabase

---

## 📝 Priority: Components to Convert

### Phase 1 (Core) - Start Here
1. ✅ AuthContext (done)
2. ✅ AdminUsers (done)
3. AdminDashboard — statistics from tables
4. StudentDashboard — user submissions count

### Phase 2 (Main Features)
5. StudentUpload — save to thesis_submissions
6. StudentSubmissions — read feedback from table
7. AdviserReviews — feedback system
8. AdviserDashboard — stats by adviser

### Phase 3 (Secondary)
9. AdviserStudents — list students
10. RightPanel — notifications
11. StudentUpload — file upload to Supabase Storage (optional, for now use file_url text field)

---

## 🔧 Example: Convert StudentDashboard to Supabase

**Before (localStorage):**
```javascript
const allSubmissions = JSON.parse(localStorage.getItem('submissions') || '[]')
const userSubmissions = allSubmissions.filter((s) => s.student_id === userId)
```

**After (Supabase):**
```javascript
async function fetchSubmissions() {
  const { data, error } = await supabase
    .from('thesis_submissions')
    .select('*')
    .eq('student_id', profile.id)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    setError(error.message)
  } else {
    setSubmissions(data || [])
  }
}
```

---

## ✅ Checklist

- [ ] Created `profiles` table
- [ ] Created `thesis_submissions` table
- [ ] Created `feedback` table
- [ ] Created `notifications` table
- [ ] Disabled RLS on all tables (dev)
- [ ] Updated `.env` with Supabase credentials
- [ ] Tested quick login (creates profile)
- [ ] Tested admin user create/edit/delete
- [ ] Migrated localStorage data (optional)
- [ ] Converted StudentDashboard
- [ ] Converted StudentUpload
- [ ] Converted AdviserReviews
- [ ] Converted all remaining components

---

## 🚨 Security Reminder

**Current setup (development only):**
- ✅ RLS disabled (open access)
- ✅ Using anon public key
- ✅ No auth required

**For production:**
- 🔒 Enable RLS with strict policies
- 🔒 Implement Supabase Auth or backend service role
- 🔒 Never hardcode credentials in frontend
- 🔒 Use environment variables only
- 🔒 Store passwords properly (use Supabase Auth)

---

## 📞 Next Steps

I can now:
1. Convert StudentDashboard to Supabase
2. Convert StudentUpload to Supabase
3. Convert AdviserReviews to Supabase
4. Convert all remaining components
5. Create a migration helper page for localStorage → Supabase

**Which would you like me to do next?**

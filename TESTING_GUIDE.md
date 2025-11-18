# 📚 Supabase Integration Reference Guide

## Quick Test Guide

### 1. Test Student Workflow
```
Step 1: Login
  - Email: student@example.com
  - Password: student123
  
Step 2: Go to Upload
  - Fill in thesis title
  - Add description (optional)
  - Upload PDF file
  - Click "Submit Thesis"
  → Saved to thesis_submissions table

Step 3: View Submissions
  - Go to "My Submissions"
  - See uploaded thesis in list
  → Fetched from Supabase
```

### 2. Test Adviser Workflow
```
Step 1: Login
  - Email: adviser@example.com
  - Password: adviser123

Step 2: Review Submissions
  - Click "Reviews" in sidebar
  - See all submissions
  - Select one to review
  → Fetched from Supabase

Step 3: Add Feedback
  - Type feedback comment
  - Select status (e.g., "For Revision")
  - Click "Submit Feedback"
  → Saved to feedback table
  → Submission status updated
```

### 3. Test Admin Workflow
```
Step 1: Login
  - Email: admin@example.com
  - Password: admin123

Step 2: Manage Users
  - Click "Users" in sidebar
  - See all users
  - Click "Edit" to modify
  - Click delete icon to remove
  → All changes saved to profiles table

Step 3: Create New User
  - Click "Add New User"
  - Fill name, email, role
  - Click "Save"
  → New user inserted to profiles table
```

---

## Database Operations Reference

### CREATE (Insert)
```javascript
// Student Upload
const { error } = await supabase
  .from('thesis_submissions')
  .insert([newSubmission])

// Admin Create User
const { error } = await supabase
  .from('profiles')
  .insert([newUser])

// Adviser Add Feedback
const { error } = await supabase
  .from('feedback')
  .insert([newFeedback])
```

### READ (Fetch)
```javascript
// Get user's submissions
const { data } = await supabase
  .from('thesis_submissions')
  .select('*')
  .eq('student_id', userId)

// Get all users
const { data } = await supabase
  .from('profiles')
  .select('*')

// Get feedback for submission
const { data } = await supabase
  .from('feedback')
  .select('*')
  .eq('submission_id', submissionId)

// Get user notifications
const { data } = await supabase
  .from('notifications')
  .select('*')
  .eq('user_id', userId)
```

### UPDATE (Modify)
```javascript
// Admin Update User
const { error } = await supabase
  .from('profiles')
  .update({ name, email, role })
  .eq('id', userId)

// Adviser Change Submission Status
const { error } = await supabase
  .from('thesis_submissions')
  .update({ status, adviser_id })
  .eq('id', submissionId)

// Mark Notification Read
const { error } = await supabase
  .from('notifications')
  .update({ is_read: true })
  .eq('id', notificationId)
```

### DELETE (Remove)
```javascript
// Admin Delete User
const { error } = await supabase
  .from('profiles')
  .delete()
  .eq('id', userId)
```

---

## Component File Reference

| File | Purpose | Supabase Tables | Operations |
|------|---------|-----------------|-----------|
| `src/context/AuthContext.jsx` | Login & Auth | profiles | SELECT, INSERT |
| `src/pages/StudentUpload.jsx` | Upload thesis | thesis_submissions | INSERT |
| `src/pages/StudentDashboard.jsx` | View stats | thesis_submissions, feedback | SELECT |
| `src/pages/StudentSubmissions.jsx` | View details | thesis_submissions, feedback | SELECT |
| `src/pages/AdviserReviews.jsx` | Add feedback | thesis_submissions, feedback | SELECT, INSERT, UPDATE |
| `src/pages/AdviserDashboard.jsx` | View stats | thesis_submissions, feedback | SELECT |
| `src/pages/AdminUsers.jsx` | Manage users | profiles | SELECT, INSERT, UPDATE, DELETE |
| `src/components/RightPanel.jsx` | Notifications | notifications | SELECT, UPDATE |

---

## Error Handling Pattern

All components follow this pattern:
```javascript
try {
  // Supabase operation
  const { data, error } = await supabase.from(table).select(...)
  
  if (error) throw error
  
  // Success: use data
  setData(data)
  
} catch (error) {
  console.error('Error:', error)
  setError(error.message)
  
  // Fallback to localStorage
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]')
    setData(stored)
  } catch (fallbackError) {
    console.error('Fallback error:', fallbackError)
  }
}
```

---

## Form Validation

### StudentUpload
- ✅ Title required (non-empty)
- ✅ File required (selected)
- ✅ File type required (.pdf only)

### AdminUsers
- ✅ Name required (non-empty)
- ✅ Email required (non-empty)
- ✅ Email unique (checked against DB)
- ✅ Role required (student/adviser/admin)

### AdviserReviews
- ✅ Feedback optional (can be empty)
- ✅ Status required (dropdown selection)

---

## Quick Login Credentials

These are pre-created in Supabase dummy data:

| Role | Email | Password | ID |
|------|-------|----------|-----|
| Student | student@example.com | student123 | 550e8400-e29b-41d4-a716-446655440001 |
| Adviser | adviser@example.com | adviser123 | 550e8400-e29b-41d4-a716-446655440004 |
| Admin | admin@example.com | admin123 | 550e8400-e29b-41d4-a716-446655440006 |

---

## Dummy Data Included

### Profiles (Users)
- 3 students
- 2 advisers  
- 1 admin

### Thesis Submissions
- 4 submissions with different statuses
- Assigned to students
- Some with advisers

### Feedback
- 4 feedback comments
- From advisers to submissions

### Notifications
- 6 notifications
- Various types (Approved, New Feedback, etc.)
- Mix of read/unread

### Adviser Assignments
- 3 adviser-student pairings

---

## Troubleshooting

### Issue: "User profile not found"
- Check: Is user logged in?
- Check: Did Supabase create the profile?
- Fix: Try logging out and in again

### Issue: "Cannot upload thesis"
- Check: File is PDF format?
- Check: File selected?
- Check: Title filled in?
- Check: Is Supabase connection working?

### Issue: "Email already exists"
- When creating new user in AdminUsers
- Solution: Use different email address
- Email must be unique in profiles table

### Issue: "Cannot delete user"
- When deleting in AdminUsers
- Check: Are you logged in as that user?
- Fix: Can't delete currently logged-in user

### Issue: "Supabase connection failed"
- Check: Network connection active?
- Check: VITE_SUPABASE_URL set correctly?
- Check: VITE_SUPABASE_PUBLISHABLE_KEY set?
- Fallback: Will use localStorage automatically

---

## Testing Checklist

- [ ] Login with student account
- [ ] Upload thesis (fill title, description, PDF)
- [ ] View dashboard (see stats)
- [ ] View submissions (see feedback)
- [ ] Logout and login with adviser
- [ ] See all submissions
- [ ] Add feedback to submission
- [ ] Change submission status
- [ ] Logout and login with student again
- [ ] See updated status and feedback
- [ ] Logout and login with admin
- [ ] View all users
- [ ] Create new user
- [ ] Edit user
- [ ] Delete user (not self)
- [ ] Check notifications

---

## Files Modified in Migration

```
src/
├── context/
│   └── AuthContext.jsx ← Updated: Supabase profile lookup/create
├── pages/
│   ├── StudentDashboard.jsx ← Updated: Fetch from thesis_submissions
│   ├── StudentUpload.jsx ← Updated: Insert to thesis_submissions
│   ├── StudentSubmissions.jsx ← Updated: Fetch submissions + feedback
│   ├── AdviserReviews.jsx ← Updated: Fetch, insert feedback, update status
│   ├── AdviserDashboard.jsx ← Updated: Fetch stats from DB
│   └── AdminUsers.jsx ← Updated: CRUD operations on profiles
├── components/
│   └── RightPanel.jsx ← Updated: Fetch notifications, mark read
└── utils/
    └── supabase.js ← Created: Supabase client initialization

sql/
└── supabase_setup.sql ← Created: Table creation + dummy data
```

---

## Key Success Indicators

✅ All pages load without errors  
✅ Forms accept user input  
✅ Data saves to Supabase  
✅ Data fetches from Supabase  
✅ Status updates work  
✅ Feedback saves and displays  
✅ Admin CRUD operations work  
✅ Notifications show and update  
✅ Errors logged to console  
✅ Falls back to localStorage  

---

**System is fully operational and ready for testing!** 🎓

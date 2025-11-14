# Test Credentials - E-Thesis & Capstone Project Management System

All credentials are ready to use immediately. **No backend setup required!**

## Quick Login Buttons
The fastest way to test: Click the quick login buttons on the Login page for instant access to each role.

---

## Demo User Accounts

### 👨‍🎓 STUDENT
- **Email:** `student@example.com`
- **Password:** `password123`
- **Role:** Student
- **User ID:** `student-001`
- **Name:** John Student

**Student Features:**
- Upload thesis/capstone documents
- View submission status
- Receive feedback from adviser
- Track revision history
- Access dashboard with submission statistics

---

### 👨‍🏫 ADVISER
- **Email:** `adviser@example.com`
- **Password:** `password123`
- **Role:** Adviser
- **User ID:** `adviser-001`
- **Name:** Dr. Jane Adviser

**Adviser Features:**
- View assigned student submissions
- Provide feedback and comments
- Update submission status (Submitted, For Revision, Approved, Rejected)
- Track review queue
- View statistics dashboard

---

### 👨‍💼 ADMIN
- **Email:** `admin@example.com`
- **Password:** `password123`
- **Role:** Admin
- **User ID:** `admin-001`
- **Name:** Admin User

**Admin Features:**
- View system-wide statistics
- Manage users (create, view, delete)
- Monitor all submissions and feedback
- Access admin dashboard
- System status monitoring

---

## Testing Workflow

### 1. Student Workflow
1. Login as **student@example.com** / `password123`
2. Go to "Upload Thesis" 
3. Fill in title and description
4. Upload a PDF file (simulated)
5. Submit and check Dashboard for status
6. Go to "Submissions" to view feedback

### 2. Adviser Workflow
1. Login as **adviser@example.com** / `password123`
2. Go to "Reviews" tab
3. See pending student submissions
4. Click on a submission to review
5. Add feedback comments
6. Select status (For Revision, Approved, etc.)
7. Submit feedback
8. Check "Dashboard" to see review statistics

### 3. Admin Workflow
1. Login as **admin@example.com** / `password123`
2. View system statistics on Dashboard
3. Go to "Users" to see all system users
4. Create new users (for mock system)
5. Monitor system status

---

## Data Storage

**All data is stored locally in your browser using localStorage:**
- **Submissions Data:** `localStorage.get('submissions')`
- **Feedback Data:** `localStorage.get('feedback')`
- **Notifications:** `localStorage.get('notifications')`
- **Current User Session:** `localStorage.get('currentUser')`

**Note:** Data persists across page reloads but clears if browser cache is cleared.

---

## Color Scheme (ESCR Brand)

- **Primary Red:** #C62828 (buttons, active states)
- **Gold/Yellow:** #FFCC00 (stats, accents)
- **Orange:** #F57C00 (hover states)
- **White:** #FFFFFF (backgrounds)
- **Light Gray:** #F5F5F5 (cards)

---

## Features Summary

✅ **Authentication:** Mock system (no backend required)
✅ **Role-Based Access:** Student, Adviser, Admin
✅ **File Submission:** Upload thesis/capstone (simulated)
✅ **Feedback System:** Adviser provides comments and status updates
✅ **Dashboard:** Real-time statistics for each role
✅ **Responsive Design:** Works on mobile, tablet, desktop
✅ **Data Persistence:** localStorage for offline-first functionality

---

## Troubleshooting

### Can't login?
- Verify email and password are exactly as shown above (case-sensitive)
- Try clicking the quick login button for your role
- Clear browser cache if issues persist

### Data not persisting?
- Check if localStorage is enabled in your browser
- Try not in incognito/private mode
- Check browser console for errors

### UI looks broken?
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+R)
- Try a different browser

---

## Next Steps

1. **Start the application:** `npm run dev`
2. **Open in browser:** Usually `http://localhost:5173`
3. **Login using any credentials above**
4. **Test the complete workflow**

Happy testing! 🎉

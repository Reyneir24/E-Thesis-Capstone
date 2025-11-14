# Thesis Pro - E-Thesis & Capstone Project Management System

A complete web application for managing thesis and capstone submissions with adviser feedback using React, TailwindCSS, and Supabase.

## 🎯 Features

### Student Features
- Upload thesis/capstone PDFs
- Track submission status (Submitted, For Revision, Approved, Rejected)
- Receive and view adviser feedback
- Real-time notifications
- Dashboard with submission overview

### Adviser Features
- View assigned student submissions
- Add structured feedback
- Update submission status
- Manage assigned students
- Dashboard with review queue and analytics

### Admin Features
- Create and manage users (students, advisers, admins)
- Assign advisers to students
- View system analytics and statistics
- Manage system settings

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: TailwindCSS 3
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router v6
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 16+ and npm
- A Supabase project (https://supabase.com)
- Modern web browser

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

The `.env` file is already configured with Supabase credentials:

```env
VITE_SUPABASE_URL=https://wjbzfwieoopcrzbydfnc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqYnpmd2llb29wY3J6YnlkZm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA2NjgsImV4cCI6MjA3ODY2NjY2OH0.31AUOid-QyB6aATlGXL-_3ZcynlbmvIOFob8Rq9zGdo
```

### 3. Database Setup

1. Go to Supabase SQL Editor
2. Copy all SQL from `sql/migrations.sql`
3. Execute each section in order (CREATE TABLE statements first, then RLS policies)
4. Create a storage bucket named `thesis-files` (PRIVATE)

### 4. Run the Application

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 📚 Database Schema

### tables:
- **profiles**: User accounts (students, advisers, admins)
- **thesis_submissions**: Student thesis submissions
- **feedback**: Adviser feedback on submissions
- **notifications**: User notifications
- **adviser_assignments**: Adviser-student assignments

See `sql/migrations.sql` for complete schema with RLS policies.

## 🔐 Authentication

### Demo Credentials:

```
Student: student@example.com / password123
Adviser: adviser@example.com / password123
Admin: admin@example.com / password123
```

To create demo accounts:
1. Use Admin panel to create users
2. Or manually insert into Supabase Auth via dashboard

## 🎨 Design System

### School Colors (ESCR)
- Primary Red: `#C62828`
- Yellow/Gold: `#FFCC00`
- Orange: `#F57C00`
- White: `#FFFFFF`
- Gray: `#F5F5F5`

### UI Components
- Sidebar navigation (left)
- Profile panel (right)
- Dashboard cards with soft shadows
- Rounded corners (1rem radius)
- Clean, modern layout

## 📁 Project Structure

```
thesis.project/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── RightPanel.jsx
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── StudentDashboard.jsx
│   │   ├── StudentUpload.jsx
│   │   ├── StudentSubmissions.jsx
│   │   ├── AdviserDashboard.jsx
│   │   ├── AdviserReviews.jsx
│   │   ├── AdviserStudents.jsx
│   │   ├── AdminDashboard.jsx
│   │   └── AdminUsers.jsx
│   ├── routes/
│   │   └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── utils/
│   │   └── supabase.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── sql/
│   └── migrations.sql
├── .env
├── .env.example
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── index.html
└── README.md
```

## 🔧 API Endpoints (Supabase)

### Authentication
- `supabase.auth.signInWithPassword(email, password)`
- `supabase.auth.signUp(email, password)`
- `supabase.auth.signOut()`

### Queries
- `supabase.from('profiles').select()`
- `supabase.from('thesis_submissions').select()`
- `supabase.from('feedback').select()`
- `supabase.from('notifications').select()`

## 📝 Usage Guide

### For Students:
1. Login with student credentials
2. Go to "Upload Thesis"
3. Fill in title, description, and upload PDF
4. View status on "My Submissions"
5. Check feedback from advisers

### For Advisers:
1. Login with adviser credentials
2. View "Review Queue" for pending submissions
3. Open submission and add feedback
4. Update status (Approved, For Revision, etc.)
5. View assigned students on "Assigned Students"

### For Admins:
1. Login with admin credentials
2. Create users via "User Management"
3. Assign advisers to students
4. View system analytics
5. Monitor system status

## 🐛 Troubleshooting

### Cannot login
- Verify credentials in Supabase Auth dashboard
- Check if user profile exists in `profiles` table

### File upload fails
- Check if `thesis-files` storage bucket exists
- Verify RLS policies on storage bucket
- Ensure file size < 50MB

### Notifications not showing
- Check user ID in notifications table
- Verify RLS policy allows user to view own notifications

## 📚 Further Customization

### Add New User Role
1. Update `role` CHECK constraint in `profiles` table
2. Create RLS policies for new role
3. Add role-specific pages and navigation

### Customize Colors
Edit `tailwind.config.js` and update color values:
```js
colors: {
  'escr-red': '#C62828',
  'escr-yellow': '#FFCC00',
  'escr-orange': '#F57C00',
}
```

### Add Notifications
Use Supabase realtime subscriptions in components:
```js
supabase
  .from('notifications')
  .on('*', payload => console.log(payload))
  .subscribe()
```

## 📖 Documentation

- [React Documentation](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Router Docs](https://reactrouter.com)

## 📄 License

This project is provided as-is for educational purposes.

## 🤝 Support

For issues or questions, refer to:
- Supabase Documentation
- React Documentation
- Project source code comments

---

**Built with ❤️ for thesis management**

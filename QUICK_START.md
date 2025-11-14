# ⚡ QUICK REFERENCE GUIDE

## 🚀 START HERE (3 STEPS)

### Step 1: Database Setup (5 minutes)
```bash
# Go to: https://app.supabase.com
# SQL Editor → Copy SQL from SQL_SETUP.md
# Execute 8 sections in order
# Go to Storage → Create "thesis-files" bucket (PRIVATE)
```

### Step 2: Install & Run (2 minutes)
```bash
npm install
npm run dev
```

### Step 3: Access Application
```
http://localhost:5173
Login: student@example.com / password123
```

---

## 📁 FILE LOCATIONS

| File | Purpose |
|------|---------|
| `sql/migrations.sql` | All database schema |
| `SQL_SETUP.md` | Copy-paste SQL instructions |
| `SETUP.md` | Complete setup guide |
| `README.md` | Full documentation |
| `PROJECT_SUMMARY.md` | Project overview |
| `src/App.jsx` | Main app routing |
| `.env` | Supabase credentials |

---

## 🔑 KEY FILES TO EDIT

### Add New Student Page
1. Create `src/pages/NewFeature.jsx`
2. Import in `src/App.jsx`
3. Add route in App.jsx
4. Add to sidebar in `src/components/Sidebar.jsx`

### Add New Database Table
1. Create in SQL Editor
2. Add RLS policies
3. Create queries in relevant pages
4. Update AuthContext if auth-related

### Change Colors
Edit `tailwind.config.js`:
```js
colors: {
  'escr-red': '#C62828',    // Change here
  'escr-yellow': '#FFCC00', // Change here
  'escr-orange': '#F57C00', // Change here
}
```

---

## 💻 COMMON COMMANDS

```bash
npm install             # Install dependencies
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

---

## 🗄️ SUPABASE QUERIES CHEAT SHEET

### Select
```js
const { data } = await supabase
  .from('thesis_submissions')
  .select('*')
  .eq('student_id', userId)
```

### Insert
```js
const { data } = await supabase
  .from('feedback')
  .insert([{ submission_id, adviser_id, comment }])
```

### Update
```js
const { data } = await supabase
  .from('thesis_submissions')
  .update({ status: 'Approved' })
  .eq('id', submissionId)
```

### Subscribe (Real-time)
```js
supabase
  .from('notifications')
  .on('INSERT', payload => console.log(payload))
  .subscribe()
```

---

## 🎨 COLOR REFERENCE

```
Red (Buttons):    #C62828
Yellow (Stats):   #FFCC00
Orange (Hover):   #F57C00
White (BG):       #FFFFFF
Gray (Cards):     #F5F5F5
```

---

## 👥 USER ROLES & PATHS

| Role | Login Path | Dashboard |
|------|-----------|-----------|
| Student | /login | /student/dashboard |
| Adviser | /login | /adviser/dashboard |
| Admin | /login | /admin/dashboard |

---

## 📌 IMPORTANT NOTES

⚠️ **Always run SQL sections in order**
- Tables first
- Indexes second
- RLS policies last

⚠️ **Storage bucket must be PRIVATE**
- RLS policies handle access
- Public bucket = security risk

⚠️ **Create demo users via Admin panel**
- Don't manually insert into profiles
- Use supabase.auth.admin for creation

⚠️ **Check RLS policies first**
- 90% of access issues are RLS
- Users can only see what policies allow

---

## 🐛 QUICK DEBUGGING

| Problem | Check |
|---------|-------|
| Can't login | supabase_auth.users table |
| Can't upload | storage bucket exists & is private |
| Can't see data | RLS policy matches your user |
| Notifications missing | notifications table has data |
| Page blank | Check browser console for errors |

---

## 📞 HELP RESOURCES

- **Supabase Docs**: https://supabase.com/docs
- **React Docs**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com
- **Project Docs**: See README.md

---

## ✅ VERIFICATION CHECKLIST

After setup, verify:

- [ ] Can login with student credentials
- [ ] Can upload thesis PDF
- [ ] Can see submissions on dashboard
- [ ] Adviser can view assigned students
- [ ] Admin can create new users
- [ ] Notifications appear in right panel
- [ ] Color scheme matches school colors
- [ ] Layout is responsive on mobile
- [ ] All pages load without errors
- [ ] Database connections work

---

## 🎯 PROJECT STATUS

✅ **Complete MVP**
- 9 pages
- 4 components
- 5 database tables
- 20+ RLS policies
- Full documentation

✅ **Ready to Deploy**
- Optimized build
- Secure RLS policies
- Production config
- Error handling

✅ **Ready to Extend**
- Well-structured code
- Easy to add features
- Clear documentation
- Modular components

---

## 📊 TECH STACK AT A GLANCE

```
Frontend: React 18 + Vite
Styling: TailwindCSS 3
Backend: Supabase (PostgreSQL)
Auth: Supabase Auth + JWT
Storage: Supabase Storage
Routing: React Router v6
Icons: Lucide React
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:

- [ ] Update environment variables
- [ ] Run production build: `npm run build`
- [ ] Test all features
- [ ] Check RLS policies are strict
- [ ] Verify storage bucket is private
- [ ] Set up custom domain
- [ ] Enable HTTPS
- [ ] Monitor performance

---

## 🎓 GOOD PRACTICES

✅ **DO:**
- Use ProtectedRoute for role safety
- Check auth.uid() in RLS policies
- Validate user role before showing data
- Use environment variables for secrets
- Test across devices/browsers

❌ **DON'T:**
- Store sensitive data in localStorage
- Expose database directly to frontend
- Skip RLS policy testing
- Use public storage for private files
- Commit .env files

---

## 📈 NEXT FEATURES TO ADD

Popular additions:
1. Email notifications
2. PDF viewer for submissions
3. Comment threads
4. File versioning
5. Advanced analytics
6. Plagiarism detection
7. Bulk operations
8. Export functionality

---

**Questions? See PROJECT_SUMMARY.md or SETUP.md**

**Happy coding! 🚀**

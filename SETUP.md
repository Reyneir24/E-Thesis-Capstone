# SETUP GUIDE - Thesis Pro

## ✅ Step 1: Database Setup (IMPORTANT)

### 1.1 Create Tables and Policies

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Copy the entire content from `sql/migrations.sql`
4. Execute each SQL section in this order:
   - ✔ CREATE TABLES (sections 1-5)
   - ✔ CREATE INDEXES (section 6)
   - ✔ ENABLE RLS (section 7)
   - ✔ RLS POLICIES (sections 8-12)

### 1.2 Create Storage Bucket

1. Go to **Storage** in Supabase dashboard
2. Click **Create a new bucket**
3. Name it: `thesis-files`
4. Set to **PRIVATE**
5. Click **Create bucket**

### 1.3 Add Storage RLS Policies (Optional but recommended)

Go to **Storage > Policies** and add the commented policies from migrations.sql

---

## ✅ Step 2: Create Demo Users (Optional)

Use the Admin panel after setup or manually create via Supabase Auth:

1. Go to **Authentication > Users** in Supabase
2. Click **Create new user**
3. Add users:
   ```
   Email: student@example.com
   Password: password123
   
   Email: adviser@example.com
   Password: password123
   
   Email: admin@example.com
   Password: password123
   ```

4. Then go to the app Admin panel and create profiles for each

---

## ✅ Step 3: Install Dependencies

```bash
npm install
```

---

## ✅ Step 4: Run the Application

```bash
npm run dev
```

The app will start at `http://localhost:5173`

---

## ✅ Step 5: Test the System

### Student Flow:
1. Login: `student@example.com` / `password123`
2. Go to "Upload Thesis"
3. Fill in title and upload a PDF
4. Check "My Submissions" to see status

### Adviser Flow:
1. Login: `adviser@example.com` / `password123`
2. Assign adviser in Admin panel
3. Go to "Review Queue"
4. Add feedback and update status

### Admin Flow:
1. Login: `admin@example.com` / `password123`
2. Go to "User Management"
3. Create new users
4. Assign students to advisers

---

## 🔧 Build for Production

```bash
npm run build
```

This creates optimized files in the `dist` folder ready for deployment.

---

## 📋 Supabase Configuration Reference

```env
VITE_SUPABASE_URL=https://wjbzfwieoopcrzbydfnc.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqYnpmd2llb29wY3J6YnlkZm5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwOTA2NjgsImV4cCI6MjA3ODY2NjY2OH0.31AUOid-QyB6aATlGXL-_3ZcynlbmvIOFob8Rq9zGdo
```

---

## 🎨 Color Reference

```
Primary Red (Buttons):       #C62828
Yellow/Gold (Accents):       #FFCC00
Orange (Hover):              #F57C00
White (Background):          #FFFFFF
Light Gray (Cards):          #F5F5F5
```

---

## 📁 File Structure Overview

```
thesis-pro/
├── src/
│   ├── components/       # Reusable components
│   ├── pages/           # Route pages
│   ├── context/         # Auth context
│   ├── utils/           # Supabase client
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── sql/
│   └── migrations.sql   # Database schema
├── .env                 # Environment variables
├── package.json         # Dependencies
├── vite.config.js       # Vite config
├── tailwind.config.js   # TailwindCSS config
└── README.md           # Documentation
```

---

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## ❓ FAQ

**Q: How do I reset the database?**
A: Delete all tables in SQL Editor and re-run migrations.sql

**Q: Can I change the school colors?**
A: Yes, edit `tailwind.config.js` colors section

**Q: How do I add more users?**
A: Use Admin > User Management panel

**Q: Where are files stored?**
A: In `thesis-files` storage bucket in Supabase

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| Login fails | Check credentials in Supabase Auth |
| Upload fails | Verify storage bucket exists and is private |
| No feedback | Check adviser assignment in admin panel |
| Notifications missing | Verify RLS policies on notifications table |

---

## 📞 Support

Refer to:
- Supabase Documentation: https://supabase.com/docs
- React Documentation: https://react.dev
- TailwindCSS: https://tailwindcss.com

---

**All setup! Happy thesis managing! 🎓**

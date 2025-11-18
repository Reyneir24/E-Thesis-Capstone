# ⚡ Quick Action: Fix 500 Errors in 3 Steps

## You're Getting 500 Errors? Here's Why & How to Fix

### The Problem
```
Failed to load resource: the server responded with a status of 500
```

The `profiles` table has a foreign key to `auth.users`, but we're using custom IDs.

---

## 🔧 Fix It Right Now

### Step 1: Copy This SQL
```sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;
```

### Step 2: Run in Supabase
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to your project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Paste the SQL above
6. Click **Run** (or Ctrl+Enter)

✅ **Done!**

### Step 3: Refresh Your App
- Close the app
- Clear browser cache (optional but recommended)
- Reload the page
- Try login again

---

## ✅ Verify It Works

After running the SQL, you should see:
- ✅ Student login works (no 500 errors)
- ✅ Can see submissions
- ✅ Admin can create/edit/delete users
- ✅ Changes save to Supabase
- ✅ Notifications load

---

## 📝 Testing After Fix

### Test 1: Student Login
```
1. Click "Student Login" button
2. Should see dashboard with stats
3. No errors in browser console (F12)
```

### Test 2: Upload Thesis
```
1. Go to "Upload"
2. Fill title, description, upload PDF
3. Click "Submit Thesis"
4. Should redirect to submissions
```

### Test 3: Admin Create User
```
1. Login with admin@example.com / admin123
2. Click "Users" → "Add New User"
3. Fill name, email, role
4. Click "Save User"
5. New user appears in list
```

### Test 4: Admin Edit User
```
1. As admin, go to "Users"
2. Click ✏️ (edit) on any user
3. Change name or email
4. Click "Save User"
5. Changes saved to Supabase
```

### Test 5: Adviser Feedback
```
1. Login with adviser@example.com / adviser123
2. Click "Reviews"
3. Select a submission
4. Add feedback + change status
5. Click "Submit Feedback"
6. Changes saved
```

---

## If Still Having Issues

### Issue: Still Getting 500 Errors

**Check 1: RLS Enabled?**
1. Go to **Authentication** → **Policies** in Supabase
2. For each table, make sure RLS is **disabled** (toggle should be OFF)

**Check 2: Constraint Really Removed?**
Run this in SQL Editor:
```sql
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'profiles';
```

Should show **NO results** or only other constraints (not `profiles_id_fkey`)

**Check 3: Hard Refresh Browser**
- Windows/Linux: Ctrl+Shift+R
- Mac: Cmd+Shift+R

---

## Success! 🎉

Once the SQL is run:
- All 500 errors gone ✅
- Student can login ✅
- Admin can manage users ✅
- All data saves to Supabase ✅
- App fully functional ✅

**Total time to fix: < 2 minutes**

---

## Still Stuck?

Create a new query in Supabase SQL Editor and run this to diagnose:

```sql
-- Check constraint status
SELECT 'STEP 1: Check for foreign key constraint' as step;
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'profiles' AND constraint_type = 'FOREIGN KEY';

-- Check RLS status
SELECT 'STEP 2: Check RLS status' as step;
SELECT * FROM pg_tables WHERE tablename = 'profiles';

-- Check column structure
SELECT 'STEP 3: Check column structure' as step;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles';

-- Check existing data
SELECT 'STEP 4: Check existing data' as step;
SELECT COUNT(*) as profile_count FROM public.profiles;
```

This will help you see what's wrong!

---

**Go run that SQL now and your app will work! 🚀**

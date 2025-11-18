# 🔧 Fix Supabase 500 Errors

## Problem
Getting `500` errors when trying to query/insert into profiles table:
```
Failed to load resource: the server responded with a status of 500 ()
```

## Root Cause
The `profiles.id` foreign key constraint references `auth.users(id)`, but we're using custom string IDs like `"student-001"` instead of auth UUIDs.

## Solution: Disable Auth Constraint

### Step 1: Run SQL in Supabase
Go to **Supabase Dashboard** → **SQL Editor** → Run this:

```sql
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
```

### Step 2: Verify Constraint Removed
Run this to check:
```sql
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE table_name = 'profiles';
```

**Expected result:** No `profiles_id_fkey` in the list

### Step 3: Refresh Your App
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page (Ctrl+R or F5)
- Try login again

---

## Testing Checklist

After running the SQL:

- [ ] Try Student login → Check console for errors
- [ ] Go to StudentDashboard → Should load submissions
- [ ] Go to AdminUsers → Should load user list
- [ ] Try admin create new user → Should save to Supabase
- [ ] Try admin edit user → Should update in Supabase
- [ ] View notifications → Should load from table
- [ ] Try student upload thesis → Should insert successfully

---

## If Still Getting Errors

### Check 1: RLS Policies
Some Supabase projects have RLS enabled by default.

**Fix:**
1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. For each table (profiles, thesis_submissions, feedback, notifications):
   - Click the table
   - Look for "Enable RLS" toggle
   - If enabled, click **"Disable RLS"** (for development)

### Check 2: Verify Constraint Removed
In Supabase SQL Editor, run:
```sql
-- Show all constraints on profiles table
\d public.profiles
```

Look for any `FOREIGN KEY` constraints. If you see `profiles_id_fkey`, run:
```sql
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey CASCADE;
```

### Check 3: Column Names Match
Verify your table has these exact columns:
```sql
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;
```

Should show:
- id (text)
- name (text)
- email (text)
- role (text)
- created_at (timestamp)
- updated_at (timestamp)

---

## Quick SQL Script

Copy and run this entire script in Supabase SQL Editor:

```sql
-- Remove auth constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey CASCADE;

-- Verify it's removed
SELECT 'Constraint check:' as info;
SELECT constraint_name FROM information_schema.table_constraints 
WHERE table_name = 'profiles' AND constraint_name LIKE '%fkey%';

-- Show column structure
SELECT 'Column structure:' as info;
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'profiles' ORDER BY ordinal_position;

-- Check existing data
SELECT 'Existing profiles count:' as info;
SELECT COUNT(*) FROM public.profiles;

-- If you want to clear and re-seed:
-- DELETE FROM public.profiles;
-- Then run supabase_setup.sql
```

---

## After Fix - Test Admin User Edit

### Flow:
1. **Login as admin**
   - Email: admin@example.com
   - Password: admin123

2. **Go to Users page**
   - Click "Users" in sidebar

3. **Edit a user**
   - Click ✏️ (edit icon) on any user
   - Change name or email
   - Click "Save User"

4. **Verify in console**
   - Open DevTools (F12)
   - Should see successful update message
   - No red errors in console

5. **Verify in Supabase**
   - Go to Supabase Dashboard
   - Open **profiles** table
   - Check if changes were saved

---

## Common Issues & Fixes

| Error | Fix |
|-------|-----|
| `403 Forbidden` | Enable RLS policies or disable RLS in settings |
| `400 Bad Request` | Column name mismatch - verify column names |
| `500 Internal Server Error` | Foreign key constraint - remove profiles_id_fkey |
| `401 Unauthorized` | Not related to our setup (we don't use Supabase Auth) |

---

## Success Indicators ✅

After fix, you should see:
- ✅ No 500 errors in console
- ✅ Admin users page loads with list
- ✅ Create user works
- ✅ Edit user works (changes save)
- ✅ Delete user works
- ✅ Student can login
- ✅ Student dashboard loads
- ✅ Can upload thesis
- ✅ Can view submissions
- ✅ Notifications load

---

## Need Help?

If you still have issues:
1. Check Supabase dashboard for any errors
2. Verify table structure matches expected columns
3. Make sure RLS is disabled for development
4. Check browser DevTools console for detailed errors
5. Try hard refresh (Ctrl+Shift+R)

---

**After running the SQL fix above, the app should work perfectly!** ✨

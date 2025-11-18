# Vercel Deployment Settings

## Build and Output Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

## Environment Variables
| Key                           | Value                                                      |
|-------------------------------|------------------------------------------------------------|
| VITE_SUPABASE_URL             | https://wjbzfwieoopcrzbydfnc.supabase.co                   |
| VITE_SUPABASE_PUBLISHABLE_KEY | eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)    |

> You can add these in the Vercel dashboard under **Project Settings → Environment Variables**.

---

## Steps to Deploy
1. **Import your GitHub repo** into Vercel.
2. **Set the above environment variables** in Vercel project settings.
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`
6. **Deploy!**

---

For more details, see your `.env` file or Supabase dashboard for the correct keys.

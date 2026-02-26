# Supabase Auth Setup Guide

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in:
   - **Name**: market-regime-report (or any name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users
4. Click "Create new project" and wait for setup

## 2. Get API Keys

1. In your Supabase project, go to **Settings > API**
2. Copy these values:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)

## 3. Create .env.local

Create `/website/.env.local` with:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Run SQL Migration

1. In Supabase, go to **SQL Editor**
2. Click "New query"
3. Paste the contents of `supabase/migrations/001_profiles.sql`:

```sql
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  current_regime_access BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, current_regime_access)
  VALUES (NEW.id, NEW.email, TRUE);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

4. Click "Run" to execute

## 5. Configure Auth Redirect URLs

1. In Supabase, go to **Authentication > URL Configuration**
2. Add these to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://marketregimes.com/auth/callback`

## 6. Configure Email Templates (Optional)

1. Go to **Authentication > Email Templates**
2. Select "Magic Link"
3. Customize the email if desired

## 7. Configure Session Duration

1. Go to **Authentication > Providers**
2. Under "Email", ensure it's enabled
3. Go to **Authentication > Settings**
4. Set **JWT expiry** to desired duration (default is 3600 seconds = 1 hour)
5. The refresh token handles long sessions automatically (~30 days)

## 8. Add Environment Variables to Vercel

1. Go to your Vercel project
2. Go to **Settings > Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your anon key
4. Redeploy the project

## 9. Test Locally

```bash
npm install
npm run dev
```

1. Go to http://localhost:3000
2. Click "Current Regime" - should redirect to login
3. Enter your email and click "Send Magic Link"
4. Check your email and click the link
5. You should be redirected to /current-regime

## File Changes Summary

### New Files
- `src/lib/supabase/server.ts` - Server-side Supabase client
- `src/lib/supabase/client.ts` - Client-side Supabase client
- `src/lib/supabase/middleware.ts` - Middleware helper for auth
- `src/middleware.ts` - Next.js middleware for route protection
- `src/app/login/page.tsx` - Login page with magic link
- `src/app/auth/callback/route.ts` - Auth callback handler
- `src/components/SignOutButton.tsx` - Sign out button component
- `supabase/migrations/001_profiles.sql` - Database migration
- `.env.local.example` - Environment variables template

### Modified Files
- `src/app/layout.tsx` - Added auth state to header
- `src/app/current-regime/page.tsx` - Added access control
- `src/components/Header.tsx` - Added Sign In/Sign Out button

## Managing Access

To enable/disable access for a user:

```sql
-- Disable access
UPDATE profiles
SET current_regime_access = FALSE
WHERE email = 'user@example.com';

-- Enable access
UPDATE profiles
SET current_regime_access = TRUE
WHERE email = 'user@example.com';
```

## Troubleshooting

### Magic link not working
- Check Supabase email logs: **Authentication > Users > Click user > Logs**
- Verify redirect URLs are configured correctly
- Check spam folder

### Session not persisting
- Ensure cookies are not being blocked
- Check that middleware is running (look for `ƒ Proxy` in build output)

### "Access Not Enabled" showing unexpectedly
- Check the profiles table in Supabase
- Verify `current_regime_access` is `TRUE` for the user

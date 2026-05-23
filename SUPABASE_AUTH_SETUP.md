# Supabase Authentication Setup Guide

## Overview

The authentication system has been migrated from NextAuth to Supabase Auth. This provides a more integrated and reliable authentication solution using Supabase's built-in auth service.

## Environment Variables Required

Add these to your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAIL=gautammanak1@gmail.com
```

## Getting Your Supabase Keys

1. Go to [https://supabase.com](https://supabase.com)
2. Sign in or create an account
3. Create a new project or select existing one
4. Navigate to **Project Settings** → **API**
5. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Secret** (from **Secrets** tab) → `SUPABASE_SERVICE_ROLE_KEY`

## Database Setup

Supabase will automatically sync with your PostgreSQL database. Ensure your `User` table has:

```sql
CREATE TABLE "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(64) NOT NULL UNIQUE,
  name text,
  emailVerified boolean NOT NULL DEFAULT false,
  image text,
  isAnonymous boolean NOT NULL DEFAULT false,
  createdAt timestamp NOT NULL DEFAULT NOW(),
  updatedAt timestamp NOT NULL DEFAULT NOW()
);
```

Supabase Auth will automatically create auth records when users sign up.

## How Authentication Works

### Login Flow

1. User enters email and password on `/login`
2. `app/(auth)/actions.ts` handles the form submission
3. Calls `supabase.auth.signInWithPassword()`
4. Middleware validates session and sets cookies
5. User is redirected to `/`

### Registration Flow

1. User enters email and password on `/register`
2. `app/(auth)/actions.ts` validates input
3. Checks if user exists in database
4. Calls `supabase.auth.signUp()`
5. Automatically signs in the user
6. User is redirected to `/`

## Client-Side Auth Hook

Use the `useSupabaseAuth()` hook in client components:

```tsx
"use client";

import { useSupabaseAuth } from "@/lib/supabase/auth";

export function MyComponent() {
  const { user, session, loading, signOut, supabase } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <p>Logged in as: {user?.email}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

## Server-Side Auth

For server components or API routes:

```tsx
// Server Component
import { createClient } from "@/lib/supabase/server";

export default async function MyServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>{user?.email}</div>;
}
```

## Protected Routes

The middleware (`middleware.ts`) protects admin routes:

- `/admin/*` routes require admin email from `ADMIN_EMAIL` env var
- Login/register pages redirect authenticated users to `/`
- All auth state changes are automatically synced to cookies

## Troubleshooting

### "Login nicht hota"

**Problem:** Login doesn't work
**Solution:**
1. Verify Supabase keys in `.env.local`
2. Check Supabase project is running
3. Ensure `User` table exists in database
4. Check browser console for error messages

### Session Not Persisting

**Problem:** User gets logged out after page refresh
**Solution:**
1. Middleware should handle session refresh automatically
2. Check cookie settings in `middleware.ts`
3. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct

### Can't Sign Up

**Problem:** Registration fails
**Solution:**
1. Ensure password is at least 6 characters
2. Email must be valid format
3. Check database for duplicate emails
4. Review Supabase auth settings

## Test Credentials

```
Email: gautammanak1@gmail.com
Password: Coder@123
```

## Files Changed

- `app/(auth)/actions.ts` - Updated auth actions
- `app/(auth)/login/page.tsx` - Updated login form
- `app/(auth)/register/page.tsx` - Updated registration form
- `lib/supabase/server.ts` - Server-side Supabase client
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/auth.ts` - Auth hook for client components
- `app/(auth)/auth.server.ts` - Server auth utilities
- `middleware.ts` - Request middleware for auth
- `components/chat/sidebar-user-nav.tsx` - Updated user nav
- `hooks/use-guest-session.ts` - Updated guest session hook
- `package.json` - Updated dependencies

## Next Steps

1. Set environment variables
2. Run `pnpm install` to install Supabase packages
3. Run `pnpm dev` to start dev server
4. Test login at `http://localhost:3000/login`
5. Test registration at `http://localhost:3000/register`

## Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase with Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

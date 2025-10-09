# Landing Page Implementation - Part 1: Routing and Structure

## 1. Create Route Groups

Create the following directory structure:
```
frontend/src/app/
├── (app)/              # Protected app routes
│   ├── dashboard/
│   └── layout.tsx      # App layout with auth check
├── (marketing)/        # Public marketing routes
│   ├── page.tsx        # Landing page
│   └── layout.tsx      # Marketing layout
└── layout.tsx          # Root layout
```

## 2. Move Existing Dashboard

Move current page.tsx logic to (app)/dashboard/page.tsx:
```bash
mkdir -p frontend/src/app/(app)/dashboard
mv frontend/src/app/page.tsx frontend/src/app/(app)/dashboard/page.tsx
```

## 3. Create App Layout

Create `frontend/src/app/(app)/layout.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return <>{children}</>
}
```

## 4. Create Marketing Layout

Create `frontend/src/app/(marketing)/layout.tsx`:
```tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sunday School Music Creator - AI Songs for Children\'s Ministry',
  description: 'Create engaging Bible-based songs for Sunday School in minutes. AI-powered tool generates lyrics and music. Perfect for teachers and children\'s ministry.',
  keywords: 'sunday school, children ministry, bible songs, christian music, AI music generator',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

## 5. Update Root Page

Create `frontend/src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/home')
  }
}
```

## 6. Update Authentication Redirects

Update login/signup success redirects to go to `/dashboard`:

In `frontend/src/app/login/page.tsx`:
```tsx
router.push('/dashboard')  // Instead of '/'
```

In `frontend/src/app/signup/page.tsx`:
```tsx
router.push('/dashboard')  // Instead of '/'
```

## 7. Update Auth Callback

Update `frontend/src/app/auth/callback/route.ts`:
```tsx
return NextResponse.redirect(new URL('/dashboard', origin))
```

This routing setup ensures:
- Logged out users see the landing page
- Logged in users go directly to dashboard
- Clean separation between marketing and app pages
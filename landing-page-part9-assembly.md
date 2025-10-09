# Landing Page Implementation - Part 9: Main Landing Page Assembly

## Create Main Landing Page

Create `frontend/src/app/(marketing)/page.tsx`:
```tsx
import Navigation from '@/components/landing/Navigation'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  )
}
```

## Create Marketing Home Route

Since we redirect to `/home` for logged-out users, create the route:
Create `frontend/src/app/(marketing)/home/page.tsx`:
```tsx
import Navigation from '@/components/landing/Navigation'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesSection from '@/components/landing/FeaturesSection'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import PricingSection from '@/components/landing/PricingSection'
import Footer from '@/components/landing/Footer'

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
      </main>
      <Footer />
    </>
  )
}
```

## Update Root Page Redirect

Update `frontend/src/app/page.tsx`:
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

## Features:
- Complete landing page assembly
- Proper routing for logged-out users
- All components integrated
- SEO-friendly structure
- Clean separation of concerns
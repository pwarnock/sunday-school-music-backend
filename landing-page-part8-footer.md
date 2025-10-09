# Landing Page Implementation - Part 8: Footer Component

## Create Footer Component

Create `frontend/src/components/landing/Footer.tsx`:
```tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🎵</span>
              <span className="text-xl font-extrabold">Sunday School Music Creator</span>
            </div>
            <p className="text-landing-muted-foreground mb-4">
              AI-powered songs for children's ministry. Create engaging, 
              Bible-based music in minutes.
            </p>
            <p className="text-sm text-landing-muted-foreground">
              Made with ❤️ for children's ministry leaders
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="mailto:support@sundayschoolmusic.com" className="text-landing-muted-foreground hover:text-landing-primary transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-landing-muted-foreground">
            © {new Date().getFullYear()} Sunday School Music Creator. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
```

## Features:
- 4-column responsive layout
- Brand section with description
- Quick links and support sections
- Email contact link
- Copyright notice
- Dark mode support
- Hover effects on links
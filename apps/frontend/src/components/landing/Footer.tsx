import Link from 'next/link'
import Image from 'next/image'
import { siteConfig } from '@sunday-school/lib'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="block mb-4">
              <div className="relative w-[150px] h-[84px]">
                <Image 
                  src="/images/logo-150.png" 
                  alt={`${siteConfig.name} - AI-Powered Sunday School Music`}
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-gray-600 mb-4">
              AI-powered songs for children&apos;s ministry. Create engaging, 
              Bible-based music in minutes.
            </p>
            <p className="text-sm text-gray-500">
              Made with ❤️  by FaithTech OC for children&apos;s ministry leaders
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-green-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-green-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-green-500 transition-colors">
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
                <Link href="/help" className="text-gray-600 hover:text-green-500 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-green-500 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href={`mailto:support@${siteConfig.name.toLowerCase()}.com`} className="text-gray-600 hover:text-green-500 transition-colors">
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-800 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
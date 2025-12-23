import { useEffect } from 'react'

declare global {
  interface Window {
    onRecaptchaVerify?: (token: string) => void
    grecaptcha?: {
      render: (container: string | Element, options: Record<string, unknown>) => void
      reset: (widgetId?: number) => void
    }
  }
}

interface ReCaptchaProps {
  onVerify: (token: string) => void
  siteKey: string
}

export default function ReCaptcha({ onVerify, siteKey }: ReCaptchaProps) {
  useEffect(() => {
    // Load reCAPTCHA script if not already loaded
    if (!document.querySelector('script[src*="recaptcha"]')) {
      const script = document.createElement('script')
      script.src = 'https://www.google.com/recaptcha/api.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Setup callback
    window.onRecaptchaVerify = (token: string) => {
      onVerify(token)
    }

    return () => {
      // Clean up callback
      if (window.onRecaptchaVerify) {
        delete window.onRecaptchaVerify
      }
    }
  }, [onVerify])

  if (!siteKey) {
    return (
      <div className="text-sm text-gray-500">
        reCAPTCHA not configured
      </div>
    )
  }

  return (
    <div 
      className="g-recaptcha" 
      data-sitekey={siteKey}
      data-callback="onRecaptchaVerify"
    />
  )
}
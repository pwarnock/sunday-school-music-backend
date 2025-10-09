# Landing Page Implementation - Part 2: Color System and Theme

## 1. Install Required Dependencies

Add Framer Motion for animations:
```bash
cd frontend && npm install framer-motion
```

## 2. Update Tailwind Config

Add custom colors to `frontend/tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        'landing': {
          'primary': 'hsl(119.1667, 61.0169%, 53.7255%)',
          'primary-dark': 'hsl(142.0859, 70.5628%, 45.2941%)',
          'secondary': 'hsl(208.8703, 95.9839%, 48.8235%)',
          'accent': 'hsl(55.0588, 100%, 50%)',
          'dark': 'hsl(216.9231, 19.1176%, 26.6667%)',
          'light': 'hsl(208, 100%, 97.0588%)',
          'muted': 'hsl(220, 14.2857%, 95.8824%)',
          'muted-foreground': 'hsl(220, 8.9362%, 46.0784%)',
        }
      },
      fontFamily: {
        'poppins': ['Poppins', 'sans-serif'],
        'lora': ['Lora', 'serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-20px) rotate(-1deg)' },
        },
      },
    },
  },
}
```

## 3. Add Google Fonts

Update `frontend/src/app/layout.tsx`:
```tsx
import { Poppins, Lora, DM_Sans, IBM_Plex_Mono } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
})

const lora = Lora({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-lora",
})

// Keep existing fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
})

// Update body className
className={`${dmSans.variable} ${ibmPlexMono.variable} ${poppins.variable} ${lora.variable} font-sans antialiased`}
```

## 4. Add Gradient Utilities

Add to `frontend/src/app/globals.css`:
```css
@layer utilities {
  .gradient-text {
    @apply bg-gradient-to-r from-landing-primary to-landing-secondary bg-clip-text text-transparent;
  }
  
  .gradient-border {
    @apply relative;
  }
  
  .gradient-border::before {
    content: '';
    @apply absolute inset-0 rounded-[inherit] p-[2px];
    background: linear-gradient(135deg, theme('colors.landing.primary'), theme('colors.landing.secondary'));
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  
  .float-animation {
    animation: float 3s ease-in-out infinite;
  }
}

html {
  scroll-behavior: smooth;
}
```

## 5. Create Landing Button Styles

Add button variants for landing page:
```css
.btn-landing-primary {
  @apply px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-landing-primary to-landing-primary-dark rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200;
}

.btn-landing-secondary {
  @apply px-8 py-4 text-lg font-semibold text-landing-dark border-2 border-gray-200 rounded-xl hover:border-landing-primary hover:text-landing-primary transition-all duration-200;
}

.card-hover-gradient {
  @apply group relative transition-all duration-300;
}

.card-hover-gradient::before {
  content: '';
  @apply absolute inset-0 rounded-[inherit] p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300;
  background: linear-gradient(135deg, theme('colors.landing.primary'), theme('colors.landing.secondary'));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

This theme system provides:
- Landing page specific colors
- Gradient utilities for text and borders
- Animation keyframes
- Button styles matching the mockup
- Smooth scroll behavior
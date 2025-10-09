# Dark Mode Implementation Guide

## 1. ThemeToggle Component (components/ui/theme-toggle.tsx)

```tsx
"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## 2. Layout.tsx Updates

Add ThemeProvider wrapper:

```tsx
import { ThemeProvider } from "next-themes"

// In the body:
<body className={`${dmSans.variable} ${ibmPlexMono.variable} ${lora.variable} font-sans antialiased`}>
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </ThemeProvider>
</body>
```

## 3. Font Imports in Layout.tsx

```tsx
import { DM_Sans, IBM_Plex_Mono, Lora } from "next/font/google"

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
})

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
})

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
})
```

## 4. Dashboard Header Update

Add theme toggle to navigation:

```tsx
<nav className="bg-card/80 backdrop-blur-sm shadow-sm border-b border-border">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Existing content */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground bg-background/80 px-3 py-1 rounded-full">
          {user?.email}
        </span>
        <ThemeToggle />
        <Button onClick={handleLogout} variant="outline" size="sm">
          Logout
        </Button>
      </div>
    </div>
  </div>
</nav>
```

## 5. Color Replacements Guide

### Background Colors
- `bg-gray-50` → `bg-background`
- `bg-white` → `bg-card`
- `bg-gray-100` → `bg-muted`

### Text Colors
- `text-gray-600` → `text-muted-foreground`
- `text-gray-700` → `text-foreground`
- `text-gray-500` → `text-muted-foreground`

### Border Colors
- `border-gray-200` → `border-border`
- `border-gray-300` → `border-border`
- `border-gray-100` → `border-border`

### Interactive Colors
- `bg-indigo-600` → `bg-primary`
- `bg-purple-600` → `bg-primary`
- `bg-blue-600` → `bg-primary`
- `bg-green-600` → `bg-accent`
- `hover:bg-indigo-700` → `hover:bg-primary/90`

### Focus States
- `focus:ring-indigo-500` → `focus:ring-ring`
- `focus:ring-2` → `focus:ring-2`

## 6. Chat Bubble Updates

```tsx
// Assistant bubble
className="bg-card border border-border"

// Loading dots
<span className="w-2 h-2 bg-muted-foreground/50 rounded-full"></span>
```

## 7. Song Display Updates

```tsx
// Song card
<Card className="bg-accent/10 border-accent/20">

// Song lyrics container
<div className="text-accent-foreground text-sm mb-4 bg-card p-4 rounded border border-accent/20 song-lyrics">

// Bible reference card
<Card className="bg-primary/10 border-primary/20 mb-4">
```

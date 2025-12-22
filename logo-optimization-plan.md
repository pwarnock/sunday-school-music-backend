# Logo Optimization and Integration Plan

## Current Logo Analysis
- **File**: `logo.png`
- **Size**: 145KB (too large for a logo)
- **Dimensions**: 1920x1080 (unnecessarily large for logo usage)
- **Format**: PNG with RGBA (supports transparency)

## Optimization Strategy

### 1. Create Optimized Versions
- **Primary Logo**: 200x113px (maintaining aspect ratio) for navigation
- **Footer Logo**: 150x84px for footer usage
- **Mobile Logo**: 120x68px for mobile navigation
- **Favicon**: 32x32px and 16x16px
- **Apple Touch Icon**: 180x180px
- **OG Image**: Keep original for social media sharing

### 2. File Format Strategy
- **PNG**: For versions needing transparency
- **WebP**: For modern browsers (with PNG fallback)
- **SVG**: If possible, trace the logo for perfect scaling

### 3. Integration Points

#### Navigation Component
- Desktop: 200px width logo
- Mobile: 120px width logo
- Add proper alt text: "YouSong - AI-Powered Sunday School Music"

#### Footer Component
- 150px width logo
- Link to home page

#### Meta Tags & Favicon
- Update `favicon.ico`
- Add multiple favicon sizes
- Update Open Graph image

#### Auth Pages (Login/Signup)
- Center logo above forms
- 250px width for auth pages

### 4. Dark Mode Considerations
- Check if logo works on dark backgrounds
- May need to add white outline or create dark mode variant

## Implementation Steps

1. **Optimize Images**
   ```bash
   # Create optimized versions
   convert logo.png -resize 200x -quality 85 logo-200.png
   convert logo.png -resize 150x -quality 85 logo-150.png
   convert logo.png -resize 120x -quality 85 logo-120.png
   
   # Create favicon
   convert logo.png -resize 32x32 favicon-32x32.png
   convert logo.png -resize 16x16 favicon-16x16.png
   
   # Create Apple touch icon
   convert logo.png -resize 180x180 apple-touch-icon.png
   ```

2. **Update Components**
   - Navigation.tsx
   - Footer.tsx
   - LoginPage.tsx
   - SignupPage.tsx
   - Layout metadata

3. **Test Across Devices**
   - Desktop (light/dark mode)
   - Tablet
   - Mobile
   - Social media preview

## Performance Goals
- Navigation logo: < 20KB
- Footer logo: < 15KB
- Mobile logo: < 10KB
- Total logo assets: < 100KB combined
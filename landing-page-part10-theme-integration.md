# Landing Page Implementation - Part 10: Theme Integration with Existing Components

## Apply Landing Theme to Dashboard Components

### 1. Update Primary Buttons

Replace existing primary button styles in Dashboard and other components:

**Before:**
```tsx
className="bg-primary hover:bg-primary/90"
```

**After:**
```tsx
className="bg-gradient-to-r from-landing-primary to-landing-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-white"
```

### 2. Update Card Hover Effects

Add gradient border hover effect to cards:

**Before:**
```tsx
<Card className="bg-card">
```

**After:**
```tsx
<Card className="group relative bg-card hover:-translate-y-1 transition-all duration-300">
  {/* Add gradient border */}
  <div className="absolute inset-0 rounded-[inherit] p-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
    <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-r from-landing-primary to-landing-secondary" />
    <div className="absolute inset-[2px] rounded-[inherit] bg-card" />
  </div>
  <div className="relative z-10">
    {/* Card content */}
  </div>
</Card>
```

### 3. Update Navigation Bar

Enhance the Dashboard navigation with blur effect:

```tsx
<nav className="bg-card/80 backdrop-blur-xl shadow-sm border-b border-border">
```

### 4. Update Success States

For success messages and completed states:

```tsx
className="bg-gradient-to-r from-landing-primary to-landing-primary-dark text-white px-4 py-2 rounded-full"
```

### 5. Update Text Highlights

For important text that should stand out:

```tsx
<span className="bg-gradient-to-r from-landing-primary to-landing-secondary bg-clip-text text-transparent font-bold">
  Important Text
</span>
```

### 6. Update Secondary Buttons

For outline/secondary buttons:

```tsx
className="border-2 border-gray-200 dark:border-gray-700 hover:border-landing-primary hover:text-landing-primary transition-all duration-200"
```

### 7. Update Loading States

For loading animations and spinners:

```tsx
className="animate-spin border-4 border-gray-200 border-t-landing-primary rounded-full"
```

## Specific Component Updates

### Dashboard Header
```tsx
// Update the main title
<h2 className="text-2xl font-bold">
  Welcome to <span className="gradient-text">Sunday School Music</span>
</h2>
```

### Song Cards
```tsx
// Add hover effect to generated song cards
<Card className="card-hover-gradient bg-accent/10 border-accent/20">
  <div className="relative z-10">
    {/* Existing content */}
  </div>
</Card>
```

### Create Button
```tsx
// Update the main create button
<Button className="btn-landing-primary">
  🚀 Start Creating
</Button>
```

### Credit Display
```tsx
// Make credits stand out
<span className="bg-gradient-to-r from-landing-accent to-orange-500 text-landing-dark px-3 py-1 rounded-full font-bold">
  ✨ Credits: {credits}
</span>
```

This integration maintains existing functionality while adding the modern gradient theme from the landing page.


## Problem Analysis

Two issues with the Hero slider background images:

1. **Slow image loading**: When switching tabs, the new background image hasn't been preloaded, causing a visible delay.
2. **Stale image on rapid clicking**: `AnimatePresence` without `mode="wait"` allows old images to linger. The exit animation (8s scale) keeps the previous `motion.img` mounted, so rapid clicks stack images and the last one stays visible underneath.

## Plan

### 1. Preload all slide background images on mount
- Add a `useEffect` that creates `new Image()` objects for each URL in `slideBackgrounds` so they're cached by the browser before the user clicks.

### 2. Fix AnimatePresence for instant image swap
- Add `mode="wait"` to the background `AnimatePresence` (line 163) so the exiting image is removed before the new one enters — no stacking.
- Shorten exit transition to a quick crossfade (`opacity: 0` over ~0.3s) instead of the current no-opacity exit that leaves old images visible.
- Keep the enter zoom-out effect but add an `opacity` fade-in for smoothness.

### Technical changes (single file: `HeroSection.tsx`)

**A) Image preloading** — after `slideBackgrounds` array, add:
```tsx
useEffect(() => {
  slideBackgrounds.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}, [slideBackgrounds[0], slideBackgrounds[1], slideBackgrounds[2]]);
```

**B) Fix AnimatePresence + motion.img** — replace the background image block:
- `AnimatePresence` gets `mode="wait"`
- `motion.img` gets `initial={{ opacity: 0, scale: 1.05 }}`, `animate={{ opacity: 1, scale: 1 }}`, `exit={{ opacity: 0 }}` with shorter durations (~0.5s enter, ~0.3s exit) so transitions feel instant while still smooth.


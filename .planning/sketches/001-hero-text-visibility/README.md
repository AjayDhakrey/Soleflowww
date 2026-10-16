# Sketch 001: Hero Video & Text Legibility

## Context & Problem
When playing the dynamic wholesale footwear video across the entire Hero section, certain video frames contain bright white objects (woven rope, light canvas, white sneaker uppers). When text is overlaid:
1. `bg-clip-text` combined with inherited `text-shadow` causes Chromium/WebKit browsers to render the text as a black muddy silhouette (as observed on "Footwear Business").
2. Standard directional scrims at 40-50% opacity allow too much white glare through from the video behind white headline and paragraph text.

## Explored Variants

### Option A: Directional Scrim + Solid Luminous Cyan (Recommended)
- **Mechanism**: A calibrated multi-stop horizontal scrim (`from-slate-950/95 via-slate-950/80 40% via-slate-950/35 70% to-transparent`).
- **Typography Fix**: Replaces `bg-clip-text` with solid luminous `text-sky-400` that does not break in CSS with `text-shadow`.
- **Contrast**: Text has deep multi-layer drop shadows (`[text-shadow:_0_4px_16px_rgba(0,0,0,0.95)]`).
- **Balance**: Keeps the right 55-60% of the video bright and vibrant while ensuring 100% text readability on the left.

### Option B: Frosted Glass Pod Backplate
- **Mechanism**: The entire left column (headline, copy, CTAs, 1-click logins) is enclosed in a floating frosted glass card (`bg-slate-950/70 backdrop-blur-xl border border-white/20 rounded-3xl p-8`).
- **Contrast**: Guaranteed 100% readability regardless of what frame plays in the video.
- **Trade-off**: Text is boxed into a panel rather than floating seamlessly over the edge-to-edge canvas.

### Option C: Ambient Radial Spotlight
- **Mechanism**: Full-width dark veil (`bg-slate-950/65`) combined with a soft radial focus behind the headline (`radial-gradient(circle at 25% 45%, ...)`).
- **Feel**: Ultra-cinematic, moody, and unified.

## Previewing
Open `.planning/sketches/001-hero-text-visibility/sketch.html` in your browser to toggle between the three options live with the video playing.

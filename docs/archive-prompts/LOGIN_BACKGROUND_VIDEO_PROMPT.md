# SoleFlow — Login Page Background Video (Master Prompt)

Paste the MASTER PROMPT into a video generator (Google Veo, OpenAI Sora, Runway Gen-4, Kling, Luma Dream Machine, Pika).
Best result: first generate the still image from LOGIN_BACKGROUND_IMAGE_PROMPT.md, then use it as the START FRAME ("image-to-video") with this prompt.
Save as: frontend/src/assets/videos/login/login-bg.mp4 (+ login-bg.webm)

---

## MASTER PROMPT

A calm, seamless looping background video for the login page of "SoleFlow", a B2B footwear wholesale and trade-management platform for shoe manufacturers, distributors and sales representatives.

SCENE: A bright, airy, premium 3D studio in soft pastel light. The CENTER of the frame is an open, empty, evenly lit area of clean off-white (#F5F8FE) and must stay completely clear and still for the whole video, because a white login card sits on top of it. All objects and motion stay on the LEFT and RIGHT edges.

LEFT SIDE: 2–3 modern shoes (a clean white sneaker, a brown leather formal shoe, a minimal loafer) on light pastel pedestals, with stacked plain shoe boxes in soft blue and white.

RIGHT SIDE: A small stack of shoe boxes, a minimal delivery parcel, and 2–3 floating frosted-glass UI cards showing simple icons only (a bar chart, an order checkmark, a rupee coin, a delivery truck). No readable text or numbers.

MOTION (very slow and subtle):
- The white sneaker rotates slowly on its pedestal (about 30° over the clip).
- The frosted-glass icon cards float gently up and down a few pixels, slightly out of sync.
- The bar chart bars on one card rise softly; the checkmark draws in once.
- Soft light drifts slowly across the scene; a few tiny dust/bokeh particles float in the air.
- Camera: locked-off or an extremely slow push-in (less than 3%). No cuts, no fast moves, no shake.

STYLE: Soft 3D render, clay/matte materials, smooth rounded shapes, soft diffused shadows, gentle depth of field. Clean, minimal, modern SaaS look — calm and professional, not cartoonish, not busy, not "AI-looking".

COLOR PALETTE: Mostly white and very light blue-grey (#F5F8FE, #F8FAFC), brand blue accents (#1E6FF6 / #2563EB), soft sky blue, a touch of tan leather, a hint of mint (#EAFBF3). Low contrast.

LIGHTING: Soft, even studio light from the top-left. No flicker, no dark areas.

FORMAT: 16:9 landscape, 1920×1080 (or 4K), 24–30 fps, 8–10 seconds, the last frame matches the first frame for a seamless loop. No audio.

---

## NEGATIVE PROMPT

text, letters, numbers, logos, watermark, people, hands, faces, motion in the center, objects crossing the center, fast camera movement, cuts, zoom, shaking, flicker, strobe, morphing shoes, melting shapes, extra laces, dark background, neon colors, harsh shadows, cartoon style, busy scene

---

## TOOL-SPECIFIC TIPS

- Veo / Sora: write "seamless loop, static camera" at the start; set 16:9 and 8s.
- Runway / Kling / Luma: use image-to-video with the generated still as the first frame; set motion strength LOW (2–4 of 10). For a perfect loop, set the same image as both start and end frame if the tool allows it.
- If the loop has a visible jump: in CapCut / DaVinci, duplicate the clip, reverse the copy and join them (boomerang), or add a 0.5s crossfade at the loop point.

## MOBILE VERSION (optional)

Same prompt, change FORMAT to "9:16 portrait, 1080×1920" and say: "objects and motion only at the top and bottom edges; middle 60% empty and still."
Save as: login-bg-mobile.mp4

## AFTER GENERATING

1. Compress: target under 3 MB. Example (ffmpeg):
   ffmpeg -i in.mp4 -vf scale=1920:-2 -c:v libx264 -crf 28 -preset slow -an -movflags +faststart login-bg.mp4
   ffmpeg -i in.mp4 -vf scale=1920:-2 -c:v libvpx-vp9 -crf 36 -b:v 0 -an login-bg.webm
2. In LoginPage.tsx, ADD a <video> next to the existing background <img> (do not delete the image — keep it as the poster / fallback):
   <video autoPlay muted loop playsInline preload="auto" poster={loginBg}
     className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none">
     <source src={loginBgWebm} type="video/webm" />
     <source src={loginBgMp4} type="video/mp4" />
   </video>
3. Respect reduced motion: hide the video with `motion-reduce:hidden` so the still image shows instead.

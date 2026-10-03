# SoleFlow — Login Page Background Image (Master Prompt)

Paste the MASTER PROMPT into any image generator (Midjourney, DALL·E / ChatGPT, Gemini / Imagen, Ideogram, Leonardo, Firefly).
Save the result as: frontend/src/assets/images/login/login-bg.png

---

## MASTER PROMPT

Create a full-screen, wide-format background image for the login page of "SoleFlow", a B2B footwear wholesale and trade-management platform used by shoe manufacturers, distributors and sales representatives.

SCENE: A bright, airy, premium 3D studio scene in soft pastel light. The CENTER of the image is an open, empty, softly lit area of clean off-white (#F5F8FE) — this space must stay completely clear because a white login card sits on top of it. All visual interest is pushed to the LEFT and RIGHT edges.

LEFT SIDE: A neat, elegant arrangement of 2–3 modern shoes (a clean white sneaker, a brown leather formal shoe, a minimal loafer) resting on light pastel display pedestals, with a few stacked plain shoe boxes in soft blue and white.

RIGHT SIDE: Hints of the wholesale/trade workflow — a small stack of shoe boxes, a minimal delivery parcel, and 2–3 floating frosted-glass UI cards with simple icons only (a bar chart, an order checkmark, a rupee/currency coin, a delivery truck). No readable text or numbers on the cards.

STYLE: Soft 3D render, clay/matte materials, smooth rounded shapes, gentle ambient occlusion, soft diffused shadows, subtle depth of field, calm and professional. Clean, minimal, modern SaaS aesthetic — not cartoonish, not busy, not "AI-looking".

COLOR PALETTE: Mostly white and very light blue-grey (#F5F8FE, #F8FAFC), with accents of brand blue (#1E6FF6 / #2563EB), soft sky blue, a touch of warm tan leather and a hint of mint green (#EAFBF3). Low contrast overall so the login card remains the focus.

LIGHTING: Soft, even studio light from the top-left, no harsh highlights, no dark areas.

COMPOSITION: 16:9 landscape, 3840×2160 (4K). Objects occupy only the outer ~25% on each side; center 50% is empty and evenly lit. Objects must not touch the image edges so the image can crop safely on smaller and mobile screens.

---

## NEGATIVE PROMPT (if your tool supports it)

text, letters, words, numbers, logos, brand names, watermark, signature, people, faces, hands, clutter in the center, dark background, neon colors, harsh shadows, high contrast, grainy, blurry objects, distorted shoes, extra laces, melted shapes, cartoon style, busy pattern

---

## TOOL-SPECIFIC ADD-ONS

- Midjourney: add `--ar 16:9 --style raw --v 7 --q 2 --no text, logo, people, watermark`
- DALL·E / ChatGPT: start with "Generate a 16:9 landscape image:" and add "No text anywhere in the image."
- Ideogram / Leonardo: choose 16:9, style "3D render", put the negative prompt in the negative field.

## MOBILE VERSION (optional, portrait)

Same prompt, but change COMPOSITION to: "9:16 portrait, 1080×1920. Shoes and boxes only at the top and bottom edges; middle 60% empty and evenly lit for the login card."
Save as: frontend/src/assets/images/login/login-bg-mobile.png

## AFTER GENERATING

1. Compress to WebP (~300–500 KB) with squoosh.app.
2. In LoginPage.tsx, point the existing background <img> to the new file (add the import; don't delete the old ones).
3. Keep `object-cover object-center` so the empty center always sits behind the card.

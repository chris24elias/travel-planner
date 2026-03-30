# Design System: Amber Meridian

### 1. Overview & Creative North Star
**Creative North Star: The Curated Wanderer**
Amber Meridian is a high-end editorial design system built for the sophisticated traveler. It eschews the clinical coldness of modern SaaS in favor of a warm, tactile aesthetic reminiscent of a premium travel journal. The system prioritizes "Quiet Luxury"—using expansive whitespace, bold typographic weight, and a sophisticated palette of ambers and stones to guide the user's eye. It breaks the traditional grid through intentional asymmetry, such as offset bento grids and a vertical timeline that acts as a narrative spine rather than just a list.

### 2. Colors
The palette is rooted in Earth tones, using `#F59E0B` (Amber) as its sun, supported by deep stones and warm creams.

- **The "No-Line" Rule:** Borders are largely prohibited for structural sectioning. Separation is achieved through background shifts (e.g., `surface-container-low` to `surface-container-lowest`). Use the `outline-variant` (`#d8c3ad`) at 10-20% opacity only when an edge must be defined for accessibility.
- **Surface Hierarchy & Nesting:** Depth is created by "lifting" elements. The background is `#fdf9f3`. Cards use `surface-container-lowest` (#ffffff) to appear as if they are floating above the page.
- **The "Glass & Gradient" Rule:** Use `rgba(255, 255, 255, 0.7)` with a `backdrop-blur` of 20px for persistent navigation (Sidebars and Headers) to maintain context and a sense of lightness.
- **Signature Textures:** Main CTAs should utilize a `bg-gradient-to-br from-primary to-primary-container` to create a jewel-like focal point.

### 3. Typography
The system uses a dual-font approach to balance character with readability.

- **Headline Scale (Plus Jakarta Sans):** Used for brand identity and high-impact headers. It features an extra-bold weight (700-800) and tight tracking (-0.025em) to create a modern, editorial feel. 
    - *Display:* 3rem (48px) - Used for the main trip title.
    - *Headline:* 1.5rem (24px) to 1.875rem (30px) - Used for section headers.
- **Body & Label Scale (Be Vietnam Pro):** A highly legible sans-serif used for all functional text and metadata.
    - *Body Large:* 1.125rem (18px)
    - *Body Standard:* 0.875rem (14px)
    - *Label/Small:* 0.75rem (12px) or 11px for uppercase "Caps" labels.
- **Typographic Rhythm:** The contrast between the 3rem headlines and the 11px uppercase labels creates a dynamic, high-fashion layout style.

### 4. Elevation & Depth
Elevation in Amber Meridian is soft and atmospheric, moving away from harsh "drop shadows."

- **The Layering Principle:** Content sits on `surface_container_lowest`. The Sidebar uses a deep shadow (`shadow-lg` style) but with a stone-tinted blur: `rgba(68, 64, 60, 0.06)`.
- **Ambient Shadows:** Standard cards utilize `12px 12px 32px -4px rgba(68,64,60,0.06)`. This creates a "lifted paper" effect rather than a digital window.
- **Glassmorphism:** The Sidebar and Header use `backdrop-blur-3xl` and `85%` opacity, allowing colors to bleed through subtly as the user scrolls.

### 5. Components
- **Buttons:** 
    - *Primary:* Gradient fill (Amber to Gold), rounded-xl (12px), bold text.
    - *Secondary:* `surface-container-high` background, tonal text.
- **Navigation (Active State):** Indicated by a vertical "pill" indicator and a subtle `amber-50/50` background shift. Interaction includes a `scale-[1.02]` hover effect.
- **Bento Stats:** Large `3rem` figures paired with `0.875rem` labels, housed in `1.5rem` (24px) rounded containers.
- **Timeline:** A 2px vertical rule in `surface-container-highest` with a centered 12px dot marking events, creating a "threaded" narrative.

### 6. Do's and Don'ts
- **Do:** Use `gap-6` (24px) as the standard spacing unit for layout grids to ensure an "editorial" feel.
- **Do:** Use `uppercase` and `tracking-widest` for secondary labels to add a sophisticated, metadata-driven look.
- **Don't:** Use 1px solid borders to separate sections.
- **Don't:** Use standard blue for links. Use `primary` (Amber) or `on-surface` with weight shifts.
- **Do:** Apply `transition-all` and subtle scales (`1.02`) to cards to reward user interaction with a tactile response.
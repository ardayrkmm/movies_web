---
name: Cinematic Immersive System
colors:
  surface: '#200e0c'
  surface-dim: '#200e0c'
  surface-bright: '#4a3330'
  surface-container-lowest: '#1a0908'
  surface-container-low: '#2a1614'
  surface-container: '#2e1a18'
  surface-container-high: '#3a2522'
  surface-container-highest: '#462f2c'
  on-surface: '#ffdad5'
  on-surface-variant: '#e9bcb6'
  inverse-surface: '#ffdad5'
  inverse-on-surface: '#412b28'
  outline: '#af8782'
  outline-variant: '#5e3f3b'
  surface-tint: '#ffb4aa'
  primary: '#ffb4aa'
  on-primary: '#690003'
  primary-container: '#e50914'
  on-primary-container: '#fff7f6'
  inverse-primary: '#c0000c'
  secondary: '#ffb4aa'
  on-secondary: '#690004'
  secondary-container: '#ae010d'
  on-secondary-container: '#ffb8b0'
  tertiary: '#a7c8ff'
  on-tertiary: '#003061'
  tertiary-container: '#0072d7'
  on-tertiary-container: '#f8f9ff'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4aa'
  on-primary-fixed: '#410001'
  on-primary-fixed-variant: '#930007'
  secondary-fixed: '#ffdad5'
  secondary-fixed-dim: '#ffb4aa'
  on-secondary-fixed: '#410002'
  on-secondary-fixed-variant: '#930009'
  tertiary-fixed: '#d5e3ff'
  tertiary-fixed-dim: '#a7c8ff'
  on-tertiary-fixed: '#001b3c'
  on-tertiary-fixed-variant: '#004689'
  background: '#200e0c'
  on-background: '#ffdad5'
  surface-variant: '#462f2c'
typography:
  display-xl:
    fontFamily: Montserrat
    fontSize: 64px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Montserrat
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style

This design system is engineered for a high-end cinematic experience, blending the intensity of the theater with the precision of modern digital interfaces. The visual narrative centers on **Immersive Minimalism**, where the UI recedes into the background to prioritize high-fidelity movie imagery. 

The aesthetic is deeply rooted in a **Dark Cinematic** style, utilizing high-contrast accents against a light-absorbing canvas to evoke the feeling of a darkened theater. It balances the urgency of entertainment with the utility of a professional booking engine, ensuring that both the customer-facing discovery phase and the administrative management phase feel part of a singular, premium ecosystem.

**Key Principles:**
- **Visual Gravity:** Content is anchored by deep blacks and vibrant reds, creating a sense of importance and focus.
- **Precision:** Clean lines and purposeful whitespace prevent the dark theme from feeling cluttered.
- **Focus:** Interface elements use subtle depth to guide the eye toward primary actions without competing with poster art.

## Colors

The color strategy is strictly dark-mode, designed to minimize eye strain and maximize the "pop" of movie marketing assets. 

- **The Void (Background):** A near-black `#0A0A0B` acts as the stage.
- **Cinema Red (Primary):** The iconic `#E50914` is used sparingly for primary calls-to-action and critical states to maintain its high-impact status.
- **Layering (Surfaces):** Depth is created through a hierarchy of charcoal tones rather than shadows, moving from `#161618` for base containers to `#222224` for interactive or floating elements.
- **Typography:** Pure white is reserved for headings to ensure maximum legibility, while secondary and muted grays handle metadata and secondary information to maintain visual hierarchy.

## Typography

The typography pairing combines the geometric strength of **Montserrat** for headlines with the industrial clarity of **Inter** for functional text.

- **Headlines:** Use Montserrat in Bold or Extra Bold weights. High-level displays (Display XL/LG) should use slight negative letter spacing to create a compact, "movie poster" impact.
- **Body:** Inter provides the necessary utilitarian contrast. Its high x-height ensures that even small metadata (duration, rating, genre) remains legible against dark backgrounds.
- **Labels:** Use Inter Bold in uppercase for all-caps labels, such as "SHOWTIMES" or "ADMIN DASHBOARD," to provide a structured, professional feel.

## Layout & Spacing

The design system utilizes a **12-column fluid grid** for desktop and a **4-column grid** for mobile. 

- **Rhythm:** A strict 4px base unit governs all spatial relationships. 
- **The "Breathe" Principle:** Given the dark theme, ample whitespace (Padding XL/XXL) is required between major sections to prevent the UI from feeling heavy.
- **Containment:** For the Admin Dashboard, use a fixed sidebar (280px) with a fluid content area. For the Customer Website, utilize a max-width container of 1440px to ensure cinematic imagery doesn't become overstretched on ultra-wide monitors.
- **Gutters:** Standardized at 24px to allow movie cards sufficient "air" to be viewed as individual pieces of art.

## Elevation & Depth

In a dark, cinematic environment, depth is achieved through **Tonal Layering** and **Subtle Outlines** rather than heavy shadows.

- **Tiers:**
  - **Level 0 (Background):** `#0A0A0B` - The base layer.
  - **Level 1 (Cards/Sections):** `#161618` - Used for movie cards and content containers.
  - **Level 2 (Popovers/Modals):** `#222224` - Floating elements that sit above the main UI.
- **Outlines:** All containers should utilize a subtle 1px border (`#2A2A2C`) to define boundaries against the dark background. 
- **Interaction:** On hover, interactive elements should transition their border color to the Primary Cinema Red or increase their surface brightness slightly to provide tactile feedback.
- **Overlays:** Use a 60% opacity black gradient overlay on the bottom third of movie posters to ensure white text remains readable when placed directly over imagery.

## Shapes

The shape language is "Soft-Modern," using a consistent but restrained corner radius to balance approachability with professional rigor.

- **Components:** Standard buttons, input fields, and small cards use a **4px (0.25rem)** radius.
- **Large Containers:** Movie posters and large sections use a **8px (0.5rem)** radius (`rounded-lg`).
- **Featured Elements:** Hero sections or prominent promotional banners can use up to **12px (0.75rem)** radius (`rounded-xl`) to feel more distinct and modern.
- **Selection:** Seat selection icons should remain perfectly circular or use very soft rounded squares to distinguish them from structural UI elements.

## Components

### Buttons
- **Primary:** Solid Cinema Red (`#E50914`) with White text. No border. On hover, darken to `#B20710`.
- **Secondary:** Transparent background with a 1px border (`#2A2A2C`). On hover, the border becomes White.
- **Ghost:** No background or border. Red text for actions, Secondary gray for navigation.

### Cards (Movie Posters)
- **Structure:** Aspect ratio of 2:3. 1px subtle border.
- **Interaction:** On hover, the card should scale slightly (1.02x) and the border should glow with a 4px soft red outer shadow.
- **Metadata:** Title in Montserrat Bold (White), Genre in Inter Regular (Secondary Gray).

### Form Inputs
- **Field:** Surface Elevated (`#222224`) background with a `#2A2A2C` border. 
- **Focus State:** Border changes to Cinema Red with a 0px offset, 2px blur glow.
- **Labels:** Small, uppercase Inter (Muted Gray) sitting above the field.

### Seat Selection
- **Available:** Surface Elevated (`#222224`) with a subtle border.
- **Selected:** Primary Cinema Red.
- **Occupied:** Muted Gray (`#666666`) with a diagonal strike-through.
- **VIP/Premium:** Gold border or subtle gradient to denote higher tier.

### Navigation
- **Top Bar:** Semi-transparent Background (`#0A0A0B` at 80%) with a backdrop blur of 12px.
- **Active Links:** Bold white text with a 2px red underline centered below the text.
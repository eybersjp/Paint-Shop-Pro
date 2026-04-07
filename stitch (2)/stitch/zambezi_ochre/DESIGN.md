# Design System Document

## 1. Overview & Creative North Star: "The Earthbound Studio"
This design system is built to bridge the gap between Zimbabwe’s raw, industrial manufacturing power and the sophisticated, tactile beauty of architectural paint. Our Creative North Star is **The Earthbound Studio**. 

To move beyond a generic "corporate" template, this system utilizes **Organic Brutalism**. We reject the standard, boxy grid in favor of an editorial layout characterized by intentional asymmetry, overlapping "canvases," and massive typography. The UI should feel like a high-end interior design magazine—spacious, authoritative, and deeply rooted in the textures of the earth.

## 2. Colors: Tonal Depth & The "No-Line" Rule
The palette is a sophisticated interplay of Zimbabwean ochres (`primary`), deep forest greens (`secondary`), and industrial cobalt (`tertiary`).

### The "No-Line" Rule
Traditional 1px solid borders are strictly prohibited for defining sections. Boundaries must be established through color blocking and background shifts. For example, a "Product Details" section in `surface-container-low` should sit directly against a `background` hero without a stroke.

### Surface Hierarchy & Nesting
Treat the interface as physical layers of painted substrate. 
*   **Base:** `surface` (#fbf9f6) acts as the primary canvas.
*   **Layering:** Use `surface-container-low` for large content blocks and `surface-container-highest` for high-interaction cards. This "stacking" creates natural depth without the clutter of lines.

### The Glass & Gradient Rule
To evoke the liquid nature of paint:
*   **Gradients:** Use subtle linear gradients for primary CTAs, transitioning from `primary` (#8e2f19) to `primary_container` (#ae472e). This adds a "wet" sheen and premium finish.
*   **Glassmorphism:** For floating navigation or over-image labels, use `surface` at 70% opacity with a `20px` backdrop-blur.

## 3. Typography: Editorial Authority
The typography scale creates a rhythmic contrast between industrial utility and human-centric accessibility.

*   **Display & Headlines (Space Grotesk):** Use for all `display` and `headline` roles. This typeface's geometric, slightly "tech" apertures reflect the precision of manufacturing. 
    *   *Styling Tip:* Use `display-lg` with tight letter-spacing (-0.02em) for hero headlines to create a bold, "ink-heavy" look.
*   **Body & Titles (Manrope):** Chosen for its warmth and extreme legibility. All functional text, descriptions, and labels use Manrope. 
    *   *Hierarchy:* `title-lg` should be used for product names, while `body-md` handles the technical specifications.

## 4. Elevation & Depth: Tonal Layering
We move away from the "shadow-heavy" look of 2010s web design. Hierarchy is achieved through **Tonal Lift**.

*   **The Layering Principle:** To make a component "pop," move it one step up the surface scale (e.g., a `surface-container-lowest` card placed on a `surface-container` background).
*   **Ambient Shadows:** For floating elements like modals or active swatches, use a highly diffused shadow: `box-shadow: 0 20px 40px rgba(84, 67, 60, 0.08);`. The color is a tint of `on-surface-variant`, never pure black.
*   **The Ghost Border:** For input fields or zones requiring clear containment, use a "Ghost Border": `outline-variant` (#dac1b8) at 20% opacity. This provides a "whisper" of a boundary that maintains the clean, editorial aesthetic.

## 5. Components

### Interactive Color Swatches
*   **Form:** Use the `full` (9999px) roundedness scale for individual swatches.
*   **Interaction:** On hover, the swatch should scale 1.1x. When selected, apply a 2px "Ghost Border" at 100% opacity of the `outline` token, with a 4px inner gap from the swatch.
*   **Layout:** Group swatches in asymmetric clusters rather than a rigid 10x10 grid.

### Buttons
*   **Primary:** Fill with a gradient (`primary` to `primary_container`), `md` (0.375rem) roundedness. Typography: `label-md` in `on-primary`, all-caps with 0.05em tracking.
*   **Secondary:** Ghost-style. No background. `outline` token border at 40% opacity. 

### Photo Upload & Visualizer Zones
*   **Drop Zone:** Use `surface-container-highest`. Instead of a dashed line, use a subtle 10% `outline-variant` solid border. 
*   **Typography:** Use `title-sm` for "Upload your room" and `label-sm` for technical constraints.

### E-commerce Cards
*   **Constraint:** No dividers. Separate the image, price, and title using vertical white space (e.g., `1.5rem` from the spacing scale).
*   **Surface:** Use `surface-container-low`. On hover, shift to `surface-container-lowest` for a subtle "lift" effect.

### Input Fields
*   **Style:** Minimalist. Only a bottom-border (1px) using `outline-variant`. 
*   **Focus State:** The bottom border transforms into a 2px `primary` line. Label moves from `body-md` to `label-sm` above the line.

## 6. Do’s and Don’ts

### Do:
*   **Embrace Negative Space:** Allow headlines to breathe. A `display-lg` headline should often have more white space around it than the content below it.
*   **Use Asymmetry:** Place a product image off-center, overlapping a background color block of `secondary_container`.
*   **Respect the Palette:** Use `secondary` (Deep Green) for sustainability or "Eco-Friendly" messaging and `tertiary` (Blue) for professional/technical "contractor" sections.

### Don’t:
*   **Don't use 100% Black:** For text, always use `on-surface` (#1b1c1a). It is softer and feels more like premium charcoal ink.
*   **Don't use standard Dividers:** If content feels cluttered, increase the margin. If it still feels cluttered, change the background color of one section to `surface-container-low`.
*   **Don't over-round:** Avoid `full` rounding on cards or buttons; stick to `md` or `lg` to maintain the architectural, industrial feel. Only swatches and chips should be `full` rounded.
# Portfolio Upgrade 

# You are a senior product engineer taking over this portfolio

You have been hired to rescue this portfolio. The owner is **Glenn Soe**, a fresh software-engineering graduate based in Singapore, looking for a junior role. The current site works but reads as templated and AI-generated. Your job is to rebuild the visual language and motion so it looks like a real design studio shipped it — a $10k site, not a $100 one — while preserving 100% of the existing content, structure, and hosting model.

You are running with `--dangerously-skip-permissions`. **Do not ask for confirmation** before any local file edit, `git add`, `git commit`, `python -m http.server`, or in-app browser action. Just do it. The only action you must NOT take without explicit approval is `git push` — leave the branch local when you're done. Also do not touch any file outside `C:\Users\gsjzd\OneDrive\Desktop\Portfolio\` except for reading `C:\Users\gsjzd\Downloads\DESIGN.md` as a design reference.

## Non-negotiable constraints

1. **Stack stays vanilla.** No React, no Vue, no Vite, no npm, no `package.json`. This site is deployed as static HTML/CSS/JS. Any library you add must load from a CDN via `<script>` tag.
2. **Preserve all content.** Every project title, every bio sentence, every project link, every skill percentage, every resume entry stays. You are changing the visual layer, not the information.
3. **Preserve JS hooks.** `main.js` binds to class names (`.reveal`, `.magnetic`, `.tilt-card`, `#navToggle`, etc.). Keep those hooks alive when you restyle so the existing IntersectionObserver logic keeps working — refactor `main.js` in place rather than starting over.
4. **File count stays small.** Do not create new stylesheet files or split HTML into partials. One `style.css`, one `main.js`, one `projects.js`, three HTML pages. Same as today.
5. **Every section gets touched.** If a section is left in the old visual language, the whole site reads as broken. See the acceptance checklist at the bottom.

## Files you will modify

- `index.html` — 620 lines currently; expect similar order of magnitude after
- `style.css` — full token rewrite at `:root`, then per-section rules
- `main.js` — add GSAP + Lenis wiring; add three new init functions; refactor `initMagnetic`
- `projects.html`, `projects.js` — restyle only, plus one bug fix
- `resume.html` — restyle only

## Design system — source of truth

The visual language comes from the Dylanbrouwer design reference at `C:\Users\gsjzd\Downloads\DESIGN.md` — a brutalist type-foundry aesthetic: monochrome palette with a single ember-orange accent, monument-scale condensed display type, tight grids, hairline dividers, flat surfaces (no shadows), sharp corners for cards, pill radii for interactive elements only.

Read that file once before you start. Then use the tokens below verbatim — they are the DESIGN.md tokens with three free-font substitutions called out explicitly so you don't fight a paid-font wall.

### Colors — paste into `:root` in `style.css`

```css
:root {
  /* Palette — from DESIGN.md */
  --color-ember-orange: #ff6436;   /* sole chromatic accent — dots, status, ≤5px only */
  --color-onyx:         #161616;   /* dark hero background */
  --color-graphite:     #3c3a3e;   /* primary text, filled buttons */
  --color-stone:        #7b7a7c;   /* secondary text, sub-copy */
  --color-ash:          #a2a2a2;   /* muted helper text */
  --color-silver-mist:  #c9c7cc;   /* hairline dividers, low-emphasis borders */
  --color-fog:          #f1f1f1;   /* section wash, nav-inactive bg */
  --color-paper:        #f8f8f8;   /* page canvas */
  --color-pure-white:   #ffffff;   /* card surfaces */

  /* Aliases the existing CSS may still reference */
  --bg:      var(--color-paper);
  --surface: var(--color-pure-white);
  --border:  var(--color-silver-mist);
  --accent:  var(--color-ember-orange);
  --text:    var(--color-graphite);
  --muted:   var(--color-stone);
  --white:   var(--color-pure-white);

  /* Gradient used ONLY on display-scale hero type */
  --gradient-display-fade: linear-gradient(
    rgb(0,0,0),
    rgb(110,108,112) 25%,
    rgb(185,183,187) 50%,
    rgb(220,214,214) 75%,
    rgb(241,241,241)
  );

  /* Type */
  --font-display: 'Bebas Neue', ui-sans-serif, system-ui, sans-serif;      /* free substitute for ABC Gravity Variable */
  --font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;           /* free substitute for Die Grotesk B — use weight 500 everywhere */
  --font-mono:    'JetBrains Mono', ui-monospace, SFMono-Regular, monospace; /* free substitute for IBM Plex Mono */

  /* Type scale */
  --text-micro:      12px;
  --text-caption:    14px;
  --text-body-sm:    17px;
  --text-body:       21px;
  --text-subheading: 23px;
  --text-heading-sm: 36px;
  --text-heading:    60px;
  --text-heading-lg: 96px;
  --text-display:    clamp(120px, 22vw, 288px);

  /* Spacing — 6px base unit */
  --space-6:   6px;
  --space-12:  12px;
  --space-18:  18px;
  --space-24:  24px;
  --space-48:  48px;
  --space-60:  60px;
  --space-72:  72px;
  --space-96:  96px;
  --space-120: 120px;

  /* Radii — pills for interactives, sharp for content */
  --radius-nav:     9999px;
  --radius-cards:   0px;
  --radius-badges:  9999px;
  --radius-inputs:  0px;
  --radius-panels:  14.4px;
  --radius-buttons: 9999px;

  /* Motion */
  --ease-in:  cubic-bezier(0.32, 0.72, 0, 1);
  --ease-out: cubic-bezier(0.19, 1, 0.22, 1);
  --dur-micro:     0.3s;
  --dur-component: 0.5s;
  --dur-reveal:    0.7s;
}
```

**Delete the existing `--accent: #ff3c3c` and `--accent2: #ffcc00`.** After the rewrite, grep the whole project for `#ff3c3c` and `#ffcc00` and confirm zero hits.

### Google Fonts link — replace the current one in every HTML page

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@500;600&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

Drop `Syne` — it's replaced by Inter.

### Hard rules — do these, don't do those

**Do:**
- Use Inter 500 for ALL body and mid-scale headings — no weight contrast, hierarchy comes from size and color only.
- Reserve `--font-display` for headings ≥60px and hero-scale monuments.
- Apply `--gradient-display-fade` only on display-scale hero type via `background-clip: text; -webkit-text-fill-color: transparent;`.
- Use JetBrains Mono UPPERCASE at 12–14px for all metadata, labels, nav links, timestamps.
- Set letter-spacing `-0.03em` on Inter headings 36px and above.
- Use `border-radius: 9999px` on nav pills, tags, and buttons. Use `0px` on every card, panel, image, form input.
- Every card: flat. No `box-shadow`. Depth comes from background contrast and hairline `1px solid var(--color-silver-mist)` borders.

**Don't:**
- Don't introduce any additional hue. Monochrome + ember orange, period. If you catch yourself typing `blue`, `green`, `red`, `#f`, `#0f0`, stop.
- Don't use ember orange as a background wash, a button fill, or anything wider than ~12px. It appears only as small status dots, small accent marks, and single-character punctuation.
- Don't apply gradients to backgrounds, buttons, or body copy. Gradient is a typographic device only.
- Don't use rounded corners on cards, images, form inputs, or content panels. Pills are for interactives only.
- Don't use bouncy or spring easings. Every motion uses `--ease-in` or `--ease-out`. No overshoot.
- Don't animate `width`, `height`, `top`, `left`, or any layout property. Only `transform`, `opacity`, and `color`.
- Don't center-align paragraphs. Left-align everything. Center is reserved for display-scale statements.

## Motion system

Load these two libraries from CDN in every HTML page, before `main.js`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>
<script src="https://unpkg.com/lenis@1.1.13/dist/lenis.min.js"></script>
```

Wire Lenis in `main.js` inside `initPostLoad`:

```js
const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
function raf(t){ lenis.raf(t); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
lenis.on('scroll', ScrollTrigger.update);
gsap.registerPlugin(ScrollTrigger);
```

Use these primitives throughout:
- Entrance reveals: `gsap.from(el, { y: 40, opacity: 0, duration: 0.7, ease: 'expo.out' })` triggered via `ScrollTrigger` with `start: 'top 85%'`, `once: true`.
- Micro-interactions (hover, focus): 0.3s, `--ease-in`.
- Page-level reveals: 0.6–0.75s, `--ease-in`.

Add three new init functions in `main.js`:

- `initScrollMarquee()` — two typography rows, both tripled for seamless loop. Row 1 translateX driven by `window.scrollY * 0.3`. Row 2 translateX driven by `-window.scrollY * 0.3`. Passive scroll listener; use `will-change: transform`.
- `initCharReveal()` — for the About-section paragraph. Split the paragraph into `<span>` per character, then `gsap.to(chars, { opacity: 1, stagger: 0.02, scrollTrigger: { trigger: paragraph, start: 'top 80%', end: 'bottom 40%', scrub: true } })`. Base opacity of each char is 0.2.
- `initStickyProjects()` — for the index-page projects. Wrap all project cards in a container that is `height: calc(100vh * N)` where N is the card count. Each card `position: sticky; top: 6rem;` with `transform: scale(1 - (N - i - 1) * 0.03)` applied via `ScrollTrigger` as you scroll past.

Refactor the existing `initMagnetic()` to use the DESIGN.md easings: `transform 0.3s cubic-bezier(0.32,0.72,0,1)` in, `transform 0.6s cubic-bezier(0.19,1,0.22,1)` out. Reduce the pull strength by ~30% — the current version is too aggressive for the restrained visual language.

## Section-by-section — what to change

Do these in order. Commit after each section (see "Commits" below) so a bad section is one `git revert` away.

### 1. Loader
- Keep the mechanism (progress bar, WELCOME transition). Restyle:
- Background `--color-onyx` (currently `--bg`).
- Logo `filter: invert(1)` if needed to sit on dark.
- Progress bar track: 1px hairline in `rgba(255,255,255,0.15)`, full width.
- Fill bar: 1px `--color-pure-white`, animated left-to-right.
- Tiny `--color-ember-orange` 6px dot at the fill's leading edge — the only orange on the loader.
- `LOADING` / `WELCOME` / percentage text: JetBrains Mono uppercase 12px, letter-spacing 0.1em, `--color-ash`.

### 2. Custom cursor
- Default dot: 8px, `--color-graphite`, `mix-blend-mode: difference` if it improves legibility on dark hero.
- Ring on hover-interactive elements: 32px ring, 1px `--color-ember-orange`, no fill.
- Transition `transform 0.3s var(--ease-in)`.
- On coarse pointers (`@media (hover: none)`) hide both, restore native cursor — that rule already exists, keep it.

### 3. Nav
Rebuild as the DESIGN.md "Pill Nav Button" spec. Floats over hero with no background bar; nothing sticky, nothing filled.

- Container: `position: fixed; top: 24px; left: 24px; right: 24px; display: flex; justify-content: space-between; align-items: center; z-index: 100;`
- Logo: 32px tall, `filter: invert(1)` while over hero, revert once scrolled past hero (toggle a `.nav-inverted` class from `initNavbar`).
- Links wrap: `display: flex; gap: 6px;` — each link is a pill button.
- Each pill: `padding: 7px 14px; border: 1px solid rgba(60,58,62,0.15); border-radius: 9999px; background: transparent; font: 500 14px/1 var(--font-mono); text-transform: uppercase; letter-spacing: 0.02em; color: var(--color-graphite);`
- Prefix each link with a `•` glyph in a `<span aria-hidden>` at 12px.
- Hover: background `rgba(60,58,62,0.06)`, no transform.
- When over dark hero: pill borders and text become `rgba(255,255,255,0.25)` and `--color-pure-white` — toggle via body class.

### 4. Mobile menu
Restyle the fullscreen overlay:
- Background `--color-onyx`.
- Links stacked, huge, in `--font-display` at 96px, uppercase, `--color-pure-white`. Left-aligned with 48px left padding.
- Close button top-right, mono 14px, uppercase `CLOSE`, ember dot prefix.
- Enter animation: opacity + `translateY(-20px)` → `0`, 0.5s `--ease-in`. Stagger link entrances by 60ms.

### 5. Hero (`#hero`)

Full viewport, `background: var(--color-onyx)`, `color: var(--color-pure-white)`.

Layout, top to bottom:
- Top metadata row (below nav, above monument): JetBrains Mono 12px uppercase, `--color-ash`, letter-spacing 0.15em. Content: `// SINGAPORE · SOFTWARE ENGINEER · OPEN TO WORK` then a `<span class="ember-dot"></span>` then `AVAILABLE`. Left-aligned with 48px page padding.
- Monument name — **replace the existing `Glenn<br><span>Soe</span>` markup with a single `<h1>` containing `GLENN SOE`**. Style:
  ```css
  .hero-name {
    font-family: var(--font-display);
    font-size: var(--text-display);
    line-height: 0.74;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    background: var(--gradient-display-fade);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
    text-align: left;
    padding: 0 48px;
    margin-top: auto;   /* pins to bottom of hero via flex column */
  }
  ```
- Remove the old `.hero-bg-text` "SOFTWARE" ghost — the monument replaces it. Delete the `#heroBgText` element and its CSS.
- Remove the old `.hero-tag` element (its content merges into the mono metadata row above).
- Sub-copy under the monument: keep the existing paragraph text unchanged. Style as Inter 500 21px, `--color-stone`, `max-width: 480px`, `line-height: 1.3`, `letter-spacing: -0.01em`. Left-aligned with 48px padding.
- CTA row: two elements, `gap: 24px`.
  - Primary: pill button, `background: var(--color-graphite); color: var(--color-pure-white); padding: 14px 28px; border-radius: 9999px; font: 500 14px var(--font-mono); text-transform: uppercase; letter-spacing: 0.08em;` — text `SEE MY WORK →`. Keep `.magnetic` class.
  - Secondary: ghost text link, Inter 500 17px, `--color-pure-white`, underline on hover only. Text `HIRE ME →`.
- Scroll indicator: bottom-right corner, mono 12px `SCROLL ↓`, `--color-ash`. Delete the current vertical line element.
- Hero flex layout: `display: flex; flex-direction: column; justify-content: space-between; padding: 120px 0 48px;`.

Entrance choreography (`initHero`, new function called from `initPostLoad`):
1. Metadata row: `y: -20, opacity: 0 → 0, 1`, delay 0, duration 0.6.
2. Monument: `y: 60, opacity: 0 → 0, 1`, delay 0.15, duration 0.9.
3. Sub-copy: `y: 20, opacity: 0`, delay 0.5, duration 0.6.
4. CTAs: stagger 0.1s starting at delay 0.7, y 20, duration 0.5.

### 6. Marquee
Kill the current infinite-loop marquee. Replace with a scroll-linked typography strip:

```html
<section class="marquee-section" aria-hidden="true">
  <div class="marquee-row marquee-row--right" data-speed="0.3">
    <div class="marquee-track"><!-- tech tags repeated 3× --></div>
  </div>
  <div class="marquee-row marquee-row--left" data-speed="0.3">
    <div class="marquee-track"><!-- tech tags repeated 3× --></div>
  </div>
</section>
```

- Section background `--color-fog`. Padding `120px 0`.
- Each `.marquee-track` is a horizontal flex row of terms separated by a `•` in `--color-ember-orange` (this is one of the few valid orange usages — a single small character).
- Row 1 terms (existing home stack): `HTML5 • CSS3 • JAVASCRIPT • TYPESCRIPT • REACT • VUE • NODE.JS • EXPRESS`
- Row 2 terms (existing extended stack): `TAILWIND • FIGMA • GIT • VERCEL • MONGODB • POSTGRES • DOCKER • PYTHON`
- Term styling: `font: 400 clamp(72px, 10vw, 160px) var(--font-display); text-transform: uppercase; color: var(--color-pure-white); -webkit-text-stroke: 1px var(--color-silver-mist);` — outlined type, no fill (or fill with `--color-pure-white` if it reads too weak).
- Bullet: `color: var(--color-ember-orange); font-size: 24px; margin: 0 48px;`.
- `initScrollMarquee` drives each row's `transform: translate3d(...)` from `window.scrollY`. Row 1 goes right (positive), row 2 goes left (negative). Base offset so the middle repetition is visible on load.

### 7. About (`#about`)
- Section background `--color-paper`. Padding `120px 48px`.
- Ghosted section title: an absolutely-positioned `ABOUT` in `--font-display` at 200px, `color: var(--color-pure-white)`, `z-index: 0`, sitting at the bottom-right of the section. This is the DESIGN.md "Ghosted Section Title" pattern — it nearly vanishes into the background.
- Two-column layout above the ghost:
  - Left column: small mono label `// 01 — WHO`, then a heading in `--font-display` 96px `A FRESH GRAD FROM SINGAPORE.` — left-aligned, `--color-graphite`, letter-spacing `-0.03em`.
  - Right column: the existing 3-paragraph bio, Inter 500 21px, `--color-stone`, `max-width: 520px`. **Apply the char-reveal to the FIRST paragraph only** via `initCharReveal`. The other two use standard `.reveal` fade.
- Stats — reformat entirely. Kill the current 4-card grid. Replace with a horizontal strip:
  ```
  ┌─────────────────────────────────────────────────────────────────────┐
  │ 2023          8+           1+           4+                          │
  │ GRADUATED     PROJECTS     INTERNSHIP   YEARS SELF-TAUGHT           │
  └─────────────────────────────────────────────────────────────────────┘
  ```
  - Row: `display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--color-silver-mist); border-bottom: 1px solid var(--color-silver-mist); padding: 48px 0; margin-top: 96px;`
  - Number: `--font-display`, 96px, `--color-graphite`. Keep the existing `initCounters` animation targeting these numbers — its class hooks must be preserved.
  - Label: JetBrains Mono 12px uppercase, `--color-stone`, letter-spacing 0.1em.
  - Vertical hairlines between columns: `border-left: 1px solid var(--color-silver-mist);` on children 2+.

### 8. Projects (`#projects` on `index.html`)
Rebuild as sticky-stacking cards.

Markup:
```html
<section id="projects">
  <div class="projects-header">
    <span class="section-num">// 02 — WORK</span>
    <h2 class="section-title">SELECTED PROJECTS</h2>
  </div>

  <div class="sticky-stack">
    <!-- 6 cards -->
    <article class="project-card" data-index="0"> ... </article>
    <article class="project-card" data-index="1"> ... </article>
    ...
  </div>

  <a class="view-all" href="projects.html">VIEW ALL PROJECTS →</a>
</section>
```

CSS:
```css
.sticky-stack { position: relative; }
.project-card {
  position: sticky;
  top: 96px;
  min-height: calc(100vh - 96px);
  background: var(--color-pure-white);
  border: 1px solid var(--color-silver-mist);
  border-radius: 0;                   /* sharp per DESIGN.md — override motion reference's rounding */
  padding: 48px;
  transform-origin: top center;
  will-change: transform;
}
```

Each card interior (grid):
- Row 1: giant project number (`01`, `02`...) in `--font-display` at 140px, `--color-graphite`, occupying its own column.
- Row 1 right: metadata block — category pill (`FULL-STACK`/`FRONTEND`/`GAME`/`API` in a dark `--color-onyx` mono chip 12px uppercase), then title in `--font-display` 60px `--color-graphite`, then one-line description in Inter 500 21px `--color-stone`, then stack pills row (mono 12px, `--color-onyx` bg, `--color-pure-white` text, 0 6px padding, 6px gap), then a ghost `LIVE PROJECT →` pill link (border 2px `--color-graphite`, mono 14px uppercase, letter-spacing 0.1em).
- Row 2: full-width cover image (use existing `Cover_Images/*.png`). No border-radius. `object-fit: cover; aspect-ratio: 16/9;`.

Scale-stack behavior via `initStickyProjects`:
```js
gsap.utils.toArray('.project-card').forEach((card, i, cards) => {
  const targetScale = 1 - (cards.length - 1 - i) * 0.03;
  gsap.to(card, {
    scale: targetScale,
    scrollTrigger: {
      trigger: card,
      start: 'top 96px',
      end: '+=100%',
      scrub: true,
    }
  });
});
```

Preserve every project's existing title, description, tags, and link. The three projects with cover images (NextTrack, BrainPet, Operation BlackSite) show them full-bleed; the three without (BlogSpace, ShopUI, Admin Dashboard) get a mono placeholder block reading `// NO COVER` in `--color-fog` background — still a card, still 100vh — do not skip them.

"VIEW ALL PROJECTS" button: ghost pill in `--color-graphite`, mono 14px uppercase, 2px border, centered under the stack with 96px top margin.

### 9. Skills (`#skills`)
Keep the tab mechanism. Restyle:
- Section background `--color-fog`. Padding `120px 48px`.
- Ghosted section title `SKILLS` at 200px per the About pattern.
- Section heading: mono label `// 03 — TOOLKIT`, then `--font-display` 96px `WHAT I BUILD WITH.`
- Tab bar: horizontal flex, gap 6px. Each tab is a pill (transparent bg, 1px border, mono 14px uppercase). Active tab: `background: var(--color-onyx); color: var(--color-pure-white); border-color: var(--color-onyx);` and prefixed with an ember dot.
- Skill row:
  ```
  [devicon] REACT ────────────────────────────────────  75%
  ```
  - Left: devicon 24px, then skill name in mono 14px uppercase, then a track.
  - Track: `height: 1px; background: var(--color-silver-mist); flex: 1;` — hairline only.
  - Fill: `background: var(--color-graphite); height: 1px;` — animates from 0 to the target percentage on tab open. **No rounded ends. No red. No gradient.**
  - Percentage: mono 12px `--color-stone`, right-aligned.
- Preserve the existing skill data and percentages in `main.js` — only change the render.

### 10. Contact (`#contact`)
- Section background `--color-paper`. Padding `120px 48px`.
- Ghosted section title `CONTACT` at 200px.
- Two-column: 40% pitch / 60% form.
- Left column: mono label `// 04 — REACH OUT`, then `--font-display` 96px `LET'S BUILD SOMETHING.`, then the existing pitch paragraph in Inter 500 21px `--color-stone`. Then three social links stacked, each: ember dot + mono 14px uppercase, gap 12px. `EMAIL`, `GITHUB`, `LINKEDIN` — keep existing URLs.
- Right column form: single vertical stack, gap 24px. Each field:
  - Label: mono 12px uppercase `--color-stone`.
  - Input/textarea: `border: 0; border-bottom: 1px solid var(--color-silver-mist); background: transparent; padding: 12px 0; font: 500 21px var(--font-body); color: var(--color-graphite); border-radius: 0;`. On focus: `border-bottom-color: var(--color-graphite);`.
  - No placeholders — labels do the work.
- Submit: pill button, `background: var(--color-graphite); color: var(--color-pure-white);` mono 14px uppercase `SEND MESSAGE →`. Keep `.magnetic` class.

### 11. Footer
- Background `--color-onyx`. Padding `48px`. Border-top removed — the dark background is the divider.
- Grid: three columns.
  - Left: `[ember dot] OPEN TO WORK` — mono 12px uppercase `--color-pure-white`. The ember dot is a `<span class="ember-dot ember-dot--pulse"></span>` with a slow 2s opacity pulse (0.4 → 1) via CSS animation.
  - Center: `© 2026 GLENN SOE. ALL RIGHTS RESERVED.` — mono 12px `--color-ash`.
  - Right: `BASED IN SINGAPORE` — mono 12px `--color-ash`.

### 12. Resume FAB
- Currently red. Change to `--color-graphite` pill with `--color-pure-white` mono 14px text. Keep the position (bottom-right, fixed). Same magnetic interaction.

### 13. `projects.html`
Apply the same nav, colors, and type. Then:
- Intro block: mono label `// ARCHIVE`, then `--font-display` 96px `ALL PROJECTS.`
- Filter chips: mono pills (same styling as nav pills). Active: onyx bg with ember dot prefix.
- Project card grid: 3 columns desktop, 2 tablet, 1 mobile. Each card is flat, 0 radius, 1px silver-mist border, `--color-pure-white` bg. Hover: image lifts `translateY(-6px)`, 0.3s `--ease-in`. No shadow.
- **Fix the JOJOStudio bug**: in the project data (or wherever the image path lives), change `JOJOSTUDIO_CoverImage.png` to `JOJOStudio_CoverImage.png` to match the actual filename on disk. This 404s on case-sensitive hosts.
- Count badge: mono 12px `SHOWING {n} OF {total}`.

### 14. `resume.html`
- Body background `--color-paper`.
- Page title `RESUME` in `--font-display` 200px monument style, black-to-silver gradient, at the top.
- Contact bar underneath in mono 14px.
- Each role: role title in `--font-display` 60px, company in Inter 500 21px `--color-graphite`, date range in mono 12px `--color-stone`, bullet points in Inter 500 17px `--color-graphite`.
- Hairline `1px solid var(--color-silver-mist)` divider between roles.
- Print stylesheet stays — check that fonts fall back cleanly and colors invert to black-on-white.

## Global cleanup pass

After all sections:
1. Remove all references to `Syne` in HTML and CSS.
2. Remove all references to `#ff3c3c`, `#ffcc00`, `--accent2`.
3. Grep for `border-radius` — every non-zero, non-9999px value is either `--radius-panels` (14.4px, rare) or a bug.
4. Grep for `box-shadow` — should be near-zero uses. If a shadow exists, justify it or remove it.
5. Confirm every heading ≥36px has `letter-spacing: -0.03em`.
6. Confirm all mono text uses `text-transform: uppercase`.

## Motion checklist

- [ ] Lenis wired and scroll behavior is smooth without feeling laggy.
- [ ] Hero entrance sequence plays after loader, not during.
- [ ] Marquee rows drift on scroll (both directions), no jitter.
- [ ] About paragraph 1 character-reveals across its scroll range.
- [ ] Project cards stack and scale as you scroll past.
- [ ] Magnetic effect is subtle — you have to be within ~80px of the button to feel it.
- [ ] No spring or bounce anywhere.
- [ ] `prefers-reduced-motion: reduce` disables Lenis, marquee scroll-link, and char reveal; keeps opacity fades.

## Commits — atomic, per section

Use conventional commits. Small commits are easier to revert than one monster diff.

Suggested order:
1. `feat(tokens): install DESIGN.md color, type, spacing system`
2. `feat(loader): monochrome loader with ember accent`
3. `feat(cursor): graphite dot + ember hover ring`
4. `feat(nav): pill nav floating over hero`
5. `feat(hero): monument name with gradient fill`
6. `feat(marquee): scroll-linked kinetic typography strip`
7. `feat(about): ghosted title + character reveal bio`
8. `feat(projects): sticky-stacking cards`
9. `feat(skills): brutalist tab UI with hairline bars`
10. `feat(contact): underline-only form + editorial pitch`
11. `feat(footer): dark mono row with pulsing open-to-work`
12. `feat(projects-page): apply new visual language + fix JOJOStudio case bug`
13. `feat(resume): apply new visual language`
14. `chore(cleanup): drop Syne, red, and dead rules`

**Do not push.** Leave the branch local.

## After every section — verify in a browser

Do not move to the next section until the current one passes visual QA.

1. Start a static server in background:
   ```bash
   python -m http.server 8000
   ```
2. Open the in-app browser at `http://localhost:8000/`.
3. Take a screenshot at 1280×800 (desktop). Resize to 768×1024 (tablet), screenshot. Resize to 375×812 (mobile), screenshot.
4. Read the console — zero errors.
5. If it's broken, fix it before committing.

## Acceptance checklist — must all be true before you declare done

- [ ] All original text content present. Grep every project title and the first sentence of the bio in the new HTML — nothing missing.
- [ ] No `#ff3c3c`, `#ffcc00`, `Syne` anywhere in the repo.
- [ ] Ember orange (`#ff6436`) used only on ≤12px status dots, single-character punctuation, and cursor hover ring. No fills, no backgrounds.
- [ ] All 6 index-page projects render and link correctly.
- [ ] All 7 projects-page projects render and link correctly (includes JOJOStudio).
- [ ] JOJOStudio image case-mismatch fixed and image loads without 404.
- [ ] Loader completes in under 3s. Never hangs.
- [ ] Zero console errors on `index.html`, `projects.html`, `resume.html`.
- [ ] Site works with JS disabled — basic content is readable (motion is progressive enhancement).
- [ ] Cursor is visible everywhere on desktop and behaves correctly on hover.
- [ ] Resume print stylesheet still renders cleanly (`Ctrl+P` preview).
- [ ] Lighthouse: Performance ≥85, Accessibility ≥95, Best Practices ≥90.
- [ ] All 14 commits landed; branch is local (not pushed).

When every box is ticked, print a short summary of what changed, the commit hashes, and any known follow-ups. Then stop.

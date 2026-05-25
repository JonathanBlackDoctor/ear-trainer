# Handoff: 음감 훈련 — Visual Direction (G · I · J · M)

This package contains **four candidate visual directions** for the 음감 훈련 (Ear Training) mobile PWA. The product manager has narrowed the design exploration to these four; pick **one** of the four directions and implement the entire app in that direction's visual language.

The full product spec (screens, modes, gamification, content lexicon) is in **[DESIGN_SPEC.md](./DESIGN_SPEC.md)** and remains the source of truth for *what* the app does. This README is the source of truth for *how it looks*.

## How to use this package

1. **Open [`preview.html`](./preview.html)** in any modern browser to see all 4 directions live side by side. Confirm the chosen direction with stakeholders.
2. **Open [`demos/{g,i,j,m}.html`](./demos)** to see one direction in isolation at the exact mock fidelity.
3. **Look at [`screenshots/{g,i,j,m}-{home,setup,training,result,stats}.png`](./screenshots)** — 20 PNGs at the exact rendered pixel size, for spot-checking the implementation against the mocks.
4. **Read this README** for the design system (tokens, components, interactions, state, accessibility).
5. **Copy the chosen direction's token files** from [`tokens/`](./tokens) into the codebase:
   - `tokens/global.css` — base (Pretendard font, tabular nums, reduced-motion, focus rings, touch-target floor). Always include.
   - `tokens/{letter}.css` — CSS custom properties for the chosen direction.
   - `tokens/{letter}.tailwind.js` — Tailwind theme extension for the chosen direction (use **either** the CSS or Tailwind file, whichever fits the codebase).
6. **Reference [`source/direction-{letter}.jsx`](./source)** for exact inline-style values per element. Every visible decision (color, padding, radius, shadow, gap, rotation) is captured as a literal in the JSX. When in doubt, the JSX wins.

---

## About the design files

The files under `source/` are **design references in React JSX** — high-fidelity prototypes built to communicate look and feel. They are **not** production code to ship as-is. Recreate the designs in the target codebase's existing environment (React 18 + TypeScript + Tailwind + Zustand + Tone.js + VexFlow + Recharts, per the DESIGN_SPEC), following its established patterns.

- `source/shared.jsx` defines a `<Phone>` wrapper, a `MiniSpark` sparkline helper, and the `MODES` / `INTERVAL_CHOICES` arrays. Equivalent helpers exist in the real codebase or should be created idiomatically.
- `source/direction-{g,i,j,m}.jsx` each export 5 screens (`{LETTER}_Home`, `_Setup`, `_Training`, `_Result`, `_Stats`) — the most important 5 of the 7 routes. Implement the remaining 2 (실험실 `/lab`, 업적 `/badges`) in the same direction.
- `source/android-frame.jsx` is the device bezel used only for presentation. Discard when implementing.
- Open **[preview.html](./preview.html)** in a browser to see the 4 directions live side by side.

## Fidelity

**High-fidelity.** Colors, type sizes, paddings, radii, and decorative motifs are all final and should be matched pixel-perfectly within the chosen direction. The five shown screens already cover every component the rest of the app needs (cards, buttons, level grid, toggles, segmented controls, choice grids, progress bars, chips, sparklines, mode tiles, badges) — derive the missing screens by reusing those primitives in the same idiom.

---

## Common foundations (applies to ALL four directions)

### Platform constraints (unchanged from DESIGN_SPEC §2)
- **Mobile portrait only.** All screens are a single-column vertical scroll. Frame width in the mocks is 412px (Android M3 default). Content max-width should be ~390–512px centered.
- **PWA**: respect iOS `safe-area-inset-*` and Android navigation. Theme color per direction (see each direction's tokens).
- **Touch first**: 44×44px minimum hit area; primary action buttons ≥ 56px tall.
- **Korean-only UI**. Use **Pretendard** as the only family (`https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css`). All directions are sans-only — no Noto Serif KR despite the original spec.
- **Tabular nums**: Apply `font-variant-numeric: tabular-nums` to any block of digits (XP, percentages, level numbers, time, BPM). Mocks use a `.tnum` class.
- **`prefers-reduced-motion`** must disable all transition/animation effects (including direction M's gradient shimmer if added).
- Light mode only.

### Information architecture (§3)
Seven routes: `/` 홈 · `/train/:mode` 훈련 (setup → training) · `/result` 결과 · `/stats` 통계 · `/settings` 설정 · `/lab` 실험실 · `/badges` 업적.

### 13 training modes (§7)
`solfege 🎼` · `interval 🎵` · `chord 🎹` · `progression 🎸` · `melody 🎶` · `transpose 🔄` · `rhythm 🥁` · `tempo ⏱️` · `bpm 🎯` + lab modes `lab-scale 🪜` · `lab-cadence 🛑` · `lab-key 🗝️` · `lab-inversion 🔄`. Each has 1–10 levels.

### Korean copy & tone
Soft 존댓말. Encouraging not commanding. Use the exact strings shown in the mocks where possible — they have been tuned for length and warmth. Examples: "약점 보강", "한 번 더", "시작하기", "완벽합니다!". Avoid game-y exclamations unless the direction's tone calls for it (only J does, mildly).

### Iconography
**Emoji are kept as the only icon system** (per PM decision). All mocks use the same emoji set:
- Modes: 🎼 🎵 🎹 🎸 🎶 🔄 🥁 ⏱️ 🎯 🪜 🛑 🗝️ 🔄
- Status: ✓ ✗ ⚡ 🔥 ⚡ 💎 👑 🎊 🏆 🥉 🥈 🥇 💠
- Controls: ▶ 🐢 🐇 🎹

### Game mechanics (§8)
- **XP per question** = `(level + correctness × 0.6 + speed_bonus_3-10s_linear) × combo_multiplier_max_2x`
- **8 ranks** by cumulative XP: 🥉 Bronze I/II/III (0/200/500), 🥈 Silver (1,200), 🥇 Gold (3,000), 💠 Platinum (8,000), 💎 Diamond (20,000), 👑 Master (50,000).
- **Combo overlays** at 3/5/10/20 consecutive: 🔥 / ⚡ / 💎 / 👑.
- **18 achievements** in 6 categories — see DESIGN_SPEC §8.4 for the full list.

### Component catalog (shared across directions)
The five mocked screens collectively show every component the full app needs:

| Component | Demo screen | Notes |
|---|---|---|
| **Primary button** (시작하기 / 한 번 더) | Setup, Result | Full-width, large, direction-specific accent. |
| **Secondary button** (📊 통계 / ⚙ 설정) | Home, Result | Smaller, neutral. |
| **Ghost button** (건너뛰기) | Training | Plain text or hairline border. |
| **Hero card** | Home (rank), Result (score), Setup (mode emblem) | Each direction's signature decoration lives here. |
| **Stat tile** (정답률 / 세션 / 문제) | Home, Stats | Always 3-column, big tabular number. |
| **Level grid** (1–10) | Setup | 5×2 grid, distinguishes inactive / done / active. |
| **Toggle** (절대음감) | Setup | Two-state. |
| **Segmented control** (속도 🐇 ↔ 🐢) | (implied in directions B/I; recreate in chosen direction style) | |
| **Progress bar** (Q×/N, ✓N) | Training | 10 segmented ticks colored by status. |
| **Play controls row** (🎹 · ▶ · 🐢) | Training | Center button is largest. |
| **Choice grid** (보기) | Training | 2-column grid, 6 visible. Numbered 1–6 top-corner. |
| **Feedback / pick state** | Training | Picked = direction's primary accent. (Correct/wrong states use semantic colors — see §"Semantic states" below.) |
| **Chip / badge** | All screens | Per-direction shape and weight. |
| **Sparkline trend** | Stats | 20 data points. |
| **Horizontal bar list** | Home (modes), Stats (modes/weakness) | Always 5–6 rows. |
| **Achievement card** | Result | Avatar + NEW chip + title + description. |
| **Tab bar** (홈 / 통계 / 업적 or 통계 / 설정) | Home | Different across directions — see individual specs. |

### Semantic states (universal across the 4 directions)
Although each direction has its own primary color, **success / danger / warning are kept consistent for cognitive consistency**:

| State | Color | Used for |
|---|---|---|
| Correct | `#15803d` (sage green) — or each direction's `green`/`mint`/`success` token | answer ✓, mode acc ≥ 80%, "정답" feedback |
| Wrong   | `#dc2626` (warm red) — or each direction's `red`/`coral`/`danger` token | answer ✗, weak items, "오답" feedback |
| Warning | `#f59e0b` (amber) — or each direction's mid-accent | mode acc 60–79%, fallback |
| Skipped/idle | gray | unanswered, neutral |

Each direction overrides these with its own palette (see per-direction tokens). The role is what matters — pick the closest hue in the direction's palette.

---

## Direction G — 네오 브루탈리즘

> Thick black borders + hard offset shadows + candy block colors. Highest energy / gamification feel. Best fit if the team wants 음감 훈련 to feel like a playful daily app (Duolingo energy, not Calm energy).

**Files**:
- Source: [`source/direction-g.jsx`](./source/direction-g.jsx) (canonical — `G` object at top is the palette)
- Tokens: [`tokens/g.css`](./tokens/g.css) · [`tokens/g.tailwind.js`](./tokens/g.tailwind.js)
- Live demo: [`demos/g.html`](./demos/g.html)
- Screenshots: [`screenshots/g-home.png`](./screenshots/g-home.png) · [`g-setup.png`](./screenshots/g-setup.png) · [`g-training.png`](./screenshots/g-training.png) · [`g-result.png`](./screenshots/g-result.png) · [`g-stats.png`](./screenshots/g-stats.png)

### Design tokens

```
Background      bg          #fffef0   (cream)
Surface         card        #ffffff
Ink             ink         #0a0a0a
                inkSoft     #3a3a3a
                inkMute     #7a7a7a
Primary (warm)  pink        #ff5a8c
Primary (deep)  ink         #0a0a0a   (used as button bg too)
Accent          mustard     #f5d142
                mint        #5af2c2
                lavender    #a497ff
                sky         #7fc6ff
                orange      #fb923c
Success         green       #7ce26c
Danger          red         #ff5b4a
```

### Type
Pretendard 700 / 800 / 900 only. Tracking `-0.01em` for body, `-0.02em` to `-0.05em` for large display numbers. Tabular nums on all numerals.

| Role | Size | Weight |
|---|---|---|
| Display (XP, score %) | 76–120 | 900 |
| H1 (모드 이름) | 30–36 | 900 |
| H2 (섹션) | 18–22 | 900 |
| Body | 13–14 | 700–900 |
| Caption | 10–11 | 800–900 |

### Shape, border, shadow
- **Border**: `2.5px solid #0a0a0a` on cards, `2px solid #0a0a0a` on inner elements (level buttons, toggles). Never less than 2px.
- **Radius**: **0** (square) everywhere. The only round element is the play orb on Training (a 132px circle).
- **Shadow**: hard offsets, no blur — `boxShadow: 'Xpx Xpx 0 #0a0a0a'`.
  - Small element: `3px 3px 0 #0a0a0a`
  - Standard card: `4px 4px 0 #0a0a0a` or `6px 6px 0 #0a0a0a`
  - Hero / CTA: `8px 8px 0 #0a0a0a`, or `6px 6px 0 #ff5a8c` for a colored shadow on dark buttons.
- **Active/press state**: drop shadow size to 2px and translate(2,2) — gives the physical "press" feel. Hover: shift -1,-1 and grow shadow by 1px.

### Decoration motifs
- Tilted stickers (`transform: rotate(-2deg)` or `+3deg`) on chips for label energy.
- Color blocks as background under emoji on mode tiles (use the mode's own accent color from DESIGN_SPEC §4.1, opacity 100%, hard-edged).
- No gradients ever. No blur.

### Theme color (PWA): `#ff5a8c` (pink). Splash bg: `#fffef0`.

### Screen highlights
- **Home**: hero rank card (`bg: pink`, hard 6px offset shadow). 3 candy stat tiles. Mode grid uses each tile's *own* candy color as bg, with mode accent as fill. CTA tab is a 2-button row (white / black-with-pink-shadow).
- **Setup**: Big mint hero block, level grid where active = `bg: ink, color: mustard, shadow: 3px 3px 0 pink`. CTA is hot pink with 8px shadow.
- **Training**: Mustard play container, large pink ▶ button, picked answer in mint with 5px shadow. Submit = pink gradient.
- **Result**: Mustard rank-up banner with rotated 🥇. Mint score block (huge 92%). 4 candy stat tiles in row.
- **Stats**: Sky-blue hero with mustard `%` pad. Mint-tinted chart frame.

### Animation
- Combo overlay: hard `pop` (scale 1.2 → 1 with no easing — feels like a stamp).
- Press: `transform: translate(2px, 2px); box-shadow: 2px 2px 0 #0a0a0a;` in 80ms.
- Avoid soft fades. Direction G is hard cuts.

---

## Direction I — 모눈 / 데이터 (Grid / Data)

> Grid-paper background + monospace-style labels + signal-lime accent. Lab notebook / oscilloscope aesthetic. Best fit if 음감 훈련 is for serious learners who like seeing precise data on their progress.

**Files**:
- Source: [`source/direction-i.jsx`](./source/direction-i.jsx)
- Tokens: [`tokens/i.css`](./tokens/i.css) · [`tokens/i.tailwind.js`](./tokens/i.tailwind.js)
- Live demo: [`demos/i.html`](./demos/i.html)
- Screenshots: [`screenshots/i-home.png`](./screenshots/i-home.png) · [`i-setup.png`](./screenshots/i-setup.png) · [`i-training.png`](./screenshots/i-training.png) · [`i-result.png`](./screenshots/i-result.png) · [`i-stats.png`](./screenshots/i-stats.png)

### Design tokens

```
Background      bg          #fbfcfd   + grid pattern (see below)
Card            card        #ffffff
Inset           inset       #f5f7fa
Ink             ink         #0f1419
                inkSoft     #4a5563
                inkMute     #9aa3b0
Hairline        hair        #e2e7ed   (1px primary)
                hairDark    #c8d0d9   (1px emphasis / corners)
                grid        #eef1f5   (12px square grid)
Primary         lime        #65a30d
                limeBright  #84cc16
                limeSoft    #ecfccb
Accent          cyan        #0e7490
                cyanBright  #06b6d4
Signal/Danger   signal      #ef4444
Warn            amber       #ea580c
```

### Grid background
The signature look. Apply to all root containers:

```css
background:
  linear-gradient(#eef1f5 1px, transparent 1px) 0 0 / 12px 12px,
  linear-gradient(90deg, #eef1f5 1px, transparent 1px) 0 0 / 12px 12px,
  linear-gradient(#e2e7ed 1px, transparent 1px) 0 0 / 60px 60px,
  linear-gradient(90deg, #e2e7ed 1px, transparent 1px) 0 0 / 60px 60px,
  #fbfcfd;
```

Two layers: light 12px micro-grid + darker 60px major-grid. Cards sit *on top* of this background, so they look like notes pinned to graph paper.

### Type
Pretendard with `font-variant-numeric: tabular-nums slashed-zero` on numerics. Labels use uppercase + `letterSpacing: 1.5–2px` to evoke monospace without switching family.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Display KPI (78.3%) | 64–96 | 800 | -0.05em |
| H1 (음감 훈련 / v4.2) | 28 | 800 | -0.03em |
| Mono label (SESS·042) | 10–11 | 700–800 | +1.5–2px, uppercase |
| Body | 12–13 | 700 | -0.005em |
| Caption | 9–10 | 700–800 | +1px |

### Shape, border, shadow
- **Border**: `1px solid #c8d0d9` (hairDark) for outer card edges. `1px solid #e2e7ed` (hair) for internal separators. `1.5–2px solid #0f1419` only on CTA buttons.
- **Radius**: **0** everywhere (it's a notebook). Internal grid cells: 0.
- **Shadow**: **none**. Depth comes from the grid background.
- **Corner marks**: Every important card has crosshair corner ticks (10×10px L-brackets in `#c8d0d9`) at all four corners — see `ICorners` in source.

### Decoration motifs
- **Mono pill labels**: `SETUP · 음정 / interval`, `RANK · UP`, `Q · 05 / 10`, `BY MODE`, `// HOWTO`. The `//`, `·`, and `/` separators are integral to the aesthetic.
- **Numeric labels with delta indicators**: `+5`, `-3`, `↑ +6.2pp` colored by sign.
- **Oscilloscope waveform** on the play card: tiny gridded chart area with a sinusoid in lime. SVG path: `M0,35 Q20,5 40,35 T80,35 Q100,55 120,35 T160,35 ...`
- **Slashed-zero numerals** throughout.

### Theme color (PWA): `#65a30d` (lime). Splash bg: `#fbfcfd`.

### Screen highlights
- **Home**: Dashboard grid — 2×2 KPI block (ACC, XP, N, ΣQ). Rank progress bar with tick marks every 20%. Sparkline glance with `SIG · 최근 20세션` label. Mode table with `#`, `MODE`, `ACC`, `Δ` columns.
- **Setup**: Spec-card hero with lime-bordered emoji frame. `MODE · 02 / interval` mono label. Level slider with axis numbers (1–10) and `Lv 04 · 음역확장` callout in lime.
- **Training**: `SCOPE · A4 → ? Hz` oscilloscope card. `▶  PLAY / 듣기` button in ink with lime text. Choice grid is a 1px-bordered 2-column table.
- **Result**: Lime rank-up banner. Score plaque with `92.0%` (one decimal!) + crosshair corners. 4-column stat row with colored top-strip per column.
- **Stats**: Hero KPI `78.3%` with `↑ +6.2pp (30d)`. Trend chart sits on a faint grid. Mode bars have tick marks at 25/50/75% along the bar.

### Animation
- Hairline reveals (drawing in a 1px stroke from left to right) — 200ms ease-out.
- Number rolls (count up from 0 to value) on Result XP and score. 600ms.
- No bouncing, no scale — keep it scientific.

---

## Direction J — 카세트 테이프 (Y2K Cassette)

> Hot pink + teal + chrome + caution-tape diagonals. Tape reels and VU meters as core motifs. Y2K nostalgia. Best fit if 음감 훈련 should feel warm, playful, and slightly retro — pulling on the "mixtape" mental model for daily training.

**Files**:
- Source: [`source/direction-j.jsx`](./source/direction-j.jsx)
- Tokens: [`tokens/j.css`](./tokens/j.css) · [`tokens/j.tailwind.js`](./tokens/j.tailwind.js)
- Live demo: [`demos/j.html`](./demos/j.html)
- Screenshots: [`screenshots/j-home.png`](./screenshots/j-home.png) · [`j-setup.png`](./screenshots/j-setup.png) · [`j-training.png`](./screenshots/j-training.png) · [`j-result.png`](./screenshots/j-result.png) · [`j-stats.png`](./screenshots/j-stats.png)

### Design tokens

```
Background      bg          #f5ecdc   (warm cream)
Card            card        #ffffff
Chrome          (gradient)  linear-gradient(180deg, #f5f5f7 0%, #d5d8de 50%, #f5f5f7 100%)
Ink             ink         #1a0d1f
                inkSoft     #5a4860
                inkMute     #a899ad
Hair            hair        #ddd0c1
Primary         pink        #ff3da8
                pinkDeep    #c91d80
Accent          teal        #00c4b4
                tealDeep    #0a8a7d
                yellow      #ffd83d
Silver          silver      #c0c4cc
```

### Type
All Pretendard 700 / 800 / 900. Tracking `-0.02em` to `-0.05em` on display. Tabular nums.

| Role | Size | Weight |
|---|---|---|
| Display | 80–96 | 900 |
| H1 (음정 듣기) | 32 | 900 |
| Sticker label | 10–11 | 900 |
| Body | 13 | 700 |
| Caption | 10 | 700–900 |

### Shape, border, shadow
- **Border**: `2.5px solid #1a0d1f` on outer chrome cases; `2px solid #1a0d1f` on inner cards/buttons; `1.5–2px solid #1a0d1f` on tiny elements.
- **Radius**: **0** (everything is sharp like cassette plastic). Exceptions: reel rim (`borderRadius: '50%'`), pill stickers (`borderRadius: 4`).
- **Shadow**: hard offsets like direction G, but smaller — `2–5px Xpx 0 #1a0d1f`. Use 4–5px on CTAs, 2px on quiet cards.
- **Stickers**: rotated `-3deg` / `+2deg`, with their own 1.5px border + 2px offset shadow. See `JSticker` in source.

### Decoration motifs
- **Tape reels** (`JReel`): SVG concentric circles with 6 radial spokes + colored hub (pink or teal). Used at corners of the rank card, tape window, and Result plaque. Animate the reels rotating during 듣기 playback (`@keyframes spin`, 4s linear infinite).
- **Tape window**: Dark purple (`#2a1c2f`) inset bordered box containing two reels with a colored tape strip stretched between them. The active strip's color reflects current state (pink = playing, teal = ready).
- **Caution-tape stripes** (`JStripes`): 45° repeating-linear-gradient `pink/yellow` or `teal/pink` bands with 2px ink top/bottom borders, used at top/bottom of screens like masthead/footer rules.
- **Transport buttons**: `◀◀ REW / ▶ PLAY / ◾ STOP / ▶▶ FF` 4-button row in chrome.

### Theme color (PWA): `#ff3da8`. Splash bg: `#f5ecdc`.

### Screen highlights
- **Home**: Stripe band → masthead with two tilted stickers → cassette-body rank card (chrome bg, tape window inside, corner screws). Track-list of modes numbered 01–06.
- **Setup**: Yellow cassette-label hero with `TRACK 02 · SIDE A` + a reel. Chrome level dial card. CTA = pink with 5px shadow.
- **Training**: Full tape window with two reels (spin while playing). Progress = 10 bordered ticks. Picked answer: teal with 4px shadow + `transform: rotate(-1deg)`.
- **Result**: Pink "SIDE B UNLOCKED" rank-up. Yellow score plaque with reels at corners. Teal XP block. CTA `◁◁ REW · 한 번 더`.
- **Stats**: Chrome KPI panel with mini VU bars (20-bar histogram). Track-performance list mimicking Home's track list.

### Animation
- **Reels rotate** during playback: `@keyframes spin { to { transform: rotate(360deg); } }`, 4s linear infinite. Stop on pause.
- **VU bars** flicker subtly during playback (random scaleY 0.95–1.05 every 200ms) — but respect `prefers-reduced-motion`.
- Button press: scale to 0.96 and translate(1,1), shadow → 1px in 90ms.
- Sticker hover (desktop only): wiggle ±2deg.

---

## Direction M — 오로라 / 홀로그래픽

> Iridescent pearl gradients + glossy backdrop-blurred cards. Luxury, prismatic, slightly spiritual. Best fit if 음감 훈련 should feel premium and meditative — a tool for reverent daily practice.

**Files**:
- Source: [`source/direction-m.jsx`](./source/direction-m.jsx)
- Tokens: [`tokens/m.css`](./tokens/m.css) · [`tokens/m.tailwind.js`](./tokens/m.tailwind.js)
- Live demo: [`demos/m.html`](./demos/m.html)
- Screenshots: [`screenshots/m-home.png`](./screenshots/m-home.png) · [`m-setup.png`](./screenshots/m-setup.png) · [`m-training.png`](./screenshots/m-training.png) · [`m-result.png`](./screenshots/m-result.png) · [`m-stats.png`](./screenshots/m-stats.png)

**This direction is the most performance-sensitive** (backdrop-filter, multiple blur-filtered orbs) — gate the heaviest effects behind a low-end-device check (see Performance below).

### Design tokens

```
Background      bg          linear-gradient(135deg,
                              #ede2ff 0%, #d9eaff 22%, #d2f5e9 44%,
                              #fff0d9 66%, #ffd9ec 88%, #e6d9ff 100%)
Pearl card      pearl       #fdfcff (rarely solid; usually rgba(255,255,255,0.7) + blur)
Ink             ink         #1a1f3a
                inkSoft     #4b5070
                inkMute     #9a9ec0
Hair            hair        rgba(26,31,58,0.10)
                hairSoft    rgba(26,31,58,0.05)
Prism colors    cyan        #06b6d4
                violet      #a855f7
                pink        #ec4899
                amber       #f59e0b
                mint        #10b981
Iridescent      iridescent  linear-gradient(135deg,
                              #06b6d4 0%, #a855f7 25%, #ec4899 50%,
                              #f59e0b 75%, #10b981 100%)
Iridescent soft iridescentSoft  linear-gradient(135deg,
                              rgba(6,182,212,0.15) 0%,
                              rgba(168,85,247,0.15) 50%,
                              rgba(236,72,153,0.15) 100%)
```

### Glass card recipe (`MCard` in source)

```css
background: rgba(255,255,255,0.7);
border: 1px solid rgba(255,255,255,0.9);
border-radius: 22px;
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
box-shadow:
  0 8px 24px rgba(26,31,58,0.06),
  0 1px 3px rgba(26,31,58,0.04),
  inset 0 1px 0 rgba(255,255,255,0.8);
```

Optional `gloss` variant adds a thin highlight line at the top: a 1px linear-gradient `transparent → rgba(255,255,255,0.9) → transparent`. Used on hero cards.

### Type
Pretendard 700 / 800. Tracking `-0.02em` to `-0.06em` on display. Tabular nums.

| Role | Size | Weight |
|---|---|---|
| Display (92%) | 76–110 | 800 |
| H1 (음정 듣기) | 26–30 | 800 |
| H2 | 13–14 | 800 |
| Body | 12–13 | 700–800 |
| Caption | 10–11 | 700–800 |

**Gradient text** (`MText`) — used for select hero phrases ("다섯 분", "음정 듣기", display numbers):

```css
background: var(--iridescent);
-webkit-background-clip: text;
background-clip: text;
-webkit-text-fill-color: transparent;
filter: drop-shadow(0 4px 12px rgba(168,85,247,0.3));  /* optional on huge text */
```

### Shape, border, shadow
- **Border**: only `1px solid rgba(255,255,255,0.9)` on glass cards. No dark borders anywhere.
- **Radius**: **22px** on cards, **14–18px** on inner controls, **999px** (full pill) on chips. All shapes soft.
- **Shadow**: soft, multi-layer, often colored. For CTAs: `0 14px 30px rgba(168,85,247,0.5)`. For glass cards: see recipe above.

### Decoration motifs
- **Orbs** (`MOrb`): full-circle iridescent-gradient divs with `filter: blur(20–40px)` and `opacity: 0.5–0.7`. Place 2–3 orbs absolutely positioned in screen bgs (top-right negative, mid-left negative) for the aurora bloom. Each screen has a unique orb composition.
- **Iridescent gradient** is reused everywhere — never invent new colorways. Use it on:
  - Rank-card background (full bleed)
  - Active level buttons
  - Picked choice button
  - Primary CTA button
  - Bottom-tab active state
  - Gradient text on display numbers
- **Per-mode tile gradient**: each of the 9 modes gets a unique 2-stop gradient (`cyan→violet`, `violet→pink`, etc.) for its emoji chip — see source for the mapping.
- **Glossy 1px top highlight** on hero glass cards.

### Theme color (PWA): `#a855f7` (violet). Splash bg: `#ede2ff` (top of bg gradient).

### Screen highlights
- **Home**: Aurora bg with 2 blurred orbs. Iridescent rank card with white text. 3 glass stat tiles. Glass weakness card with glowing dot indicators (`box-shadow: 0 0 8px ${color}99`). Mode grid: each tile has a small unique-gradient emoji chip + per-mode gradient progress bar.
- **Setup**: Hero glass card with an iridescent-gradient 92×92 emoji emblem (boxShadow `0 12px 32px rgba(168,85,247,0.4)`). Active level button = iridescent gradient. CTA = iridescent gradient with heavy violet shadow.
- **Training**: Play card features a 144×144 iridescent orb button with a `position: absolute, inset: -20, blur(20px)` halo glow behind it. Picked choice goes full iridescent gradient.
- **Result**: Iridescent rank-up card with glossy highlight. Score with gradient text + drop-shadow filter. XP number also in gradient text. Mint/cyan/pink/amber stat chips.
- **Stats**: Hero `78%` in gradient text. Trend chart line uses an `<linearGradient id="mTrendL">` (cyan→violet→pink) for stroke; area fill is violet w/ 0.25 opacity at top fading to 0. Mode bars each get a unique 2-stop gradient.

### Performance notes
- `backdrop-filter: blur(20px)` is the most expensive part. On lower-end devices, replace with a solid `rgba(255,255,255,0.85)` and drop the blur. Detect via `@media (max-device-pixel-ratio: 2)` or feature-detect + user toggle in Settings.
- The blurred orbs are also costly. Limit to ~3 per screen, never animate them. The "Aurora" feel comes from static composition, not motion.
- Gradient text with `filter: drop-shadow` can flicker on Android Chrome — only apply to the largest display numbers.
- Respect `prefers-reduced-transparency` (iOS): when set, drop all `rgba` glass to fully opaque and remove blur.

### Animation
- Soft fade-in (200ms) on screen mount.
- Score number scale-up + count (0 → 92%) over 800ms with `cubic-bezier(0.16, 1, 0.3, 1)`.
- Choice button pick: 120ms scale 1 → 1.02 → 1 with the new shadow expanding.
- Combo overlay: soft scale 0.9→1 + opacity 0→1 over 280ms.
- No rotations, no bounces. Direction M is "ethereal".

---

## Implementation notes (all directions)

### Routing & state
- 7 routes with HashRouter (React Router) per DESIGN_SPEC §3.
- Zustand store mirrored to `localStorage`. Slices: `progress` (sessions, xp, ranks, achievements, weakness map), `settings` (chord notation, key fixing, session length, scale/key options), `audio` (sample-loaded flag, fallback flag).
- No backend.

### Audio
- Tone.js + Salamander Grand Piano samples (`public/samples/piano/*.mp3`) preloaded on the user's first `START` tap (browsers gate audio behind a user gesture). Show a loading state ("🎵 소리 준비 중...") on the START button.
- If sample loading fails, surface a yellow/amber banner at the top of Training: "피아노 샘플을 못 불러왔어요. 기본 음색으로 진행합니다." Color the banner with the direction's warn token.
- Reference note is always Middle C (C4) unless 절대음감 mode is on.
- **🐢 느리게** = 0.5× playback rate.

### Charts (Stats screen)
- Use **Recharts**. The mocks use a hand-drawn `MiniSpark` SVG — replace with a `<LineChart>` + `<Area>` in real implementation.
- Trend line stroke = direction primary. Area fill = primary at 0.15–0.25 opacity fading to 0 (M uses a 2-stop gradient stroke).
- Mode bars = `<BarChart>` with per-bar `fill` from the direction's accent palette mapped by accuracy: ≥80 success / ≥60 primary / <60 danger.

### Inputs other than the choice grid
The choice-grid was the only input shown in mocks. For the rest, follow these patterns in your chosen direction:

- **Piano keyboard** (melody, solfege-keyboard): horizontal-scrolling 3–5 octave keyboard, white keys 44×120, black keys 28×75, with note-name labels. Selected key highlight = direction primary, correct = direction success, wrong = direction danger. Keep the keyboard shape neutral; only color states change per direction.
- **Roman numeral grid** (progression): 4-column buttons `I ii iii IV V vi vii°`. Same visual style as the choice grid in the chosen direction, smaller (4 columns instead of 2).
- **Scale degree buttons** (1–7) for transpose: 7 button row, identical to a smaller choice grid.
- **Tap button** (rhythm/tempo): single huge button center-screen (160×160). G: hard square with offset shadow. I: outlined square with crosshair corners. J: shaped like a tape pad. M: iridescent orb identical to Training's play button but with `Tap` label.
- **BPM slider** (bpm levels 7–10): range slider with the current value displayed as a giant tabular number above. Track color = direction primary.

### Empty / loading / error states
- **First-visit empty home** (no sessions): hide rank/stats/weakness cards. Show a single welcome card with 🎼 + "훈련을 시작해보세요". Style as a hero card in the chosen direction.
- **Empty stats** (no sessions): full-screen 📭 + "아직 기록이 없어요" + a primary button "훈련 시작". Style consistent with chosen direction's empty-state pattern.
- **Audio loading**: button text changes to "🎵 소리 준비 중..." + disabled state. Show a small spinner adjacent.
- **Audio fallback warning**: see Audio section above.
- **Settings → 기록 초기화**: 2-step destructive confirm. First tap: button turns danger color, label changes to "한 번 더 눌러 확정 (5초)". After 5s, revert. Second tap (within 5s): clear store, show success toast.

### Accessibility
- All choice buttons: `role="radiogroup"` + each `role="radio"` with `aria-checked` + arrow-key + number-key 1–9 shortcuts.
- All progress bars: `role="progressbar"` with `aria-valuenow/min/max`.
- `prefers-reduced-motion`: disable all transitions, scale/rotate/translate effects, animated decorative elements (J reels, M orb glow pulse if added).
- `prefers-reduced-transparency` (iOS): in M, swap glass `rgba(255,255,255,0.7)` for solid `#fdfcff`, drop `backdrop-filter`.
- All emoji should have `aria-label` annotations when used as the sole identifier (e.g., mode tile emoji → `aria-label="음정 듣기"`).
- Focus rings: 2px outline in primary color with 2px offset on keyboard navigation (`:focus-visible`).

### Responsive
The app is portrait-only and capped at ~512px content width. The page always centers on larger screens with a neutral background outside the centered content (use the direction's `bg` color or a slightly darker tone).

---

## Files in this handoff

```
design_handoff_eum-gam/
├── README.md                  ← this file
├── DESIGN_SPEC.md             ← canonical product spec (unchanged)
├── preview.html               ← all 4 directions side by side
├── demos/                     ← one direction in isolation, browser-runnable
│   ├── g.html                 ← G · 네오 브루탈리즘
│   ├── i.html                 ← I · 모눈 / 데이터
│   ├── j.html                 ← J · 카세트 테이프
│   └── m.html                 ← M · 오로라 / 홀로그래픽
├── screenshots/               ← 20 reference PNGs (412×892-ish each)
│   ├── g-home.png  g-setup.png  g-training.png  g-result.png  g-stats.png
│   ├── i-home.png  i-setup.png  i-training.png  i-result.png  i-stats.png
│   ├── j-home.png  j-setup.png  j-training.png  j-result.png  j-stats.png
│   └── m-home.png  m-setup.png  m-training.png  m-result.png  m-stats.png
├── tokens/                    ← copy these into your codebase
│   ├── global.css             ← Pretendard, tabular nums, reduced-motion, focus, touch-target
│   ├── g.css     g.tailwind.js
│   ├── i.css     i.tailwind.js
│   ├── j.css     j.tailwind.js
│   └── m.css     m.tailwind.js
└── source/                    ← canonical design references (React JSX, inline styles)
    ├── shared.jsx             ← Phone wrapper, MiniSpark, MODES, INTERVAL_CHOICES
    ├── android-frame.jsx      ← device bezel (presentation only — DISCARD)
    ├── direction-g.jsx        ← G · 네오 브루탈리즘 (5 screens)
    ├── direction-i.jsx        ← I · 모눈 / 데이터 (5 screens)
    ├── direction-j.jsx        ← J · 카세트 테이프 (5 screens)
    └── direction-m.jsx        ← M · 오로라 / 홀로그래픽 (5 screens)
```

Each `direction-*.jsx` exports `{LETTER}_Home`, `{LETTER}_Setup`, `{LETTER}_Training`, `{LETTER}_Result`, `{LETTER}_Stats` and has the canonical token object as the first top-level `const` (`G`, `I`, `J`, `M`).

---

## Suggested implementation order

1. Pick **one direction**.
2. **Copy `tokens/global.css` and `tokens/{letter}.{css|tailwind.js}`** into your codebase. Don't hand-retype values — copy literally.
3. Build the **component library** (button, card, chip, level grid, choice grid, progress, sparkline, toggle, segmented control, play controls, weak-item row, mode tile) once, in that direction. Use the screenshots as pixel reference and `source/direction-{letter}.jsx` as the inline-style source of truth.
4. Build the **5 shown screens** (Home, Setup, Training, Result, Stats) to match the mocks pixel-perfectly.
5. Extend to the **2 remaining routes** (실험실, 업적) using the same primitives.
6. Wire **input variants** (piano, roman grid, scale degrees, tap, BPM slider) — each just a variant of choice grid / chips / sliders already built.
7. Hook **state & audio** per existing codebase patterns (Zustand + Tone.js).
8. **Game mechanics** (XP formula, ranks, combos, achievements) per DESIGN_SPEC §8.
9. QA: accessibility (a11y), `prefers-reduced-motion`/`-transparency`, low-end perf (esp. M), iOS safe-area, PWA install.

Questions on tokens or screen specs → refer to the source jsx files in `source/` — every visible decision is captured in inline `style` objects.

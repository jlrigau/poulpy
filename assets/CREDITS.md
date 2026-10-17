# Asset credits

The template ships a small starter game (a mini **Nebula Nursery**, the new-game seed). **All of
its art is generated** from one parametric SVG art module, `tools/art/starter.cjs` (a subset of
the showcase's `tools/art/nebula.cjs`, github.com/ludea-ai/nebula), rendered to PNG/WebP by
`.claude/skills/_shared/render-svg.cjs` (headless Chromium). Everything is original to this
repo — nothing is reused from any other game's art — and dedicated to the public domain
(**CC0**).

| Asset | File | Notes |
| --- | --- | --- |
| Metal deck ground | `assets/img/ground.webp` | tileable 512 |
| Nursery mat | `assets/img/pen_floor.webp` | the pen's floor (glowing hex mat) |
| Keeper robot (2 colours) | `assets/sheet/keeper.webp`, `keeper_amber.webp` | 128-px LPC walkcycle (hovering) |
| Keeper thumbnails | `assets/ui/keeper_thumb.webp`, `keeper_amber_thumb.webp` | menu portraits |
| Alien critters (×5 glows) | `assets/sheet/critter_*.webp`, `assets/ui/critter_*.webp` | 128-px, 4-frame squash walk |
| Close-ups | `assets/img/critter_closeup_*.webp` (+ `_done`) | dusty → happy, per glow colour |
| Dust bunnies, cloth, bubble | `dust.webp`, `dust_b.webp`, `cloth.webp`, `want_dust.webp` | polish mini-scene |
| Force-field fence | `assets/sheet/fence.webp` | 80-px frames drawn at half size |
| Recharge pod | `assets/img/pod_rest.webp` | rest station |
| Scenery & unlocks | `crystal*.webp`, `alienplant.webp`, `orblamp.webp`, `starball.webp`, `fountain.webp` | |
| UI icons | `assets/ui/icons/*.webp` | shared icon kit in the neon palette + critter, keeper, polish mitt |
| Home splash | `assets/img/splash.webp` | starfield, ringed planet and floating critters |
| Logo & app icons | `assets/img/logo.webp`, `assets/favicon.png`, `assets/apple-touch-icon.png`, `icon-192.png`, `icon-maskable.png` | the shared `critter()` drawing |

Regenerate: `node .claude/skills/_shared/render-svg.cjs tools/art/starter.cjs [--only key]`.

## Engine dependencies
- **Phaser 3** (v3.80.1) is vendored at `vendor/phaser.min.js` — MIT license,
  © Phaser Studio / Richard Davey.
- **Fredoka** font (latin subset) vendored at `vendor/fonts/fredoka-latin.woff2` —
  SIL Open Font License 1.1, © The Fredoka Project Authors (Milena Brandão).
- Sounds and music are synthesised at runtime (WebAudio) — no audio files.

## Making your own game
Write your own `tools/art/<game>.cjs` (copy the starter's structure) or source external art
(see the **asset-search** / **asset-add** skills) and credit any third-party assets here
with their author + license.

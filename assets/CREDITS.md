# Asset credits

**All of Poulpy's art is generated** from one parametric SVG art module, `tools/art/poulpy.cjs`,
rendered to WebP/PNG by `.claude/skills/_shared/render-svg.cjs` (headless Chromium). Everything is
original to this repo — nothing is reused from any other game's art — and dedicated to the public
domain (**CC0**).

| Asset | File | Notes |
| --- | --- | --- |
| Poulpy (little pink octopus) | `assets/sheet/poulpy.webp`, `poulpy_ride.webp`, `assets/ui/poulpy_thumb.webp` | 128-px LPC walkcycle + seated riding pose |
| Sea turtles (green, blue, pink) | `assets/sheet/turtle_*.webp`, `assets/ui/turtle_*.webp` | 4-frame swimming strip, front-view portraits |
| Close-ups | `assets/img/turtle_closeup_*.webp` (+ `_done`) | brush the algae off the shell |
| Algae, sponge, bubble | `algae.webp`, `algae_b.webp`, `brush.webp`, `want_algae.webp` | brushing mini-scene |
| Race | `turtle_back_*.webp`, `rider_back_poulpy.webp`, `rival_*.webp`, `jellyfish.webp`, `start_gate.webp` | rear views, rivals (clownfish, pufferfish, ray, crab, whale) |
| Seabed, plaza, lagoon | `ground.webp`, `plaza.webp`, `lagoon_floor.webp` | tileable sand with caustics, shell cobbles |
| City & nature | `house_*.webp`, `kelp.webp`, `coral_*.webp`, `rock*.webp`, `lamp.webp`, `vent.webp`, `starfish*.webp` | |
| Stations | `jar_house.webp`, `map_board.webp`, `chest.webp` | Poulpy's house, treasure board, hidden treasure |
| Unlocks | `clam.webp`, `statue.webp`, `lamp.webp` | |
| UI icons | `assets/ui/icons/*.webp` | shared icon kit in the sea palette + game icons (pearl, seaweed, turtle, octopus…) |
| Home splash, logo, app icons | `splash.webp`, `logo.webp`, `assets/favicon.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-maskable.png` | the shared `octo()` + `turtle()` drawings |

Regenerate: `node .claude/skills/_shared/render-svg.cjs tools/art/poulpy.cjs [--only key]`.

## Engine dependencies
- **Phaser 3** (v3.80.1) is vendored at `vendor/phaser.min.js` — MIT license,
  © Phaser Studio / Richard Davey.
- **Fredoka** font (latin subset) vendored at `vendor/fonts/fredoka-latin.woff2` —
  SIL Open Font License 1.1, © The Fredoka Project Authors (Milena Brandão).
- Sounds and music are synthesised at runtime (WebAudio) — no audio files.

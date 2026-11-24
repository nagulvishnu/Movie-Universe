# THE SKINWALKER — Technical Review Report

Project directory: `skinwalker-horror-movie-development/`
Review date: 2026-11-22
Review type: existing-project audit, repair and optimisation (no rebuild)

## 1. Project architecture

- **Stack:** React 19.2.6, Vite 7.3.7, TypeScript 5.9.3 (strict, `noUnusedLocals`/`noUnusedParameters`), Three.js 0.187, Tailwind 4, `vite-plugin-singlefile`. Imperative Three.js engine, not React Three Fiber.
- **Boot:** `index.html` → `src/main.tsx` → `src/App.tsx` (`TitleScreen` | `Player`) → `src/components/Player.tsx` (rAF transport + UI).
- **Timeline:** `src/movie/index.ts` concatenates `act1`–`act4`, assigns cumulative `start`, sorts cues/shots/lines, derives `MOVIE.total`, `CREDITS_START`, `POST_START`, and exposes `sceneAt`, `subtitleAt`, `cardsAt`.
- **Engine:** `src/engine/engine.ts` — renderer (ACESFilmic, PCF shadows, adaptive DPR), keyframe sampling with shortest-arc yaw, scene load/unload, cue firing, lighting/fog/flashlight/flash/burn effects, camera updates.
- **Characters:** `src/engine/rig.ts` — 11 procedural characters (`SPECS`), shared geometry/material caches, full pose library, expression table and an `uncanny` (`u`) parameter that drives the creature transformation.
- **Environments:** `envCommon.ts` (palettes, instanced trees, rain, fog, dust), `envOutdoor.ts` (forest/road/gas), `envIndoor.ts` (cabin/hunt/ranger/cave/home).
- **Audio:** `src/engine/audio.ts` — Web Audio graph with 5 buses, convolution reverb, 8 procedural ambience beds, 6 music modes, ~45 procedural SFX, optional recorded manifest, SpeechSynthesis fallback.
- **Persistence:** `src/engine/settings.ts` (localStorage settings/progress, try/catch guarded).

## 2. Original condition before modifications

- `npx tsc --noEmit`: **passed**. `npm run build`: **passed** (48 modules, `dist/index.html` ≈ 968 kB).
- 34 scenes across 4 acts, cumulative starts, **1705 s (28:25)** runtime, 0 gaps/overlaps, all durations > 0.
- `public/audio/voices/manifest.json` is `{}`; no recorded audio files exist. Title screen correctly states the build ships without recorded voice acting.
- Exactly one ending is implemented (see §6); no contradictory ending variant exists in source or in the built bundle.

## 3. Problems identified

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| 1 | High | `speakTTS()` called `ss.cancel()` then scheduled `ss.speak()` on an untracked 30 ms timeout. `stopSpeech()` (called on every scene change and seek) could not cancel the pending utterance → old dialogue bled into the next scene. | `audio.ts:421-422`, `engine.ts:192`, `Player.tsx:48` |
| 2 | High | Pause passed wall-clock time (`ms/1000`) as `now` to `Engine.step()`, so breathing, blinking, fire flicker, flashlight sway and camera shake kept animating behind the PAUSED overlay. | `Player.tsx:81` |
| 3 | High | On a natural scene transition `catchUp(local, natural)` applied all ambience/music cues, then `fireCues(def, -0.001, local)` re-applied the same window → duplicated audio state and stacked crossfades. | `engine.ts:187-204,294-303` |
| 4 | Medium | `AudioEngine` created with `useMemo` (double-created in StrictMode dev), `voiceschanged` listener never removed, `dispose()` never called, and `reset()` set `duck.gain.value` without cancelling automation. | `App.tsx:9`, `audio.ts:46-49,94-99` |
| 5 | Medium | Recorded buffer sources were started with no stored reference, so seeking could not stop an in-flight recorded line (latent with the empty manifest, real once files are imported). | `audio.ts:395-404` |
| 6 | Low | Six authored line pairs overlap by 0.06–0.56 s. Inspection confirms these are deliberate dramatic interruptions (e.g. "Not this quiet." over the previous line), not defects. | `act1.ts:245-246,277-278` and 4 others |

## 4. Problems repaired

1. `AudioEngine` now tracks `speechTimer` and `bufferSource`; `stopSpeech()` clears the timer, stops the buffer and cancels synthesis; `speakTTS()` and `playBuffer()` both route through it. Audio now stops cleanly on scene change, seek, pause and dispose.
2. `Player` maintains a playback `clock` that only advances while playing; `Engine.step()` receives that frozen value, so ambient animation truly pauses.
3. After `catchUp()` on a scene change, `prevLocal` is set to `local`, eliminating the duplicate cue window. The redundant `else if` branch in `step()` was removed.
4. `App` now holds a single `AudioEngine` in a `useRef` and calls `audio.dispose()` on unmount. The `voiceschanged` listener is stored, removed on dispose, and re-registered on `init()` so StrictMode remounts remain correct. `reset()` now uses `unduck()` (which cancels scheduled automation).
5. The validator explicitly permits short (< 1 s) authored dialogue overlaps while still failing on genuine large overlaps; all six are reported for transparency.

## 5. Files and modules changed

- `src/engine/audio.ts`, `src/engine/engine.ts`
- `src/components/Player.tsx`, `src/App.tsx`
- `package.json` (added `typecheck`, `validate` scripts), `scripts/validate.mjs` (new)

## 6. Screenplay and timeline validation

`npm run validate` bundles the real movie modules with esbuild and asserts contiguous starts, positive durations, dialogue containment, no >1 s overlap, cue/card containment, credits-before-post-credit, and manifest reference integrity.

Result: **34 scenes, 0 gaps, 0 overlaps, 0 containment failures**, 6 intentional short overlaps. Runtime **1705.00 s (28:25)**. Credits (scene 32) precede post-credit (33) and the "The End" card (34). The skip-credits button jumps to `POST_START`.

All continuity beats are present: gas-station warning, forest-cabin suspense, gradual voice imitation, hunting-cabin notebook/recorder evidence, creature reveal, attack/escape, ranger-station flare-gun climax, shopkeeper/Tommy connection, fifth photograph, home mirror phone call and "THE FOREST REMEMBERS YOU." **Implemented ending preserved; no ending versions were combined.**

## 7. Actual planned runtime

**1705 s = 28 min 25 s** — about 1.5 minutes below the 30-minute lower bound of the target, and 11.5 minutes below the 40-minute upper bound. The film is contiguous and complete; reaching 30+ minutes would require additional authored scenes (natural candidates: more of the hunter's investigation in the hunting cabin and a longer ranger-station standoff) rather than padding.

## 8. Character animation findings

Procedural rigs with shared cached geometry, full pose library (idle/walk/limp/run/stalk/sprint/sit/fear/crouch/aim/point/peer), per-character expressions and an `uncanny` parameter driving head tilt, eye shine, teeth and stretched smile. Gait advances by travelled distance. Creature "transformation" is an uncanny-parameter change plus visibility swap between a duplicate actor and the creature — effective, but the swap is a single-frame pop. No static placeholder characters; no systematic floating/sliding defect. Minor: locomotion poses with no displacement freeze the legs (the mechanism is fragile but currently authored correctly).

## 9. Camera and cinematography findings

`PerspectiveCamera(40°, 16:9, 0.05, 500)` with per-shot position/look interpolation (`smooth(u)`), actor-relative and head-tracked look targets, idle drift, shake, roll and animated FOV. Establishing shots, close-ups, two-shots and creature POVs are authored across all four acts. Key light follows the look point; interior dimming/flicker, lightning and flashlight spotlights support the horror tone. Transitions are hard cuts with scene fades.

## 10. Environment and visual quality findings

Six palettes (day/overcast/dusk/night/dawn/storm) define sky, fog, hemi/key light and exposure. Instanced trees, scrolling road tiles, gas-station photos, cabin fireplace/footprints, hunting-cabin evidence wall, ranger barricade/flare prop, cave photo reveal and the mirrored post-credit room are all implemented. Identity preserved: dark, disturbing, unpredictable. Buildings/rooms are detailed, not primitive placeholders.

## 11. Audio asset inventory and limitations

| Category | Status |
|----------|--------|
| Actual recorded voice files | **None.** Manifest `{}`; no audio files in repo. |
| Procedural audio | 8 ambience beds, 6 music modes, ~45 SFX, telephone/radio/phone FX — all Web Audio synthesis. |
| Browser-generated speech | All dialogue via `SpeechSynthesis`, per-character pitch/rate/voice profiles, mimic/far/whisper/radio FX. |
| Missing assets | Recorded voice acting (and optional recorded music/SFX). Import UI and manifest loader already exist. |

Subtitle duration (`lineDur`), mouth movement (`talkTime`) and TTS rate compression use three different word-duration formulas; text can lead/trail the synthetic voice slightly. This is documented rather than represented as lip sync.

## 12. Movie player validation

Source inspection confirms: title screen with runtime/scene/line counts, sound & settings modal (5 volume sliders, quality, subtitles, per-character TTS voice/pitch/rate + Test, session-only file import, dialogue-sheet download), resume logic, play/pause, scrubbing with pointer capture, ±10 s buttons, mute, subtitles, fullscreen, keyboard controls, credits roll with skip, auto-hiding UI, visibility auto-pause and progress save. Pause now truly freezes ambient animation. **Browser playback was not executed in this environment.**

## 13. Performance optimisations

- Adaptive DPR based on measured frame rate; quality presets affecting shadow/lighting detail.
- Shared geometry and material caches for rigs; instanced trees/LEDs; capped rain/dust/fog sprite counts; one environment loaded at a time with disposal.
- Audio lifecycle repairs eliminate per-scene timer/node/listener accumulation across long viewing sessions.
- No heavy external textures or post-processing stack; appropriate for the RTX 3050 4 GB target.

## 14. Test results

- `npm run typecheck`: **pass, 0 errors**.
- `npm run validate`: **pass** — 34 scenes, contiguous, 6 intentional short overlaps, 0 recorded assets.
- `npm run build`: **pass**.
- No pre-existing unit/integration test suite exists; the validator is the added executable regression check. Browser playback tests: **not executable here**.

## 15. Production build results

`npm run build`: **success**, 48 modules transformed, single-file `dist/index.html` ≈ 968 kB. Verified after repairs.

## 16. Remaining limitations

- Runtime 28:25, slightly under the 30 min target.
- No recorded voice acting; synthetic voices only, with estimate-based subtitle timing.
- Creature/fake-actor swap is an instant pop rather than a morph.
- `loadSettings()` parses JSON twice (harmless but untidy); dead `void`-padded locals remain from strict unused checks.
- Minor browser-compat gaps: `ResizeObserver` and `createStereoPanner()` unguarded; `sceneAt()` has no upper bound (currently unused by UI).
- No browser-level playback verification was possible here.

## 17. Recommendations for future improvements

1. Populate `public/audio/voices/manifest.json` with recorded line files using the `sNN_MM.mp3` convention; the loader and import UI already support it.
2. Smooth the fake→creature and father→father2 visibility swaps with a brief opacity/uncanny crossfade.
3. Unify subtitle, mouth and TTS duration calculations into one helper.
4. Add 2–3 authored evidence/standoff scenes to cross the 30-minute mark without altering the ending.
5. Guard `ResizeObserver`/`createStereoPanner` and add `onPointerCancel` for the seek bar.
6. Perform a manual full-playback QA pass (Chrome/Edge) covering seek, pause, mute, subtitles, credits skip and post-credit.

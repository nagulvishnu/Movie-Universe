# THE LAST CALL — Technical Review Report

Project directory: `the-last-call-movie-development/`
Review date: 2026-11-22
Review type: existing-project audit, repair and optimisation (no rebuild)

## 1. Project architecture

- **Stack:** React 19.2.6, Vite 7.3.7, TypeScript 5.9.3 (strict; `noUnusedLocals`/`noUnusedParameters` disabled), Three.js 0.187, **React Three Fiber 9.8.2 + Drei 10.7.9**, `@react-three/postprocessing` 3.2.2, Tailwind 4, `vite-plugin-singlefile`. This is the only one of the three films using declarative R3F scenes.
- **Boot:** `index.html` → `src/main.tsx` → `src/App.tsx` (`title` | `play`, `Player` keyed by start time) → `src/ui/Player.tsx` → `src/stage/MovieCanvas.tsx`.
- **Screenplay compiler:** `src/movie/script/act1.ts`–`act3.ts` + `ending.ts` → `src/movie/compile.ts` → `movie` (35 scenes / 235 shots / 194 lines / 165 cues). `Conductor` (`conductor.ts`) is the clock→world/audio adapter; `stage.ts` is the shared mutable runtime state.
- **Characters:** `src/characters/Human.tsx` — procedural rig with two-bone analytic IK, viseme mouth, blinking, tears, head look-at and hand props; `cast.ts` defines six characters.
- **Environments:** `Road`, `Apartment`, `Places`, `Exchange`, `Underground` with shared `kit.tsx` primitives (canvas textures, rain/dust shaders, phone props, flicker lights).
- **Audio:** `src/audio/engine.ts` (buses, music, ambience, ring motifs, SFX, dialogue), `dsp.ts`, `music.ts` (9 generative sequencers), `sfx.ts` (~38 effects), `assets.ts` (manifest loader), `voice.ts` (SpeechSynthesis fallback).
- **Persistence:** `src/ui/playback.ts` (localStorage progress/volume/mute/subtitles/quality).

## 2. Original condition before modifications

- `npx tsc --noEmit`: **passed**. `npm run build`: **passed** (99 modules, `dist/index.html` ≈ 1.46 MB — the largest of the three due to R3F/Drei/postprocessing).
- 35 contiguous scenes, 235 shots, 194 lines, 165 cues; runtime **1852.57 s (30:52.6)** — inside the 30–40 min target with no padding.
- `public/audio/manifest.json` has empty `dialogue`, `music` and `sfx` maps; no audio files exist under `public/audio/`. The title screen's asset report honestly shows zero recorded files.
- All required story beats are present (see §6); the central mystery is preserved and the credits explicitly state "No monsters were shown in the making of this film."

## 3. Problems identified

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| 1 | Medium | Recorded dialogue buffer sources were created and started with no stored reference; `stopTransient()` could not stop an in-flight recorded line on seek/restart (latent with the empty manifest). | `audio.ts:373-405,414-427` |
| 2 | Medium | Keyboard listener effect had no dependency array, so it was removed/re-added ~5×/second as the 200 ms UI clock re-rendered the player. | `Player.tsx:135-159` |
| 3 | Low | Dragging the volume slider while muted hard-coded `muted:false`, unexpectedly unmuting. | `Player.tsx:112-119` |
| 4 | Low | `document.exitFullscreen()` called unguarded while `requestFullscreen` used `?.` — throws on browsers lacking the API. | `Player.tsx:131` |
| 5 | Low | `AudioEngine` had no `dispose()`; the AudioContext survived player unmount. Music/ambience `setInterval`s were stopped by `stopAll()` but the context stayed open. | `audio.ts:429-441`, `Player.tsx:51-56` |
| 6 | Low / by design | `voice.ts` calls `speechSynthesis.cancel()` before every line, so the five overlapping-in-intent voices of the finale play sequentially; the procedural `voices` SFX supplies the murmur. Changing this would risk unintentional overlap (Rule 6), so it was preserved and documented. | `voice.ts:84`, `act3.ts:204-210` |
| 7 | Low | `Timekeeper` clamps `dt` to 0.1 s; below 10 FPS or after tab throttling the film clock can lag wall time. | `MovieCanvas.tsx:59` |

## 4. Problems repaired

1. `AudioEngine` now keeps a `Set<AudioBufferSourceNode>` of active dialogue sources, stops them before starting a new recorded line, clears them in `stopTransient()`, and removes them on `onended`. Added `dispose()` (stop all + cancel speech + close context); `Player` cleanup now calls it.
2. Keyboard handlers are stored in a `handlersRef` updated each render; the listener effect now has `[]` dependencies, so it registers once while always calling the latest handlers.
3. `setVolume()` now preserves the current mute state instead of forcibly unmuting.
4. `document.exitFullscreen?.()` is guarded.
5. The validator handles Vite's `import.meta.env.BASE_URL` via an esbuild `define`, so the real compiled screenplay can be validated under Node.

## 5. Files and modules changed

- `src/audio/engine.ts`, `src/ui/Player.tsx`
- `package.json` (added `typecheck`, `validate` scripts), `scripts/validate.mjs` (new)

## 6. Screenplay and timeline validation

`npm run validate` compiles the actual `movie` object with esbuild and asserts: contiguous scene starts, positive shot durations, line containment inside shots, no line overlaps, cues within the movie, credits-before-post-credit, and audio-manifest reference integrity.

Result: **35 scenes / 235 shots / 194 lines / 165 cues, 0 gaps, 0 overlaps, 0 containment failures.** Runtime **1852.57 s (30:52.6)**. Ordering: Presents → Narration → Title → Acts I–III → Silence → Credits (`s18`) → post-credit (`s19a`/`s19b`) → The End (`s19c`).

Continuity: 2:17 AM warning call, Daniel/Emily connection, Olivia's death, second victim and photograph, Detective Sarah, abandoned telephone exchange, Victor Hale, Project Echo, Emily's recordings, underground facility, the Daniel/Emily revelation, final call, the decision not to answer the mobile, the little girl's voice, credits and the post-credit boy's call are all present. The landline being disconnected is **implied** (uncancellable "only honest phone"; `off_landline` state at the climax) rather than stated verbatim. The explanation remains psychological/technological ("echoes", copies of memory/personality); no monster is introduced.

## 7. Actual planned runtime

**1852.57 s = 30 min 52.6 s.** This is within the 30–40 minute target. No scenes were added or padded; the figure comes from the existing compiler's deterministic shot/line durations.

## 8. Character animation findings

`Human.tsx` builds each actor from shared primitives, solves two arms with analytic IK, and drives walking/running from a distance-derived stride phase (hip swing, vertical bob, arm swing), plus breathing, tremor, blinking and idle head motion. Emotions interpolate from the `FACES` table; brows, lids and tears are animated. **Mouth movement is implemented**: the current character of the active line is mapped through a vowel table into `mouthO` — a practical lightweight viseme, not professional lip sync. Props (phone, photo, handset, torch, folder) toggle with the shot. No systematic floating/sliding or scale defect; the boy's smaller scale is compensated in camera height math.

## 9. Camera and cinematography findings

`CameraRig` evaluates per-shot `CamSpec`: smoothstep eased `p→p2`/`look→look2`, actor-relative frames with yaw, head-tracked targets, sinusoidal shake/roll and animated FOV. Establishing wides, close-ups, OTS and head-tracked coverage are authored throughout. Two torch spotlights track Daniel/Sarah with a constant light count. `PostFX` provides quality tiers: high = DoF + Bloom + HueSaturation + BrightnessContrast + Noise + Vignette; medium drops DoF; low = Bloom + Vignette. Per-environment colour grading is defined in `GRADE`.

## 10. Environment and visual quality findings

Twelve environments are mapped, each keyed by scene id so it remounts per scene: `void`, `road`, `apartment`, `police`, `park`, `bedroom`, `exchangeExt`, `exchangeInt`, `victor`, `archive`, `facility`, `control`. Room shells are inward-facing; per-env fog/background, flicker/glow/spot lights and GPU-shader rain/dust are used. The facility uses instanced meshes for 24 ringing phones and light grids. Visual identity preserved: mysterious, psychologically unsettling, cinematic.

## 11. Audio asset inventory and limitations

| Category | Status |
|----------|--------|
| Actual recorded assets | **None.** `public/audio/manifest.json` contains empty `dialogue`/`music`/`sfx` objects; no audio files exist. |
| Procedural audio | 9 generative music sequencers, ~38 SFX, ambience beds and telephone ring motifs — all Web Audio. |
| Browser-generated speech | All 194 lines via `SpeechSynthesis` with fixed per-speaker pitch/rate profiles; subtitle-only when unavailable. |
| Missing assets | Recorded dialogue, music and SFX. The manifest loader, per-line ID convention and import/report UI are intact. |

`stopTransient()` correctly replaces the SFX bus to kill one-shots and stops ring/speech; recorded dialogue tails are now stopped too. `voice.ts` cancellation prevents true simultaneous speech by design (finale layering is carried by procedural SFX).

## 12. Movie player validation

Source inspection confirms: title/resume/restart, settings (volume, mute, subtitles, graphics, live asset report), play/pause, scrubbing with act ticks, time display, mute, volume, CC, fullscreen, menu, keyboard controls (Space/M/F/C/←/→), visibility auto-pause, auto-hiding controls, credits roll, post-credit scenes, end card and localStorage save/resume. Volume now preserves mute; keyboard listeners no longer churn; fullscreen exit is guarded. **Browser playback was not executed in this environment.**

## 13. Performance optimisations

- Quality presets materially change the post-processing stack (DoF removed on medium/low, effects reduced on low) and are wired to `stage.quality`.
- Instanced meshes for repeated phones/lights; shared geometry cache in `Human.tsx`/`kit.tsx`; shader-based rain/dust; GPU resource disposal in `Rain`, `WindowRain`, `Dust`, `Cable`, `TextScreen` cleanups.
- Player keyed by start time ensures a clean remount; audio context is now closed on unmount, preventing a long-session resource leak.
- The single-file bundle is the largest of the three (≈ 1.46 MB); acceptable, but the postprocessing stack is the main GPU cost on a 4 GB VRAM laptop — low/medium presets are the recommended default there.

## 14. Test results

- `npm run typecheck`: **pass, 0 errors**.
- `npm run validate`: **pass** — 35 scenes, contiguous, 0 overlaps, 0 recorded assets declared.
- `npm run build`: **pass**.
- No pre-existing unit/integration suite exists; the validator is the added executable regression check. Browser playback tests: **not executable here**.

## 15. Production build results

`npm run build`: **success**, 99 modules transformed, single-file `dist/index.html` ≈ 1,462 kB (gzip ≈ 417 kB). Verified after repairs.

## 16. Remaining limitations

- No recorded audio; all voices synthetic and subtitle timing is compiler-estimate based.
- Finale "many voices" layering is sequential for TTS (intentional, prevents overlap); procedural murmur supplies the effect.
- Frame clock can lag below 10 FPS or after tab throttling.
- Dead `creditsScene` export uses a non-null assertion; fragile only if the scene id is renamed.
- Audio pause suspends the context while music/ambience schedulers keep firing against frozen time; can bunch events on resume (low impact).
- `DepthOfField` target is mutated via a `ref as never` hack; may not follow the tracked look point on all postprocessing versions.
- No browser-level playback verification was possible here.

## 17. Recommendations for future improvements

1. Populate `public/audio/manifest.json` with real dialogue/music/SFX files; the loader, per-line IDs, import UI and asset report already support them.
2. Use wall-clock time (with seek rebasing) instead of clamped frame `dt` for the master clock to remove low-FPS drift.
3. Replace the `DepthOfField` ref hack with the officially supported target prop/hook for the installed postprocessing version.
4. Give the finale a dedicated multi-voice synthesised bed so the "echo chorus" reads as simultaneous without overlapping TTS utterances.
5. Start the RTX 3050 profile on the `low` or `medium` post-processing tier and expose it as the default in settings.
6. Run a manual full-playback QA pass (Chrome/Edge) covering seek, pause, mute, subtitles, credits and both post-credit scenes.

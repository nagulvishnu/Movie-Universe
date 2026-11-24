# TWO SURVIVORS — Technical Review Report

Project directory: `threejs-cinematic-film-development/`
Review date: 2026-11-22
Review type: existing-project audit, repair and optimisation (no rebuild)

## 1. Project architecture

- **Stack:** React 19.2.6, Vite 7.3.7, TypeScript 5.9.3 (strict), Three.js 0.187, Tailwind 4, `vite-plugin-singlefile`. No React Three Fiber — rendering is an imperative Three.js engine owned by React.
- **Boot:** `index.html` → `src/main.tsx` → `src/App.tsx` (`title` | `play` state machine) → `src/components/MoviePlayer.tsx`.
- **Transport:** `src/engine/director.ts` — rAF loop, scene switching at `t >= scene.dur`, cue/music/dialogue firing, fade overlay, throttled React snapshots (~90 ms).
- **Renderer:** `src/engine/stage.ts` owns `WebGLRenderer`, two persistent procedural characters (Arin/Mira), `CinematicCamera`, `LightRig`, `EffectsManager`, `EnvironmentManager`. One environment is built at a time and the previous one is disposed.
- **Screenplay:** `src/story/act1.ts` … `act5.ts` → `src/story/screenplay.ts` (`SCENES`, derived `SCENE_STARTS`, `TOTAL_DURATION`, `locate()`). `helpers.ts` supplies `seq()`, `dur()`, `cover()` and shot constructors; `track.ts` supplies distance-driven actor choreography.
- **Audio:** `src/engine/audio.ts` (fully procedural Web Audio: music moods, ambience layers, ~40 SFX, reverb, buses) and `src/engine/voice.ts` (recorded-file-first, SpeechSynthesis fallback).
- **Persistence:** `src/data/playbackProgress.ts` (localStorage settings + progress).
- **Player UI:** `CinematicHUD`, `AudioControls`, `SubtitleSystem`, `MovieCredits`, `TitleScreen`.

## 2. Original condition before modifications

- `npx tsc --noEmit`: **passed** (zero errors). `npm run build`: **passed** (71 modules, `dist/index.html` ≈ 967 kB).
- No installed `node_modules` initially; dependencies were installed from the committed lockfile (esbuild postinstall was blocked by the npm policy but the platform binary is present and builds work).
- 42 scenes, 0 gaps/overlaps by construction, runtime **1456.43 s (24:16)**.
- No recorded audio: `public/audio/voice/manifest.json` is `{}`; no `.mp3/.wav/.ogg` files exist. 100% of dialogue used browser SpeechSynthesis.
- All story beats were present; no missing characters, scenes or environments.

## 3. Problems identified

| # | Severity | Problem | Evidence |
|---|----------|---------|----------|
| 1 | Severe | `a3_fac2` duration hardcoded to 42 s although its dialogue sequence needs ≈ 53.4 s. Final lines and the closing two-shot were unreachable; all later scenes started ~12 s early. | `act3.ts:114-125,379` |
| 2 | High | `a3_hos2` had two dialogue sequences concatenated with a 0.73 s overlap; `voice.speak()` cancels the first line mid-sentence. | `act3.ts:38-46,211` |
| 3 | High | Deferred `speechSynthesis.speak()` in a 40 ms `setTimeout` could not be cancelled; a line from the outgoing scene could speak over the next one or after a seek. | `voice.ts:67` |
| 4 | Medium | "Continue Watching" saved `progress.t` but always restarted the scene at 0. | `App.tsx:23`, `MoviePlayer.tsx:54` |
| 5 | Medium | `MediaElementAudioSourceNode` and `HTMLAudioElement` leaked on every recorded line; volume was applied twice (utterance + bus). | `voice.ts:66,70-83,93` |
| 6 | Medium | Radio bed started before the `muteDialogue` check; audio context/interval never disposed on player unmount. | `voice.ts:55-57`, `director.ts:130-134` |
| 7 | Medium | `voiceschanged` assigned with `onvoiceschanged`, overwriting other handlers and never removed. | `voice.ts:35` |
| 8 | Low | Unreachable final shots in `a3_br3` and `a4_confess`; end-modal timer not cleared on restart/exit; corrupt localStorage index could dereference `SCENES[-1]`. | `act3.ts:356`, `act4.ts:156`, `MoviePlayer.tsx:38`, `playbackProgress.ts:18` |

## 4. Problems repaired

1. `a3_fac2` now uses `FA2_DUR = dur(FA2, fa2)`; facility blackout (`deadAt`), `silence` music cue and power-down SFX were moved from ~34 s to ~46-48 s so they follow the map/recordings. `a3_fac3` `tOff` now tracks the new duration.
2. `a3_hos2`'s second sequence moved from 21.4 s → 22.8 s, removing the overlap while staying inside the 36 s scene.
3. Unreachable closing shots in `a3_br3`, `a4_confess` and `a3_fac2` moved inside their scene durations.
4. `VoiceEngine` now tracks the speech timer and a generation token, clears both on `cancel()`, applies channel volume only on the audio bus, starts the radio bed only when dialogue is audible, stores/disconnects media-element source nodes, uses `addEventListener`/`removeEventListener` for `voiceschanged`, and exposes `dispose()`.
5. `Director.dispose()` now calls `voice.dispose()` and `audio.dispose()`.
6. `progress.t` is passed through `App.tsx` → `MoviePlayer` → `Director.start(idx, t)` and clamped to the scene duration; the end-UI timer is cleared on cleanup/restart; localStorage index validation and TitleScreen bounds were hardened.

## 5. Files and modules changed

- `src/story/act3.ts`, `src/story/act4.ts`
- `src/engine/voice.ts`, `src/engine/director.ts`
- `src/App.tsx`, `src/components/MoviePlayer.tsx`, `src/components/TitleScreen.tsx`, `src/data/playbackProgress.ts`
- `package.json` (added `typecheck`, `validate` scripts), `scripts/validate.mjs` (new)

## 6. Screenplay and timeline validation

`npm run validate` bundles the actual screenplay modules with esbuild and asserts: contiguous scene starts, positive durations, dialogue containment, no unintended dialogue overlap, shot containment, credits-before-post-credit ordering, and audio-manifest reference integrity.

Result: **42 scenes, 0 gaps, 0 overlaps, 0 dialogue/shot containment failures.** All scenes reachable. Credits (scene 40, `a_credits`) precede the post-credit monitoring scene (41, `pc_monitor`). The 11:47 AM event, Arin/Mira meeting, hospital recordings, abandoned village, bridge storm, Annex Four facility, Station 17 automated beacon, Lena's bracelet, survivor transmission, hopeful sunrise ending and post-credit global survivor-monitoring reveal are all present in source. The ultimate cause of the disappearance is never revealed.

## 7. Actual planned runtime

**1468.39 s = 24 min 28.4 s** (was 24:16 before the facility-timeline repair). This is **below the stated 30–40 min target by roughly 5.5–15.5 minutes**. No time was padded: the increase came entirely from restoring ≈ 11.9 s of already-written facility dialogue.

The existing acts are already narratively dense. Coherent places for future expansion, without inventing a cause or changing the ending, are: more screentime in the hospital recordings (act 3), the village family-video aftermath (act 3), and the Station 17 archive discovery (act 4). These would be new screenplay work, not a technical repair.

## 8. Character animation findings

Arin and Mira are fully procedural rigs (joint hierarchy, face rig with eyelids/brows/mouth, hair/beard variants, hand props). 26 named poses cover idle, walk, run, sit, cry, comfort, crawl, reach, aim, etc. Gait phase is driven by **travelled distance**, which prevents foot sliding. Blinking, breathing, eye tracking and viseme-ish lip movement are layered on top. No static placeholder models. Two-frame pose snapping at scene boundaries masks the track reset. Minor: head-height eye tracking uses the previous frame's world matrix (one-frame lag).

## 9. Camera and cinematography findings

`CinematicCamera` supports orbit/close/ECU/medium, two-shots, over-the-shoulder, fixed dolly/crane and tracking shots, with eased intra-shot moves, handheld shake, wall-collision push-out and floor clamping. Between shots the film uses intentional hard cuts; between scenes it uses dip/fade/flash/black overlays. All authored shots are now within their scene durations. `camera.rotateZ(s.roll * lerp(1,1,u))` remains a dead expression (roll applies instantly) — cosmetic, documented as a limitation.

## 10. Environment and visual quality findings

Nine builders are registered and all are used: city (alive/ruined with the 11:47 stop-and-vanish), highway, supermarket, hospital (generator room + timed power-up), village, bridge (timed deck collapse), facility (world map + blackout), station (procedural terrain, tape archive), monitor (post-credit readout). Lighting has 14 presets with animated sky, stars, fog and flashlight follow. No placeholder geometry remains unintentionally.

## 11. Audio asset inventory and limitations

| Category | Status |
|----------|--------|
| Actual recorded dialogue/music/SFX files | **None.** `public/audio/voice/manifest.json` is `{}`; no audio files in the repo. |
| Procedural sound effects / ambience / music | ~40 SFX, 14 ambience layers, 8 music moods in `audio.ts` — all synthesised at runtime. |
| Browser-generated speech | All 194-line-equivalent dialogue via `SpeechSynthesis`, with per-speaker pitch/rate/voice selection and radio/whisper/shout/whisper styles. |
| Missing audio assets | Recorded voice acting, music stems and Foley are absent. The manifest/file loader is intact and documented for future import. |

Subtitles are computed from a text-length estimate, not from measured speech duration; they can lead or trail the synthetic voice slightly. This is an honest limitation, not a false claim of lip sync.

## 12. Movie player validation

Source inspection confirms: title/intro, skip-intro, pause/resume, volume (3 buses + per-channel mute), subtitles toggle, seek bar with act marks, prev/next scene, restart, fullscreen, keyboard controls (Space/←/→/F/C/M), auto-hiding HUD, progress save/resume (now with intra-scene time), credits roll driven by scene time, end modal, and post-credit scene. **Browser playback was not executed** — no browser automation is available in this environment; verification is source inspection + build + validator only.

## 13. Performance optimisations

- Quality presets (`low`/`balanced`/`high`) affect shadow-map size and effect density; `setQuality` rebuilds shadow maps correctly.
- One environment live at a time with disposal on swap; shared geometry caches; instanced meshes for repeated props; capped particle counts; adaptive rAF delta; distance-driven animation avoids per-frame path maths.
- Repaired resource lifecycle (audio context, interval, speech timer, media-element source nodes, voiceschanged listener) removes leaks across repeated viewing sessions.
- Remaining: canvas `Texture` maps created per environment rebuild are not all disposed — see §16.

## 14. Test results

- `npm run typecheck` (`tsc --noEmit`): **pass, 0 errors**.
- `npm run validate` (new executable timeline/audio validator): **pass** — 42 scenes, contiguous, no dialogue/shot containment failures, 0 recorded assets declared.
- Unit/integration test suites: **none exist in the repository**; no framework is configured. The validator is the executable regression test added for the defects repaired above.
- Browser playback tests: **not executable in this environment**.

## 15. Production build results

`npm run build`: **success**, 71 modules transformed, `dist/index.html` emitted at ≈ 967 kB (single-file bundle). Verified after the repairs.

## 16. Remaining limitations

- Runtime is ~24:28, under the 30–40 min target; meaningful expansion requires new screenplay content.
- No recorded voice acting; all dialogue is synthetic. Subtitles use duration estimation.
- Some canvas-generated textures are not disposed on environment rebuild (low-severity GPU leak over very long sessions).
- Hard cuts between shots (by design) and instant camera roll.
- `file://` opening of the single-file build cannot fetch the voice manifest; it degrades silently to speech synthesis.
- No browser-level playback verification was possible here.

## 17. Recommendations for future improvements

1. Record dialogue into `public/audio/voice/` and populate `manifest.json` using the existing ID convention; the loader already supports it.
2. Add a small duration-measurement hook so subtitles can follow real recorded/synthetic speech length.
3. Add a `Texture.dispose()` pass in `EnvironmentManager.clear()` for canvas textures created by environment builders.
4. Consider 4–6 additional dialogue scenes in hospital/village/station to approach 30 min, without touching the mystery or ending.
5. Replace `lerp(1,1,u)` with a real eased roll interpolation if roll is used in future shots.
6. Run a manual full-playback QA pass in Chrome/Edge with subtitles, seek, mute and fullscreen.

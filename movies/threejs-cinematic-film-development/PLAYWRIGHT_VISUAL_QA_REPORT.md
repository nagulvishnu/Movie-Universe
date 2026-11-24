# TWO SURVIVORS — Playwright Visual QA Report

## Browser and environment
- Playwright 1.65.1, bundled Chromium, headless, 1280×720, **1 worker**.
- WebGL 2.0 via ANGLE/SwiftShader (software). This is **not** the RTX 3050; GPU figures are not representative of that hardware.
- Dev server config `playwright.config.ts`; production-preview config `playwright.preview.config.ts`, project identifier `two-survivors`.

## Test configuration
Shared suites in `tests/shared/` invoked by `tests/two-survivors/*.spec.ts`: startup, player, scenes, playback, performance, audio. Console errors, page errors and failed requests are monitored in every suite.

## Screenshots captured
77 PNG files under `playwright-results/two-survivors/screens/` (title, intro card, first 3D frame, player states, subtitles, seek before/after, credits, post-credit, 6 continuous-playback frames, 14 representative scene frames with `scene-manifest.json`, and all 42 scene frames in `full-sweep/`). Video recording enabled.

## Scenes inspected
42/42 scenes visited in timeline order by the accelerated sweep; 14 representative scenes individually captured, including opening, title, act samples, climax, ending and post-credit. Motion detected in 3 sampled sequences.

## Player functionality results
Play/pause/resume verified; pause freezes the clock; volume, mute and unmute verified; subtitles toggle verified; fullscreen enter/exit verified; seeking changes frame and time; Continue Watching resumes from saved progress; credits and post-credit scenes reachable.

## Rendering issues
None observed. First real 3D frame: nonBlackRatio 0.858, stddev 40.3, 1074 unique colours. The intentionally black opening card is documented separately.

## Console errors / network failures
0 console errors, 0 page errors, 0 failed requests in verified runs. SwiftShader emitted benign GPU-stall warnings during pixel reads.

## Audio behaviour
0 recorded files (as documented previously). 1 SpeechSynthesis utterance observed on dialogue, 5 cancel calls; pause and seek cancel speech; mute suppresses new dialogue.

## Performance observations
Page load 417 ms; first rendered 3D frame 4.7 s; 3.4 FPS under software rendering; 4 long tasks (longest 1998 ms); JS heap 24.8 MB.

## Failed tests
Two transient harness failures occurred under full load (a mute-button click intercepted by the canvas, and a title-screen screenshot protocol error). Both were fixed in the harness (keyboard mute, screenshot retries) and the affected tests passed on rerun.

## Fixes applied
Test-harness only: blank-frame detection calibrated for dark cinematic scenes; seek positioned just before real dialogue lines; keyboard used for controls that auto-hide; screenshot retry logic; Playwright 1.65 video mode corrected. **No application source was changed** — no genuine app defect was found in browser QA.

## Remaining issues
Full 24:28 playback was not observed in real time (accelerated full sweep + a real continuous segment). RTX 3050 performance was not measured.

## Verification categories
Source-level: previously verified. Automated browser: verified. Screenshot-based visual inspection: verified. Complete playback: accelerated full coverage, not real-time. Performance: measured under SwiftShader only.

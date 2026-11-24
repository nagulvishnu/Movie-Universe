# THE SKINWALKER — Playwright Visual QA Report

## Browser and environment
Playwright 1.65.1, headless Chromium, 1280×720, **1 worker**, WebGL 2 via ANGLE/SwiftShader (software renderer, not RTX 3050). Configs: dev `playwright.config.ts`, production preview `playwright.preview.config.ts`, project identifier `skinwalker`.

## Test configuration
Shared suites in `tests/shared/`, invoked from `tests/skinwalker/*.spec.ts`: startup, player, scenes, playback, performance, audio, with console/page/network monitoring throughout.

## Screenshots captured
70 PNG files in `playwright-results/skinwalker/screens/` (title, intro, first 3D frame, player states, subtitles, seek, credits/post-credit, continuous frames, 15 representative scene frames with `scene-manifest.json`, plus 34 full-sweep frames). Video recording enabled.

## Scenes inspected
34/34 scenes visited in order; 15 representative scenes captured individually. Motion detected in 3 sampled sequences. Opening, title, act samples, attack/climax, ending and post-credit covered.

## Player functionality results
Play/pause/resume (pause freezes clock), volume, mute/unmute, subtitles, fullscreen, seek, progress, Continue Watching (resumed at ~46 s), credits skip/post-credit — all verified.

## Rendering issues
None. The intentional night-time darkness initially tripped a too-strict blank-frame heuristic; after calibration the real forest frame measured nonBlackRatio 0.25, stddev 5.9, 30 unique colours — a valid, deliberately dark frame.

## Console errors / network failures
0 console errors, 0 page errors, 0 failed requests in verified runs. Benign SwiftShader GPU-stall warnings during pixel reads.

## Audio behaviour
0 recorded files. 1 SpeechSynthesis utterance observed, 6 cancel calls; pause/seek cancel speech; mute suppresses dialogue.

## Performance observations
Page load 382 ms; first 3D frame 5.6 s; 4.6 FPS under software rendering; 3 long tasks (longest 2933 ms); JS heap 18.4 MB.

## Failed tests
Initial failures were harness issues: strict brightness threshold on a dark scene, hidden-control clicks intercepted by the canvas, and UI-clock lag after seek. All corrected in the harness (calibrated detector, keyboard shortcuts, polling) and reruns passed.

## Fixes applied
Test-harness only. No application source changes were required; no genuine browser defect was found.

## Remaining issues
Full 28:25 playback was not observed in real time. GPU/hardware performance unmeasured. Creature/fake-actor swap pop is a known source-level cosmetic item, not newly detected here.

## Verification categories
Source-level: previously verified. Automated browser: verified. Screenshot-based visual inspection: verified. Complete playback: accelerated full coverage plus real segment. Performance: SwiftShader only.

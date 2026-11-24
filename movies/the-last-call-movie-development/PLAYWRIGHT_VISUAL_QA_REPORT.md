# THE LAST CALL — Playwright Visual QA Report

## Browser and environment
Playwright 1.65.1, headless Chromium, 1280×720, **1 worker**, WebGL 2 via ANGLE/SwiftShader (software renderer, not RTX 3050). Configs: dev `playwright.config.ts`, production preview `playwright.preview.config.ts`, project identifier `last-call`.

## Test configuration
Shared suites in `tests/shared/`, invoked from `tests/last-call/*.spec.ts`: startup, player, scenes, playback, performance, audio, with console/page/network monitoring.

## Screenshots captured
68 PNG files in `playwright-results/last-call/screens/` (title, intentional black studio card, first 3D frame, player states, subtitles, seek, credits/post-credit, continuous frames, 14 representative scene frames with `scene-manifest.json`, 35 full-sweep frames). Video recording enabled.

## Scenes inspected
35/35 scenes visited in order; 14 representative scenes individually captured. Motion detected in 2 sampled sequences. Opening, title, act samples, climax, ending and both post-credit scenes covered.

## Player functionality results
Play/pause/resume (pause freezes clock), volume, mute/unmute (volume preserves mute), subtitles, fullscreen, seek, progress, Continue Watching (resumed at 45 s), credits and post-credit — all verified. This is the heaviest R3F/postprocessing build and still rendered correctly.

## Rendering issues
None. The opening black studio card is intentional; the first real 3D frame measured nonBlackRatio 0.19, stddev 29.5, 991 unique colours.

## Console errors / network failures
0 console errors, 0 page errors, 0 failed requests in verified runs. Minor SwiftShader GPU warnings during pixel reads.

## Audio behaviour
0 recorded files. 1 SpeechSynthesis utterance observed, 5 cancel calls; pause/seek cancel speech; mute suppresses dialogue; finale layering remains procedural/SFX-driven by design.

## Performance observations
Page load 542 ms; first 3D frame 7.0 s; 5.1 FPS under software rendering; 9 long tasks (longest 823 ms); JS heap 28 MB. Highest cost of the three, as expected from R3F + postprocessing.

## Failed tests
The accelerated full sweep initially failed because the DOM clock updates on a 200 ms interval and heavy scene loads delayed seek application. Fixed in the harness by polling until the seek lands; the rerun visited all 35 scenes successfully.

## Fixes applied
Test-harness only. No application source changes were required; no genuine browser defect was found.

## Remaining issues
Full 30:53 playback was not observed in real time. GPU/hardware performance unmeasured. `DepthOfField` target behaviour and tab-throttling clock drift remain source-level items from the earlier audit.

## Verification categories
Source-level: previously verified. Automated browser: verified. Screenshot-based visual inspection: verified. Complete playback: accelerated full coverage plus real segment. Performance: SwiftShader only.

/**
 * Optional Movie Universe bridge. Copy into your movie and call it ONLY if your movie can report
 * real playback state. Set "progress": { "enabled": true } in movie.json to let the hub use it.
 *
 *   import { universe } from "./movie-universe-bridge.js";
 *   universe.ready();
 *   universe.progress(currentSeconds, totalSeconds);   // only report what is truly known
 *   universe.ended();
 *
 * Protocol "movie-universe/1" (see movies/README.md). Messages are only sent to the same origin,
 * and the hub only accepts messages that come from its own embedded iframe + same origin.
 */
function post(message) {
  if (window.parent === window) return;
  window.parent.postMessage({ protocol: "movie-universe/1", ...message }, window.location.origin);
}

export const universe = {
  ready: () => post({ type: "ready" }),
  progress: (position, duration) => post({ type: "progress", position, duration }),
  ended: () => post({ type: "ended" }),
  onHubMessage(handler) {
    window.addEventListener("message", (e) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      if (e.data && e.data.protocol === "movie-universe/1") handler(e.data);
    });
  },
};

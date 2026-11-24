// Movie Universe — movie-scoped PostCSS config.
//
// The hub root has its own postcss.config.mjs ("@tailwindcss/postcss"). Vite resolves PostCSS configs
// upward from the movie root, so without this file a movie build picks up the hub's config and fails
// when the hub's plugins are not installed (they live in the hub's package.json). This movie uses
// Tailwind via "@tailwindcss/vite" in vite.config.ts, so an empty plugin set is enough.
export default { plugins: [] };

// Global playback clock (read by the renderer every frame, no React re-render needed)
export const clock = {
  time: 0, // film time in seconds
  playing: false,
  mode: "title" as "title" | "film",
};

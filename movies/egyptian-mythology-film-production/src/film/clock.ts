// Mutable render-time state shared between the film engine and the 3D layer (read each frame, no React state).
export type Quality = 'low' | 'medium' | 'high';

export const clock = {
  animT: 0, // continuous animation time (advances only while playing)
  progress: 0, // progress through the current scene, 0..1
  sceneTime: 0, // seconds since the current scene began
  sceneDur: 1,
  sceneIdx: 0,
  quality: 'medium' as Quality,
  playing: false,
};

export const qualityScale = (q: Quality) => (q === 'low' ? 0.35 : q === 'medium' ? 0.7 : 1);

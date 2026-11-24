import { TOTAL_DURATION } from '../story/screenplay';

export const MOVIE = {
  title: 'TWO SURVIVORS',
  tagline: "When the whole world disappeared, two strangers became each other's only reason to survive.",
  genres: ['Post-apocalyptic', 'Survival', 'Mystery', 'Thriller', 'Emotional drama'],
  universe: 'A 3D MOVIE UNIVERSE ORIGINAL  ·  FILM ONE',
  runtimeMin: Math.round(TOTAL_DURATION / 60),
  synopsis:
    "Five years after the Day of Silence, a lone paramedic and a radio technician meet in the ruins of a supermarket. A transmission repeats every night at 11:47. Together they travel toward Station 17 — and toward a truth that isn't the truth.",
};

export const CREDITS: { role: string; names: string[] }[] = [
  { role: 'A Movie Universe Original', names: ['TWO SURVIVORS'] },
  { role: 'Story and Screenplay', names: ['Original screenplay written for this production'] },
  { role: 'Characters', names: ['ARIN — former paramedic', 'MIRA — radio technician'] },
  { role: 'Direction', names: ['Screenplay-driven procedural direction', 'Cinematic scene director engine'] },
  { role: 'Cinematography', names: ['Procedural cinematic camera system', 'Shot design: establishing, tracking, over-the-shoulder, close-up, crane'] },
  { role: 'Character Animation', names: ['Procedural rigged characters', 'Facial performance, eye tracking, lip movement, gait blending'] },
  { role: '3D Environments', names: ['The City', 'The Forgotten Highway', 'The Supermarket', 'The Silent Hospital', 'The Village of Empty Homes', 'The Broken Bridge', 'The Research Facility', 'Station 17'] },
  { role: 'Voices', names: ['Browser speech synthesis (fallback)', 'Recorded voice files can be dropped into /audio/voice'] },
  { role: 'Sound Design', names: ['Original procedural Web Audio ambience and effects'] },
  { role: 'Music', names: ['Original generative piano, pads and drones'] },
  { role: 'Production', names: ['Built with React, Vite, TypeScript and Three.js'] },
  { role: '', names: ['Thank you for watching.'] },
];

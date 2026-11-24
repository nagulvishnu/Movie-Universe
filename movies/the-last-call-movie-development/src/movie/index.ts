import { compileMovie } from "./compile";
import { Conductor } from "./conductor";
import { act1 } from "./script/act1";
import { act2 } from "./script/act2";
import { act3 } from "./script/act3";
import { ending } from "./script/ending";

/** The whole film, compiled once from the modular screenplay files. */
export const movie = compileMovie([...act1, ...act2, ...act3, ...ending]);
export const conductor = new Conductor(movie);

/** Index of the credits scene (for the credits overlay and progress ticks) */
export const creditsScene = movie.scenes.find((s) => s.id === "s18")!;

export function fmt(t: number): string {
  const s = Math.max(0, Math.floor(t));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

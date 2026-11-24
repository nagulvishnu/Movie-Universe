export const ROOT: string;
export const MOVIES_DIR: string;
export const REGISTRY_FILE: string;
export const PUBLIC_MOVIES: string;
export const PUBLIC_ART: string;
export function discover(options?: { write?: boolean; syncArt?: boolean }): {
  registry: { schema: number; movies: unknown[]; diagnostics: unknown[] };
  changed: boolean;
};
export function summarize(registry: { movies: { status: string }[] }): Record<string, number>;

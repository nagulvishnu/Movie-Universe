// Movie Universe bridge — type declarations for src/movie-universe-bridge.js (mirrors movies/_template).
export interface UniverseBridge {
  ready(): void;
  progress(position: number, duration: number): void;
  ended(): void;
  onHubMessage(handler: (message: { type: string; position?: number; duration?: number; lang?: string | null }) => void): void;
}

export declare const universe: UniverseBridge;

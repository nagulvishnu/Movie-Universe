import type {
  ActorId,
  ActorSpec,
  CCue,
  CLine,
  CMovie,
  CScene,
  CShot,
  MusicId,
  AmbId,
  RingKind,
  SceneDef,
  SpeakerId,
} from "./types";

const ACTORS: SpeakerId[] = ["daniel", "sarah", "emily", "victor", "olivia", "boy"];

/** Estimated spoken length (seconds). Timeline is deterministic; recorded audio can replace speech without changing it. */
export function lineDuration(text: string, fx?: string, who?: string): number {
  const words = text.trim().split(/\s+/).length;
  const slow = who === "narrator" ? 1.75 : fx === "whisper" ? 1.9 : 2.25;
  const pauses = (text.match(/[.,…?!—]/g) || []).length * 0.13;
  return 0.55 + words / slow + pauses;
}

const DEFAULT_ACTOR: ActorSpec = { p: [0, 0, 0], ry: 0, pose: "stand", em: "neutral" };

export function compileMovie(scenes: SceneDef[]): CMovie {
  const cs: CScene[] = [];
  const shots: CShot[] = [];
  const lines: CLine[] = [];
  const cues: CCue[] = [];
  let T = 0;

  scenes.forEach((sc, si) => {
    const sStart = T;
    let actors: Partial<Record<ActorId, ActorSpec>> = {};
    let st: Record<string, string | number | boolean> = {};
    let ring: RingKind = "none";
    let music: MusicId | null = null;
    let amb: AmbId[] = sc.amb ?? [];
    if (sc.music) music = sc.music === "stop" ? null : sc.music;
    let lineNo = 0;

    sc.shots.forEach((sh) => {
      // carry actors forward (end position becomes start position)
      const next: Partial<Record<ActorId, ActorSpec>> = {};
      for (const k of Object.keys(actors) as ActorId[]) {
        const prev = actors[k]!;
        next[k] = { ...prev, p: prev.to ?? prev.p, ry: prev.ryTo ?? prev.ry, to: undefined, ryTo: undefined };
      }
      if (sh.a) {
        for (const k of Object.keys(sh.a) as ActorId[]) {
          const patch = sh.a[k];
          if (patch === null) delete next[k];
          else if (patch) next[k] = { ...(next[k] ?? DEFAULT_ACTOR), ...patch } as ActorSpec;
        }
      }
      actors = next;
      if (sh.st) st = { ...st, ...sh.st };
      if (sh.ring) ring = sh.ring;
      if (sh.music) music = sh.music === "stop" ? null : sh.music;
      if (sh.amb) amb = sh.amb;

      // sequence dialogue
      let cursor = sh.lead ?? 0.8;
      const sl: CLine[] = [];
      for (const l of sh.l ?? []) {
        const fx = l.fx ?? "none";
        const dur = lineDuration(l.t, fx, l.w);
        const start = cursor + (sl.length ? l.gap ?? 0.45 : 0);
        const cl: CLine = {
          id: `${sc.id}_${lineNo++}`,
          w: l.w,
          text: l.t,
          start: T + start,
          end: T + start + dur,
          fx,
          em: l.em ?? "neutral",
          face: l.f !== undefined ? l.f : ACTORS.includes(l.w) ? (l.w as ActorId) : null,
          tag: l.tag,
          sceneIdx: si,
        };
        sl.push(cl);
        cursor = start + dur;
      }
      const dur = Math.max(sh.d ?? 0, sl.length ? cursor + (sh.tail ?? 0.9) : 0.5);
      // lines were stored with offsets relative to shot start (+T); fine — absolute already
      const shot: CShot = {
        idx: shots.length,
        sceneIdx: si,
        start: T,
        end: T + dur,
        dur,
        cam: sh.cam,
        actors,
        st,
        ring,
        card: sh.card,
        music,
        amb,
        lines: sl,
        fi: sh.fi ?? 0,
        fo: sh.fo ?? 0,
        black: !!sh.black,
      };
      shots.push(shot);
      lines.push(...sl);
      for (const c of sh.cues ?? []) {
        const rel = c[0] < 0 ? dur + c[0] : c[0];
        cues.push({ t: T + rel, n: c[1], o: c[2] ?? {} });
      }
      T += dur;
    });

    cs.push({
      id: sc.id,
      title: sc.title,
      env: sc.env,
      start: sStart,
      end: T,
      fadeIn: sc.fadeIn ?? 0.9,
      fadeOut: sc.fadeOut ?? 0.7,
    });
  });

  cues.sort((a, b) => a.t - b.t);
  return { duration: T, scenes: cs, shots, lines, cues };
}

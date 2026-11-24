import type { SceneDef } from "../types";
import { A, L, V, R, cu, ms, ots, cam, S, PI, VOID, blackShot } from "./dsl";

const T = { torch: "daniel sarah" };

/** ENDING — ONE LAST CALL · CREDITS · POST-CREDIT SCENE */
export const ending: SceneDef[] = [
  /* ------------------------------------------------ escape */
  {
    id: "s17a",
    title: "Escape",
    env: "facility",
    amb: ["machinery", "hum"],
    music: "revelation",
    fadeIn: 0.6,
    shots: [
      S(cam([0, 1.6, 12.6], [0, 1.2, -4], { fov: 42, shake: 0.9 }), {
        d: 4.6,
        ring: "many",
        a: {
          daniel: A([0.2, 0, -6.0], 0, "run", "fear", { to: [0.2, 0, 9.4], hand: "none", arms: "run", look: null }),
          sarah: A([-0.6, 0, -7.4], 0, "run", "fear", { to: [-0.6, 0, 10.6], hand: "torch", look: null }),
        },
        st: { ...T, wave: 2, alarm: true, tape: false, display: "ACTIVE", noCeil: false },
        cues: [[0.0, "steps", { d: 4.6, pace: 0.24 }], [0.0, "alarm", { d: 4.6 }], [0.0, "voices", { d: 4.6 }]],
        l: [L("sarah", "Move! Don't stop!", { em: "fear", f: null }), L("daniel", "Keep going!", { em: "fear", f: null, gap: 0.5 })],
        lead: 0.4,
      }),
      S({ on: "daniel", p: [-1.2, 1.2, 2.2], at: "daniel", fov: 36, shake: 1.0 }, {
        d: 3.6,
        a: { daniel: A([0.2, 0, 3.0], 0, "run", "fear", { to: [0.2, 0, 9.5], hand: "none", arms: "run" }), sarah: A([-0.6, 0, 2.2], 0, "run", "fear", { to: [-0.6, 0, 9.5], hand: "torch" }) },
        cues: [[0.0, "steps", { d: 3.6, pace: 0.24 }]],
      }),
    ],
  },
  {
    id: "s17b",
    title: "Police Arrive",
    env: "exchangeExt",
    amb: ["rain", "wind"],
    music: "ending",
    fadeIn: 0.5,
    shots: [
      S(cam([-5, 1.6, 13], [0, 1.5, 2], { p2: [-3.5, 1.5, 12], fov: 40 }), {
        d: 6,
        a: {
          daniel: A([0.3, 0, 1.2], 0, "run", "fear", { to: [0.8, 0, 6.2], hand: "none", arms: "run" }),
          sarah: A([-0.5, 0, 0.6], 0, "run", "fear", { to: [-0.5, 0, 5.4], hand: "torch" }),
        },
        st: { ...T, sirens: true, cars: true, tape: false },
        cues: [[0.0, "siren", { d: 24 }], [0.0, "steps", { d: 4, pace: 0.26, wet: 1 }], [0.5, "thunder"], [0.5, "v:thunder"]],
        l: [L("sarah", "Seal it! Seal all of it! Nobody goes in!", { em: "angry", f: null, gap: 0 })],
        lead: 2.8,
      }),
      S(cam([0, 1.5, 9.5], [0, 1.4, 4], { fov: 34 }), {
        d: 6,
        a: {
          daniel: A([0.8, 0, 6.2], -PI / 2, "stand", "tired", { look: "sarah", hand: "none", arms: "rest" }),
          sarah: A([-0.5, 0, 5.4], PI / 2, "stand", "worry", { look: "daniel", hand: "none", arms: "rest" }),
        },
        st: { torch: "", tape: true },
        l: [L("sarah", "Daniel...", { em: "worry" }), L("sarah", "Do you believe Emily is still alive?", { em: "sad", gap: 1.0 })],
      }),
      S(cu("daniel", { d: 0.85, x: 0.15, push: 0.2 }), {
        a: { daniel: { em: "sad", look: "sarah" } },
        l: [L("daniel", "I don't know.", { em: "sad" })],
        tail: 2.8,
        music: "ending",
      }),
      S(cam([4, 2.4, 14], [0, 2.6, 0], { p2: [1.5, 3.4, 18], fov: 36 }), {
        d: 8,
        st: { sirens: true },
        a: { daniel: { em: "sad", look: [0, 1.5, 0] }, sarah: { em: "neutral", look: [0, 1.5, 0] } },
      }),
    ],
  },

  /* ------------------------------------------------ one last call */
  {
    id: "s17c",
    title: "One Last Call",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "ending",
    fadeIn: 1.6,
    shots: [
      S(cam([1.0, 1.65, -2.2], [-1.8, 1.1, 2.9], { p2: [1.4, 1.6, -1.6], fov: 40 }), {
        d: 6,
        a: { daniel: A([-1.8, 0, 3.4], PI, "walk", "tired", { to: [-1.25, 0, -0.5], hand: "none", arms: "rest", look: null }), sarah: null },
        st: { day: false, doorOpen: 1, laptop: "", clock: "1:41", off_mob: true, deskmob: true, phoneOn: false, torch: "", sirens: false },
        card: { kind: "loc", text: "HARLOW CITY", sub: "THAT NIGHT  ·  1:41 AM" },
        cues: [[0.0, "doorCreak", { d: 1.6 }], [0.5, "steps", { d: 5, pace: 0.7 }], [5.4, "doorClose"]],
      }),
      S(ms("daniel", { sit: true, d: 1.9, x: 0.7 }), {
        d: 6,
        a: { daniel: A([-1.2, 0, -1.65], PI, "sit", "sad", { arms: "hold", hand: "phone", look: null }) },
        st: { doorOpen: 0 },
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.12, push: 0.1 }), {
        d: 6,
        card: { kind: "tag", text: "DELETE ALL 14 VOICE MEMOS?\n▶ EMILY  ·  0:42" },
        a: { daniel: { em: "sad" } },
      }),
      S(cu("daniel", { sit: true, d: 0.7, x: 0.1, fov: 24 }), {
        d: 5,
        card: { kind: "tag", text: "14 RECORDINGS DELETED" },
        a: { daniel: { em: "cry" } },
        cues: [[0.3, "beep", { f: 500 }]],
      }),
      S(cam([2.4, 1.5, 2.9], [-1.2, 1.0, -1.8], { fov: 36 }), {
        d: 11,
        music: "ending",
        a: { daniel: { hand: "none", arms: "lap", em: "sad", look: [-1.25, 0.9, -2.55] } },
        st: { clock: "2:12" },
        cues: [[3, "heart", { d: 7, bpm: 52, g: 0.25 }]],
      }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 3.5, st: { clock: "2:16" }, music: "stop" }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 1.6, st: { clock: "2:17" }, cues: [[0.05, "impact", { g: 0.6 }]] }),
      S(cam([-0.2, 1.1, -1.5], [-0.55, 0.78, -2.15], { fov: 24, shake: 0.1 }), { d: 4.6, ring: "mobile", st: { phoneText: "UNKNOWN\nNUMBER" }, a: { daniel: { em: "fear" } } }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.15, shake: 0.2 }), {
        d: 4,
        ring: "mobile",
        a: { daniel: { em: "fear", arms: "point", look: [-0.55, 0.8, -2.15] } },
      }),
      S(cu("daniel", { sit: true, d: 0.55, x: 0.0, fov: 20 }), {
        ring: "mobile",
        music: "stop",
        a: { daniel: { arms: "point", em: "worry", look: [-0.55, 0.8, -2.15] } },
        l: [R("emily", "Don't answer when you hear my voice.", { fx: "echo", em: "fear", tag: "EMILY  ·  MEMORY" })],
        lead: 1.2,
        tail: 1.4,
      }),
      S(cu("daniel", { sit: true, d: 0.75, x: 0.12, push: 0.1 }), {
        d: 5,
        ring: "mobile",
        a: { daniel: { arms: "lap", em: "sad", look: [-0.55, 0.8, -2.15] } },
      }),
      S(cam([-0.2, 1.1, -1.5], [-0.55, 0.78, -2.15], { fov: 24 }), {
        d: 6,
        ring: "none",
        st: { phoneOn: true, phoneText: "MISSED CALL\nEMILY REED" },
        cues: [[0.0, "hangup"]],
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.12, push: 0.2 }), {
        d: 9,
        a: { daniel: { em: "cry", arms: "cover", look: null } },
        music: "ending",
      }),
      S(cam([1.7, 1.6, 1.2], [-1.2, 1.15, -1.65], { fov: 34 }), {
        d: 6,
        ring: "old",
        music: "stop",
        a: { daniel: { em: "shock", arms: "lap", look: [2.2, 0.9, -0.6] } },
        cues: [[2.0, "v:glitch"]],
      }),
      S(cam([1.7, 1.6, 1.2], [-1.2, 1.15, -1.65], { fov: 34 }), {
        d: 8,
        ring: "old",
        a: { daniel: { pose: "stand", ryTo: 1.27, em: "fear", arms: "rest", look: [2.2, 0.9, -0.6] } },
        cues: [[0.2, "chair"]],
      }),
      S({ on: "daniel", p: [0.2, 1.65, 1.3], at: "daniel", p2: [0.1, 1.65, 0.8], fov: 28, shake: 0.2 }, {
        d: 7,
        ring: "old",
        a: { daniel: { pose: "walk", to: [1.5, 0, -0.7], em: "fear", look: [2.2, 0.9, -0.6] } },
        cues: [[0.1, "steps", { d: 4, pace: 0.8 }]],
      }),
      S(cam([0.6, 1.2, -1.6], [2.2, 0.88, -0.6], { p2: [1.2, 1.05, -1.1], fov: 26 }), {
        d: 5,
        ring: "old",
        a: { daniel: { pose: "stand", em: "fear", look: [2.2, 0.9, -0.6], ry: PI / 2 } },
      }),
      S(cu("daniel", { d: 0.8, x: 0.15, shake: 0.2 }), {
        ring: "none",
        st: { off_landline: true },
        cues: [[0.2, "pickup"]],
        a: { daniel: { hand: "handset", arms: "ear", em: "fear" } },
        l: [V("girl", "Daniel... thank you for opening the door.", { fx: "whisper", em: "smile" })],
        lead: 1.6,
        tail: 1.4,
      }),
      S(cu("daniel", { d: 0.55, x: 0.0, fov: 20, push: 0.06 }), { d: 3.5, a: { daniel: { em: "shock" } }, cues: [[0.2, "boom"]] }),
    ],
  },
  {
    id: "s17d",
    title: "Silence",
    env: "void",
    fadeIn: 0.05,
    fadeOut: 0.1,
    shots: [blackShot(6, { music: "stop", amb: [] })],
  },
  {
    id: "s18",
    title: "Credits",
    env: "void",
    fadeIn: 0.2,
    fadeOut: 1.2,
    shots: [blackShot(62, { music: "credits", card: { kind: "credits", text: "" } })],
  },

  /* ------------------------------------------------ POST-CREDIT */
  {
    id: "s19a",
    title: "The Real Nightmare",
    env: "facility",
    amb: ["machinery", "hum"],
    music: "stop",
    fadeIn: 1.5,
    fadeOut: 0.2,
    shots: [
      S(cam([0, 1.5, 13.2], [0, 1.1, -11.4], { p2: [0, 1.4, 8], fov: 34 }), {
        d: 8,
        st: { tape: true, wave: 0, alarm: false, display: "", torch: "", noCeil: false },
        card: { kind: "loc", text: "SUB-LEVEL THREE", sub: "SEALED" },
      }),
      S(cam([0, 1.4, 8], [0, 1.1, -11.4], { p2: [0, 1.3, 0], fov: 32, shake: 0.1 }), { d: 14, ring: "red", cues: [[0.5, "flicker"], [7, "flicker"]] }),
      S(cam([0, 1.3, 0], [0, 1.05, -11.4], { p2: [0, 1.17, -8.4], fov: 30, fov2: 20 }), {
        d: 11,
        ring: "none",
        st: { display: "OUTGOING CALL\n2:17 AM" },
        cues: [[0.2, "beep", { f: 800 }], [0.5, "dialtone", { d: 2 }], [3.0, "beep", { f: 900 }], [3.4, "beep", { f: 1000 }], [3.8, "beep", { f: 1100 }], [6.0, "ring-mini", { g: 0.6 }], [8.5, "ring-mini", { g: 0.6 }], [-1.5, "sting"]],
      }),
    ],
  },
  {
    id: "s19b",
    title: "A Little Boy",
    env: "bedroom",
    amb: ["night", "roomtone"],
    music: "stop",
    fadeIn: 0.1,
    fadeOut: 0.2,
    shots: [
      S(cam([1.6, 1.5, 1.4], [0, 0.6, -1.0], { p2: [1.3, 1.4, 1.1], fov: 36 }), {
        d: 7,
        a: { boy: A([0, 0.62, -0.25], 0, "lie", "neutral") },
        card: { kind: "loc", text: "ELSEWHERE", sub: "2:17 AM" },
      }),
      S(cam([0.4, 0.75, -0.9], [0.95, 0.56, -1.55], { fov: 26 }), { d: 5, ring: "old" }),
      S(cam([0.5, 1.2, -0.8], [0, 0.65, -1.12], { fov: 28, shake: 0.1 }), { d: 3.5, ring: "old", a: { boy: { em: "worry" } } }),
      S(cu("boy", { sit: true, d: 0.6, x: 0.08, fov: 26 }), {
        ring: "none",
        a: { boy: A([0, 0.24, -0.8], 0, "sit", "worry", { hand: "handset", arms: "ear", look: null }) },
        st: { off_bedside: true },
        cues: [[0.1, "pickup"]],
        l: [V("daniel", "Hello... can you hear me?", { fx: "whisper" }), L("boy", "Who is this?", { em: "fear", gap: 1.0 }), V("daniel", "It's Daniel.", { fx: "whisper", gap: 1.4 })],
        lead: 1.0,
        tail: 1.2,
      }),
      S(cu("boy", { sit: true, d: 0.5, x: 0.0, fov: 20 }), { d: 3, a: { boy: { em: "shock" } }, cues: [[0.1, "boom"]] }),
    ],
  },
  {
    id: "s19c",
    title: "The End",
    env: "void",
    fadeIn: 0.05,
    fadeOut: 1.6,
    shots: [
      blackShot(4.5, { music: "stop", card: { kind: "title", text: "THE LAST CALL", sub: "" }, cues: [[0.2, "sting"]] }),
      blackShot(5.5, { card: { kind: "end", text: "THE END" } }),
    ],
  },
];

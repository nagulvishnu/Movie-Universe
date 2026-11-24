import type { SceneDef } from "../types";
import { A, L, V, R, cu, ms, ots, cam, S, PI, VOID, blackShot } from "./dsl";

const OLIVIA = A([-0.4, 0, 0.2], PI, "drive", "worry", { look: [-0.4, 1.2, -12] });
const DAN_DESK = A([-1.2, 0, -1.65], PI, "sit", "tired", { arms: "desk", look: [-1.25, 0.95, -2.57] });
const DAN_LIE = A([0.6, 0.68, 1.6], -PI / 2, "lie", "tired");

/** PROLOGUE + ACT I — THE FIRST CALL */
export const act1: SceneDef[] = [
  /* ------------------------------------------------ intro */
  {
    id: "s00a",
    title: "Presents",
    env: "void",
    fadeIn: 1.8,
    fadeOut: 1.2,
    shots: [S(VOID, { d: 6, card: { kind: "studio", text: "MOVIE UNIVERSE", sub: "MOVIE 03" }, cues: [[0.4, "swell", { d: 7 }]] })],
  },
  {
    id: "s00b",
    title: "Narration",
    env: "void",
    amb: ["rain"],
    fadeIn: 0.4,
    fadeOut: 1.6,
    shots: [
      S(VOID, {
        black: true,
        lead: 1.6,
        tail: 2.8,
        l: [
          L("narrator", "Every telephone call begins with a voice.", { f: null, tag: "NARRATOR" }),
          L("narrator", "Sometimes, the person speaking is miles away.", { f: null, gap: 1.0, tag: "NARRATOR" }),
          L("narrator", "Sometimes, they are standing right beside you.", { f: null, gap: 1.0, tag: "NARRATOR" }),
          L("narrator", "And sometimes...", { f: null, gap: 1.3, tag: "NARRATOR" }),
          L("narrator", "You're speaking to someone who no longer exists.", { f: null, gap: 1.8, tag: "NARRATOR" }),
        ],
        cues: [[14, "heart", { d: 6, bpm: 54, g: 0.5 }]],
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 01 — THE WOMAN ON THE ROAD */
  {
    id: "s01",
    title: "The Woman on the Road",
    env: "road",
    amb: ["rain", "car", "city"],
    fadeIn: 1.4,
    fadeOut: 0.1,
    shots: [
      S(cam([9, 3.2, -13], [0, 0.6, 0], { p2: [6.5, 2.0, -8], fov: 38 }), {
        d: 7,
        a: { olivia: OLIVIA },
        card: { kind: "loc", text: "HARLOW CITY", sub: "11:52 PM" },
        cues: [[2.2, "thunder"], [2.2, "v:thunder"]],
      }),
      S(cam([2.5, 1.5, 9], [0, 0.9, -2], { p2: [1.8, 1.2, 6.5], fov: 38 }), { d: 5 }),
      S(cam([0, 9, 2], [0, 0, -3], { p2: [0.5, 6.5, -2], fov: 40 }), { d: 4.5 }),
      S(cu("olivia", { sit: true, d: 1.0, x: 0.1, push: 0.2, fov: 30, shake: 0.25 }), { d: 5, a: { olivia: { em: "tired" } } }),
      S(cam([-0.1, 1.3, 0.95], [-0.4, 1.1, -2], { fov: 42, shake: 0.5 }), { d: 4.5, music: "tension" }),
      S(cam([0.05, 1.3, 0.15], [0, 1.24, -0.3], { fov: 22, shake: 0.4 }), { d: 3.5, a: { olivia: { look: [0, 1.24, -0.3] } } }),
      S(cam([0.15, 0.98, -0.12], [0.38, 0.63, -0.46], { fov: 24, shake: 0.2 }), {
        d: 5,
        ring: "mobile",
        st: { phoneText: "UNKNOWN\nNUMBER" },
        a: { olivia: { look: [0.38, 0.7, -0.46], em: "worry" } },
      }),
      S(cu("olivia", { sit: true, d: 0.9, x: 0.2, shake: 0.3 }), {
        d: 2.5,
        ring: "mobile",
        a: { olivia: { em: "worry", look: [0.38, 0.7, -0.46] } },
      }),
      S(cu("olivia", { sit: true, d: 0.85, x: 0.25, shake: 0.35, push: 0.1 }), {
        ring: "none",
        st: { off_mob: true },
        cues: [[0.1, "pickup"]],
        a: { olivia: { hand: "phone", arms: "ear", em: "fear", look: [-0.4, 1.2, -12] } },
        l: [V("caller", "Don't go home tonight.", { fx: "whisper", em: "fear" }), L("olivia", "Who is this?", { em: "fear", gap: 0.9 }), V("caller", "Because tomorrow, you won't be alive.", { fx: "whisper", gap: 1.1 })],
        tail: 1.0,
      }),
      S(cu("olivia", { sit: true, d: 0.75, x: 0.1, fov: 24, shake: 0.3 }), {
        d: 3.2,
        cues: [[0.1, "hangup"]],
        a: { olivia: { hand: "none", arms: "steer", em: "shock" } },
      }),
      S(cam([0.05, 1.3, 0.15], [0, 1.24, -0.3], { fov: 20, shake: 0.4 }), { d: 3, a: { olivia: { look: [0, 1.24, -0.3], em: "fear" } }, music: "stop" }),
      S(cam([0, 1.2, -0.25], [0, 0.7, 1.4], { fov: 48, shake: 0.2 }), { d: 5, cues: [[1.8, "drip"]] }),
      S(cu("olivia", { sit: true, d: 0.8, x: 0.15, fov: 24, shake: 0.4 }), {
        d: 3.5,
        a: { olivia: { em: "fear", look: [0, 1.24, -0.3] } },
        cues: [[0.4, "radioOn", { d: 3.2 }]],
        st: { radio: true, radioText: "FM 98.1" },
      }),
      S(cam([0.1, 0.9, -0.1], [0.05, 0.64, -0.36], { fov: 26, shake: 0.5 }), {
        st: { radioText: "▒▒ ▒▒▒ ▒▒" },
        lead: 1.2,
        tail: 1.6,
        cues: [[0, "staticBurst", { d: 4, g: 0.8 }]],
        l: [L("girl", "Olivia...", { f: null, fx: "whisper", tag: "RADIO" })],
      }),
      S(cu("olivia", { sit: true, d: 0.7, x: 0.1, fov: 22, shake: 1.2, push: 0.15 }), {
        d: 3.2,
        music: "tension",
        a: { olivia: { em: "shock", look: [0.05, 0.64, -0.36] } },
        cues: [[0.3, "screech"], [0.3, "v:glitch"]],
      }),
      S(cam([-0.2, 1.3, 0.7], [-0.4, 1.0, -3], { fov: 55, shake: 2.5, roll: 0.35 }), {
        d: 2.6,
        a: { olivia: { em: "fear", look: [-0.4, 1.0, -3] } },
        cues: [[0.9, "v:flash"], [0.9, "crash"]],
      }),
      blackShot(3.6, { music: "stop", amb: [] }),
    ],
  },
  {
    id: "s01t",
    title: "Title",
    env: "void",
    fadeIn: 0.1,
    fadeOut: 1.5,
    shots: [
      S(VOID, {
        black: true,
        d: 11,
        music: "mystery",
        card: { kind: "title", text: "THE LAST CALL", sub: "The dead are calling. And tomorrow, someone else will answer." },
        cues: [[0.3, "boom"]],
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 02 — DANIEL'S LIFE */
  {
    id: "s02a",
    title: "Daniel's Life",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "daniel",
    fadeIn: 1.5,
    shots: [
      S(cam([1.8, 1.75, 2.75], [-0.7, 1.0, -1.6], { p2: [1.2, 1.65, 2.3], fov: 42 }), {
        d: 7,
        a: { daniel: DAN_DESK },
        st: { laptop: "HARLOW LEDGER\nINVESTIGATIONS", clock: "", phoneOn: false },
        card: { kind: "loc", text: "HARLOW CITY", sub: "THREE YEARS LATER  ·  11:48 PM" },
        cues: [[0.6, "typing", { d: 5 }]],
      }),
      S(cam([-0.8, 1.3, -1.55], [-1.35, 0.85, -2.45], { p2: [-1.0, 1.2, -1.8], fov: 30 }), { d: 5, cues: [[0.2, "paper"]] }),
      S(cu("daniel", { sit: true, d: 0.95, x: 0.3, push: 0.15 }), {
        l: [
          L("daniel", "Case file forty-one. Another missing person the police quietly stopped looking for.", { em: "tired" }),
          L("daniel", "Same pattern. Same silence. Nobody ever remembers the last thing they heard.", { em: "tired", gap: 1.2 }),
        ],
      }),
      S(cam([-0.85, 1.45, -1.15], [-1.25, 1.0, -2.55], { fov: 30, shake: 0.1 }), {
        l: [L("daniel", "Twelve cases. Not one of them ends with a body.", { em: "worry" })],
        cues: [[0.2, "typing", { d: 3 }]],
      }),
      S(cam([1.0, 1.1, 0.4], [2.2, 0.88, -0.6], { p2: [1.3, 1.05, 0.2], fov: 28 }), {
        a: { daniel: { look: [2.2, 0.9, -0.6] } },
        l: [L("daniel", "I still can't cancel that line. Em called it the only honest phone in the city.", { em: "sad" })],
      }),
      S(ms("daniel", { sit: true, d: 1.9, x: 0.7 }), {
        st: { photo: "siblings" },
        a: { daniel: { hand: "photo", arms: "hold", em: "sad", look: null } },
        l: [L("daniel", "Em...", { em: "sad" }), L("daniel", "You promised you'd call.", { em: "sad", gap: 1.0 })],
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.15, push: 0.3, fov: 26 }), { d: 5, a: { daniel: { em: "sad" } } }),
    ],
  },
  {
    id: "s02b",
    title: "Flashback",
    env: "park",
    amb: ["birds", "city"],
    music: "daniel",
    fadeIn: 1.8,
    fadeOut: 1.6,
    shots: [
      S(cam([2.6, 1.5, 4.2], [0, 0.9, 0], { p2: [1.6, 1.3, 3.4], fov: 34 }), {
        d: 5,
        a: {
          daniel: A([-0.35, 0, 0.08], 0, "sit", "smile", { look: "emily", arms: "lap" }),
          emily: A([0.35, 0, 0.08], 0, "sit", "smile", { look: "daniel", arms: "lap" }),
        },
      }),
      S(cam([0.2, 1.15, 2.3], [0, 1.0, 0], { fov: 30 }), {
        l: [L("emily", "You always take the worst photos, Dan.", { em: "smile" }), L("daniel", "You always blink.", { em: "smile", gap: 0.5 })],
      }),
      S(cu("emily", { sit: true, d: 0.95, x: -0.15, push: 0.15 }), {
        l: [L("emily", "Promise me something. If I ever get lost... you'll answer when I call.", { em: "smile" })],
        a: { emily: { em: "smile" } },
      }),
      S(cu("daniel", { sit: true, d: 0.95, x: 0.15, push: 0.1 }), { l: [L("daniel", "Always.", { em: "smile" })], tail: 1.4 }),
      S(cam([1.0, 1.2, 3.0], [0, 1.0, 0], { p2: [3.4, 2.6, 7.5], fov: 34 }), { d: 5.5, a: { daniel: { em: "smile" }, emily: { em: "smile" } } }),
    ],
  },
  {
    id: "s02c",
    title: "Emily's Recording",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "daniel",
    fadeIn: 1.2,
    shots: [
      S(ms("daniel", { sit: true, d: 2.0, x: 0.8 }), {
        a: { daniel: A([-1.2, 0, -1.65], PI, "sit", "sad", { arms: "hold", hand: "phone", look: null }) },
        st: { laptop: "", phoneOn: true, phoneText: "VOICE MEMO\nEMILY  0:42", off_mob: true, clock: "" },
        l: [R("emily", "Hey, Dan. If you're hearing this, I'm late again. Don't wait up. And eat something that isn't coffee.", { em: "smile" })],
        tail: 1.2,
      }),
      S(cu("daniel", { sit: true, d: 0.85, x: 0.12, push: 0.2 }), {
        a: { daniel: { em: "sad" } },
        l: [L("daniel", "Three years, Em.", { em: "sad" }), L("daniel", "They stopped searching after eight months. I never did.", { em: "sad", gap: 1.2 })],
      }),
      S(cam([2.2, 1.5, 2.9], [-1.2, 1.0, -2.0], { fov: 36 }), { d: 6, a: { daniel: { em: "sad", arms: "hold" } } }),
    ],
  },

  /* ------------------------------------------------ SCENE 03 — 2:17 AM */
  {
    id: "s03",
    title: "2:17 AM",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "stop",
    fadeIn: 1.2,
    fadeOut: 1.0,
    shots: [
      S(cam([-2.2, 1.9, 2.7], [-0.2, 0.9, 0], { p2: [-1.9, 1.7, 2.4], fov: 40 }), {
        d: 5,
        a: { daniel: A([-1.2, 0, -1.65], PI, "walk", "tired", { to: [0.3, 0, 1.3], arms: "rest", hand: "none", look: null }) },
        st: { laptop: "", phoneOn: false, off_mob: false, clock: "2:03" },
        cues: [[0.4, "steps", { d: 4, pace: 0.62 }]],
      }),
      S(cam([-1.6, 1.75, 2.7], [1.5, 0.7, 1.6], { fov: 40 }), {
        d: 8,
        a: { daniel: DAN_LIE },
        st: { clock: "2:09" },
        cues: [[1.5, "heart", { d: 6, bpm: 48, g: 0.3 }]],
      }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 3.5, st: { clock: "2:16" } }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 1.6, st: { clock: "2:17" }, cues: [[0.05, "impact", { g: 0.5 }]] }),
      S(cam([1.9, 0.85, 0.35], [2.22, 0.57, 0.55], { fov: 24 }), { d: 4.6, ring: "mobile", st: { phoneText: "UNKNOWN\nNUMBER" } }),
      S(cam([2.1, 1.45, 1.9], [2.28, 0.74, 1.6], { fov: 28, shake: 0.2 }), { d: 3.4, ring: "mobile", a: { daniel: { em: "worry" } } }),
      S(ms("daniel", { sit: true, d: 1.9, x: 0.6 }), {
        d: 3.6,
        ring: "mobile",
        a: { daniel: A([1.75, 0.1, 1.6], -PI / 2, "sit", "worry", { hand: "phone", arms: "hold", look: null }) },
        st: { off_mob: true, phoneOn: true },
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.2, shake: 0.25 }), {
        ring: "none",
        cues: [[0.1, "pickup"]],
        a: { daniel: { arms: "ear", em: "worry" } },
        st: { phoneOn: false },
        l: [V("olivia", "Daniel... please don't let me die tomorrow.", { fx: "whisper" }), L("daniel", "Who are you?", { em: "worry", gap: 0.8 })],
      }),
      S(cu("daniel", { sit: true, d: 0.5, x: 0.0, fov: 20, push: 0.06 }), {
        a: { daniel: { em: "fear" } },
        l: [V("olivia", "You don't remember me?", { fx: "whisper", em: "sad" })],
        cues: [[2.6, "staticBurst", { d: 1.3, g: 0.9 }], [2.6, "v:glitch"]],
        tail: 1.6,
      }),
      S(ms("daniel", { sit: true, d: 1.7, x: 0.5 }), {
        a: { daniel: { em: "fear" } },
        l: [V("olivia", "Tomorrow... don't let them find me.", { fx: "whisper" })],
        cues: [[-1.0, "hangup"]],
        tail: 1.4,
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.1 }), {
        d: 5,
        a: { daniel: { arms: "hold", em: "worry", look: null } },
        card: { kind: "tag", text: "CALL ENDED  00:41\nNUMBER: —" },
      }),
      S(cu("daniel", { sit: true, d: 0.9, x: 0.1, push: 0.35, fov: 24 }), { d: 7, a: { daniel: { em: "fear", look: [1.2, 1.0, 1.6] } }, cues: [[0.5, "heart", { d: 6, bpm: 66, g: 0.35 }]] }),
    ],
  },

  /* ------------------------------------------------ SCENE 04 — THE FIRST DEATH */
  {
    id: "s04a",
    title: "The First Death",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "stop",
    fadeIn: 1.4,
    shots: [
      S(cam([1.8, 1.75, 2.75], [-0.7, 1.0, -1.6], { fov: 42 }), {
        d: 5,
        a: { daniel: A([-1.2, 0, -1.65], PI, "sit", "tired", { arms: "desk", look: [-1.25, 0.95, -2.57] }) },
        st: { day: true, laptop: "HARLOW LEDGER\nWOMAN FOUND DEAD\nOLIVIA MARSH, 29", clock: "", phoneOn: false, off_mob: false },
        card: { kind: "loc", text: "THE NEXT MORNING", sub: "7:12 AM" },
        amb: ["city", "roomtone"],
      }),
      S(cam([-1.25, 1.1, -1.95], [-1.25, 0.9, -2.57], { p2: [-1.25, 1.05, -2.1], fov: 24 }), { d: 4 }),
      S(cu("daniel", { sit: true, d: 0.9, x: 0.2, push: 0.2 }), {
        a: { daniel: { em: "worry" } },
        l: [L("daniel", "Olivia Marsh. Twenty-nine.", { em: "worry" }), L("daniel", "Found in her apartment, hours after a car accident.", { em: "worry", gap: 0.8 }), L("daniel", "That voice. That was her voice.", { em: "shock", gap: 1.4 })],
        music: "tension",
      }),
      S(ms("daniel", { sit: true, d: 1.8, x: 0.6 }), {
        a: { daniel: { arms: "ear", hand: "phone", em: "worry" } },
        cues: [[0.2, "pickup"]],
        l: [
          L("daniel", "Detective Collins? My name is Daniel Reed. I spoke to Olivia Marsh last night. A few hours before she died.", { em: "worry" }),
          V("sarah", "Mr. Reed. Don't go anywhere. I'll see you at the station.", { gap: 0.9 }),
        ],
        tail: 1.2,
      }),
    ],
  },
  {
    id: "s04b",
    title: "Detective Collins",
    env: "police",
    amb: ["hum", "roomtone"],
    music: "investigation",
    fadeIn: 1.2,
    shots: [
      S(cam([-3.0, 2.0, 3.0], [0.6, 0.9, 0.4], { p2: [-2.4, 1.9, 2.8], fov: 38 }), {
        d: 6,
        a: {
          sarah: A([0.6, 0, -0.55], 0, "sit", "suspicion", { arms: "lap", look: "daniel" }),
          daniel: A([0.6, 0, 1.35], PI, "sit", "tired", { arms: "lap", look: "sarah", hand: "none" }),
        },
        st: { interview: true },
        card: { kind: "loc", text: "HARLOW POLICE DEPARTMENT", sub: "DETECTIVE DIVISION" },
        cues: [[0.5, "door"]],
      }),
      S(ots("daniel", "sarah", { sit: true, d: 0.7, x: 0.3, push: 0.1 }), {
        l: [
          L("sarah", "Mr. Reed. Journalists usually call us after the story breaks. You called before it did.", { em: "suspicion" }),
          L("daniel", "She called me. At 2:17 in the morning.", { em: "worry", gap: 0.7 }),
        ],
      }),
      S(cu("sarah", { sit: true, d: 0.9, x: -0.15, push: 0.12 }), {
        a: { sarah: { em: "suspicion" } },
        l: [L("sarah", "Olivia Marsh didn't have your number. Her phone made no calls after midnight.", { em: "suspicion" })],
      }),
      S(ots("sarah", "daniel", { sit: true, d: 0.7, x: -0.3 }), {
        a: { daniel: { em: "worry", hand: "phone", arms: "hold" } },
        l: [L("daniel", "Then look at mine.", { em: "angry" })],
        cues: [[1.4, "paper"]],
      }),
      S(cu("daniel", { sit: true, d: 0.9 }), { d: 4.5, card: { kind: "tag", text: "2:17 AM  ·  00:41\nUNKNOWN NUMBER" }, a: { daniel: { em: "worry" } } }),
      S(cu("sarah", { sit: true, d: 0.9, x: 0.1, push: 0.2 }), {
        a: { sarah: { em: "suspicion", look: [0.6, 0.8, 0.4] } },
        l: [L("sarah", "Forty-one seconds. And no number.", { em: "suspicion" }), L("sarah", "I either have a ghost, or a man who wants a seat in my investigation.", { em: "suspicion", gap: 1.2 })],
      }),
      S(ms("daniel", { sit: true, d: 2.0, x: 0.8 }), {
        a: { daniel: { em: "angry", hand: "none", arms: "lap", look: "sarah" }, sarah: { look: "daniel" } },
        l: [L("daniel", "I didn't kill her.", { em: "angry" }), L("sarah", "I didn't say you did.", { em: "suspicion", f: "sarah", gap: 1.0 })],
      }),
      S(cu("sarah", { sit: true, d: 0.85, x: 0.15 }), {
        l: [L("sarah", "Stay away from this, Mr. Reed. If you interfere with my case, I will arrest you. Is that clear?", { em: "angry" })],
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.12, push: 0.18 }), {
        a: { daniel: { em: "sad" } },
        l: [L("daniel", "She asked me not to let her die.", { em: "sad" })],
        tail: 1.6,
      }),
      S(cam([-3.0, 2.0, 3.0], [0.6, 0.9, 0.4], { p2: [-2.8, 1.9, 2.4], fov: 38 }), {
        a: { daniel: { pose: "stand", em: "sad", look: "sarah" }, sarah: { em: "suspicion" } },
        l: [L("sarah", "Go home.", { em: "neutral" }), L("daniel", "I can't.", { em: "sad", gap: 1.0 })],
        tail: 2.0,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 05 — THE SECOND CALL */
  {
    id: "s05a",
    title: "The Second Call",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "stop",
    fadeIn: 1.4,
    shots: [
      S(cam([-1.6, 1.7, 2.6], [1.5, 0.8, 1.0], { p2: [-1.2, 1.6, 2.3], fov: 40 }), {
        d: 7,
        a: { daniel: A([1.5, 0.1, 1.15], PI, "sit", "tired", { look: [2.2, 0.6, 0.78], arms: "lap", hand: "none" }) },
        st: { day: false, laptop: "", clock: "2:04", off_mob: false, phoneOn: false },
        card: { kind: "loc", text: "THE FOLLOWING NIGHT", sub: "2:04 AM" },
      }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 3, st: { clock: "2:16" } }),
      S(cam([1.75, 0.82, 0.98], [2.14, 0.6, 0.78], { fov: 22 }), { d: 1.4, st: { clock: "2:17" }, cues: [[0.05, "impact", { g: 0.5 }]] }),
      S(cam([1.9, 0.85, 0.35], [2.22, 0.57, 0.55], { fov: 24 }), { d: 4.2, ring: "mobile", st: { phoneText: "UNKNOWN\nNUMBER" }, a: { daniel: { em: "worry" } } }),
      S(cu("daniel", { sit: true, d: 0.9, x: 0.2, shake: 0.2 }), {
        ring: "none",
        st: { off_mob: true },
        cues: [[0.2, "pickup"]],
        a: { daniel: { hand: "phone", arms: "ear", em: "fear", look: null } },
        l: [V("youngman", "Please... I don't want to die.", { fx: "whisper" }), L("daniel", "Who is this? Where are you?", { em: "fear", gap: 0.7 }), V("youngman", "Look for the photograph.", { fx: "whisper", gap: 1.2 })],
      }),
      S(cu("daniel", { sit: true, d: 0.55, x: 0.0, fov: 20 }), { d: 4, cues: [[0.1, "hangup"]], a: { daniel: { em: "shock", hand: "none", arms: "lap" } } }),
    ],
  },
  {
    id: "s05b",
    title: "The Photograph",
    env: "apartment",
    amb: ["city", "roomtone"],
    music: "tension",
    fadeIn: 1.3,
    fadeOut: 1.0,
    shots: [
      S(cam([1.8, 1.75, 2.75], [-0.7, 1.0, -1.6], { fov: 42 }), {
        d: 5,
        a: { daniel: A([-1.2, 0, -1.65], PI, "sit", "tired", { arms: "desk", look: [-1.25, 0.95, -2.57] }) },
        st: { day: true, laptop: "HARLOW LEDGER\nSECOND DEATH\nMARCUS WEBB, 27", off_mob: false, phoneOn: false, clock: "" },
        card: { kind: "loc", text: "THE NEXT MORNING", sub: "6:50 AM" },
      }),
      S(cu("daniel", { sit: true, d: 0.9, x: 0.2 }), {
        a: { daniel: { em: "worry" } },
        l: [L("daniel", "Marcus Webb. Twenty-seven.", { em: "worry" }), L("daniel", "Look for the photograph.", { em: "fear", gap: 1.0 })],
      }),
      S(cam([-1.0, 1.4, -1.2], [-1.6, 0.8, -2.4], { p2: [-1.3, 1.2, -1.7], fov: 28, shake: 0.2 }), { d: 5, cues: [[0.3, "paper"], [2.2, "paper"]] }),
      S(ms("daniel", { sit: true, d: 1.7, x: 0.6 }), {
        st: { photo: "victims" },
        a: { daniel: { hand: "photo", arms: "hold", em: "shock", look: null } },
        l: [L("daniel", "Olivia... and Marcus.", { em: "shock" }), L("daniel", "They knew each other.", { em: "worry", gap: 1.0 }), L("daniel", "Someone is connecting them.", { em: "fear", gap: 1.2 })],
      }),
      S(cam([0.2, 1.3, 1.0], [2.2, 0.9, -0.6], { p2: [0.9, 1.2, 0.5], fov: 34 }), {
        d: 8,
        ring: "old",
        music: "stop",
        st: { laptop: "" },
        a: { daniel: { hand: "none", arms: "desk", em: "fear", look: [2.2, 0.9, -0.6] } },
        cues: [[2.5, "v:glitch"], [5.5, "sting"]],
      }),
    ],
  },
];

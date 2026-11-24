import type { SceneDef } from "../types";
import { A, L, V, R, cu, ms, ots, cam, S, PI, VOID, blackShot } from "./dsl";

const BOARD: [number, number, number] = [0, 1.7, -3.4];
const TORCHES = { torch: "daniel sarah" };

/** ACT II — THE DEAD KNOW HIS NAME */
export const act2: SceneDef[] = [
  {
    id: "a2",
    title: "Act II",
    env: "void",
    fadeIn: 0.3,
    fadeOut: 1.0,
    shots: [S(VOID, { black: true, d: 5.5, music: "stop", card: { kind: "act", text: "ACT II", sub: "THE DEAD KNOW HIS NAME" }, cues: [[0.3, "swell", { d: 5 }]] })],
  },

  /* ------------------------------------------------ SCENE 06 — THE INVESTIGATION */
  {
    id: "s06",
    title: "The Investigation",
    env: "police",
    amb: ["hum", "roomtone"],
    music: "investigation",
    fadeIn: 1.2,
    shots: [
      S(cam([0, 1.7, 1.6], BOARD, { p2: [0.2, 1.65, 0.9], fov: 40 }), {
        d: 6,
        a: {
          sarah: A([-0.6, 0, -2.7], PI, "stand", "neutral", { arms: "cross", look: BOARD }),
          daniel: A([0.5, 0, -2.7], PI, "stand", "tired", { arms: "think", look: BOARD }),
        },
        st: { interview: false },
        card: { kind: "loc", text: "THREE DAYS IN", sub: "HARLOW POLICE DEPARTMENT" },
      }),
      S(cam([-0.2, 1.8, -1.9], [-0.4, 1.75, -3.46], { p2: [0.15, 1.8, -2.3], fov: 30 }), {
        l: [L("sarah", "Olivia Marsh, twenty-nine. Telephone company accountant. Marcus Webb, twenty-seven. Night-shift security.", { em: "neutral" })],
      }),
      S({ p: [2.0, 1.7, -0.7], at: "daniel", atOff: [0, -0.15, 0], fov: 32 }, {
        a: { daniel: { em: "worry", arms: "think" } },
        l: [L("daniel", "Different lives. Different neighbourhoods. Same photograph.", { em: "worry" }), L("daniel", "Look at the background.", { em: "worry", gap: 1.2 })],
      }),
      S(cam([0.7, 1.9, -2.4], [1.0, 1.9, -3.45], { p2: [0.9, 1.9, -2.7], fov: 24 }), {
        a: { daniel: { arms: "point", look: [1.0, 1.9, -3.45] } },
        l: [L("daniel", "A sign. Half of it's torn away. 'Harlow Telephone... Exchange.'", { em: "worry" }), L("sarah", "That building closed fifteen years ago.", { em: "suspicion", gap: 0.9 })],
      }),
      S({ p: [-0.2, 1.7, 0.9], at: "sarah", atOff: [0, -0.15, 0], fov: 32 }, {
        a: {
          sarah: A([-1.6, 0, -0.4], -PI / 2, "stand", "neutral", { hand: "phone", arms: "ear", look: null }),
          daniel: A([0.5, 0, -2.7], PI, "stand", "worry", { arms: "think", look: BOARD, hand: "none" }),
        },
        cues: [[0.2, "pickup"]],
        l: [
          L("sarah", "Pull every unexplained death with a link to that exchange. Yes. All of them.", { em: "angry" }),
          V("researcher", "Detective, that's fourteen files. Going back fifteen years.", { gap: 1.0 }),
          L("sarah", "Fourteen.", { em: "worry", gap: 0.8 }),
        ],
        tail: 1.2,
      }),
      S(cam([2.5, 1.9, 2.0], [-0.2, 1.2, -0.9], { p2: [1.6, 1.8, 1.4], fov: 36 }), {
        a: {
          sarah: A([-0.2, 0, -0.9], PI, "stand", "worry", { hand: "folder", arms: "hold", look: "daniel" }),
          daniel: A([0.7, 0, -0.9], PI, "stand", "worry", { arms: "cross", look: "sarah", hand: "none" }),
        },
        l: [
          L("sarah", "Fourteen cases. Every one ruled accidental, or unexplained.", { em: "worry" }),
          L("daniel", "Read me the details.", { em: "worry", gap: 0.8 }),
        ],
      }),
      S(cu("sarah", { d: 0.9, x: 0.2, push: 0.18 }), {
        a: { sarah: { em: "worry", look: [-0.2, 1.1, -0.5] } },
        card: { kind: "tag", text: "CASE 0417  ·  UNEXPLAINED\nCALL LOGGED: 2:17 AM" },
        l: [L("sarah", "Every file lists a telephone call. Same time. Always.", { em: "fear" }), L("daniel", "2:17.", { em: "worry", f: null, gap: 0.8 })],
        music: "tension",
      }),
      S(ots("daniel", "sarah", { d: 0.7, x: 0.3 }), {
        a: { daniel: { look: "sarah" }, sarah: { look: "daniel", em: "fear" } },
        l: [L("sarah", "I read these files years ago. I never saw it. How did I never see it?", { em: "fear" }), L("daniel", "Maybe you weren't meant to.", { em: "worry", gap: 1.0 })],
        tail: 1.4,
      }),
      S(cam([-1.5, 1.8, 2.4], [0.1, 1.2, -0.9], { fov: 36 }), {
        d: 6,
        a: { sarah: { em: "neutral", look: "daniel" }, daniel: { em: "tired" } },
        l: [L("sarah", "Whatever this is, I'm not letting you walk into it alone.", { em: "neutral", gap: 1.0 })],
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 07 — EMILY'S VOICE */
  {
    id: "s07",
    title: "Emily's Voice",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "daniel",
    fadeIn: 1.4,
    shots: [
      S(cam([1.8, 1.75, 2.75], [-0.7, 1.0, -1.6], { p2: [1.3, 1.65, 2.4], fov: 42 }), {
        d: 6,
        a: { daniel: A([-1.2, 0, -1.65], PI, "sit", "tired", { arms: "hold", hand: "phone", look: null }), sarah: null },
        st: { day: false, laptop: "EMILY REED\nMISSING 3 YRS", clock: "", off_mob: true, phoneOn: false },
        card: { kind: "loc", text: "2:16 AM", sub: "" },
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.2, shake: 0.15 }), {
        d: 4.5,
        ring: "mobile",
        music: "tension",
        a: { daniel: { em: "worry" } },
        st: { phoneOn: true, phoneText: "UNKNOWN\nNUMBER" },
      }),
      S(cu("daniel", { sit: true, d: 0.8, x: 0.15, shake: 0.15 }), {
        ring: "none",
        cues: [[0.1, "pickup"]],
        a: { daniel: { arms: "ear", em: "worry" } },
        st: { phoneOn: false },
        l: [V("emily", "Daniel...", { fx: "whisper", em: "sad" })],
        tail: 1.2,
      }),
      S(cu("daniel", { sit: true, d: 0.5, x: 0.0, fov: 20 }), { d: 5, a: { daniel: { em: "shock" } }, music: "stop", cues: [[0.2, "heart", { d: 4, bpm: 60, g: 0.5 }]] }),
      S(cu("daniel", { sit: true, d: 0.85, x: 0.12, push: 0.12 }), {
        a: { daniel: { em: "fear" } },
        l: [V("emily", "Why did you leave me there?", { fx: "whisper", em: "sad" })],
        tail: 1.8,
      }),
      S(cu("daniel", { sit: true, d: 0.7, x: 0.1, shake: 0.3 }), {
        a: { daniel: { em: "cry" } },
        l: [L("daniel", "Emily? Emily, where are you?", { em: "cry" }), V("emily", "Under the station.", { fx: "whisper", gap: 1.6, em: "sad" })],
        cues: [[-0.9, "staticBurst", { d: 0.9 }], [-0.1, "hangup"]],
        tail: 1.3,
      }),
      S(cu("daniel", { sit: true, d: 0.85, x: 0.12, push: 0.3, fov: 26 }), {
        d: 9,
        music: "daniel",
        a: { daniel: { arms: "cover", hand: "none", em: "cry" } },
      }),
      S(cam([-0.9, 1.15, -1.7], [-0.78, 0.86, -2.3], { p2: [-0.85, 1.0, -2.0], fov: 26 }), { d: 5, a: { daniel: { em: "cry" } } }),
      S(cam([2.2, 1.5, 2.9], [-1.2, 1.0, -2.0], { fov: 38 }), { d: 7, a: { daniel: { arms: "cover", em: "cry" } } }),
      S(ms("daniel", { sit: true, d: 1.8, x: 0.7 }), {
        a: { daniel: { arms: "ear", hand: "phone", em: "worry" } },
        cues: [[0.2, "pickup"]],
        l: [L("daniel", "Sarah. It was Emily. She told me she's under the station.", { em: "worry" }), V("sarah", "Where are you? Stay there. I'm coming.", { gap: 0.9 })],
        tail: 1.2,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 08 — THE ABANDONED EXCHANGE */
  {
    id: "s08a",
    title: "The Abandoned Telephone Exchange",
    env: "exchangeExt",
    amb: ["rain", "wind"],
    music: "stop",
    fadeIn: 1.3,
    shots: [
      S(cam([-6, 2.5, 10], [0, 4, 0], { p2: [-3.5, 2.2, 8.5], fov: 38 }), {
        d: 8,
        a: {
          sarah: A([-1.2, 0, 10], PI, "walk", "neutral", { to: [-0.7, 0, 3.6], hand: "torch" }),
          daniel: A([1.0, 0, 10.8], PI, "walk", "worry", { to: [0.8, 0, 3.4], hand: "torch" }),
        },
        st: { ...TORCHES, tape: false, sirens: false, cars: false },
        card: { kind: "loc", text: "HARLOW TELEPHONE EXCHANGE", sub: "CLOSED FIFTEEN YEARS" },
        cues: [[1.8, "thunder"], [1.8, "v:thunder"], [0.5, "steps", { d: 7, pace: 0.55, wet: 1 }]],
      }),
      S({ on: "daniel", p: [0.4, 1.75, -2.6], p2: [0.4, 1.75, -1.1], look: [0, 2.2, 0], fov: 40, shake: 0.5 }, {
        d: 5,
        a: { sarah: { to: [-0.7, 0, 2.6] }, daniel: { to: [0.8, 0, 2.4] } },
      }),
      S(cam([0, 1.1, 6.2], [0, 1.9, 0], { fov: 30 }), {
        a: { sarah: A([-0.7, 0, 2.6], PI, "stand", "suspicion", { hand: "torch", look: [0, 2.2, 0] }), daniel: A([0.8, 0, 2.4], PI, "stand", "worry", { hand: "torch", look: [0, 2.2, 0] }) },
        l: [
          L("sarah", "Sealed fifteen years ago. A court order, and no explanation.", { em: "suspicion" }),
          L("daniel", "Somebody kept the power on.", { em: "worry", gap: 1.0 }),
          L("sarah", "Stay behind me.", { em: "neutral", gap: 0.9 }),
        ],
      }),
      S(cam([0.5, 1.3, 1.6], [0, 1.0, 0.2], { fov: 26, shake: 0.4 }), {
        d: 4.5,
        a: { sarah: { to: [-0.3, 0, 0.9], pose: "walk" } },
        cues: [[0.4, "lock"], [2.4, "door"], [2.5, "doorCreak", { d: 2 }]],
      }),
    ],
  },
  {
    id: "s08b",
    title: "Inside the Exchange",
    env: "exchangeInt",
    amb: ["exchange", "hum"],
    music: "underground",
    fadeIn: 1.2,
    shots: [
      S(cam([0, 1.7, -3.5], [0, 1.3, 6], { p2: [0, 1.5, -2.0], fov: 40 }), {
        d: 9,
        a: {
          sarah: A([-0.5, 0, 8.3], PI, "walk", "suspicion", { to: [-0.5, 0, 1.2], hand: "torch" }),
          daniel: A([0.7, 0, 8.0], PI, "walk", "worry", { to: [0.7, 0, 1.6], hand: "torch" }),
        },
        st: { ...TORCHES, tape: false, doorOpen: 0, monitor: "" },
        card: { kind: "loc", text: "INSIDE THE EXCHANGE", sub: "" },
        cues: [[0.2, "steps", { d: 8, pace: 0.6 }], [1.0, "switchboard", { d: 8 }]],
      }),
      S(cam([-1.5, 1.25, 4.0], [-3.6, 0.9, 1.0], { p2: [-1.5, 1.25, -3.5], look2: [-3.6, 0.9, -4], fov: 38 }), {
        d: 7,
        a: { sarah: { to: [-0.5, 0, -1.8] }, daniel: { to: [0.7, 0, -1.0] } },
        l: [L("sarah", "Look at this place. Every line still plugged in.", { em: "worry", f: null }), L("daniel", "Rows and rows of telephones. As if everyone just got up and left.", { em: "worry", f: null, gap: 1.0 })],
      }),
      S(cam([0, 0.4, 0], [0.5, 4.2, -4], { p2: [0, 0.5, -1], fov: 50, shake: 0.2 }), { d: 4.5, a: { sarah: { to: [-0.5, 0, -3.4] }, daniel: { to: [0.7, 0, -2.6] } }, cues: [[1.5, "spark"]] }),
      S(cam([0, 1.9, -5.5], [0, 2.1, -8.4], { fov: 32 }), {
        d: 5,
        a: { sarah: { to: [-0.5, 0, -4.2] }, daniel: { to: [0.5, 0, -4.2], look: [1.3, 2.1, -8.4] } },
        l: [L("daniel", "Employee portraits. Half of them are crossed out.", { em: "worry", f: null })],
      }),
      S(cam([-1.5, 1.4, -5.4], [-2.5, 1.2, -8.4], { fov: 34 }), {
        a: { sarah: A([-1.8, 0, -7.2], PI, "stand", "neutral", { look: [-2.5, 1.2, -8.4], hand: "torch" }), daniel: A([-0.6, 0, -6.8], PI, "stand", "worry", { look: [-2.5, 1.2, -8.4], hand: "torch" }) },
        cues: [[0.6, "lock"], [1.1, "lock"]],
        l: [L("sarah", "Basement door. Locked from the outside.", { em: "suspicion" }), L("daniel", "Of course it is.", { em: "tired", gap: 0.8 })],
      }),
      S(cam([2.8, 1.7, -1.8], [0, 1.0, -5.5], { p2: [2.0, 1.6, -2.6], fov: 36 }), {
        d: 6,
        a: {
          sarah: A([-0.6, 0, -4.4], PI, "stand", "worry", { hand: "none", look: [0, 1.0, -5.6] }),
          daniel: A([0.5, 0, -4.4], PI, "stand", "worry", { hand: "none", look: [0, 1.0, -5.6] }),
        },
        st: { torch: "daniel sarah", tape: false, monitor: "REEL 0912\nD. REED" },
        cues: [[0.5, "paper"]],
        l: [L("sarah", "Reels. Hundreds of them. Every conversation labelled by date.", { em: "worry" }), L("daniel", "Phone calls. Somebody recorded all of it.", { em: "worry", gap: 0.8 })],
      }),
      S(cu("sarah", { d: 0.9, x: 0.2 }), {
        a: { sarah: { em: "suspicion", look: [0, 1.0, -5.6] } },
        l: [L("sarah", "Daniel. This one has your name on it.", { em: "suspicion" })],
      }),
      S(cu("daniel", { d: 0.9, x: -0.15, push: 0.2 }), {
        a: { daniel: { em: "shock", look: [0, 1.0, -5.6] } },
        l: [L("daniel", "That's impossible. I've never been here.", { em: "shock" })],
      }),
      S(cam([0.8, 1.35, -4.4], [0.1, 1.05, -5.6], { p2: [0.5, 1.3, -4.9], fov: 28 }), {
        d: 8,
        st: { tape: true, monitor: "REEL 0912\n▶ PLAYING" },
        cues: [[0.2, "tape", { d: 5 }], [0.6, "staticBurst", { d: 1.6, g: 0.5 }]],
        music: "stop",
        l: [R("daniel", "Emily... don't answer the phone.", { em: "fear", gap: 0.2 })],
        lead: 2.2,
        tail: 1.4,
      }),
      S(cu("daniel", { d: 0.7, x: 0.1, push: 0.12, fov: 24 }), {
        st: { tape: false, monitor: "REEL 0912\nD. REED" },
        a: { daniel: { em: "fear", look: [0.1, 1.0, -5.6] } },
        l: [L("daniel", "That's my voice. I never said that. I don't remember saying that.", { em: "fear" })],
      }),
      S(cu("sarah", { d: 0.85, x: 0.2, push: 0.15 }), {
        a: { sarah: { em: "suspicion", look: "daniel" } },
        l: [L("sarah", "The label says three years ago, Daniel. What aren't you telling me?", { em: "suspicion" }), L("daniel", "Nothing. I swear. I don't remember any of it.", { em: "fear", f: null, gap: 1.0 })],
        tail: 1.6,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 09 — VICTOR HALE */
  {
    id: "s09",
    title: "Victor Hale",
    env: "victor",
    amb: ["rain", "roomtone"],
    music: "stop",
    fadeIn: 1.4,
    shots: [
      S(cam([0.3, 1.6, 2.4], [0.3, 0.9, -0.8], { p2: [0.2, 1.5, 2.0], fov: 38 }), {
        d: 6,
        a: {
          victor: A([1.3, 0, -0.7], -PI / 2, "sit", "neutral", { arms: "lap", look: "daniel" }),
          daniel: A([-0.7, 0, -0.3], PI / 2, "sit", "tired", { arms: "lap", look: "victor", hand: "none" }),
          sarah: A([-0.6, 0, -1.8], PI / 2, "stand", "suspicion", { arms: "cross", look: "victor", hand: "none" }),
        },
        st: { torch: "" },
        card: { kind: "loc", text: "PINECREST ROAD", sub: "VICTOR HALE  ·  RETIRED EXCHANGE TECHNICIAN" },
        cues: [[0.5, "knock"]],
      }),
      S(ots("daniel", "victor", { sit: true, d: 0.7, x: 0.28 }), {
        l: [L("daniel", "Mr. Hale. Thank you for seeing us.", { em: "neutral" }), L("victor", "Visitors rarely find Pinecrest Road. You said you wanted to talk about the exchange.", { em: "neutral", gap: 1.2 })],
      }),
      S(cu("victor", { sit: true, d: 1.0, x: -0.1 }), {
        l: [L("daniel", "Does 2:17 mean anything to you?", { em: "neutral", f: null })],
        tail: 2.4,
        lead: 0.4,
      }),
      S(cu("victor", { sit: true, d: 0.9, x: 0.0, push: 0.3, fov: 24 }), {
        d: 8,
        a: { victor: { em: "fear" } },
        l: [L("victor", "Where did you hear that number?", { em: "fear" })],
        lead: 3.0,
        tail: 2.2,
      }),
      S(ots("victor", "daniel", { sit: true, d: 0.8, x: -0.3 }), {
        a: { daniel: { em: "worry" } },
        l: [L("daniel", "Someone who's already dead called me. At exactly that time.", { em: "worry" })],
        tail: 2.2,
      }),
      S(cu("victor", { sit: true, d: 1.0, x: 0.1, push: 0.15, fov: 26 }), {
        l: [
          L("victor", "Fifteen years ago, several of us at the exchange began receiving calls.", { em: "fear" }),
          L("victor", "From people... who had already died.", { em: "sad", gap: 2.0 }),
        ],
        tail: 2.0,
      }),
      S(cu("sarah", { d: 1.0, x: 0.25 }), {
        a: { sarah: { em: "suspicion", look: "victor" } },
        l: [L("sarah", "Tricks. Recordings.", { em: "suspicion" })],
      }),
      S(cu("victor", { sit: true, d: 0.95, x: -0.1 }), {
        a: { victor: { look: [0.3, 1.2, -0.7] } },
        l: [L("victor", "Voices. Their voices. Answering questions only they could answer.", { em: "sad" })],
        tail: 2.4,
      }),
      S(cam([0.3, 1.5, 2.4], [0.3, 0.9, -0.8], { p2: [0.3, 1.35, 1.6], fov: 36 }), {
        d: 14,
        a: { victor: { look: null, em: "fear" } },
        l: [
          L("victor", "One night, every telephone in the building rang at once.", { em: "fear" }),
          L("victor", "We answered. All of us.", { em: "fear", gap: 2.0 }),
          L("sarah", "And?", { em: "suspicion", gap: 1.4, f: "sarah" }),
          L("victor", "We heard our own voices.", { em: "fear", gap: 2.2 }),
        ],
        tail: 2.4,
      }),
      S(cu("victor", { sit: true, d: 0.8, x: 0.05, push: 0.25, fov: 22 }), {
        a: { victor: { em: "sad", look: null } },
        l: [L("victor", "After that night... we stopped answering.", { em: "sad" })],
        tail: 2.8,
      }),
      S(ots("victor", "daniel", { sit: true, d: 0.8, x: -0.3, push: 0.1 }), {
        a: { daniel: { em: "worry", look: "victor" } },
        l: [L("daniel", "Where were the calls coming from?", { em: "worry" })],
        tail: 2.0,
      }),
      S(cu("victor", { sit: true, d: 1.2, x: 0.0, fov: 24 }), {
        d: 11,
        a: { victor: { em: "fear", look: [0.3, 1.1, 1.0] } },
        l: [L("victor", "We never found out.", { em: "fear" }), L("victor", "Some telephones, Mr. Reed, should be left to ring.", { em: "sad", gap: 3.2 })],
        cues: [[3.6, "ring-mini"], [7.5, "ring-mini", { g: 0.6 }]],
        tail: 3.0,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 10 — SARAH'S CALL */
  {
    id: "s10",
    title: "Sarah's Call",
    env: "apartment",
    amb: ["rain", "roomtone"],
    music: "tension",
    fadeIn: 1.4,
    shots: [
      S(cam([2.2, 1.8, 2.8], [-1.0, 0.9, 0], { p2: [1.6, 1.7, 2.5], fov: 40 }), {
        d: 6,
        a: {
          daniel: A([-1.2, 0, -1.65], PI, "sit", "tired", { arms: "hold", hand: "phone", look: null }),
          sarah: A([-1.95, 0, 1.3], PI / 2, "sit", "tired", { arms: "lap", hand: "phone", look: null }),
        },
        st: { day: false, laptop: "", clock: "", off_mob: true, phoneOn: false, torch: "" },
        card: { kind: "loc", text: "2:17 AM", sub: "" },
      }),
      S(cu("sarah", { sit: true, d: 0.85, x: 0.2, shake: 0.2 }), { d: 4.2, ring: "mobile", a: { sarah: { em: "worry", arms: "hold" } } }),
      S(cu("sarah", { sit: true, d: 0.8, x: 0.15, shake: 0.2 }), {
        ring: "none",
        cues: [[0.1, "pickup"]],
        a: { sarah: { arms: "ear", em: "worry" } },
        l: [V("father", "Sarah... it's Dad.", { fx: "whisper" }), L("sarah", "...Dad?", { em: "shock", gap: 1.2 })],
      }),
      S(cu("sarah", { sit: true, d: 0.55, x: 0.0, fov: 20, push: 0.06 }), {
        a: { sarah: { em: "fear" } },
        l: [V("father", "You should never have trusted Daniel.", { fx: "whisper" })],
        cues: [[2.6, "staticBurst", { d: 0.8 }]],
        tail: 1.6,
      }),
      S(cu("sarah", { sit: true, d: 0.8, x: 0.2 }), {
        a: { sarah: { em: "angry" } },
        l: [L("sarah", "Who is this?", { em: "angry" })],
        cues: [[-0.8, "hangup"]],
        tail: 1.6,
      }),
      S(ms("sarah", { sit: true, d: 2.0, x: 0.9 }), {
        d: 3.8,
        a: { sarah: { arms: "hold", em: "fear", look: "daniel" }, daniel: { look: "sarah", em: "worry" } },
      }),
      S(cu("daniel", { sit: true, d: 0.85, x: 0.2 }), {
        d: 4.2,
        ring: "mobile",
        a: { daniel: { em: "fear" } },
        st: { off_mob: true },
      }),
      S(cu("daniel", { sit: true, d: 0.75, x: 0.15, shake: 0.2 }), {
        ring: "none",
        cues: [[0.1, "pickup"]],
        a: { daniel: { arms: "ear", em: "fear" } },
        l: [V("daniel", "Tomorrow, Sarah will die.", { fx: "phone", em: "neutral" })],
        tail: 1.4,
      }),
      S(cam([0.3, 1.5, 1.2], [-1.6, 1.05, 0.2], { fov: 34 }), {
        d: 5,
        cues: [[0.1, "hangup"]],
        a: { daniel: { arms: "hold", em: "fear", look: "sarah" }, sarah: { em: "fear", look: "daniel" } },
      }),
      S(ots("sarah", "daniel", { sit: true, d: 0.8, x: 0.3 }), {
        a: { daniel: { em: "worry" }, sarah: { em: "angry" } },
        l: [
          L("sarah", "That wasn't my father.", { em: "angry" }),
          L("daniel", "And that wasn't me. But it sounded exactly like me.", { em: "fear", gap: 1.0 }),
          L("sarah", "It's using our voices. To turn us against each other.", { em: "worry", gap: 1.0 }),
          L("daniel", "Then it's working.", { em: "sad", gap: 1.0 }),
          L("sarah", "No. It isn't.", { em: "neutral", gap: 1.0 }),
        ],
        tail: 1.6,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 11 — THE HIDDEN CONNECTION */
  {
    id: "s11a",
    title: "The Hidden Connection",
    env: "police",
    amb: ["hum", "roomtone"],
    music: "investigation",
    fadeIn: 1.4,
    shots: [
      S(cam([0, 1.7, 1.6], BOARD, { p2: [0.1, 1.7, 0.8], fov: 40 }), {
        d: 5,
        a: {
          sarah: A([-0.2, 0, -0.9], PI, "stand", "worry", { hand: "folder", arms: "hold", look: "daniel" }),
          daniel: A([0.7, 0, -0.9], PI, "stand", "tired", { arms: "cross", look: "sarah", hand: "none" }),
        },
        st: { interview: false },
        card: { kind: "loc", text: "THE NEXT MORNING", sub: "" },
      }),
      S(ots("daniel", "sarah", { d: 0.7, x: 0.3 }), {
        l: [
          L("sarah", "Olivia Marsh. Marcus Webb. Both listed on a maintenance contract. Fifteen years ago.", { em: "worry" }),
          L("sarah", "An accident. Sub-level three, beneath the Harlow exchange.", { em: "worry", gap: 0.8 }),
        ],
      }),
      S(cu("daniel", { d: 0.9, x: -0.15, push: 0.2 }), {
        a: { daniel: { em: "worry", look: "sarah" } },
        l: [L("daniel", "A facility? Under a telephone exchange?", { em: "worry" }), L("sarah", "On paper, a cable vault.", { em: "suspicion", f: "sarah", gap: 0.8 })],
      }),
      S(ms("daniel", { d: 1.9, x: 0.6 }), {
        a: { daniel: { hand: "folder", arms: "hold", em: "shock", look: [0.7, 1.0, -0.5] } },
        st: { photo: "single" },
        cues: [[0.4, "paper"]],
        l: [
          L("daniel", "Emily's notebook. Her last entry.", { em: "shock" }),
          L("daniel", "She wrote down the same address. A week before she vanished.", { em: "sad", gap: 1.0 }),
          L("daniel", "Emily was investigating this place.", { em: "fear", gap: 1.2 }),
        ],
        tail: 1.6,
      }),
    ],
  },
  {
    id: "s11b",
    title: "Beneath the Exchange",
    env: "archive",
    amb: ["machinery", "hum"],
    music: "underground",
    fadeIn: 1.5,
    fadeOut: 0.3,
    shots: [
      S(cam([0, 1.7, -6.9], [0, 1.4, 6], { p2: [0, 1.6, -5.8], fov: 40 }), {
        d: 9,
        a: {
          daniel: A([0.5, 0, 6.2], PI, "walk", "worry", { to: [0.5, 0, -3.4], hand: "torch" }),
          sarah: A([-0.5, 0, 6.8], PI, "walk", "suspicion", { to: [-0.6, 0, -3.1], hand: "torch" }),
        },
        st: { ...TORCHES, screen: "", screen2: "", screen3: "" },
        card: { kind: "loc", text: "SUB-LEVEL THREE", sub: "BENEATH THE EXCHANGE" },
        cues: [[0.2, "steps", { d: 9, pace: 0.62 }], [0.2, "doorCreak", { d: 2 }]],
      }),
      S(cam([-1.0, 1.4, -2.2], [-2.7, 1.2, -4.5], { p2: [-0.4, 1.4, -2.8], fov: 36 }), {
        d: 6,
        a: { daniel: A([0.3, 0, -3.8], PI, "stand", "worry", { hand: "torch", look: [-2.7, 1.2, -4.5] }), sarah: A([-0.7, 0, -3.6], PI, "stand", "worry", { hand: "torch", look: [0, 1.2, -6.1] }) },
        l: [L("sarah", "Archive. Whoever built this didn't want it found.", { em: "worry" })],
      }),
      S(cam([0, 1.3, -4.6], [0, 1.2, -6.1], { fov: 30 }), {
        d: 4,
        st: { screen: "ACCESS CODE:\n_ _ _ _", torch: "" },
        a: { daniel: A([0.3, 0, -5.0], PI, "stand", "worry", { arms: "desk", hand: "none", look: [0, 1.2, -6.1] }), sarah: A([-0.8, 0, -5.0], PI, "stand", "worry", { hand: "none", look: [0, 1.2, -6.1] }) },
        cues: [[0.4, "beep", { f: 900 }]],
      }),
      S(cu("daniel", { d: 0.9, x: 0.15 }), {
        a: { daniel: { em: "worry", look: [0, 1.2, -6.1] } },
        l: [L("daniel", "Try Emily's birthday.", { em: "sad" }), L("sarah", "How can you know?", { em: "suspicion", f: null, gap: 0.8 }), L("daniel", "It's what she used for everything.", { em: "sad", gap: 0.8 })],
        cues: [[0.2, "typing", { d: 4 }]],
      }),
      S(cam([0, 1.25, -5.0], [0, 1.2, -6.1], { fov: 28 }), {
        d: 3.5,
        st: { screen: "ACCESS\nGRANTED" },
        cues: [[0.3, "beep", { f: 1500 }], [0.5, "powerUp"]],
        music: "stop",
      }),
      S(cam([0, 1.25, -4.9], [0, 1.2, -6.1], { p2: [0, 1.25, -5.55], fov: 26 }), {
        d: 9,
        st: { screen: "PROJECT ECHO\nCLASSIFIED", screen2: "SUB-LEVEL 3\nLINES: ACTIVE", screen3: "POWER:\nSTILL LIVE" },
        cues: [[0.2, "boom"], [0.2, "v:flash"], [0.2, "v:glitch"], [1.2, "swell", { d: 8 }]],
        music: "underground",
      }),
      S(cu("daniel", { d: 0.8, x: 0.15, push: 0.1 }), {
        d: 5,
        a: { daniel: { em: "shock" } },
        l: [L("daniel", "Project Echo.", { em: "shock", gap: 0.4 })],
      }),
    ],
  },
];

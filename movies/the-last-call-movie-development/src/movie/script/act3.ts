import type { SceneDef } from "../types";
import { A, L, V, R, cu, ms, ots, cam, S, PI, VOID } from "./dsl";

const T = { torch: "daniel sarah" };
const SCR: [number, number, number] = [0, 1.2, -6.1];

/** ACT III — PROJECT ECHO */
export const act3: SceneDef[] = [
  {
    id: "a3",
    title: "Act III",
    env: "void",
    fadeIn: 0.3,
    fadeOut: 1.0,
    shots: [S(VOID, { black: true, d: 5.5, music: "stop", card: { kind: "act", text: "ACT III", sub: "PROJECT ECHO" }, cues: [[0.3, "swell", { d: 5 }]] })],
  },

  /* ------------------------------------------------ SCENE 12 — THE EXPERIMENT */
  {
    id: "s12",
    title: "The Experiment",
    env: "archive",
    amb: ["machinery", "hum"],
    music: "underground",
    fadeIn: 1.3,
    shots: [
      S(cam([2.2, 1.7, -2.4], SCR, { p2: [1.6, 1.6, -3.2], fov: 36 }), {
        d: 6,
        a: {
          daniel: A([0.5, 0, -4.9], PI, "stand", "worry", { hand: "folder", arms: "hold", look: SCR }),
          sarah: A([-0.7, 0, -4.9], PI, "stand", "worry", { look: SCR, hand: "none", arms: "cross" }),
        },
        st: { torch: "", screen: "PROJECT ECHO\nCLASSIFIED", screen2: "AUDIO LOG\n417", screen3: "" },
      }),
      S(cu("daniel", { d: 0.9, x: 0.2, push: 0.15 }), {
        a: { daniel: { em: "worry", look: [0.5, 1.1, -4.5] } },
        l: [L("daniel", "Project Echo. Objective: to reconstruct human voice and personality from recorded conversation.", { em: "worry" })],
      }),
      S(ots("daniel", "sarah", { d: 0.7, x: 0.3 }), {
        a: { daniel: { look: "sarah" }, sarah: { em: "fear", look: "daniel" } },
        l: [
          L("sarah", "They were trying to rebuild people. From recordings.", { em: "fear" }),
          L("daniel", "From the way they spoke. The words they chose. What they were afraid of.", { em: "worry", gap: 1.0 }),
        ],
      }),
      S(cam([-0.3, 1.25, -4.7], [-1.0, 1.05, -6.05], { p2: [-0.5, 1.2, -5.1], fov: 26 }), { d: 4.5, cues: [[0.4, "beep", { f: 1000 }], [1.6, "typing", { d: 2 }]] }),
      S(cu("sarah", { d: 0.85, x: 0.2 }), {
        a: { sarah: { em: "worry", look: [-1.0, 1.05, -6.05] } },
        l: [L("sarah", "Final experiment. Log four-one-seven. There's an audio file.", { em: "worry" })],
      }),
      S(cam([0, 1.5, -3.0], SCR, { p2: [0, 1.35, -4.0], fov: 34, shake: 0.15 }), {
        d: 6,
        music: "stop",
        a: { daniel: A([0.5, 0, -4.9], PI, "stand", "fear", { look: SCR, hand: "none", arms: "cross" }), sarah: { em: "fear" } },
        st: { screen: "LOG 417\n▶ PLAYING", screen2: "VOICES:\nLOADED" },
        cues: [[0.2, "tape", { d: 4 }]],
        lead: 1.6,
        l: [
          R("researcher", "Final experiment, log four-one-seven. All lines active. Subject voices loaded.", { em: "neutral" }),
          R("researcher", "Every telephone in the building is ringing. Every one. The voices... they belong to people who died years ago.", { em: "fear", gap: 1.2 }),
        ],
      }),
      S(cam([0, 1.3, -4.4], SCR, { p2: [0, 1.28, -5.2], fov: 28, shake: 0.3 }), {
        d: 5,
        cues: [[0.2, "alarm", { d: 2.4 }], [0.2, "voices", { d: 4 }]],
        lead: 0.5,
        l: [R("researcher", "Shut it down. Shut it down now!", { em: "fear" })],
      }),
      S(cam([0, 1.3, -4.4], SCR, { fov: 28 }), {
        d: 11,
        music: "stop",
        st: { screen: "LOG 417\nENDED", screen2: "" },
        cues: [[0.2, "powerDown"]],
        lead: 4.0,
        l: [
          R("researcher", "We didn't create the voices.", { em: "sad" }),
          R("researcher", "We only gave them a way to reach us.", { em: "sad", fx: "echo", gap: 1.8 }),
        ],
        tail: 1.6,
      }),
      S(cu("sarah", { d: 0.85, x: -0.2, push: 0.1 }), {
        music: "tension",
        a: { sarah: { em: "fear", look: "daniel" } },
        l: [L("sarah", "What does that mean?", { em: "fear" })],
      }),
      S(cu("daniel", { d: 0.85, x: 0.15, push: 0.1 }), {
        a: { daniel: { em: "sad", look: [0, 1.2, -6.1] } },
        l: [L("daniel", "I don't know.", { em: "sad" })],
        tail: 2.0,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 13 — EMILY'S FINAL RECORDING */
  {
    id: "s13",
    title: "Emily's Final Recording",
    env: "archive",
    amb: ["machinery", "hum"],
    music: "underground",
    fadeIn: 1.3,
    shots: [
      S(cam([1.8, 1.6, -3.2], [0.2, 0.9, -5.8], { p2: [1.3, 1.5, -3.8], fov: 36 }), {
        d: 6,
        a: {
          daniel: A([0.6, 0, -5.0], PI, "stand", "tired", { arms: "think", look: [0.3, 0.8, -5.7], hand: "none" }),
          sarah: A([-0.9, 0, -4.7], PI, "stand", "worry", { look: [-1.0, 1.05, -6.05], hand: "none", arms: "cross" }),
        },
        st: { torch: "", screen: "PROJECT ECHO", screen2: "", screen3: "TAPE:\nE. REED" },
        cues: [[1.0, "paper"], [2.4, "paper"]],
      }),
      S(cam([0.6, 1.2, -4.2], [0.9, 1.05, -6.05], { p2: [0.7, 1.15, -4.8], fov: 26 }), {
        d: 4.5,
        a: { daniel: { em: "sad", look: [0.9, 1.05, -6.05] } },
        l: [L("daniel", "Emily's handwriting.", { em: "sad" })],
      }),
      S(cu("daniel", { d: 0.85, x: 0.15 }), {
        d: 5,
        music: "stop",
        st: { screen3: "TAPE:\n▶ PLAY" },
        cues: [[0.3, "tape", { d: 4 }]],
        a: { daniel: { em: "sad" } },
        l: [R("emily", "If you're listening to this, Daniel... I found something.", { em: "worry" })],
      }),
      S(cu("daniel", { d: 0.7, x: 0.1, push: 0.15, fov: 22 }), {
        a: { daniel: { em: "cry" } },
        l: [
          R("emily", "I think the calls aren't coming from the future.", { em: "worry" }),
          R("emily", "They're coming from somewhere else.", { em: "fear", gap: 1.0 }),
        ],
        cues: [[0.3, "tape", { d: 4 }]],
        tail: 3.0,
      }),
      S(cu("daniel", { d: 0.6, x: 0.0, push: 0.08, fov: 20 }), {
        d: 8,
        a: { daniel: { em: "shock" } },
        lead: 2.2,
        l: [R("emily", "Don't answer when you hear my voice.", { fx: "whisper", em: "fear" })],
        cues: [[0.2, "heart", { d: 6, bpm: 58, g: 0.5 }]],
        tail: 2.4,
      }),
      S(cam([0, 1.3, -4.4], SCR, { fov: 28 }), { d: 4, st: { screen3: "TAPE\nENDED" }, a: { daniel: { em: "sad" } }, cues: [[0.1, "hangup"]] }),
      S(cam([-1.8, 1.6, -3.0], [-0.4, 1.1, -5.4], { fov: 34 }), {
        music: "tension",
        a: { sarah: A([-0.9, 0, -5.0], PI, "stand", "worry", { look: [-1.0, 1.05, -6.05] }), daniel: { look: "sarah", em: "sad" } },
        st: { screen2: "POWER:\nLIVE", screen3: "" },
        l: [
          L("sarah", "Daniel. The facility's still drawing power. Sub-level three is live.", { em: "worry" }),
          L("daniel", "Then that's where she is.", { em: "sad", gap: 1.0 }),
          L("sarah", "Or where something wants us to think she is.", { em: "fear", gap: 1.0 }),
        ],
      }),
      S(cam([0, 1.7, -2.2], [0, 1.4, -5.6], { p2: [0, 1.65, -3.1], fov: 34 }), {
        a: { sarah: { look: "daniel", em: "neutral" }, daniel: { look: "sarah", em: "neutral" } },
        l: [L("daniel", "Then we go in.", { em: "neutral" }), L("sarah", "Together. Whatever happens.", { em: "neutral", gap: 1.2 })],
        tail: 2.2,
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 14 — THE FINAL NIGHT */
  {
    id: "s14",
    title: "The Final Night",
    env: "facility",
    amb: ["machinery", "hum"],
    music: "underground",
    fadeIn: 1.5,
    shots: [
      S(cam([0, 1.55, 13.2], [0, 1.4, 0], { p2: [0, 1.5, 12.4], fov: 40 }), {
        d: 9,
        a: {
          daniel: A([0.5, 0, 12.3], PI, "walk", "worry", { to: [0.4, 0, 6.5], hand: "torch" }),
          sarah: A([-0.5, 0, 12.9], PI, "walk", "worry", { to: [-0.5, 0, 6.9], hand: "torch" }),
        },
        st: { ...T, wave: 0, alarm: false, tape: false, display: "", noCeil: false },
        card: { kind: "loc", text: "SUB-LEVEL THREE", sub: "RESEARCH FACILITY  ·  POWER ACTIVE" },
        cues: [[0.2, "steps", { d: 9, pace: 0.6 }]],
      }),
      S({ on: "daniel", p: [0.35, 1.55, 2.6], look: [0, 1.5, 0], at: "daniel", fov: 32, shake: 0.4 }, {
        d: 7,
        a: { daniel: { to: [0.4, 0, 1.0] }, sarah: { to: [-0.5, 0, 1.5] } },
        l: [L("daniel", "Emily said 'under the station'.", { em: "worry", f: null }), L("sarah", "These lines were never disconnected. Look at the cables.", { em: "worry", f: null, gap: 1.0 })],
      }),
      S(cam([0.2, 1.5, 2.8], [1.62, 1.45, 1.25], { p2: [0.6, 1.5, 2.2], fov: 24 }), {
        d: 4,
        a: { daniel: A([0.4, 0, 1.0], PI, "stand", "worry", { hand: "torch", look: [1.62, 1.45, 1.25] }), sarah: A([-0.5, 0, 1.5], PI, "stand", "worry", { hand: "torch", look: [1.62, 1.45, 1.25] }) },
        cues: [[1.2, "beep", { f: 700 }], [2.8, "ring-mini"]],
      }),
      S(cam([0, 1.6, -3.5], [0, 1.5, 10], { p2: [0, 1.6, -2.6], fov: 40, shake: 0.3 }), {
        d: 9,
        ring: "many",
        music: "tension",
        a: { daniel: A([0.4, 0, 1.0], PI, "stand", "fear", { hand: "torch", look: [1.62, 1.45, 3] }), sarah: A([-0.5, 0, 1.5], PI, "stand", "fear", { hand: "torch", look: [-1.62, 1.45, 3] }) },
        st: { wave: 1, alarm: true },
        cues: [[0.1, "voices", { d: 8 }], [0.1, "v:glitch"]],
      }),
      S(cu("daniel", { d: 0.7, x: 0.0, shake: 0.5, fov: 24 }), {
        d: 9,
        ring: "many",
        a: { daniel: { em: "fear", arms: "cover", hand: "none", look: null } },
        st: { wave: 2 },
        cues: [[0.1, "voices", { d: 9 }]],
        l: [
          V("olivia", "Daniel... please don't let me die.", { fx: "whisper" }),
          V("youngman", "I don't want to die!", { fx: "whisper", gap: 0.2 }),
          V("researcher", "Shut it down. Shut it down!", { fx: "echo", gap: 0.2 }),
          V("mother", "Daniel, sweetheart... come home.", { fx: "echo", gap: 0.2 }),
          V("emily", "Daniel... why did you leave me?", { fx: "whisper", gap: 0.2 }),
        ],
        lead: 0.3,
      }),
      S(cu("sarah", { d: 0.7, x: 0.0, shake: 0.5, fov: 24 }), {
        d: 6,
        ring: "many",
        a: { sarah: { em: "fear", look: null, arms: "hold" } },
        st: { wave: 2 },
        cues: [[0.1, "voices", { d: 6 }]],
        l: [V("father", "Sarah. Sarah, sweetheart... answer me.", { fx: "echo" }), L("sarah", "Don't. Don't listen to it.", { em: "fear", gap: 0.4 })],
      }),
      S(cam([0, 1.5, -2.0], [0, 1.5, 8], { fov: 44, shake: 0.9 }), { d: 5, ring: "many", st: { wave: 2 }, cues: [[0.1, "voices", { d: 5 }], [3.5, "riser", { d: 1.5 }]] }),
      S(cam([0, 1.5, -3.0], [0, 1.4, 6], { fov: 38 }), {
        d: 8,
        ring: "none",
        music: "stop",
        st: { wave: 3, alarm: false },
        cues: [[0.0, "powerDown"], [0.0, "v:flash"]],
        a: { daniel: { em: "worry", arms: "hold", hand: "torch", look: [0, 1.4, -8] }, sarah: { em: "fear", arms: "hold", hand: "torch", look: [0, 1.4, -8] } },
      }),
      S(cam([0, 1.3, -7.6], [0, 1.05, -11.4], { p2: [0, 1.2, -9.4], fov: 22 }), {
        d: 7,
        ring: "red",
        st: { display: "INCOMING\n2:17 AM", wave: 3 },
      }),
      S({ on: "daniel", p: [0.3, 1.6, 3.0], at: "daniel", fov: 34, shake: 0.3 }, {
        d: 12,
        ring: "red",
        a: {
          daniel: A([0.3, 0, 0.5], PI, "walk", "fear", { to: [0, 0, -9.9], hand: "none", arms: "rest", look: [0, 1.0, -11.4] }),
          sarah: A([-0.4, 0, 1.6], PI, "walk", "fear", { to: [-0.6, 0, -7.6], hand: "torch", look: "daniel" }),
        },
        cues: [[0.1, "steps", { d: 12, pace: 0.62 }]],
      }),
      S(cu("daniel", { d: 0.8, x: 0.25, shake: 0.2 }), {
        d: 5,
        ring: "red",
        a: { daniel: A([0, 0, -9.9], PI, "stand", "fear", { look: [0, 1.0, -11.4], arms: "rest", hand: "none" }) },
      }),
      S({ on: "daniel", p: [0.3, 1.6, 0.9], at: "daniel", fov: 24, shake: 0.2, p2: [0.2, 1.6, 0.6] }, {
        ring: "none",
        st: { off_red: true, display: "CONNECTED\n2:17 AM" },
        cues: [[0.1, "pickup"]],
        a: { daniel: { hand: "handset", arms: "ear", em: "fear" } },
        l: [V("daniel", "Daniel... whatever you do tomorrow, don't go home.", { fx: "phone" })],
        lead: 1.2,
        tail: 2.4,
      }),
      S(cu("daniel", { d: 0.6, x: 0.0, push: 0.1, fov: 20 }), {
        d: 6,
        cues: [[0.1, "boom"], [0.1, "hangup"]],
        a: { daniel: { em: "shock" } },
        st: { off_red: false },
      }),
    ],
  },

  /* ------------------------------------------------ SCENE 15 — THE TRUTH ABOUT DANIEL */
  {
    id: "s15",
    title: "The Truth About Daniel",
    env: "control",
    amb: ["machinery", "hum"],
    music: "underground",
    fadeIn: 1.5,
    shots: [
      S(cam([1.2, 1.8, 3.8], [0, 1.4, -3.5], { p2: [0.6, 1.7, 3.2], fov: 40 }), {
        d: 6,
        a: { daniel: A([0, 0, -1.9], PI, "walk", "tired", { to: [0, 0, -2.3], hand: "none", arms: "rest", look: [0, 1.0, -3.4] }), sarah: null },
        st: { torch: "", lowPower: true, screen: "SUB-LEVEL 3 CONTROL", screen2: "SECURITY\nARCHIVE", screen3: "CAM 04", screen4: "STANDBY", sec: 0, lights: 0 },
        card: { kind: "loc", text: "FACILITY CONTROL ROOM", sub: "" },
      }),
      S(cu("daniel", { d: 0.85, x: 0.2, push: 0.15 }), {
        a: { daniel: { em: "worry", look: [-1.0, 1.4, -3.3] } },
        l: [L("daniel", "Security archive. Camera four. Three years ago.", { em: "worry" })],
        cues: [[2.8, "beep", { f: 1100 }]],
      }),
      S(cam([-0.6, 1.8, 1.8], [-4.9, 1.9, -0.8], { p2: [-1.2, 1.8, 1.4], fov: 34 }), {
        d: 8,
        st: { sec: 1, screen3: "CAM 04\n▶ PLAY" },
        cues: [[0.2, "staticBurst", { d: 1, g: 0.4 }]],
        a: { daniel: { look: [-4.9, 1.9, -0.8] } },
        l: [L("daniel", "That's me. And Emily.", { em: "shock", f: null }), L("daniel", "I don't remember this. Any of it.", { em: "fear", f: null, gap: 1.2 })],
        lead: 2.4,
      }),
      S(cu("daniel", { d: 0.7, x: -0.15, push: 0.2, fov: 24 }), {
        d: 8,
        a: { daniel: { em: "shock", look: [-4.9, 1.9, -0.8] } },
        st: { sec: 2 },
        cues: [[0.5, "powerDown"], [0.5, "v:glitch"], [3.5, "alarm", { d: 3 }]],
      }),
      S(cam([2.5, 1.7, 3.4], [-0.5, 1.2, -2.2], { fov: 38 }), {
        d: 4,
        a: { sarah: A([3.4, 0, 3.6], PI, "walk", "fear", { to: [1.0, 0, -1.4], look: "daniel", hand: "torch" }), daniel: { look: [-4.9, 1.9, -0.8] } },
        st: { sec: 3, torch: "sarah" },
        cues: [[0.1, "steps", { d: 4, pace: 0.4 }]],
      }),
      S(ots("daniel", "sarah", { d: 0.8, x: 0.3 }), {
        a: { sarah: A([1.0, 0, -1.4], -PI / 2, "stand", "worry", { look: "daniel", hand: "none" }), daniel: A([0, 0, -2.3], PI, "stand", "fear", { look: "sarah", hand: "none", arms: "rest" }) },
        st: { sec: 4, torch: "" },
        l: [
          L("sarah", "Daniel. What is that?", { em: "worry" }),
          L("daniel", "Me. Three years ago, with Emily. She brought me here to investigate Project Echo.", { em: "fear", gap: 0.8 }),
          L("daniel", "The experiment activated by accident. Then the power failed. And Emily was gone.", { em: "sad", gap: 1.0 }),
        ],
      }),
      S(cu("daniel", { d: 0.8, x: 0.15, push: 0.15 }), {
        a: { daniel: { em: "sad" } },
        l: [
          L("daniel", "I walked out with no memory of any of it.", { em: "sad" }),
          L("daniel", "It recorded our voices. I was the first one to make contact.", { em: "fear", gap: 1.2 }),
        ],
      }),
      S(cu("sarah", { d: 0.85, x: 0.2 }), {
        a: { sarah: { em: "fear", look: "daniel" } },
        l: [L("sarah", "Then who has been calling us?", { em: "fear" })],
        tail: 2.0,
      }),
      S(cam([0.4, 1.35, -1.3], [0, 1.0, -3.15], { p2: [0.1, 1.25, -2.1], fov: 26 }), {
        d: 6,
        ring: "red",
        music: "tension",
        st: { display: "INCOMING\n2:17 AM" },
        a: { daniel: { look: [0, 1.0, -3.15], em: "fear" }, sarah: { look: [0, 1.0, -3.15] } },
      }),
      S(cu("daniel", { d: 0.75, x: 0.2, shake: 0.25 }), {
        ring: "red",
        d: 3.5,
        a: { daniel: { em: "fear", look: [0, 1.0, -3.15] } },
      }),
      S(cu("daniel", { d: 0.75, x: 0.15, shake: 0.3, push: 0.1 }), {
        ring: "none",
        st: { off_red: true, display: "CONNECTED" },
        cues: [[0.1, "pickup"]],
        a: { daniel: { hand: "handset", arms: "ear", em: "fear" } },
        l: [V("daniel", "You were never supposed to leave.", { fx: "distort", em: "neutral" })],
        lead: 1.2,
        tail: 1.6,
      }),
      S(cam([0, 1.8, 3.0], [0, 1.8, -4.4], { p2: [0, 1.8, 2.0], fov: 44, shake: 0.5 }), {
        d: 7,
        ring: "many",
        music: "revelation",
        st: { lights: 1, off_red: false, screen: "CONNECTION ESTABLISHED", lowPower: false },
        a: { daniel: { hand: "none", arms: "rest", em: "shock" } },
        cues: [[0.0, "powerUp"], [0.1, "v:flash"], [1.5, "voices", { d: 5 }], [-0.4, "boom"]],
      }),
    ],
  },

  /* ------------------------------------------------ FINAL REVELATION — THE PEOPLE ON THE OTHER END */
  {
    id: "s16",
    title: "The People on the Other End",
    env: "control",
    amb: ["machinery", "hum"],
    music: "revelation",
    fadeIn: 1.2,
    shots: [
      S(cam([1.4, 1.8, 3.6], [0, 1.3, -3.2], { p2: [0.8, 1.7, 3.0], fov: 40, shake: 0.2 }), {
        d: 6,
        ring: "many",
        a: {
          daniel: A([0, 0, -2.3], PI, "stand", "shock", { look: [0, 1.0, -3.4], arms: "rest", hand: "none" }),
          sarah: A([3.8, 0, 3.8], PI, "run", "fear", { to: [0.9, 0, -1.6], hand: "none" }),
        },
        st: { torch: "", lights: 2, screen: "CONNECTION ESTABLISHED", screen2: "INCOMING\n12,481", sec: 0, display: "ACTIVE" },
        cues: [[0.5, "steps", { d: 4, pace: 0.34 }], [0.1, "voices", { d: 6 }]],
      }),
      S(ots("daniel", "sarah", { d: 0.8, x: 0.3 }), {
        ring: "none",
        a: { sarah: A([0.9, 0, -1.6], -PI / 2, "stand", "fear", { look: "daniel", hand: "none" }), daniel: { look: "sarah" } },
        l: [L("sarah", "Daniel! We have to leave. Right now.", { em: "fear" })],
        cues: [[0.1, "hit"]],
      }),
      S(cu("daniel", { d: 0.85, x: 0.15, push: 0.2 }), {
        a: { daniel: { em: "sad", look: [0, 1.0, -3.4] } },
        l: [
          L("daniel", "They aren't predictions.", { em: "sad" }),
          L("daniel", "The calls. They never told us who would die.", { em: "worry", gap: 1.2 }),
          L("daniel", "They're echoes. People trapped inside the experiment.", { em: "fear", gap: 1.2 }),
        ],
      }),
      S({ p: [2.2, 1.7, -0.3], p2: [1.6, 1.65, -0.8], at: "daniel", atOff: [0, -0.15, 0], fov: 32 }, {
        a: { daniel: { em: "sad", look: "sarah" }, sarah: { em: "worry" } },
        l: [
          L("daniel", "Copies of memories. Of personalities. Of conversations that never ended.", { em: "sad" }),
          L("daniel", "Some of them are trying to warn us.", { em: "worry", gap: 1.2 }),
          L("daniel", "Others are trying to get out.", { em: "fear", gap: 1.6 }),
        ],
      }),
      S(cam([-1.0, 1.7, 2.0], [-4.9, 1.9, -0.8], { p2: [-1.6, 1.7, 1.6], fov: 34 }), {
        d: 7,
        music: "stop",
        ring: "none",
        st: { sec: 3, lights: 2 },
        a: { daniel: { look: [-4.9, 1.9, -0.8] }, sarah: { look: [-4.9, 1.9, -0.8] } },
        cues: [[0.1, "powerDown"], [0.2, "staticBurst", { d: 1.2, g: 0.5 }]],
        lead: 2.2,
        l: [R("emily", "Daniel, don't answer!", { em: "fear" })],
        tail: 0.6,
      }),
      S(cam([-1.0, 1.7, 2.0], [-4.9, 1.9, -0.8], { fov: 34 }), {
        d: 6,
        st: { sec: 4 },
        ring: "red",
        cues: [[2.4, "staticBurst", { d: 3, g: 0.9 }], [2.4, "v:glitch"], [2.4, "hangup"]],
        a: { daniel: { em: "shock" } },
      }),
      S(cu("daniel", { d: 0.6, x: 0.0, fov: 20, push: 0.1 }), {
        d: 5,
        ring: "none",
        st: { sec: 0 },
        a: { daniel: { em: "shock", look: null } },
        cues: [[0.1, "v:flash"], [0.1, "boom"]],
        music: "tension",
      }),
      S(cu("daniel", { d: 0.8, x: 0.12, push: 0.15 }), {
        a: { daniel: { em: "cry" } },
        l: [
          L("daniel", "I remember.", { em: "cry" }),
          L("daniel", "I answered. Three years ago, I answered the telephone.", { em: "cry", gap: 1.4 }),
          L("daniel", "And something answered me back.", { em: "fear", gap: 1.6 }),
        ],
        tail: 2.0,
      }),
      S(cu("sarah", { d: 0.85, x: 0.2 }), {
        a: { sarah: { em: "sad", look: "daniel" } },
        l: [L("sarah", "Emily...", { em: "sad" }), L("daniel", "She disappeared trying to save me.", { em: "cry", f: null, gap: 1.0 })],
        tail: 1.6,
      }),
      S(cu("sarah", { d: 0.8, x: 0.2, push: 0.12 }), {
        a: { sarah: { em: "fear" } },
        l: [L("sarah", "Then who has been calling us?", { em: "fear" })],
        tail: 2.4,
      }),
      S(cam([0.4, 1.35, -1.3], [0, 1.0, -3.15], { p2: [0.1, 1.25, -2.1], fov: 26 }), {
        d: 6,
        ring: "red",
        music: "tension",
        st: { display: "INCOMING\n2:17 AM", lights: 2 },
        a: { daniel: { look: [0, 1.0, -3.15], em: "fear" }, sarah: { look: [0, 1.0, -3.15] } },
      }),
      S(cu("daniel", { d: 0.8, x: 0.25, shake: 0.25, push: 0.1 }), {
        ring: "none",
        st: { off_red: true, display: "CONNECTED" },
        cues: [[0.1, "pickup"]],
        a: { daniel: { hand: "handset", arms: "ear", em: "fear" } },
        l: [V("emily", "Thank you for finally answering.", { fx: "echo", em: "smile" })],
        lead: 1.4,
        tail: 1.2,
      }),
      S(cam([0, 1.6, 3.4], [0, 1.9, -4.4], { p2: [0, 1.6, 1.4], fov: 44, shake: 0.7 }), {
        d: 11,
        ring: "many",
        music: "revelation",
        st: { lights: 1, off_red: false, screen: "CONNECTION ESTABLISHED", screen2: "INCOMING\n12,481", display: "ACTIVE" },
        cues: [[0.0, "powerUp"], [0.0, "v:flash"], [0.4, "voices", { d: 9 }], [0.5, "alarm", { d: 4 }], [-0.6, "boom"]],
        a: { daniel: { hand: "none", arms: "rest", em: "shock", look: [0, 1.9, -4.4] }, sarah: { look: [0, 1.9, -4.4], em: "fear" } },
      }),
      S(cu("daniel", { d: 0.9, x: 0.2, push: 0.3, fov: 24 }), {
        d: 6,
        ring: "many",
        st: { lights: 2 },
        a: { daniel: { em: "shock", look: [0, 1.9, -4.4] } },
        cues: [[0.0, "riser", { d: 5 }], [-0.2, "v:flash"]],
      }),
    ],
  },
];

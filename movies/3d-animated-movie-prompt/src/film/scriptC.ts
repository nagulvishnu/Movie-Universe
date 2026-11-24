import { scene, a, cu, ms, prof, two, W, C, rel, M, PI, H } from "./dsl";

// ============================ ACT III ============================
{
  const s = scene("Act III", "ACT III", { env: "void", light: "night", amb: ["wind"], music: M("off") });
  s({ dur: 4.5, fade: "both", card: { title: "ACT III", sub: "THE SILENCE" }, cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)], amb: [] });
}

// ---- Scene 14: Searching ----
{
  const s = scene("Searching", "ACT III", { env: "anyaHome", v: "empty", light: "roomDay", amb: ["room", "wind"], music: M("sad", 0.6), outfit: { ryan: "grief2" } });
  s({ dur: 9, fade: "in", caption: "Her apartment", cam: [W([-1.8, 1.5, 3.0], [1.0, 1.1, -1.0], 40), W([-1.0, 1.4, 2.0], [1.0, 1.1, -1.5], 38)], fx: [[0.5, "steps"]], actors: { ryan: a([3.0, 0, 2.5], undefined, "walk", [[0, "concern"], [0.6, "fear"]], { to: [0.2, 0, -0.8], look: [0.2, 1.2, -3] }) }, dof: 2 });
  const b = scene("Searching", "ACT III", { env: "bookstore", light: "dayCoast", amb: ["cafe", "sea"], music: M("sad", 0.55), outfit: { ryan: "grief2" } });
  b({ dur: 12, fade: "in", caption: "The bookstore", cam: [ms2("ryan"), cu("ryan", 0.9, 0.12, 0, 30)], fx: [[0.6, "ring"]], lines: [["R", "Meera? It's Ryan. Have you heard from Anya?"], 1.6, ["R", "...Nothing? Not even a message?"], 1.0, ["R", "Okay. Thank you. If you hear anything..."]], lead: 1.8, actors: { ryan: a([2.2, 0, -2.75], 0, "phone", [[0, "concern"], [0.5, "fear"], [0.75, "sad"]], { r: "phone", look: "down" }) } });
  const t = scene("Searching", "ACT III", { env: "station", light: "stationRain", rain: 1, amb: ["rain", "station", "train", "wind"], music: M("sad", 0.55), outfit: { ryan: "grief2" } });
  t({ dur: 10, fade: "in", caption: "The railway station", cam: [W([-4.5, 1.5, -2.0], [-1.2, 1.2, 2.2], 36), W([-3.2, 1.4, -1.2], [-1.2, 1.2, 2.2], 36)], actors: { ryan: a([-1.2, 0, 2.45], PI, "sit", [[0, "lonely"], [0.6, "sad"]], { l: "umbrellaClosed", look: [8, 1.5, 0] }) }, dof: 2.5 });
  const bc = scene("Searching", "ACT III", { env: "beach", light: "overcast", amb: ["sea", "wind", "gulls"], music: M("sad", 0.55), outfit: { ryan: "grief2" } });
  bc({ dur: 9, fade: "in", caption: "The beach", cam: [W([-4, 1.5, 6.0], [-1, 0.9, 1.5], 40), W([2, 2.2, 7.0], [3, 0.9, 0.0], 40)], fx: [[0.4, "stepsSand"]], lines: [["R", "Anya!"], 3, ["R", "Anya...!"]], lead: 2.0, dof: 0.5, actors: { ryan: a([-3, 0, 1.0], undefined, "walk", [[0, "fear"], [0.6, "sad"]], { to: [3.5, 0, -7.0], look: "sea" }) } });
  const l = scene("Searching", "ACT III", { env: "lighthouse", v: "day", light: "overcast", amb: ["wind", "sea"], music: M("sad", 0.55), outfit: { ryan: "grief2" } });
  l({ dur: 9, fade: "in", caption: "The lighthouse", cam: [W([-3.5, 1.4, -8.2], [-1.3, 0.9, -5.0], 34), W([-2.5, 1.5, -7.0], [-1.3, 0.9, -5.0], 32)], actors: { ryan: a([2.0, 0, -2.5], undefined, "walk", [[0, "hope"], [0.7, "lonely"]], { to: [-0.8, 0, -4.4], look: [-1.3, 0.6, -5.2] }) }, dof: 2 });
  const st = scene("Searching", "ACT III", { env: "studio", light: "roomDay", amb: ["room"], music: M("sad", 0.55), outfit: { ryan: "grief2" } });
  st({ dur: 10, fade: "in", caption: "Her studio", cam: [W([-1.0, 1.5, 2.8], [-3.5, 1.4, -0.5], 38), W([-2.5, 1.5, 1.5], [-4.3, 1.4, -0.6], 34)], actors: { ryan: a([-3.0, 0, 0.4], -H, "stand", [[0, "concern"], [0.7, "sad"]], { look: [-4.38, 1.5, -0.6] }) }, fx: [[0.3, "steps"]], dof: 2 });
  const ph = scene("Searching", "ACT III", { env: "ryanHome", light: "roomNight", amb: ["room", "night"], music: M("sad", 0.6), outfit: { ryan: "grief2" } });
  ph({ dur: 11, fade: "in", caption: "Every night", cam: [W([3.2, 1.35, 3.6], [3.2, 0.95, 0.95], 34), cu("ryan", 1.0, 0.0, 0, 30)], fx: [[0.6, "ring"], [4.5, "ring"]], lines: [["P", "The number you have dialled does not exist.", "Phone"]], lead: 2.8, dof: 3, actors: { ryan: a([3.2, 0, 0.95], 0, "sitPhone", [[0, "hope"], [0.5, "disbelief"], [0.85, "sad"]], { r: "phone", look: "down" }) } });
}

// ---- Scene 15: The Empty Days ----
{
  const s = scene("The Empty Days", "ACT III", { env: "ryanHome", light: "overcast", amb: ["room", "rainSoft"], music: M("sad", 0.55), outfit: { ryan: "grief" } });
  s({ dur: 10, fade: "in", caption: "The empty days", cam: [W([-3.4, 1.5, -0.2], [-1.5, 1.1, -2.2], 38), prof("ryan", -1.1, 0, 0, 30)], lines: [["N", "Days became weeks. The town stayed exactly the same. Only the silence changed."]], lead: 1.5, actors: { ryan: a([-1.5, 0, -1.75], PI, "sitSlump", "blank", { look: [-1.5, 0.75, -2.4] }) }, dof: 2 });
  s({ dur: 8, cam: [C(rel("ryan", [-0.7, -0.3, -0.1]), rel("ryan", [0, -0.5, 0.6]), 28), C(rel("ryan", [-0.55, -0.3, 0.1]), rel("ryan", [0, -0.5, 0.6]), 26)], dof: 2.5, actors: { ryan: a([-1.5, 0, -1.75], PI, "piano", "sad", { look: [-1.5, 0.75, -2.4] }) } });
  const bed = scene("The Empty Days", "ACT III", { env: "ryanHome", light: "roomNight", amb: ["room", "rainSoft"], music: M("sad", 0.55), outfit: { ryan: "grief" } });
  bed({ dur: 10, fade: "in", cam: [W([1.8, 1.3, 2.6], [3.6, 0.85, -0.9], 36), cu("ryan", 1.0, 0.15, -0.05, 30)], dof: 3, actors: { ryan: a([3.2, 0, 0.95], PI * 0.5 + 2.2, "sitSlump", [[0, "blank"], [0.6, "sad"]], { look: [3.7, 0.8, -1.12] }) } });
  const li = scene("The Empty Days", "ACT III", { env: "lighthouse", v: "day", light: "overcast", amb: ["wind", "sea"], music: M("sad", 0.5), outfit: { ryan: "grief" } });
  li({ dur: 8, fade: "in", cam: [W([-6, 1.5, 6.5], [1, 1.2, -1.5], 36), W([-3, 1.4, 5.5], [2, 1.2, -1.5], 34)], lin: true, actors: { ryan: a([7.5, 0, 5.5], undefined, "walk", "lonely", { to: [3.4, 0, 0.8], look: [0, 1.5, -5] }) } });
  li({ dur: 7, cam: [W([-3, 1.5, 4.5], [3.4, 1.2, 0.8], 36), cu("ryan", 1.1, 0.2, 0, 32)], actors: { ryan: a([3.4, 0, 0.8], 2.2, "stand", [[0, "lonely"], [0.5, "sad"], [0.9, "cry"]], { look: "down" }) } });
  const bs = scene("The Empty Days", "ACT III", { env: "bookstore", light: "overcast", amb: ["cafe", "rainSoft"], music: M("sad", 0.5), outfit: { ryan: "grief" } });
  bs({ dur: 9, fade: "in", cam: [ms2("ryan"), W([0.5, 1.5, 1.5], [3.2, 1.2, 3.4], 36)], fx: [[3.5, "doorbell"], [3.8, "door"]], actors: { ryan: a([2.2, 0, -0.9], 0, "handsFront", [[0, "blank"], [0.38, "hope"], [0.55, "lonely"]], { r: "book", look: [3.2, 1.5, 3.4] }) } });
  const un = scene("The Empty Days", "ACT III", { env: "ryanHome", light: "roomWarm", amb: ["room", "rainSoft"], music: M("sad", 0.7), outfit: { ryan: "grief" } });
  un({ dur: 14, fade: "in", caption: "The song he cannot finish", cam: [prof("ryan", -1.1, 0, 0, 30), W([-3.0, 1.4, -0.4], [-1.5, 1.2, -2.2], 36)], shake: 0.002, actors: { ryan: a([-1.5, 0, -1.75], PI, "piano", [[0, "sad"], [0.45, "cry"], [0.75, "blank"]], { look: [-1.5, 1.0, -2.4] }) } });
  un({ dur: 7, fade: "out", cam: [cu("ryan", 0.85, 0.12, 0, 30), cu("ryan", 0.65, 0.1, 0, 28)], music: M("off"), dof: 3.5, actors: { ryan: a([-1.5, 0, -1.75], PI, "sitCover", [[0, "sad"], [0.5, "cry"]], { look: "down" }) } });
}

// ---- Scene 16: Six Months Later ----
{
  const s = scene("Six Months Later", "ACT III", { env: "ryanHome", v: "box", light: "rainDay", rain: 0, amb: ["room", "rainSoft"], music: M("ambient", 0.45), outfit: { ryan: "grief2" } });
  s({ dur: 9, fade: "in", caption: "Six months later", cam: [W([-0.5, 1.5, 1.5], [3.0, 1.0, 3.2], 40), ms2("ryan")], fx: [[1.2, "knock"], [3.4, "door"]], actors: { ryan: a([1.5, 0, 0.6], undefined, "walk", [[0, "lonely"], [0.4, "confusion"]], { to: [3.0, 0, 2.6], look: [3.2, 1.0, 3.4] }) } });
  s({ dur: 13, cam: [cu("ryan", 0.9, 0.12, -0.05, 30), cu("ryan", 0.72, 0.1, -0.05, 28)], doc: ["CITY GENERAL HOSPITAL", "Patient Services", "", "Left in our care, with written instructions,", "to be delivered to Mr. Ryan", "six months after the date below.", "", "We are sorry we could not reach you sooner."], fx: [[1, "paper"]], lines: [["N", "No return address. Only a hospital stamp — and a box he recognised."]], lead: 1.0, dof: 3, actors: { ryan: a([3.0, 0, 2.6], PI, "read", [[0, "confusion"], [0.6, "concern"]], { r: "letter", look: "down" }) } });
  const bx = scene("Six Months Later", "ACT III", { env: "ryanHome", v: "box", light: "rainDay", amb: ["room", "rainSoft"], music: M("ambient", 0.5), outfit: { ryan: "grief2" } });
  bx({ dur: 12, cam: [W([0.4, 1.7, -0.2], [0.4, 0.4, 0.9], 34), cu("ryan", 1.0, 0.0, 0, 30)], fx: [[1.5, "paper"], [4, "paper"]], music: M("box", 0.5), actors: { ryan: a([0.4, 0, 2.55], PI, "sitLean", [[0, "lonely"], [0.4, "surprise"], [0.7, "sad"]], { look: [0.4, 0.4, 0.9] }) }, dof: 2.5 });
  bx({ dur: 15, cam: [cu("ryan", 0.9, 0.15, -0.05, 30), cu("ryan", 0.68, 0.1, -0.05, 28)], fx: [[0.6, "paper"]], lines: [["W", "Ryan, if you are reading this, I am sorry I couldn't explain everything."], ["W", "There are things I wanted to tell you, but I was afraid that telling you would change the way you looked at me."]], lead: 1.2, dof: 3, music: M("sad", 0.5), actors: { ryan: a([0.4, 0, 2.55], PI, "sitRead", [[0, "concern"], [0.5, "confusion"], [0.85, "sad"]], { r: "letter", look: "down" }) } });
  bx({ dur: 13, cam: [cu("ryan", 0.85, -0.12, -0.05, 30), cu("ryan", 0.62, -0.1, -0.05, 28)], fx: [[0.5, "paper"]], lines: [["W", "Before I met you, I was told I was ill. Not the kind of ill that goes away with rest."]], lead: 1.4, dof: 3.5, actors: { ryan: a([0.4, 0, 2.55], PI, "sitRead", [[0, "confusion"], [0.45, "disbelief"], [0.85, "fear"]], { r: "letter", look: "down" }) } });
}

// ---- Scene 17: The Truth ----
{
  const f = scene("The Truth", "ACT III", { env: "anyaHome", v: "drawer", light: "roomWarm", look: "flash", amb: ["room", "sea"], music: M("sadStrings", 0.6), outfit: { anya: "sick", ryan: "green" } });
  f({ dur: 8, fade: "in", caption: "What he could not see", cam: [cu("anya", 0.9, 0.12, 0, 30), W([1.0, 1.5, 0.2], [2.8, 1.1, -2.2], 36)], fx: [[0.5, "paper"], [3.0, "door"]], lines: [["N", "She hid the reports before he arrived. And always, always, she smiled when he walked in."]], lead: 0.6, actors: { anya: a([3.0, 0, -2.1], PI, "stand", [[0, "fear"], [0.45, "fear"], [0.55, "smile"]], { look: [3.4, 1.4, 3] }), ryan: a([3.4, 0, 1.8], undefined, "walk", "gentle", { to: [3.4, 0, -0.5], r: "flower", look: "anya" }) } });
  const h = scene("The Truth", "ACT III", { env: "hospital", v: "corridor", light: "hospital", look: "flash", amb: ["hospital"], music: M("sadStrings", 0.6), outfit: { anya: "sick" } });
  h({ dur: 11, cam: [W([-0.2, 1.3, -2.0], [-1.45, 0.9, -6.0], 34), cu("anya", 0.85, 0.12, 0, 30)], dof: 2.5, actors: { anya: a([-1.35, 0, -6.0], H, "sitCover", [[0, "sob"], [0.6, "cry"], [0.9, "hidden"]], { look: "down" }) } });
  const p = scene("The Truth", "ACT III", { env: "studio", light: "roomDay", look: "flash", amb: ["room"], music: M("sadStrings", 0.6), outfit: { anya: "denim", ryan: "navy" } });
  p({ dur: 9, cam: [ms("anya", 1.4, -0.3, 0), cu("anya", 0.8, 0.1, 0, 30)], fx: [[1.2, "shutter"], [4.8, "shutter"]], actors: { ryan: a([-0.5, 0, -1.6], 0, "stand", [[0, "laugh"], [0.7, "smile"]], { look: "camera" }), anya: a([-0.5, 0, 0.8], PI, "camera", [[0, "laugh"], [0.55, "hidden"], [0.85, "sad"]], { r: "camera", look: "ryan" }) }, dof: 2.5 });
  const n = scene("The Truth", "ACT III", { env: "anyaHome", v: "full", light: "roomNight", look: "flash", amb: ["room", "night"], music: M("sadStrings", 0.6), outfit: { anya: "night" } });
  n({ dur: 8, cam: [W([0.8, 1.5, -0.8], [2.0, 1.0, -2.8], 32), cu("anya", 0.8, 0.15, 0, 28)], fx: [[0.8, "paper"]], dof: 2.5, actors: { anya: a([2.1, 0, -2.25], PI, "write", [[0, "tearySmile"], [0.6, "cry"]], { r: "pen", look: "down" }) } });
  n({ dur: 7, tc: "REC 00:00:41", look: "rec", cam: [W([-0.2, 1.45, 3.1], [-0.2, 1.3, 1.2], 32), W([-0.2, 1.45, 3.0], [-0.2, 1.3, 1.2], 30)], dof: 0, actors: { anya: a([-0.2, 0, 1.2], 0, "sit", [[0, "smile"], [0.5, "tearySmile"], [0.8, "sob"]], { look: "camera" }) } });
  const r = scene("The Truth", "ACT III", { env: "ryanHome", v: "box", light: "rainDay", amb: ["room", "rainSoft"], music: M("sadStrings", 0.65), outfit: { ryan: "grief2" } });
  r({ dur: 22, cam: [cu("ryan", 0.95, 0.1, -0.05, 30), cu("ryan", 0.6, 0.06, -0.05, 26)], fx: [[0.5, "paper"]], lines: [["N", "And in that moment, every small thing she had ever said began to mean something else."], 0.8, ["W", "I was already fighting something when I met you. I didn't know whether I would have enough time to build a future. But then I met you, and for the first time, I wanted tomorrow."]], lead: 1.0, dof: 4, shake: 0.002, actors: { ryan: a([0.4, 0, 2.55], PI, "sitRead", [[0, "disbelief"], [0.35, "sad"], [0.65, "cry"], [0.85, "sob"]], { r: "letter", look: "down" }) } });
}

// ---- Scene 18: The Final Recording ----
{
  const rv = scene("The Final Recording", "ACT III", { env: "ryanHome", v: "box", light: "rainDay", amb: ["room", "rainSoft"], music: M("ambient", 0.45), outfit: { ryan: "grief2" } });
  rv({ dur: 9, fade: "in", cam: [cu("ryan", 0.95, 0.12, -0.05, 30), W([0.9, 1.0, 1.2], [0.7, 0.45, 0.95], 30)], fx: [[3.5, "beep"]], dof: 3, actors: { ryan: a([0.4, 0, 2.55], PI, "cameraLow", [[0, "lonely"], [0.5, "concern"], [0.8, "fear"]], { r: "camera", look: "down" }) } });
  const An: [number, number, number] = [-2.6, 0, -1.3];
  const vid = scene("The Final Recording", "ACT III", { env: "anyaHome", v: "full", light: "roomWarm", look: "rec", amb: ["room", "sea", "tape"], music: M("off"), outfit: { anya: "rec" } });
  vid({ dur: 20, tc: "REC 00:00:03", cam: [C(rel("anya", [0.1, 0.0, 1.5]), rel("anya", [0, -0.12, 0]), 32), C(rel("anya", [0.1, 0.0, 1.35]), rel("anya", [0, -0.12, 0]), 32)], dof: 0, shake: 0.004, lines: [["A", "Hi, Ryan."], 0.9, ["A", "I don't know how many times I recorded this. I kept deleting the videos, because I didn't like the way I looked."], 1.0, ["A", "I wanted you to remember me smiling."]], lead: 1.2, actors: { anya: a(An, H, "sit", [[0, "smile"], [0.1, "laugh"], [0.22, "nervous"], [0.7, "hidden"], [0.88, "tearySmile"]], { look: "camera" }) } });
  const rr = scene("The Final Recording", "ACT III", { env: "ryanHome", v: "box", light: "rainDay", amb: ["room", "rainSoft"], music: M("off"), outfit: { ryan: "grief2" } });
  rr({ dur: 5, cam: [cu("ryan", 0.85, 0.12, -0.05, 30), cu("ryan", 0.7, 0.1, -0.05, 28)], dof: 3.5, actors: { ryan: a([0.4, 0, 2.55], PI, "cameraLow", [[0, "cry"], [0.5, "sob"]], { r: "camera", look: "down" }) } });
  const vid2 = scene("The Final Recording", "ACT III", { env: "anyaHome", v: "full", light: "roomWarm", look: "rec", amb: ["room", "sea", "tape"], music: M("off"), outfit: { anya: "rec" } });
  vid2({ dur: 26, tc: "REC 00:01:02", cam: [C(rel("anya", [0.1, 0.0, 1.4]), rel("anya", [0, -0.12, 0]), 32), C(rel("anya", [0.1, 0.0, 1.25]), rel("anya", [0, -0.12, 0]), 30)], dof: 0, shake: 0.004, lines: [["A", "I left because I was afraid you would spend the time we had watching me suffer."], 1.0, ["A", "I made that decision for both of us, without giving you a choice."], 1.2, ["A", "I know that wasn't fair. I'm sorry."]], lead: 0.8, actors: { anya: a(An, H, "sit", [[0, "hidden"], [0.35, "sad"], [0.65, "cry"], [0.9, "tearySmile"]], { look: "camera" }) } });
  rr({ dur: 4, cam: [cu("ryan", 0.8, -0.12, -0.05, 30), cu("ryan", 0.65, -0.1, -0.05, 28)], actors: { ryan: a([0.4, 0, 2.55], PI, "cameraLow", "sob", { r: "camera", look: "down" }) } });
  vid2({ dur: 34, tc: "REC 00:02:11", cam: [C(rel("anya", [0.1, 0.0, 1.35]), rel("anya", [0, -0.12, 0]), 30), C(rel("anya", [0.1, 0.0, 1.1]), rel("anya", [0, -0.12, 0]), 28)], dof: 0, lines: [["A", "I arranged for your unfinished song to be completed, and recorded with a small orchestra. I wanted you to hear it on the day we were meant to be married."], 1.4, ["A", "There's one thing I lied about. I told you I never needed tomorrow."], 1.0, ["A", "The truth is... I wanted every tomorrow with you."]], lead: 0.8, actors: { anya: a(An, H, "sit", [[0, "gentle"], [0.4, "tearySmile"], [0.72, "hidden"], [0.88, "tearySmile"], [0.97, "smile"]], { look: "camera" }) } });
  rr({ dur: 38, fade: "out", cam: [cu("ryan", 0.95, 0.06, -0.05, 28), cu("ryan", 0.55, 0.04, -0.05, 24)], music: M("sad", 0.35), fx: [[0.3, "rec"]], dof: 4.5, shake: 0.0012, actors: { ryan: a([0.4, 0, 2.55], PI, "cameraLow", [[0, "disbelief"], [0.12, "cry"], [0.3, "sob"], [0.75, "cry"], [0.93, "accept"]], { r: "camera", look: "down" }) } });
}

// ============================ ACT IV ============================
{
  const s = scene("Act IV", "ACT IV", { env: "void", light: "night", amb: ["wind"], music: M("off") });
  s({ dur: 4.5, fade: "both", card: { title: "ACT IV", sub: "BEFORE THE LAST GOODBYE" }, cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)], amb: [] });
}

// ---- Scene 19: The Completed Song ----
{
  const s = scene("The Completed Song", "ACT IV", { env: "ryanHome", light: "roomWarm", amb: ["room", "sea"], music: M("ambient", 0.4), outfit: { ryan: "grief2" } });
  s({ dur: 11, fade: "in", caption: "A small envelope, delivered by hand", cam: [W([-0.5, 1.5, 0.8], [2.0, 1.2, 3.2], 38), cu("ryan", 0.9, 0.12, 0, 30)], fx: [[0.5, "knock"], [2.5, "door"]], doc: ["STUDIO NOTE", "", "“Tomorrow” — strings, piano & guitar.", "Recorded as requested.", "", "To be delivered on the day."], actors: { ryan: a([1.2, 0, 0.8], undefined, "walk", [[0, "lonely"], [0.5, "surprise"]], { to: [2.8, 0, 2.6], look: [3.2, 1.2, 3.4] }) } });
  s({ dur: 18, cam: [prof("ryan", -1.1, 0, 0, 30), cu("ryan", 0.9, 0.1, 0, 30)], music: M("full", 0.8), shake: 0.002, dof: 3, actors: { ryan: a([-1.5, 0, -1.75], PI, "sit", [[0, "lonely"], [0.25, "sad"], [0.55, "cry"], [0.85, "accept"]], { wear: ["headphones"], look: [-1.5, 0.9, -2.4] }) } });
  s({ dur: 14, cam: [cu("ryan", 0.8, 0.1, 0, 28), cu("ryan", 0.6, 0.08, 0, 26)], music: M("full", 0.75), lines: [["N", "Somewhere inside that melody was the sentence she never got to say: keep going."]], lead: 1.5, dof: 3.5, actors: { ryan: a([-1.5, 0, -1.75], PI, "sit", [[0, "accept"], [0.6, "hope"]], { wear: ["headphones"], look: [-1.5, 0.9, -2.4] }) } });
  s({ dur: 20, cam: [prof("ryan", -1.2, 0, 0, 30), C(rel("ryan", [-0.7, -0.5, 0.1]), rel("ryan", [0, -0.55, 0.55]), 28)], music: M("piano", 0.95), lines: [1.0, 12, ["W", "Tomorrow."]], lead: 0.5, shake: 0.002, dof: 2.5, actors: { ryan: a([-1.5, 0, -1.75], PI, "piano", [[0, "accept"], [0.5, "hope"], [0.9, "gentle"]], { look: [-1.5, 1.0, -2.4] }) } });
}

// ---- Scene 20: The Lighthouse ----
{
  const s = scene("The Lighthouse", "ACT IV", { env: "lighthouse", v: "day", light: "golden", amb: ["wind", "sea", "gulls"], music: M("pianoSparse", 0.5), outfit: { ryan: "older" } });
  const BR: [number, number, number] = [-1.3, 0, -5.15];
  s({ dur: 9, fade: "in", caption: "The lighthouse", cam: [W([-6, 2.4, 6.5], [3, 4.5, -4.5], 40), W([-3, 1.8, 3.5], [0.2, 1.3, -4.5], 38)], actors: { ryan: a([6.0, 0, 3.0], undefined, "walk", "peace", { to: [-1.0, 0, -4.0], look: [-1.3, 0.8, -5.2], r: "flower", outfit: "grief2" }) } });
  s({ dur: 9, cam: [W([-1.3, 1.3, -8.5], [-1.3, 1.0, -5.1], 34), W([-1.3, 1.25, -7.6], [-1.3, 1.0, -5.1], 32)], actors: { ryan: a(BR, PI, "sit", [[0, "peace"], [0.6, "sad"]], { r: "flower", l: "photo:laugh", look: "down", outfit: "grief2" }) }, dof: 2.5 });
  s({ dur: 18, cam: [cu("ryan", 0.9, 0.15, 0, 30), cu("ryan", 0.62, 0.1, 0, 28)], fx: [[0.6, "paper"]], lines: [["W", "I don't know what happens after this life. I don't know whether memories can find us again. But I know that loving you made my life bigger than my fears."]], lead: 1.5, music: M("pianoSparse", 0.5), dof: 3.5, actors: { ryan: a(BR, PI, "sitRead", [[0, "sad"], [0.5, "cry"], [0.85, "accept"]], { r: "letter", look: "down", outfit: "grief2" }) } });
  s({ dur: 14, cam: [W([-1.3, 1.2, -8.6], [-1.3, 1.1, -5.1], 34), two([0.5, 0.3, -4.0], [0, -0.1, 0], 36)], music: M("full", 0.75), dof: 3, actors: { ryan: a(BR, PI, "sit", [[0, "accept"], [0.5, "hope"]], { l: "photo:laugh", look: "sea", outfit: "grief2" }) } });
}

// ---- Scene 21: The Final Sunrise ----
{
  const s = scene("The Final Sunrise", "ACT IV", { env: "beach", v: "photos", light: "sunrise", amb: ["sea", "gulls", "birds", "wind"], music: M("pianoSparse", 0.5), outfit: { ryan: "grief2" } });
  const R: [number, number, number] = [-0.3, 0, -1.5];
  s({ dur: 10, fade: "in", caption: "The beach — sunrise", cam: [W([2.5, 1.6, 6.5], [0, 1.2, -4], 38), W([1.2, 1.4, 3.5], [0, 1.1, -3], 36)], actors: { ryan: a([-3, 0, 4.0], undefined, "walk", "peace", { to: [R[0], 0, R[2] + 0.9], look: "sea" }) }, fx: [[0.3, "stepsSand"]], dof: 1.5 });
  s({ dur: 10, cam: [C(rel("ryan", [0.45, -0.1, 1.0]), rel("ryan", [0.15, -0.55, 0.5]), 30), cu("ryan", 0.9, 0.1, 0, 30)], fx: [[1.0, "paper"]], lines: [["W", "When you miss me, look for the light. I'll be there in every new beginning."]], lead: 1.4, dof: 3, actors: { ryan: a(R, PI, "sit", [[0, "sad"], [0.5, "cry"], [0.9, "accept"]], { look: [0.7, 0.5, -1.5] }) } });
  s({ dur: 11, cam: [cu("ryan", 0.85, 0.08, 0, 30), cu("ryan", 0.62, 0.05, 0, 28)], music: M("strings", 0.65), dof: 3.5, actors: { ryan: a(R, PI, "sit", [[0, "cry"], [0.45, "accept"], [0.8, "smile"]], { look: "sea" }) } });
  s({ dur: 11, cam: [cu("ryan", 0.85, 0.12, 0, 30), cu("ryan", 0.7, 0.1, 0, 28)], music: M("strings", 0.65), lines: [["R", "Goodbye, Anya."], 1.8, ["R", "And thank you."]], lead: 1.2, dof: 3.5, actors: { ryan: a(R, PI, "sit", [[0, "tearySmile"], [0.55, "hope"], [0.85, "smile"]], { look: "sea" }) } });
  s({ dur: 30, cam: [W([-0.3, 1.35, 0.5], [-0.3, 1.0, -8], 38), W([0.0, 14, 46], [0, 3.0, -30], 44)], lin: false, music: M("peak", 0.95), dof: 0, shake: 0.0015, actors: { ryan: a(R, PI, "sit", "hope", { look: "sea" }) } });
  const t = scene("The Final Sunrise", "ACT IV", { env: "void", light: "night", amb: ["sea"], music: M("peak", 0.8) });
  t({ dur: 8, fade: "both", card: { title: "BEFORE THE LAST GOODBYE", big: true }, cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)] });
}

// ---- Credits ----
{
  const s = scene("Credits", "CREDITS", { env: "void", light: "night", amb: [], music: M("piano", 0.7) });
  s({ dur: 62, credits: true, fade: "in", cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)] });
}

// ---- Post-credit: One Last Message ----
{
  const s = scene("One Last Message", "POST-CREDIT", { env: "ryanHome", v: "modern", light: "roomDay", amb: ["room", "sea", "birds"], music: M("pianoSparse", 0.5), outfit: { ryan: "older" } });
  s({ dur: 9, fade: "in", caption: "Several years later", cam: [W([0.8, 1.6, 0.4], [2.5, 1.1, -2.9], 38), W([1.5, 1.5, -0.6], [2.8, 1.1, -2.9], 34)], actors: { ryan: a([2.7, 0, -2.0], PI, "write", "peace", { r: "pen", look: [2.6, 0.85, -2.9] }) }, fx: [[4.5, "knock"]] });
  s({ dur: 7, cam: [ms("ryan", 1.8, 0.4, 0), cu("ryan", 0.9, 0.12, 0, 30)], fx: [[0.6, "door"], [1.4, "paper"]], actors: { ryan: a([1.0, 0, 0.0], 0, "stand", [[0, "confusion"], [0.5, "surprise"], [0.8, "affection"]], { r: "camera", look: "down" }) }, dof: 3 });
  const v = scene("One Last Message", "POST-CREDIT", { env: "anyaHome", v: "full", light: "roomWarm", look: "rec", amb: ["room", "sea", "tape"], music: M("off"), outfit: { anya: "cafe" } });
  v({ dur: 28, tc: "REC 00:03:20", cam: [C(rel("anya", [0.1, 0.0, 1.45]), rel("anya", [0, -0.12, 0]), 32), C(rel("anya", [0.1, 0.0, 1.3]), rel("anya", [0, -0.12, 0]), 30)], dof: 0, lines: [["A", "Ryan, if you ever found this... I hope you learned to be happy again."], 1.2, ["A", "And please, don't spend your life waiting for me."], 1.0, ["A", "Live, Ryan. There are still so many beautiful mornings."]], lead: 1.0, actors: { anya: a([-2.6, 0, -1.3], H, "sit", [[0, "smile"], [0.4, "gentle"], [0.75, "tearySmile"], [0.95, "smile"]], { look: "camera" }) } });
  const w = scene("One Last Message", "POST-CREDIT", { env: "ryanHome", v: "modern", light: "roomDay", amb: ["room", "sea", "birds"], music: M("strings", 0.55), outfit: { ryan: "older" } });
  w({ dur: 12, fade: "in", cam: [W([0.4, 1.5, -1.0], [0.4, 1.5, -4.0], 36), cu("ryan", 0.9, 0.12, 0, 30)], dof: 3, actors: { ryan: a([0.4, 0, -2.6], PI, "stand", [[0, "accept"], [0.5, "hope"], [0.85, "smile"]], { look: [0.4, 1.5, -8] }) } });
  w({ dur: 12, fade: "out", cam: [W([-0.45, 1.08, -2.0], [-0.45, 1.0, -3.05], 30), W([-0.45, 1.06, -2.5], [-0.45, 1.0, -3.05], 26)], dof: 2, music: M("strings", 0.5), actors: {}, shake: 0.001 });
  const e = scene("One Last Message", "POST-CREDIT", { env: "void", light: "night", amb: [], music: M("off") });
  e({ dur: 12, fade: "both", card: { title: "Some goodbyes never stop hurting. But some memories never stop giving us a reason to live.", sub: "END" }, cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)] });
}

function ms2(id: "ryan" | "anya") {
  return C(rel(id, [0.3, -0.05, 1.8]), rel(id, [0, -0.3, 0]), 34);
}

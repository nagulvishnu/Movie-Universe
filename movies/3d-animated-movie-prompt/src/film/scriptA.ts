import { scene, a, cu, ms, ots, prof, two, W, C, rel, M, PI, H } from "./dsl";

// =====================================================================
// OPENING — THE LAST TRAIN
// =====================================================================
{
  const s = scene("The Last Train", undefined, { env: "station", light: "stationRain", rain: 1, amb: ["rain", "station", "train", "wind"], music: M("pianoSparse", 0.55), outfit: { ryan: "station", anya: "station" } });
  s({ dur: 9, fade: "in", caption: "Samudrapuram Railway Station — a rainy evening", cam: [W([-17, 1.9, 1.2], [0, 1.7, 0.4], 38), W([-9, 1.7, 1.1], [0, 1.5, 0.4], 38)], lin: true, dof: 0, lines: [["N", "Sometimes, the most important people enter our lives without warning."]], lead: 1.2 });
  s({ dur: 7, cam: [W([2, 3.4, -0.6], [2, 0.6, -2.6], 40), W([2.4, 2.8, -0.6], [2.4, 0.3, -2.6], 40)], dof: 1.5, lines: [["N", "They don't arrive with promises. They don't announce themselves."]], lead: 0.8 });
  s({ dur: 8, cam: [W([-3, 0.3, 3.0], [2, 0.7, -1.5], 46), W([-1, 0.35, 3.0], [3, 0.8, -1.5], 46)], fx: [[2, "horn"]], dof: 3, lines: [["N", "They simply appear... and somehow, the ordinary days begin to feel extraordinary."]], lead: 1 });
  s({ dur: 6, cam: [W([-3.6, 1.3, -2.2], [-1.2, 1.1, 2.4], 34), W([-3.0, 1.3, -1.6], [-1.2, 1.1, 2.4], 34)], actors: { ryan: a([-1.2, 0, 2.45], PI, "sit", "lonely", { wear: ["headphones"], look: "down" }) } });
  s({ dur: 5, cam: [cu("ryan", 0.8, 0.15, 0.0, 28), cu("ryan", 0.62, 0.1, 0.0, 28)], actors: { ryan: a([-1.2, 0, 2.45], PI, "sit", [[0, "lonely"], [0.6, "peace"]], { wear: ["headphones"], look: [-6, 1.4, -4] }) }, dof: 3 });
  s({ dur: 5, cam: [W([7, 1.4, 3.2], [8.5, 1.0, 0.9], 40), W([-0.5, 1.4, 3.2], [1.5, 1.0, 0.9], 40)], lin: true, fx: [[0.3, "stepsRun"]], actors: { anya: a([14, 0, 0.9], undefined, "run", "nervous", { to: [-0.2, 0, 0.9], wear: ["bag"], look: "away" }) } });
  s({ dur: 4.5, cam: [W([-0.6, 1.5, -1.1], [-0.9, 1.1, 1.6], 32), W([-1.1, 1.4, -0.8], [-1.2, 1.1, 1.7], 32)], fx: [[1.5, "paper"]], actors: { ryan: a([-1.2, 0, 2.45], PI, "sit", "peace", { wear: ["headphones"], look: "down" }), anya: a([0.2, 0, 1.0], undefined, "walk", "playful", { to: [-2.4, 0, 1.0], wear: ["bag"], r: "umbrellaClosed", look: "away" }) } });
  s({ dur: 6, cam: [ms("ryan", 1.9, 0.5, 0), ms("ryan", 1.6, 0.4, 0)], lines: [["R", "Excuse me... I think that's mine."]], lead: 0.9, actors: { ryan: a([-1.2, 0, 1.9], "anya", "stand", [[0, "confusion"], [0.5, "gentle"]], { look: "anya" }), anya: a([-3.0, 0, 1.0], PI * 1.4, "walk", "playful", { wear: ["bag"], r: "umbrellaClosed", look: "away" }) } });
  s({ dur: 5.5, cam: [cu("anya", 0.85, 0.12, 0, 30), cu("anya", 0.7, 0.1, 0, 30)], lines: [["A", "Oh! Sorry. I thought the universe finally gave me an umbrella."]], lead: 0.6, actors: { ryan: a([-1.2, 0, 1.9], "anya", "stand", "gentle"), anya: a([-3.0, 0, 1.2], "ryan", "stand", [[0, "surprise"], [0.35, "laugh"], [0.75, "playful"]], { wear: ["bag"], r: "umbrellaClosed" }) } });
  s({ dur: 5, cam: [ots("anya", "ryan", 0.8, 0.35, 0.1, 30), ots("anya", "ryan", 0.7, 0.35, 0.1, 30)], lines: [["R", "Does the universe usually steal things from people?"]], lead: 0.4, actors: { ryan: a([-1.2, 0, 1.9], "anya", "stand", [[0, "gentle"], [0.5, "smile"]], { look: "anya" }), anya: a([-3.0, 0, 1.2], "ryan", "stand", "listen", { wear: ["bag"], r: "umbrellaClosed" }) } });
  s({ dur: 5, cam: [cu("anya", 0.8, -0.15, 0, 30), cu("anya", 0.8, -0.15, 0, 30)], lines: [["A", "Only when it's raining."]], lead: 0.4, actors: { ryan: a([-1.2, 0, 1.9], "anya", "stand", "smile"), anya: a([-3.0, 0, 1.2], "ryan", "hold", [[0, "playful"], [0.6, "smile"]], { wear: ["bag"], r: "umbrellaClosed" }) } });
  s({ dur: 7, cam: [two([0, 0.2, 3.4], [0, -0.2, 0], 36), two([0.4, 0.15, 3.0], [0, -0.2, 0], 36)], fx: [[0.3, "chime"]], lines: [["P", "Attention please. The eight forty-five coastal express will arrive shortly on platform two.", "Announcement"], 0.4, ["A", "You look like someone who has been waiting for something."]], lead: 0.5, actors: { ryan: a([-1.6, 0, 1.6], "anya", "stand", [[0, "gentle"], [0.55, "lonely"]], { look: [-1.6, 3, 4] }), anya: a([-2.7, 0, 1.4], "ryan", "stand", [[0, "listen"], [0.6, "concern"]], { wear: ["bag"] }) } });
  s({ dur: 6, cam: [cu("ryan", 0.9, 0.12, 0, 30), cu("ryan", 0.62, 0.08, 0, 28)], lines: [["R", "Maybe I have."]], lead: 1.2, dof: 3, actors: { ryan: a([-1.6, 0, 1.6], "anya", "stand", [[0, "lonely"], [0.5, "gentle"], [0.8, "hope"]], { look: "anya" }), anya: a([-2.7, 0, 1.4], "ryan", "stand", "gentle", { wear: ["bag"], r: "umbrellaClosed" }) } });
  s({ dur: 5, cam: [ms("anya", 1.8, -0.35, 0), ms("anya", 1.5, -0.3, 0)], lines: [["A", "Well, good luck finding it."]], lead: 0.4, actors: { ryan: a([-1.6, 0, 1.6], "anya", "stand", "gentle"), anya: a([-2.7, 0, 1.4], "ryan", "stand", [[0, "playful"], [0.7, "gentle"]], { wear: ["bag"], r: "umbrellaClosed" }) } });
  s({ dur: 8, cam: [W([-6, 1.5, -1.2], [-1.8, 1.4, 1.4], 36), W([-6.5, 1.5, -1.0], [-4, 1.4, 1.4], 36)], fx: [[0.2, "stepsWet"]], actors: { ryan: a([-1.6, 0, 1.6], PI * 1.5 + 0.2, "stand", "lonely", { look: "away" }), anya: a([-2.7, 0, 1.4], undefined, "walk", "gentle", { to: [-12, 0, 2.6], wear: ["bag"], look: "away" }) }, dof: 2.5 });
  s({ dur: 8, cam: [cu("ryan", 0.9, 0.1, -0.05, 30), cu("ryan", 0.7, 0.08, -0.05, 28)], lines: [["W", "You looked like someone who needed a little sunshine."]], lead: 1.2, dof: 3, actors: { ryan: a([-1.6, 0, 1.6], PI * 1.5, "read", [[0, "lonely"], [0.4, "surprise"], [0.7, "smile"]], { r: "note", l: "umbrellaClosed", look: "down" }) } });
  s({ dur: 11, fade: "out", cam: [W([-7, 1.6, -1.8], [-1.5, 1.7, 2.4], 36), W([-9, 1.9, -3.0], [-1.0, 1.9, 2.4], 34)], lin: true, music: M("strings", 0.7), card: { title: "BEFORE THE LAST GOODBYE", sub: "She promised she would never leave. He never knew she had already said goodbye.", big: true }, actors: { ryan: a([-1.6, 0, 1.6], PI * 1.5, "stand", "smile", { look: "down", r: "note", l: "umbrellaClosed" }) }, dof: 1.5 });
}

// =====================================================================
// ACT I — THE GIRL WHO CHANGED HIS DAYS
// =====================================================================
{
  const s = scene("Act I", "ACT I", { env: "void", light: "night", amb: ["wind"], music: M("off") });
  s({ dur: 4.5, fade: "both", card: { title: "ACT I", sub: "THE GIRL WHO CHANGED HIS DAYS" }, cam: [W([0, 1, 0], [0, 40, -30], 60), W([0, 1, 0], [0, 38, -30], 60)], amb: [] });
}

// ---- Scene 1: The Bookstore Café ----
{
  const s = scene("The Bookstore Café", "ACT I", { env: "bookstore", light: "bookWarm", amb: ["cafe", "sea"], music: M("guitar", 0.5), outfit: { ryan: "work", anya: "cafe" } });
  const RY: [number, number, number] = [2.2, 0, -2.75];
  const AN: [number, number, number] = [2.05, 0, -0.95];
  s({ dur: 8, fade: "in", caption: "A few days later — the bookstore by the beach", cam: [W([-4, 1.7, 3.0], [1.5, 1.3, -1.5], 40), W([-2.6, 1.6, 2.7], [1.8, 1.3, -1.8], 40)], actors: { ryan: a(RY, 0, "handsFront", "peace", { look: "down" }) } });
  s({ dur: 5, cam: [ms("ryan", 2.0, 0.3, 0), ms("ryan", 1.7, 0.3, 0)], fx: [[0.2, "doorbell"], [0.4, "door"]], actors: { ryan: a(RY, 0, "handsFront", [[0, "listen"], [0.45, "surprise"], [0.7, "smile"]], { look: [3.2, 1.5, 3.4] }) } });
  s({ dur: 7, cam: [W([3.8, 1.4, 2.8], [2.8, 1.2, 0.2], 36), W([3.0, 1.4, 1.4], [2.2, 1.2, -1.2], 36)], fx: [[0.5, "steps"]], actors: { ryan: a(RY, 0, "handsFront", "smile", { look: "anya" }), anya: a([3.2, 0, 3.0], undefined, "walk", [[0, "curiosity"], [0.8, "playful"]], { to: AN, look: "ryan" }) } });
  s({ dur: 5, cam: [ots("ryan", "anya", 0.8, 0.3, 0.08, 30), ots("ryan", "anya", 0.65, 0.3, 0.08, 30)], lines: [["A", "The umbrella thief!"]], lead: 0.3, actors: { ryan: a(RY, 0, "handsFront", "surprise"), anya: a(AN, PI, "stand", [[0, "playful"], [0.5, "laugh"]]) } });
  s({ dur: 6, cam: [ots("anya", "ryan", 0.75, 0.3, 0.08, 30), ots("anya", "ryan", 0.6, 0.3, 0.08, 30)], lines: [["R", "I was going to say the girl who leaves mysterious messages."]], lead: 0.4, actors: { ryan: a(RY, 0, "handsFront", [[0, "smile"], [0.6, "shy"]]), anya: a(AN, PI, "stand", "listen") } });
  s({ dur: 5, cam: [two([0.4, 0.1, 2.6], [0, -0.2, 0], 36), two([0.2, 0.1, 2.2], [0, -0.2, 0], 36)], fx: [[1, "clink"]], actors: { ryan: a(RY, 0, "handsFront", "laugh", { look: "anya" }), anya: a(AN, PI, "stand", "laugh", { look: "ryan" }) } });
  const photo = (key: string, line: [string, string], reply: [string, string] | null, who: "A" | "R" = "A") => {
    s({ dur: 5, cam: [C(rel("anya", [0, -0.22, 0.95]), rel("anya", [0, -0.2, 0.4]), 24), C(rel("anya", [0, -0.22, 0.8]), rel("anya", [0, -0.2, 0.4]), 24)], fx: [[0.2, "paper"]], lines: reply ? [[line[0] as "A", line[1]], [reply[0] as "A", reply[1]]] : [[line[0] as "A", line[1]]], lead: 0.5, dof: 2, actors: { ryan: a(RY, 0, "handsFront", "smile"), anya: a(AN, "ryan", "hold", who === "A" ? "smile" : "playful", { r: `photo:${key}:show`, look: "ryan" }) } });
  };
  s({ dur: 5, cam: [ms("anya", 1.7, -0.3, 0), ms("anya", 1.4, -0.3, 0)], lines: [["A", "I'm a photographer. Do you want to see?"], ["R", "Please."]], lead: 0.4, actors: { ryan: a(RY, 0, "handsFront", "listen"), anya: a(AN, PI, "camera", "playful", { r: "camera" }) } });
  photo("sunrise", ["A", "North jetty. Five in the morning. I almost froze."], null);
  photo("rain", ["A", "Streets after rain. Empty, like the town is holding its breath."], null);
  photo("light", ["R", "That's the old lighthouse."], ["A", "Nobody goes up there anymore."]);
  photo("child", ["A", "He chased the waves for an hour. He never once looked at my camera."], null);
  photo("couple", ["A", "And these two walk the beach every evening. Same time, same bench."], null);
  s({ dur: 8, cam: [cu("anya", 0.8, 0.15, 0, 30), cu("anya", 0.7, 0.1, 0, 30)], lines: [["A", "I like taking pictures of things people usually forget to notice."]], lead: 0.3, actors: { ryan: a(RY, 0, "handsFront", "affection"), anya: a(AN, PI, "stand", [[0, "gentle"], [0.8, "hope"]], { look: "ryan" }) } });
  s({ dur: 7, cam: [cu("ryan", 0.8, -0.12, 0, 30), cu("ryan", 0.65, -0.1, 0, 28)], lines: [["R", "Maybe that's why your photographs feel different."]], lead: 0.5, actors: { ryan: a(RY, 0, "handsFront", [[0, "affection"], [0.7, "shy"]], { look: "anya" }), anya: a(AN, PI, "stand", "gentle") }, dof: 3 });
  s({ dur: 8, cam: [ots("ryan", "anya", 0.75, 0.3, 0.08, 30), two([0.5, 0.1, 2.4], [0, -0.2, 0], 36)], lines: [["R", "Can I make you a coffee? It's the only thing I'm properly good at."], ["A", "I'll be back tomorrow. For the coffee."], ["R", "Just the coffee?"], 0.4], lead: 0.4, music: M("guitar", 0.6), actors: { ryan: a(RY, 0, "handsFront", [[0, "shy"], [0.7, "smile"], [0.9, "shy"]], { look: "anya" }), anya: a(AN, PI, "stand", [[0, "gentle"], [0.55, "playful"]], { look: "ryan" }) } });
}

// ---- Scene 2: Small Conversations ----
{
  const s = scene("Small Conversations", "ACT I", { env: "bookstore", light: "bookWarm", amb: ["cafe", "sea"], music: M("light", 0.5), outfit: { ryan: "work", anya: "denim" } });
  const RY: [number, number, number] = [2.2, 0, -2.75];
  const AN: [number, number, number] = [2.05, 0, -0.95];
  s({ dur: 6, fade: "in", caption: "Small conversations", cam: [W([1.0, 1.5, 3.0], [2.4, 1.3, -1.8], 38), W([2.0, 1.5, 2.4], [2.4, 1.3, -1.8], 38)], fx: [[0.3, "doorbell"]], actors: { ryan: a(RY, 0, "handsFront", "smile", { look: "anya" }), anya: a([3.2, 0, 3.0], undefined, "walk", "playful", { to: AN, outfit: "denim", look: "ryan" }) } });
  s({ dur: 8, cam: [ots("ryan", "anya", 0.8, 0.3, 0.08, 30), cu("anya", 0.8, 0.12, 0, 30)], lines: [["R", "Start with this one. It's slow. You'll hate it for ten pages."], ["A", "And after ten pages?"], ["R", "You'll hate everyone who interrupts you."]], lead: 0.4, actors: { ryan: a(RY, 0, "hold", [[0, "gentle"], [0.8, "playful"]], { r: "book", look: "anya" }), anya: a(AN, PI, "stand", [[0, "curiosity"], [0.4, "playful"], [0.8, "laugh"]], { look: "ryan" }) } });
  s({ dur: 9, cam: [W([-1.5, 1.5, 3.0], [-1.5, 1.0, 0.8], 34), two([0, 0.05, 2.3], [0, -0.25, 0], 36)], lines: [["A", "You're too serious. You read the menu like it's a contract."], ["R", "And you photograph everything. Even my coffee."], ["A", "Your coffee has a very photogenic cup."]], lead: 0.5, actors: { ryan: a([-0.88, 0, 0.8], -H, "sitCup", [[0, "gentle"], [0.4, "playful"], [0.8, "laugh"]], { r: "coffee", look: "anya" }), anya: a([-2.12, 0, 0.8], H, "sitCup", [[0, "playful"], [0.5, "smile"], [0.8, "laugh"]], { r: "coffee", look: "ryan" }) } });
  s({ dur: 6, cam: [ms("anya", 1.5, 0.3, 0), cu("ryan", 0.9, 0.15, 0, 32)], fx: [[2.8, "shutter"]], lines: [["R", "Please don't."], ["A", "Too late."]], lead: 0.4, actors: { ryan: a(RY, 0, "handsFront", [[0, "shy"], [0.6, "laugh"]], { look: "anya" }), anya: a(AN, PI, "camera", [[0, "playful"], [0.6, "laugh"]], { r: "camera", look: "ryan" }) } });
  // Ryan composes, Anya listens
  const s2 = scene("Small Conversations", "ACT I", { env: "ryanHome", light: "roomWarm", amb: ["room", "sea"], music: M("piano", 0.55), outfit: { ryan: "home", anya: "denim" } });
  s2({ dur: 9, fade: "in", caption: "Ryan's apartment", cam: [W([-3.3, 1.5, -0.3], [-1.5, 1.2, -2.2], 38), prof("ryan", -1.0, 0, 0, 30)], actors: { ryan: a([-1.5, 0, -1.75], PI, "piano", "peace", { look: [-1.5, 1.1, -2.5] }), anya: a([-0.45, 0, -1.7], -H, "sit", [[0, "listen"], [0.5, "affection"]], { look: "ryan" }) }, shake: 0.002 });
  s2({ dur: 7, cam: [cu("anya", 0.8, 0.12, 0, 30), cu("anya", 0.65, 0.1, 0, 28)], lines: [["A", "Play that part again. The one that sounds like a door opening."], ["R", "You heard a door?"], ["A", "I heard someone coming home."]], lead: 0.5, dof: 3, actors: { ryan: a([-1.5, 0, -1.75], "anya", "sit", [[0, "surprise"], [0.8, "shy"]]), anya: a([-0.45, 0, -1.7], "ryan", "sit", [[0, "affection"], [0.6, "gentle"]]) } });
  // walk along the beach
  const s3 = scene("Small Conversations", "ACT I", { env: "beach", light: "golden", amb: ["sea", "wind", "gulls"], music: M("light", 0.5), outfit: { ryan: "casual", anya: "sea" } });
  s3({ dur: 10, fade: "in", cam: [W([-3, 1.4, 6.0], [-1, 1.2, 2.4], 36), W([4, 1.4, 6.0], [2.5, 1.2, 2.4], 36)], fx: [[0.3, "stepsSand"]], lines: [["A", "You walk like you're late for something."], ["R", "You walk like you're lost."], ["A", "I never get lost. I just find new places."]], lead: 0.5, actors: { ryan: a([-5, 0, 2.5], undefined, "walk", [[0, "gentle"], [0.4, "playful"], [0.7, "shy"]], { to: [3, 0, 2.5], look: "anya" }), anya: a([-5.9, 0, 2.5], undefined, "walk", [[0, "playful"], [0.5, "laugh"]], { to: [2.1, 0, 2.5], look: "ryan" }) } });
}

// ---- Scene 3: The First Rain ----
{
  const s = scene("The First Rain", "ACT I", { env: "street", v: "rain", light: "rainDay", rain: 1, amb: ["rain", "street"], music: M("light", 0.45), outfit: { ryan: "rain", anya: "rust" } });
  s({ dur: 5, fade: "in", caption: "The first rain", cam: [W([-12, 1.5, 6.5], [-6, 1.0, 2.0], 40), W([-6, 1.4, 5.5], [-3.5, 1.0, 3.0], 40)], fx: [[0.1, "stepsRun"]], actors: { ryan: a([-12, 0, 1.4], undefined, "run", "laugh", { to: [-3.2, 0, 3.0], look: "away" }), anya: a([-12.8, 0, 1.0], undefined, "run", "laugh", { to: [-3.9, 0, 3.2], wear: ["bag"], look: "away" }) } });
  s({ dur: 9, cam: [two([0.2, 0.0, 3.6], [0, -0.25, 0], 36), cu("ryan", 0.85, 0.15, 0, 30)], lines: [["R", "You're taking pictures even now?"], ["A", "Especially now."]], lead: 0.6, amb: ["rain", "street"], actors: { ryan: a([-3.0, 0, 3.0], -0.2, "stand", [[0, "laugh"], [0.5, "gentle"], [0.9, "laugh"]], { look: "anya" }), anya: a([-3.8, 0, 3.0], 0.2, "camera", [[0, "laugh"], [0.5, "playful"]], { wear: ["bag"], look: "ryan", r: "camera" }) } });
  s({ dur: 6, cam: [cu("ryan", 0.8, 0.12, 0, 30), cu("ryan", 0.62, 0.1, 0.0, 28)], fx: [[3.2, "shutter"]], music: M("pianoSparse", 0.55), dof: 3.5, actors: { ryan: a([-3.0, 0, 3.0], "anya", "stand", [[0, "laugh"], [0.7, "laugh"]], { look: "anya" }), anya: a([-3.8, 0, 3.0], "ryan", "camera", "playful", { wear: ["bag"], r: "camera" }) } });
  s({ dur: 7, cam: [C(rel("anya", [0, -0.25, 0.9]), rel("anya", [0, -0.2, 0.4]), 24), C(rel("anya", [0, -0.25, 0.75]), rel("anya", [0, -0.2, 0.4]), 24)], dof: 2, music: M("piano", 0.6), lines: [["A", "Look at you. That's the whole sky laughing."], ["R", "I look ridiculous."], ["A", "You look happy."]], lead: 0.8, actors: { ryan: a([-3.0, 0, 3.0], "anya", "stand", "shy", { look: "anya" }), anya: a([-3.8, 0, 3.0], "ryan", "hold", [[0, "affection"], [0.5, "playful"], [0.8, "affection"]], { wear: ["bag"], r: "photo:laugh:show", look: "ryan" }) } });
}

// ---- Scene 4: The Lighthouse ----
{
  const s = scene("The Lighthouse", "ACT I", { env: "lighthouse", v: "day", light: "sunset", amb: ["wind", "sea", "gulls"], music: M("guitar", 0.5), outfit: { ryan: "casual", anya: "denim" } });
  s({ dur: 8, fade: "in", caption: "The old lighthouse", cam: [W([-6, 3.0, 8.0], [3, 4, -4.5], 40), W([-2, 2.6, 6.5], [3, 5, -4.5], 40)], lin: true, dof: 0.5, actors: { ryan: a([6.5, 0, 3.5], undefined, "walk", "gentle", { to: [-0.8, 0, -3.2], look: "anya" }), anya: a([6.0, 0, 4.5], undefined, "walk", "smile", { to: [-1.6, 0, -3.5], look: "ryan" }) } });
  const BR: [number, number, number] = [-1.75, 0, -5.15];
  const BA: [number, number, number] = [-0.85, 0, -5.15];
  s({ dur: 8, cam: [two([0.3, 0.15, -3.0], [0, -0.1, 0], 34), two([0.1, 0.1, -2.4], [0, -0.1, 0], 34)], lines: [["A", "I want to see everything. Every coastline, every city that doesn't know me yet."]], lead: 1.0, actors: { ryan: a(BR, PI, "sit", "affection", { look: "anya" }), anya: a(BA, PI, "sit", [[0, "smile"], [0.7, "hope"]], { look: "sea" }) } });
  s({ dur: 8, cam: [cu("ryan", 0.8, 0.0, 0, 30), cu("ryan", 0.65, 0.0, 0, 28)], lines: [["R", "I want to write something that makes people feel something. Even if they don't know why."]], lead: 0.5, dof: 3, actors: { ryan: a(BR, PI, "sit", [[0, "think"], [0.6, "hope"]], { look: "sea" }), anya: a(BA, PI, "sit", "affection", { look: "ryan" }) } });
  s({ dur: 6, cam: [prof("anya", 0.95, 0.1, 0, 30), cu("anya", 0.8, 0.0, 0, 28)], lines: [["A", "Then compose something for me."]], lead: 0.6, actors: { ryan: a(BR, PI, "sit", "surprise", { look: "anya" }), anya: a(BA, PI, "sit", [[0, "playful"], [0.7, "affection"]], { look: "ryan" }) } });
  s({ dur: 6, cam: [cu("ryan", 0.8, 0.1, 0, 30), cu("ryan", 0.65, 0.1, 0, 28)], lines: [["R", "What should it sound like?"]], lead: 0.4, actors: { ryan: a(BR, PI, "sit", [[0, "gentle"], [0.8, "affection"]], { look: "anya" }), anya: a(BA, PI, "sit", "playful", { look: "ryan" }) } });
  s({ dur: 8, cam: [cu("anya", 0.85, -0.1, 0, 30), cu("anya", 0.6, -0.05, 0, 28)], lines: [["A", "Like a day you never want to end."]], lead: 0.8, music: M("piano", 0.6), dof: 3, actors: { ryan: a(BR, PI, "sit", "affection", { look: "anya" }), anya: a(BA, PI, "sit", [[0, "affection"], [0.7, "hidden"], [0.95, "gentle"]], { look: "sea" }) } });
  s({ dur: 9, cam: [two([0.4, 0.3, -3.2], [0, -0.1, 0], 34), W([-3.0, 1.0, -9.5], [-1.3, 1.0, -5.2], 32)], lines: [["R", "I promise. I'll write it."]], lead: 0.8, music: M("strings", 0.6), actors: { ryan: a(BR, PI, "sit", [[0, "hope"], [0.6, "affection"]], { look: "anya" }), anya: a(BA, PI, "restL", "affection", { look: "sea" }) } });
}

// ACT 3 — THE JOURNEY (highway, hospital, village, bridge, research facility)
import { track } from './track';
import { close, cover, dur, fixed, follow, light, orbit, ots, sc, seq, sortShots, two } from './helpers';
import type { SceneDef } from './types';

const P = Math.PI;

// ============ highway ============
const hw1 = seq('a3h1', 9, [
  ['mira', 'Thousands of people were on this road. And nobody ran.'],
  ['arin', 'There was nowhere to run to.'],
  ['mira', 'The doors are all open. Like they just... stepped out.'],
]);
const hw2 = seq('a3h2', 12.4, [
  ['mira', 'Arin. Look at this.'],
  ['arin', "We don't touch anything."],
  ['mira', "It's a family. Two parents, a little girl... and a dog.", { emote: 'sad' }],
  ['arin', 'Mira.'],
  ['mira', 'Somebody drew this for them. Somebody loved them.'],
  ['arin', 'Put it back.', { emote: 'tired' }],
  ['mira', 'No. Someone should keep it.', { gap: 1.8 }],
  ['mira', 'Who did you lose, Arin?'],
  ['arin', 'Everyone lost someone.'],
  ['mira', "That's not an answer."],
  ['arin', "...It's the only one I have.", { emote: 'sad' }],
  ['mira', 'I was in a shelter under the radio tower, running a test. When I came up, the whole city was empty.'],
  ['arin', 'Lucky.'],
  ['mira', 'Is it?', { emote: 'sad' }],
]);

// ============ hospital ============
const hos1 = seq('a3o1', 9, [
  ['mira', 'The medical wing is at the end of the corridor.', { style: 'whisper' }],
  ['arin', 'Stay close. Touch nothing.', { style: 'whisper' }],
  ['mira', 'Do you hear that?', { style: 'whisper', gap: 1.4 }],
  ['arin', 'Water. Just water.', { style: 'whisper' }],
]);
const hos2a = seq('a3o2', 13, [
  ['mira', 'Arin. The beds are still made around them.', { style: 'whisper' }],
  ['arin', "Don't look too long. It doesn't help.", { style: 'whisper' }],
]);
const hos2b = seq('a3o2b', 22.8, [
  ['arin', "...That's a generator."],
  ['mira', "That's impossible. Everything died five years ago."],
  ['arin', 'Not everything.'],
]);
const HOS2 = 36;
const hos3b = seq('a3o3', 15, [
  ['scientist', 'This is Doctor Halden, emergency channel. The event is happening everywhere. We have no explanation. People are disappearing without warning.', { style: 'radio', label: 'RECORDING', dur: 11 }],
  ['mira', 'Everywhere.', { gap: 1.2 }],
  ['arin', 'Five years. And still nobody knows.'],
]);

// ============ village ============
const vil1 = seq('a3v1', 8, [
  ['mira', 'Look at the doors. Every one of them is open.'],
  ['arin', 'Nobody locked up. Nobody packed a bag.'],
  ['mira', "They didn't even know it was happening."],
]);
const vil2a = seq('a3v2', 4.5, [
  ['arin', 'Dinner for four. Still on the table.', { style: 'whisper' }],
  ['mira', 'Somebody was about to sit down. Right there.', { style: 'whisper' }],
]);
const vil2b = seq('a3v2b', 15, [
  ['video', 'Make a wish, sweetheart!', { label: 'VIDEO' }],
  ['mira', 'My mother used to film everything. Every birthday. Every ordinary Tuesday.', { emote: 'sad' }],
  ['mira', 'I used to hate it.'],
  ['mira', "I'd give anything to be embarrassed by her again.", { style: 'distress' }],
  ['arin', "I'm sorry."],
  ['arin', "You don't have to hold it together. Not here."],
  ['mira', "If I keep busy, I don't have to feel it."],
  ['arin', 'I know.'],
]);
const vil3 = seq('a3v3', 2.2, [
  ['mira', 'Thank you.'],
  ['arin', 'For what?'],
  ['mira', 'For not telling me it gets easier.'],
  ['arin', "It doesn't.", { gap: 1.3 }],
  ['arin', 'But it gets quieter.'],
]);

// ============ bridge ============
const br1 = seq('a3b1', 5, [
  ['arin', "That bridge isn't going to hold."],
  ['mira', "It's the only way across. The next one is two days north."],
  ['arin', '...Stay in the middle. Walk where I walk.'],
]);
const br2 = seq('a3b2', 7.5, [
  ['mira', 'Arin!!', { style: 'shout', dur: 1.2 }],
  ['arin', "Hold on! Don't let go!", { style: 'shout' }],
  ['mira', "I can't— my hands—", { style: 'distress' }],
  ['arin', "Look at me. Look at me! I've got you.", { style: 'shout' }],
  ['arin', 'Pull! One... two... now!', { style: 'shout', gap: 0.3 }],
]);
const BR2 = 25;
const br3 = seq('a3b3', 2.5, [
  ['mira', 'You came back.', { emote: 'sad' }],
  ['arin', "I didn't think. I just... moved."],
  ['mira', 'You said you work alone.'],
  ['arin', 'I did say that.', { emote: 'smile' }],
  ['mira', "Don't ever do that again."],
  ['arin', 'Which part?'],
  ['mira', 'The part where you nearly die for a stranger.', { emote: 'smile' }],
  ['arin', "You're not a stranger anymore.", { emote: 'smile' }],
]);

// ============ facility ============
const fa1 = seq('a3f1', 6, [
  ['mira', "This isn't on any map."],
  ['arin', "Which is exactly why I don't like it."],
  ['mira', 'Restricted. Annex Four.'],
  ['arin', 'Stay behind me.', { gap: 1 }],
]);
const fa2 = seq('a3f2', 3, [
  ['mira', "The power's still on. Barely.", { style: 'whisper' }],
  ['arin', "Something's keeping this place alive.", { style: 'whisper', gap: 6 }],
  ['arin', 'The camera. It moved.', { style: 'whisper' }],
  ['mira', "Automatic sweep. It's running on batteries.", { style: 'whisper' }],
  ['arin', 'Is it?', { style: 'whisper', gap: 2.5 }],
  ['mira', 'Look at the map. Every red mark has the same timestamp.'],
  ['arin', 'Eleven forty-seven. Zero seconds.'],
  ['mira', 'Two hundred and fourteen sites. Different continents. Same second.'],
  ['scientist', 'Site twelve confirms. Site nineteen confirms. It did not spread. It began everywhere at once.', { style: 'radio', label: 'RECORDING' }],
]);
const FA2 = 42;
const FA2_DUR = dur(FA2, fa2);
const fa3 = seq('a3f3', 4, [
  ['mira', "Wait. There's a note."],
  ['mira', "'If anyone survives, don't wait for the signal. Find the others.'", { emote: 'worried' }],
  ['arin', 'What signal?'],
  ['mira', 'Station 17. It has to be.'],
  ['arin', 'Or whoever wants us to follow it.'],
  ['mira', 'Find the others. What others?'],
  ['arin', "I don't know. But this place was built to watch something. And it just went dark.", { gap: 1 }],
]);

export const act3: SceneDef[] = [
  // ---------------- highway ----------------
  sc({
    id: 'a3_hw1', name: 'The Forgotten Highway', act: 3, env: 'highway', mode: 'ruined', dur: dur(30, hw1), music: 'haunting',
    light: light('dusk'), fx: { dust: 0.3, debris: 0.5, wind: 0.4 }, ambience: { wind: 0.3, birds: 0.2, creaks: 0.1 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.6, dur: 5, text: 'ACT THREE', sub: 'THE JOURNEY', style: 'act' }, { at: 6.5, dur: 4, text: 'THE FORGOTTEN HIGHWAY', style: 'place' }],
    actors: {
      arin: track([-0.9, -54], 0, { emote: 'neutral' }).walk([-0.9, -8], { speed: 1.3 }),
      mira: track([0.9, -54], 0, { emote: 'neutral', look: 'none' }).walk([0.9, -8], { speed: 1.3 }),
    },
    shots: sortShots([
      fixed(0, [-34, 26, -100], [-12, 15, -78], [0, 1, -44], undefined, { fov: 46 }),
      two(9, 3.8, 1, { fov: 38, shake: 0.004 }),
      orbit(17, 'mira', 1.8, 0.0, P / 2, { fov: 30, shake: 0.004 }),
      two(22, 4.2, -1, { dist2: 3.4 }),
      follow(27, 'mira', [0, 0.45, -5], [0, 0.6, -3.5], { fov: 40 }),
    ]),
    dialogue: hw1.lines,
    sfx: [{ at: 1, name: 'gust', vol: 0.5 }, { at: 14, name: 'bird', vol: 0.4 }, { at: 20, name: 'metalHit', vol: 0.2 }],
  }),
  sc({
    id: 'a3_hw2', name: "The Child's Drawing", act: 3, env: 'highway', mode: 'ruined', dur: dur(40, hw2), music: 'emotional',
    light: light('dusk', {}, { sunI: 1.6, skyHorizon: 0xd0644a }), fx: { dust: 0.3, debris: 0.4, wind: 0.3 }, ambience: { wind: 0.25, birds: 0.15 }, surface: 'gravel', fadeIn: 'dip', fadeOut: 'slow',
    actors: {
      mira: track([0.9, -7], 0, { emote: 'neutral' }).walk([0.9, 0.2]).walk([3.5, 3.4]).stand(0.5, { yaw: P / 2 }).stand(3.2, { anim: 'crouch', yaw: P / 2, emote: 'worried' })
        .until(hw2.at[1] - 0.2, { anim: 'idle', prop: 'drawing', emote: 'sad', faceTo: 'arin', look: 'arin' }).until(hw2.at[6] + 0.3, {}).until(hw2.at[6] + 1.6, { prop: 'none' })
        .until(hw2.at[7] - 0.3, { emote: 'neutral' }).until(300, {}),
      arin: track([-0.9, -8.5], 0, { emote: 'neutral' }).walk([-0.9, 0.5]).walk([2.0, 2.2], { look: 'mira' }).stand(300, { faceTo: 'mira', emote: 'tired', look: 'mira' }),
    },
    shots: sortShots([
      two(0, 4.2, 1, { fov: 38 }),
      fixed(8, [1, 1.6, -3.5], [2.2, 1.6, -1.5], [3.4, 1.0, 3.4], undefined, { fov: 36 }),
      orbit(11.6, 'mira', 1.6, 0.0, 0.9, { dist2: 1.2, fov: 28 }),
      ...cover(hw2, (s, at, i) => (s === 'mira' ? (i % 2 ? close(at, 'mira', 0.5) : ots(at, 'arin', 'mira', 1)) : close(at, 'arin', 0.5, { shake: 0.003 })), 0.1).filter((s) => s.at > 12.5),
    ]),
    dialogue: hw2.lines,
    sfx: [{ at: hw2.at[6] + 0.9, name: 'paper', vol: 0.5 }, { at: 11.5, name: 'paper', vol: 0.3 }],
  }),
  // ---------------- hospital ----------------
  sc({
    id: 'a3_hos1', name: 'The Silent Hospital', act: 3, env: 'hospital', dur: dur(30, hos1), music: 'suspense',
    light: light('interiorDark'), fx: { dust: 1 }, ambience: { room: 0.2, drip: 0.6, creaks: 0.6, wind: 0.06 }, surface: 'tile', fadeIn: 'slow', fadeOut: 'dip', flashlight: 'arin',
    cards: [{ at: 1, dur: 4.5, text: 'THE SILENT HOSPITAL', style: 'place' }],
    actors: {
      arin: track([-0.8, 37], P, { emote: 'worried', prop: 'flashlight' }).walk([-4.6, 34.5], { speed: 1.0 }).walk([-4.6, 22.5], { speed: 1.0 }).walk([0, 19], { speed: 1.0 }).walk([0, 12], { speed: 1.0 }),
      mira: track([-0.2, 38.2], P, { emote: 'worried', look: 'none' }).stand(2.4).walk([-4.0, 35.5], { speed: 1.0 }).walk([-4.0, 23.5], { speed: 1.0 }).walk([0.6, 20], { speed: 1.0 }).walk([0.6, 14], { speed: 1.0 }),
    },
    shots: sortShots([
      fixed(0, [-6.5, 3.2, 37.8], [-3, 3.0, 37.8], [0, 1.2, 27], undefined, { fov: 44 }),
      follow(9, 'arin', [2.0, 1.4, 4.2], [1.4, 1.4, 3.6], { fov: 36, shake: 0.004 }),
      orbit(15, 'arin', 1.5, 0.0, 0.8, { dist2: 1.3, fov: 28, shake: 0.004 }),
      fixed(20, [0, 1.9, 22.5], [0, 1.9, 21], [0, 1.4, 5], undefined, { fov: 38 }),
      follow(26, 'mira', [0, 1.0, 3.4], [0, 1.2, 3.0], { fov: 38 }),
    ]),
    dialogue: hos1.lines,
    sfx: [{ at: 0.4, name: 'creak', vol: 0.5 }, { at: 6, name: 'metalHit', vol: 0.15 }, { at: 16, name: 'creak', vol: 0.4 }],
  }),
  sc({
    id: 'a3_hos2', name: 'Empty Rooms', act: 3, env: 'hospital', params: { genAt: 20 }, dur: HOS2, music: 'suspense', mus: [{ at: 19.4, name: 'tension' }],
    light: light('interiorDark'), fx: { dust: 1 }, ambience: { room: 0.2, drip: 0.5, creaks: 0.5, wind: 0.05 }, surface: 'tile', fadeIn: 'dip', fadeOut: 'cut', flashlight: 'arin',
    actors: {
      arin: track([0, 15], P, { emote: 'worried', prop: 'flashlight' }).walk([0, 4.0], { speed: 1.1 }).walk([5.2, 4.0], { speed: 1.1 }).walk([7.4, 1.7]).stand(0.4, { yaw: 0 }).stand(3.6, { anim: 'crouch', yaw: 0 })
        .until(20.0, { anim: 'idle', emote: 'worried' }).stand(2, { anim: 'idle', look: 'none', emote: 'fear', yaw: -P / 2 }).walk([0.4, 3.6], { speed: 1.3 }).stand(30, { yaw: P, emote: 'worried' }),
      mira: track([0.5, 17], P, { emote: 'worried' }).walk([-0.2, 4.0], { speed: 1.1 }).walk([-4.6, 4.0]).stand(0.5, { yaw: -P / 2 }).until(20.0, { anim: 'idle', look: [-6.2, 0.8, 3.5] }).stand(2, { emote: 'fear', look: 'none' }).walk([-0.6, 3.6], { speed: 1.3 }).stand(30, { yaw: P, emote: 'worried' }),
    },
    shots: sortShots([
      fixed(0, [0, 1.9, 19.5], [0, 1.9, 17.5], [0, 1.4, -5], undefined, { fov: 38 }),
      fixed(9.5, [1.0, 1.8, 9.5], [0.6, 1.8, 7.5], [0, 1.3, 4], undefined, { fov: 36 }),
      fixed(13.5, [0.9, 1.5, 4.0], [1.2, 1.5, 4.0], [6.5, 1.0, 2.5], undefined, { fov: 40 }),
      orbit(16, 'arin', 1.9, 0.2, 0.7, { dist2: 1.5, fov: 30 }),
      orbit(11.2, 'mira', 2.0, 0.1, 0.9, { fov: 32 }),
      close(19.3, 'arin', 0.4, { fov: 28 }),
      close(21.5, 'mira', 0.4, { fov: 28 }),
      two(25.5, 3.6, 1, { fov: 36 }),
    ]),
    dialogue: [...hos2a.lines, ...hos2b.lines],
    sfx: [{ at: 18.8, name: 'generator', vol: 0.8 }, { at: 20, name: 'zap', vol: 0.6 }, { at: 21, name: 'powerUp', vol: 0.5 }],
  }),
  sc({
    id: 'a3_hos3a', name: 'Down Below', act: 3, env: 'hospital', params: { genAt: 20, tOff: HOS2 }, dur: 12, music: 'tension',
    light: light('interiorDark'), fx: { dust: 1, sparks: [0, 3.0, -31] }, ambience: { room: 0.2, generator: 0.35, electric: 0.2, creaks: 0.3 }, surface: 'tile', fadeIn: 'cut', fadeOut: 'dip', flashlight: 'arin',
    actors: {
      arin: track([0, -18], P, { emote: 'worried', prop: 'flashlight' }).walk([0, -31.2], { speed: 1.3 }).stand(3, { look: 'none' }),
      mira: track([0.5, -15.5], P, { emote: 'worried' }).walk([0.6, -30.3], { speed: 1.3 }).stand(3, { look: 'arin' }),
    },
    shots: [
      fixed(0, [0, 2.0, -12], [0, 1.9, -17], [0, 1.4, -31], undefined, { fov: 36 }),
      follow(5, 'arin', [1.2, 1.2, 3.4], [1.0, 1.2, 2.2], { fov: 34 }),
      fixed(9, [0, 1.8, -25.5], null, [0, 1.4, -32.8], undefined, { fov: 34 }),
    ],
    sfx: [{ at: 8.8, name: 'doorOpen', vol: 0.8 }],
  }),
  sc({
    id: 'a3_hos3b', name: 'The Emergency Recording', act: 3, env: 'hospital', params: { genAt: -10 }, dur: dur(34, hos3b), music: 'suspense',
    light: light('interiorDark'), fx: { dust: 0.9, sparks: [65, 1.6, -5] }, ambience: { generator: 0.6, electric: 0.2, creaks: 0.2, drip: 0.3 }, surface: 'concrete', fadeIn: 'dip', fadeOut: 'slow', flashlight: 'arin',
    actors: {
      arin: track([51.3, 9.4], P, { emote: 'worried', prop: 'flashlight' }).walk([55.3, -6.9], { speed: 1.4 }).stand(2.5, { yaw: P, look: 'none' }).stand(60, { prop: 'none', look: [56.6, 1.1, -8.9], emote: 'worried' }),
      mira: track([50.7, 10.4], P, { emote: 'worried' }).walk([57.1, -6.9], { speed: 1.4 }).stand(60, { look: [56.6, 1.1, -8.9], yaw: P }),
    },
    shots: sortShots([
      fixed(0, [53, 2.4, 11.5], [54, 2.2, 8.5], [55, 1.0, -5], undefined, { fov: 42 }),
      follow(6, 'arin', [-2.5, 1.2, 4.5], [-2.0, 1.2, 3.5], { fov: 36 }),
      two(10.5, 3.2, 1, { fov: 36 }),
      fixed(14.5, [56.6, 1.45, -6.6], [56.6, 1.35, -7.3], [56.6, 1.05, -8.9], undefined, { fov: 30 }),
      close(21, 'mira', 0.5, { fov: 28 }),
      close(hos3b.at[2] - 0.2, 'arin', 0.5, { fov: 28 }),
    ]),
    dialogue: hos3b.lines,
    sfx: [{ at: 12.2, name: 'click', vol: 0.7 }, { at: 14.3, name: 'static', vol: 0.4 }, { at: 25.9, name: 'tapeStop', vol: 0.6 }, { at: 25.8, name: 'static', vol: 0.6 }],
  }),
  // ---------------- village ----------------
  sc({
    id: 'a3_vil1', name: 'The Village of Empty Homes', act: 3, env: 'village', dur: dur(30, vil1), music: 'haunting',
    light: light('dusk'), fx: { dust: 0.25, debris: 0.4, wind: 0.25 }, ambience: { wind: 0.2, crickets: 0.15, birds: 0.1 }, surface: 'gravel', fadeIn: 'slow', fadeOut: 'dip',
    cards: [{ at: 0.8, dur: 4.5, text: 'THE VILLAGE OF EMPTY HOMES', style: 'place' }],
    actors: {
      arin: track([-0.8, -52], 0, { emote: 'neutral' }).walk([-0.8, -8], { speed: 1.35 }),
      mira: track([0.8, -52], 0, { emote: 'neutral' }).walk([0.8, -8], { speed: 1.35 }),
    },
    shots: sortShots([
      fixed(0, [-26, 16, -76], [-10, 10, -58], [0, 1, -34], undefined, { fov: 46 }),
      two(9, 4.4, 1, { fov: 38, shake: 0.003 }),
      orbit(16, 'arin', 2.2, 0.0, -P / 2, { dist2: 1.8, fov: 32 }),
      two(22, 4.6, -1, { dist2: 3.6 }),
      fixed(27, [4, 0.5, -20], [4, 0.6, -14], [-9.3, 1.3, 0], undefined, { fov: 40 }),
    ]),
    dialogue: vil1.lines,
    sfx: [{ at: 2, name: 'gust', vol: 0.4 }, { at: 13, name: 'doorOpen', vol: 0.2 }, { at: 19, name: 'bird', vol: 0.4 }],
  }),
  sc({
    id: 'a3_vil2', name: 'The Family Video', act: 3, env: 'village', dur: Math.max(48, vil2b.end + 4), music: 'emotional', mus: [{ at: vil2b.at[2] - 0.5, name: 'sorrow' }],
    light: light('dusk', { hemiI: 0.55, sunI: 0.6, fogD: 0.002 }), fx: { dust: 0.9 }, ambience: { wind: 0.08, crickets: 0.1, creaks: 0.15 }, surface: 'wood', fadeIn: 'dip', fadeOut: 'slow',
    actors: {
      arin: track([-7.8, 0.2], -P / 2, { emote: 'worried' }).walk([-11.0, -0.1]).until(vil2a.at[1] + 2.5, { anim: 'lookAround' }).until(11.5, { anim: 'idle', look: [-13.2, 0.9, 0] }).walk([-12.5, 1.85], { speed: 1.2 })
        .until(vil2b.at[1] - 0.5, { anim: 'idle', yaw: P, look: 'mira', emote: 'neutral' }).until(vil2b.at[3] + 0.5, { emote: 'sad' }).until(vil2b.at[4] + 5, { anim: 'comfort', look: 'mira', emote: 'sad', yaw: P }).until(300, { anim: 'comfort', emote: 'neutral' }),
      mira: track([-7.8, -0.9], -P / 2, { emote: 'worried' }).walk([-10.6, -0.9]).walk([-13.2, -1.15]).stand(0.4, { yaw: 0 }).stand(2.6, { anim: 'reach', yaw: 0, emote: 'surprised' }).stand(1.2, { anim: 'idle', prop: 'camcorder', emote: 'neutral' })
        .walk([-11.4, -1.0]).walk([-11.4, 1.15]).walk([-12.5, 1.15], { speed: 0.8 }).until(13.6, { anim: 'sit', yaw: P, emote: 'happy', look: 'none' }).until(vil2b.at[1] - 0.2, { emote: 'happy' }).until(vil2b.at[3] - 0.3, { emote: 'sad' })
        .until(vil2b.at[3] + 0.4, { anim: 'sitCry', prop: 'none', emote: 'cry' }).until(vil2b.at[6] - 0.2, {}).until(300, { anim: 'sitCry', emote: 'sad' }),
    },
    shots: sortShots([
      fixed(0, [-9.9, 2.1, -3.5], [-11, 2.0, -3.1], [-14, 1.0, 0.2], undefined, { fov: 48 }),
      fixed(5, [-10.2, 1.6, 2.8], [-10.8, 1.6, 2.4], [-13.2, 0.9, 0], undefined, { fov: 40 }),
      orbit(8.4, 'mira', 2.3, 0.4, 0.5, { fov: 32 }),
      fixed(vil2a.at[1] + 0.8, [-11.9, 1.9, 3.3], [-12.7, 1.9, 3.3], [-13.2, 1.0, -0.4], undefined, { fov: 34 }),
      fixed(13.2, [-10.5, 1.5, 1.2], [-11.6, 1.4, 0.4], [-12.5, 1.0, 1.15], undefined, { fov: 34 }),
      orbit(vil2b.at[0] + 2.6, 'mira', 1.25, 0.02, 0.55, { dist2: 1.0, fov: 28 }),
      ...cover(vil2b, (s, at, i) => (s === 'mira' ? close(at, 'mira', 0.5) : s === 'arin' ? (i % 2 ? close(at, 'arin', 0.4) : two(at, 2.2, 1, { h: 0.0 })) : null), 0.1).filter((s) => s.at > vil2b.at[2]),
      two(vil2b.end - 2, 2.6, -1, { dist2: 3.4 }),
    ]),
    dialogue: [...vil2a.lines, ...vil2b.lines],
    sfx: [{ at: 0.4, name: 'doorOpen', vol: 0.5 }, { at: 12.2, name: 'click', vol: 0.6 }, { at: 14.0, name: 'birthday', vol: 0.8 }],
  }),
  sc({
    id: 'a3_vil3', name: 'It Gets Quieter', act: 3, env: 'village', dur: 40, music: 'hope',
    light: light('dusk', { sunI: 1.2 }, { skyTop: 0x0c1428, skyHorizon: 0x3a2a48, skyBottom: 0x14121a, fog: 0x2a2234, sunI: 0.25, hemiI: 0.45, stars: 0.6 }), fx: { dust: 0.2, wind: 0.2 }, ambience: { wind: 0.15, crickets: 0.35 }, surface: 'gravel', fadeIn: 'dip', fadeOut: 'slow',
    actors: {
      arin: track([-6.2, 0.5], P / 2, { emote: 'tired', faceTo: 'mira', look: 'mira' }).until(vil3.end - 0.5, { emote: 'neutral' }).until(vil3.end + 1.5, { emote: 'smile' }).walk([-0.8, 8], { speed: 1.3 }).walk([-0.8, 60], { speed: 1.3, look: 'none', emote: 'neutral' }),
      mira: track([-6.6, -0.8], P / 2, { emote: 'sad', faceTo: 'arin', look: 'arin' }).until(vil3.end - 0.8, { emote: 'neutral' }).until(vil3.end + 1.5, { emote: 'smile' }).walk([0.8, 8], { speed: 1.3 }).walk([0.8, 60], { speed: 1.3, look: 'none', emote: 'neutral' }),
    },
    shots: sortShots([
      two(0, 3.0, 1, { fov: 36 }),
      ...cover(vil3, (s, at) => (s === 'mira' ? close(at, 'mira', 0.5) : close(at, 'arin', 0.5)), 0.1),
      two(vil3.end + 0.5, 3.0, -1, { dist2: 3.8 }),
      fixed(vil3.end + 6, [-6, 3.0, -12], [-4, 9, -30], [0, 0.5, 18], [0, 0.5, 40], { fov: 44 }),
    ]),
    dialogue: vil3.lines,
    sfx: [{ at: 1, name: 'bird', vol: 0.3 }],
  }),
  // ---------------- bridge ----------------
  sc({
    id: 'a3_br1', name: 'The Broken Bridge', act: 3, env: 'bridge', params: { collapseAt: 1e9 }, dur: dur(32, br1), music: 'tension',
    light: light('storm'), fx: { rain: 1, wind: 0.9, debris: 0.7, lightning: [5.5, 15, 24] }, ambience: { rain: 0.8, wind: 0.75, river: 0.45 }, surface: 'wet', fadeIn: 'slow', fadeOut: 'cut',
    cards: [{ at: 0.8, dur: 4.5, text: 'THE BROKEN BRIDGE', style: 'place' }],
    actors: {
      arin: track([0, -50], 0, { emote: 'worried', look: 'none' }).walk([0, -8], { speed: 1.2 }),
      mira: track([0.3, -52], 0, { emote: 'worried', look: 'none' }).walk([0.3, -10], { speed: 1.2 }),
    },
    shots: sortShots([
      fixed(0, [-30, 22, -90], [-14, 14, -72], [0, 0, -34], undefined, { fov: 46, shake: 0.006 }),
      follow(8, 'arin', [4.0, 1.2, -5.5], [3.6, 1.4, -4.5], { fov: 38, shake: 0.012 }),
      two(15, 3.8, 1, { fov: 36, shake: 0.01 }),
      orbit(21, 'arin', 1.7, 0.0, -P / 2, { fov: 30, shake: 0.01 }),
    ]),
    dialogue: br1.lines,
    sfx: [{ at: 2, name: 'gust', vol: 0.7 }, { at: 12, name: 'creak', vol: 0.5 }, { at: 19, name: 'creak', vol: 0.5 }],
  }),
  sc({
    id: 'a3_br2', name: 'The Collapse', act: 3, env: 'bridge', params: { collapseAt: 7 }, dur: BR2, music: 'tension', mus: [{ at: 6.6, name: 'action' }],
    light: light('storm'), fx: { rain: 1, wind: 1, debris: 0.9, lightning: [2.5, 7.1, 11.5, 18] }, ambience: { rain: 0.9, wind: 0.85, river: 0.5 }, surface: 'wet', fadeIn: 'cut', fadeOut: 'dip',
    actors: {
      arin: track([0, 1.1], 0, { emote: 'worried' }).walk([0, 9.5], { speed: 1.2 }).stand(0.4, { yaw: P, look: 'mira', emote: 'fear' }).run([0, 7.75], { speed: 4.0 }).stand(3.7, { anim: 'prone', yaw: P, emote: 'determined' })
        .go([0, 10.4], 2.4, { anim: 'pull', yaw: P, emote: 'angry' }).stand(2, { anim: 'prone', yaw: P }).stand(2.5, { anim: 'sitGround', yaw: P, emote: 'tired', look: 'mira' }).stand(30, { anim: 'sitGround' }),
      mira: track([0, -3.7], 0, { emote: 'worried', look: 'none' }).walk([0, 4.7], { speed: 1.2 }).go([0, 5.78], 0.55, { anim: 'hang', y: -1.95, emote: 'fear', yaw: 0, look: 'arin' }).stand(4.7, { anim: 'hang', yaw: 0 })
        .go([0, 6.4], 2.4, { anim: 'hang', y: -0.35, yaw: 0, emote: 'determined' }).go([0, 7.3], 1.3, { anim: 'crouch', y: 0, yaw: 0, emote: 'fear' }).stand(2.5, { anim: 'sitGround', yaw: 0, emote: 'cry' }).stand(30, { anim: 'sitGround', emote: 'sad', look: 'arin' }),
    },
    shots: sortShots([
      fixed(0, [7.5, 1.6, -4], [7.5, 1.6, 0.5], [0, 1.4, 2], [0, 1.4, 6.5], { fov: 40, shake: 0.012 }),
      fixed(6.6, [6, -5, 13], [6, -5.5, 10], [0, -0.5, 4.5], undefined, { fov: 52, shake: 0.04 }),
      orbit(7.9, 'mira', 1.5, 0.0, 1.5, { fov: 32, shake: 0.03 }),
      orbit(9.0, 'arin', 2.3, 0.35, -P / 2, { dist2: 1.9, fov: 34, shake: 0.025 }),
      fixed(10.6, [5.5, -2.4, 4.8], [4.5, -2.0, 5.5], [0, -1.2, 6], undefined, { fov: 44, shake: 0.025 }),
      close(12.4, 'arin', -1.0, { fov: 30, shake: 0.02 }),
      orbit(13.6, 'mira', 1.8, 0.1, 1.5, { fov: 32, shake: 0.02 }),
      two(16.5, 3.8, 1, { fov: 40, shake: 0.012 }),
      close(21, 'mira', 0.4, { fov: 28 }),
    ]),
    dialogue: br2.lines,
    sfx: [{ at: 5.5, name: 'creak', vol: 0.9 }, { at: 6.8, name: 'collapse', vol: 1 }, { at: 7.6, name: 'debris', vol: 0.8 }, { at: 8.0, name: 'heartbeat', vol: 0.8 }, { at: 9.2, name: 'heartbeat', vol: 0.7 }, { at: 11, name: 'creak', vol: 0.6 }, { at: 14.2, name: 'splash', vol: 0.4 }],
  }),
  sc({
    id: 'a3_br3', name: 'Trust', act: 3, env: 'bridge', params: { collapseAt: 7, tOff: BR2 }, dur: dur(30, br3), music: 'sorrow', mus: [{ at: br3.end - 6, name: 'emotional' }],
    light: light('storm', { fogD: 0.012 }, { fogD: 0.007, hemiI: 0.9 }), fx: { rain: 0.55, wind: 0.55, debris: 0.4, lightning: [5, 19] }, ambience: { rain: 0.5, wind: 0.45, river: 0.45 }, surface: 'wet', fadeIn: 'dip', fadeOut: 'slow',
    actors: {
      arin: track([-0.3, 9.9], P, { anim: 'sitGround', emote: 'tired', faceTo: 'mira', look: 'mira' }).until(br3.at[3] - 0.2, {}).until(br3.at[3] + 0.5, { emote: 'smile' }).until(br3.end + 0.5, { emote: 'smile' }).stand(2.2, { anim: 'reach', yaw: 0.2, emote: 'smile', faceTo: 'mira' }).stand(3, { anim: 'idle', emote: 'neutral' }).walk([0, 14], { speed: 1.2 }),
      mira: track([0.5, 8.3], 0.3, { anim: 'sitGround', emote: 'sad', faceTo: 'arin', look: 'arin' }).until(br3.at[2], { emote: 'neutral' }).until(br3.at[6], { emote: 'smile' }).until(br3.end + 1.2, { emote: 'smile' }).stand(1.4, { anim: 'idle', emote: 'smile' }).stand(3, { anim: 'idle', emote: 'neutral', faceTo: null, look: 'none' }).walk([0.5, 14.5], { speed: 1.2 }),
    },
    shots: sortShots([
      two(0, 3.8, 1, { fov: 38, shake: 0.006 }),
      ...cover(br3, (s, at) => (s === 'mira' ? close(at, 'mira', 0.5, { shake: 0.004 }) : close(at, 'arin', 0.5, { shake: 0.004 })), 0.1),
      two(br3.end - 0.8, 3.2, -1, { dist2: 3.8 }),
      fixed(br3.end + 0.4, [6, 2.5, 18], [6, 4, 26], [0, 1.2, 12], [0, 1.2, 8], { fov: 40 }),
    ]),
    dialogue: br3.lines,
    sfx: [{ at: 5.4, name: 'thunder', vol: 0.5 }],
  }),
  // ---------------- research facility ----------------
  sc({
    id: 'a3_fac1', name: 'Annex Four', act: 3, env: 'facility', params: { deadAt: 1e9 }, dur: dur(26, fa1), music: 'suspense',
    light: light('night', { sunI: 0.5, fogD: 0.008 }), fx: { dust: 0.2, wind: 0.2 }, ambience: { crickets: 0.35, wind: 0.2, creaks: 0.1 }, surface: 'grass', fadeIn: 'slow', fadeOut: 'dip', flashlight: 'arin',
    actors: {
      arin: track([-80.4, 18], P, { emote: 'worried', prop: 'flashlight' }).walk([-80.4, 0.5], { speed: 1.15 }).stand(1.5, { yaw: P, look: [-81.4, 1.4, -3.8] }),
      mira: track([-79.4, 19.5], P, { emote: 'worried' }).walk([-79.4, 1.8], { speed: 1.15 }).stand(5, { yaw: P, look: [-76.2, 1.8, -3.8] }),
    },
    shots: sortShots([
      fixed(0, [-70, 3.5, 24], [-73, 2.5, 20], [-80, 2, -6], undefined, { fov: 42 }),
      follow(8, 'arin', [2.4, 1.1, 4], [2, 1.2, 3], { fov: 36, shake: 0.004 }),
      two(14.5, 3.6, 1, { fov: 36 }),
      orbit(20, 'arin', 1.5, 0.0, 0.6, { fov: 28 }),
    ]),
    dialogue: fa1.lines,
    sfx: [{ at: 16, name: 'doorOpen', vol: 0.8 }, { at: 8, name: 'bird', vol: 0.15 }],
  }),
  sc({
    id: 'a3_fac2', name: 'Two Hundred and Fourteen Sites', act: 3, env: 'facility', params: { deadAt: 48 }, dur: FA2_DUR, music: 'suspense', mus: [{ at: 46, name: 'silence' }],
    light: light('facility'), fx: { dust: 1 }, ambience: { electric: 0.25, hum: 0.2, room: 0.15 }, surface: 'tile', fadeIn: 'dip', fadeOut: 'cut', flashlight: 'arin',
    actors: {
      arin: track([-0.4, 14], P, { emote: 'worried', prop: 'flashlight' }).walk([-0.4, -5], { speed: 1.15 }).walk([-1.1, -9.5], { speed: 1.0 }).stand(60, { yaw: P, look: [0, 3, -30], emote: 'worried' }),
      mira: track([0.6, 16.5], P, { emote: 'worried', look: 'none' }).walk([0.7, -5], { speed: 1.15 }).walk([1.1, -9.5], { speed: 1.0 }).stand(60, { yaw: P, look: [0, 3, -30], emote: 'worried' }),
    },
    shots: sortShots([
      fixed(0, [0, 1.7, 19], [0, 1.7, 16.5], [0, 1.4, -6], undefined, { fov: 38 }),
      follow(8.5, 'arin', [1.0, 1.2, 3.8], [0.9, 1.3, 3.2], { fov: 36, shake: 0.004 }),
      fixed(13.5, [-0.2, 3.0, -6], [-0.4, 3.0, -8], [0, 4.2, -27], undefined, { fov: 40 }),
      close(14.5, 'arin', 0.5, { fov: 28 }),
      two(20.5, 3.8, 1, { fov: 40, h: 0.5 }),
      two(25, 3.4, 1, { fov: 42, h: 0.6, dist2: 4.2 }),
      close(fa2.at[6] - 0.2, 'mira', 0.4, { fov: 28 }),
      two(fa2.at[8] - 0.3, 3.2, 1, { fov: 40, h: 0.3, dist2: 4.2 }),
      two(36, 3.0, 1, { fov: 40, h: 0.4, shake: 0.01 }),
      close(39, 'mira', 0.4, { fov: 28 }),
    ]),
    dialogue: fa2.lines,
    sfx: [{ at: 14, name: 'blip', vol: 0.4 }, { at: 14.5, name: 'metalHit', vol: 0.25 }, { at: 47.4, name: 'powerDown', vol: 0.9 }, { at: 47.5, name: 'static', vol: 0.4 }],
  }),
  sc({
    id: 'a3_fac3', name: 'The Handwritten Note', act: 3, env: 'facility', params: { deadAt: 34, tOff: FA2_DUR }, dur: dur(36, fa3), music: 'mystery',
    light: light('facility'), fx: { dust: 1 }, ambience: { electric: 0.1, hum: 0.12, room: 0.1 }, surface: 'tile', fadeIn: 'cut', fadeOut: 'slow', flashlight: 'arin',
    actors: {
      arin: track([-1.1, -9.5], P, { emote: 'worried', prop: 'flashlight', look: 'none' }).walk([-2.1, -6.7], { speed: 1.1 }).stand(100, { yaw: P, look: 'mira', faceTo: 'mira' }),
      mira: track([1.1, -9.5], P, { emote: 'worried', look: 'none' }).walk([-3.5, -6.5], { speed: 1.3 }).stand(1.0, { yaw: P }).stand(1.6, { anim: 'reach', yaw: P, emote: 'surprised' }).until(fa3.at[1] - 0.4, { anim: 'idle', prop: 'note', emote: 'worried', look: 'none' }).until(300, {}),
    },
    shots: sortShots([
      two(0, 4.4, 1, { fov: 38 }),
      orbit(4.5, 'mira', 1.35, 0.1, 0.7, { dist2: 1.1, fov: 28 }),
      fixed(fa3.at[1] - 0.2, [-3.5, 1.65, -6.3], [-3.5, 1.5, -6.9], [-3.5, 1.15, -7.9], undefined, { fov: 30 }),
      ...cover(fa3, (s, at, i) => (s === 'mira' ? close(at, 'mira', 0.5) : i % 2 ? close(at, 'arin', 0.5) : ots(at, 'mira', 'arin', 1)), 0.1).filter((s) => s.at > fa3.at[2]),
      two(fa3.end - 3, 4.2, 1, { fov: 42, h: 0.5 }),
    ]),
    dialogue: fa3.lines,
    sfx: [{ at: 3.5, name: 'paper', vol: 0.6 }, { at: fa3.end - 2.8, name: 'sting', vol: 0.5 }],
  }),
];

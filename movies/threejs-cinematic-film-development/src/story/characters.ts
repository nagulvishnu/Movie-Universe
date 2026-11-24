// Character definitions: identical in every scene so appearance never drifts.
export interface CharacterSpec {
  id: 'arin' | 'mira' | 'extra';
  name: string;
  height: number; // metres
  build: number; // shoulder width multiplier
  skin: number; hair: number; eye: number;
  hairStyle: 'rugged' | 'shoulder';
  beard: boolean;
  jacket: number; jacketTrim: number; pants: number; boots: number; gloves: number | null;
  pack: number; scarf: number | null;
  brow: number;
  seed: number;
}

export const ARIN: CharacterSpec = {
  id: 'arin', name: 'ARIN', height: 1.82, build: 1.08,
  skin: 0xc79273, hair: 0x15110f, eye: 0x3b2a1e, hairStyle: 'rugged', beard: true,
  jacket: 0x252b2e, jacketTrim: 0x7b2f2a, pants: 0x3b3a34, boots: 0x1a1613, gloves: 0x1c1c1c,
  pack: 0x3d4631, scarf: null, brow: 0x15110f, seed: 7,
};

export const MIRA: CharacterSpec = {
  id: 'mira', name: 'MIRA', height: 1.68, build: 0.94,
  skin: 0xdba784, hair: 0x2a1812, eye: 0x4a3322, hairStyle: 'shoulder', beard: false,
  jacket: 0x5a6a45, jacketTrim: 0xd98a2b, pants: 0x4a463c, boots: 0x2a211b, gloves: null,
  pack: 0x6b4a2a, scarf: 0xd0662a, brow: 0x24150f, seed: 19,
};

export const SPEAKER_LABEL: Record<string, string> = {
  arin: 'ARIN', mira: 'MIRA', narrator: '', scientist: 'RECORDING', radio: 'RADIO', mystery: '', video: 'VIDEO',
};

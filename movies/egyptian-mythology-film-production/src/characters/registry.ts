import type { GodId } from '../film/types';

// Character definitions: each god is data. Appearances are reused across every scene to stay consistent.
export type HeadKind = 'human' | 'falcon' | 'jackal' | 'ibis' | 'lion' | 'cat' | 'croc' | 'ram' | 'set' | 'frog' | 'snake' | 'cobra' | 'scarab' | 'hippo' | 'wolf';
export type CrownKind =
  | 'sun' | 'white' | 'red' | 'pschent' | 'atef' | 'plumes' | 'feather' | 'throne' | 'house' | 'hathor' | 'moon' | 'lotus'
  | 'vulture' | 'scorpion' | 'star' | 'skullcap' | 'water' | 'ostrich' | 'goose' | 'amunra' | 'khepri';
export type ItemKind = 'ankh' | 'was' | 'crook' | 'flail' | 'spear' | 'bow' | 'knife' | 'scroll' | 'sistrum' | 'torch' | 'staff' | 'sa';
export type BodyKind = 'male' | 'female' | 'mummy' | 'child' | 'dwarf' | 'beast';

export interface GodDef {
  name: string;
  title: string;
  body: BodyKind;
  skin: string;
  cloth: string;
  accent: string;
  hair?: string;
  head: HeadKind;
  headColor?: string; // animal head colour override
  crown?: CrownKind;
  l?: ItemKind;
  r?: ItemKind;
  beard?: string;
  wings?: boolean;
  sidelock?: boolean;
  leopard?: boolean;
  raised?: boolean; // Min's raised arm
  tint?: 'skin' | 'cloth';
}

const M = '#a05f38', F = '#c98d5c', GOLD = '#d9a441', LINEN = '#f0e8d4', WIG = '#17171f', BLUE = '#1a2a6a';

export const GODS: Record<GodId, GodDef> = {
  atum: { name: 'Atum', title: 'The Complete One', body: 'male', skin: M, cloth: LINEN, accent: GOLD, hair: WIG, head: 'human', crown: 'pschent', beard: BLUE, l: 'ankh', r: 'was' },
  ra: { name: 'Ra', title: 'King of the Sun', body: 'male', skin: M, cloth: LINEN, accent: GOLD, hair: BLUE, head: 'falcon', headColor: '#5a3d22', crown: 'sun', l: 'ankh', r: 'was' },
  ramRa: { name: 'Ra (night form)', title: 'The Ram-headed Sun', body: 'male', skin: M, cloth: '#e8d8b0', accent: GOLD, hair: BLUE, head: 'ram', headColor: '#d8cfa8', crown: 'sun', l: 'ankh', r: 'was' },
  shu: { name: 'Shu', title: 'God of Air', body: 'male', skin: '#bb8a58', cloth: LINEN, accent: '#9fd0ff', hair: WIG, head: 'human', crown: 'ostrich', beard: BLUE, l: 'ankh' },
  tefnut: { name: 'Tefnut', title: 'Goddess of Moisture', body: 'female', skin: F, cloth: '#6ab0d8', accent: GOLD, hair: '#b88a3a', head: 'lion', headColor: '#c9964a', crown: 'sun', l: 'ankh' },
  geb: { name: 'Geb', title: 'God of the Earth', body: 'male', skin: '#6f8a3e', cloth: '#d8cfa8', accent: '#3f7a3a', hair: WIG, head: 'human', crown: 'goose', beard: BLUE },
  nut: { name: 'Nut', title: 'Goddess of the Sky', body: 'female', skin: '#2b3f9a', cloth: '#1f2d86', accent: GOLD, hair: WIG, head: 'human', crown: 'water', l: 'ankh' },
  osiris: { name: 'Osiris', title: 'Lord of the Dead', body: 'mummy', skin: '#2f8a52', cloth: '#f4f0e0', accent: GOLD, hair: WIG, head: 'human', crown: 'atef', beard: BLUE },
  isis: { name: 'Isis', title: 'Great of Magic', body: 'female', skin: F, cloth: '#f4f0e0', accent: GOLD, hair: WIG, head: 'human', crown: 'throne', wings: true, l: 'ankh' },
  set: { name: 'Set', title: 'Lord of Storms and the Desert', body: 'male', skin: '#9a5a3a', cloth: '#8a6a4a', accent: '#b02a1a', hair: '#5a2a1a', head: 'set', headColor: '#9a5030', r: 'was' },
  nephthys: { name: 'Nephthys', title: 'Lady of the House', body: 'female', skin: F, cloth: '#9fb8e0', accent: GOLD, hair: WIG, head: 'human', crown: 'house', wings: true },
  horus: { name: 'Horus', title: 'The Falcon King', body: 'male', skin: M, cloth: LINEN, accent: GOLD, hair: BLUE, head: 'falcon', headColor: '#4a3320', crown: 'pschent', l: 'ankh', r: 'was' },
  horusChild: { name: 'Horus the Child', title: 'Son of Isis', body: 'child', skin: M, cloth: LINEN, accent: GOLD, hair: WIG, head: 'human', sidelock: true },
  anubis: { name: 'Anubis', title: 'Guardian of the Dead', body: 'male', skin: '#17171c', cloth: LINEN, accent: GOLD, hair: '#0c0c10', head: 'jackal', headColor: '#16161a', l: 'ankh', r: 'flail' },
  thoth: { name: 'Thoth', title: 'Lord of Wisdom', body: 'male', skin: M, cloth: LINEN, accent: GOLD, hair: WIG, head: 'ibis', headColor: '#ece6d2', crown: 'moon', l: 'ankh', r: 'scroll' },
  maat: { name: "Ma'at", title: 'Truth and Order', body: 'female', skin: F, cloth: '#ffffff', accent: GOLD, hair: WIG, head: 'human', crown: 'feather', wings: true, l: 'ankh' },
  amun: { name: 'Amun', title: 'The Hidden One', body: 'male', skin: '#3b6fb0', cloth: LINEN, accent: GOLD, hair: WIG, head: 'human', crown: 'plumes', beard: BLUE, l: 'ankh', r: 'was' },
  amunRa: { name: 'Amun-Ra', title: 'King of the Gods', body: 'male', skin: '#3b6fb0', cloth: '#fff4d0', accent: GOLD, hair: WIG, head: 'human', crown: 'amunra', beard: BLUE, l: 'ankh', r: 'was' },
  ptah: { name: 'Ptah', title: 'Creator of Memphis', body: 'mummy', skin: '#3f8a7c', cloth: '#e6dcc0', accent: GOLD, hair: '#2a4aa0', head: 'human', crown: 'skullcap', beard: BLUE, r: 'was' },
  khepri: { name: 'Khepri', title: 'The Rising Sun', body: 'male', skin: M, cloth: LINEN, accent: '#2a6ab0', hair: WIG, head: 'scarab', headColor: '#245a9a', crown: 'khepri', l: 'ankh' },
  hathor: { name: 'Hathor', title: 'Lady of Joy and Love', body: 'female', skin: F, cloth: '#b0382a', accent: GOLD, hair: WIG, head: 'human', crown: 'hathor', l: 'ankh', r: 'sistrum' },
  sekhmet: { name: 'Sekhmet', title: 'The Powerful One', body: 'female', skin: F, cloth: '#b0201a', accent: GOLD, hair: '#2a1a10', head: 'lion', headColor: '#c4903f', crown: 'sun', l: 'ankh' },
  bastet: { name: 'Bastet', title: 'Lady of Bubastis', body: 'female', skin: F, cloth: '#3a8a5a', accent: GOLD, hair: '#2a1a10', head: 'cat', headColor: '#b0793f', r: 'sistrum' },
  mut: { name: 'Mut', title: 'The Divine Mother', body: 'female', skin: F, cloth: '#2a7a9a', accent: GOLD, hair: WIG, head: 'human', crown: 'vulture', l: 'ankh', r: 'was' },
  khonsu: { name: 'Khonsu', title: 'The Traveller', body: 'mummy', skin: M, cloth: '#e8e0c8', accent: GOLD, hair: WIG, head: 'human', crown: 'moon', beard: BLUE, sidelock: true },
  neith: { name: 'Neith', title: 'Mistress of Sais', body: 'female', skin: F, cloth: '#d8c8a0', accent: '#b0382a', hair: WIG, head: 'human', crown: 'red', l: 'ankh', r: 'bow' },
  sobek: { name: 'Sobek', title: 'Lord of the Nile Waters', body: 'male', skin: '#5a7a4a', cloth: LINEN, accent: GOLD, hair: '#1a3a2a', head: 'croc', headColor: '#4a6f45', crown: 'plumes', l: 'ankh', r: 'was' },
  khnum: { name: 'Khnum', title: 'The Divine Potter', body: 'male', skin: M, cloth: LINEN, accent: '#2a8a6a', hair: WIG, head: 'ram', headColor: '#cdbf98', crown: 'plumes', l: 'ankh', r: 'was' },
  min: { name: 'Min', title: 'God of Fertility and Roads', body: 'mummy', skin: '#8a5a3a', cloth: '#f4f0e0', accent: GOLD, hair: WIG, head: 'human', crown: 'plumes', beard: BLUE, raised: true, r: 'flail' },
  taweret: { name: 'Taweret', title: 'The Great One', body: 'beast', skin: '#5d6c8a', cloth: '#e8e0c8', accent: GOLD, hair: WIG, head: 'hippo', headColor: '#5d6c8a', l: 'sa' },
  bes: { name: 'Bes', title: 'Protector of Households', body: 'dwarf', skin: '#b87a45', cloth: '#d8a040', accent: '#b0382a', hair: '#8a5a2a', head: 'human', crown: 'plumes', r: 'knife', l: 'sistrum' },
  seshat: { name: 'Seshat', title: 'Mistress of the House of Books', body: 'female', skin: F, cloth: '#c9893a', accent: GOLD, hair: WIG, head: 'human', crown: 'star', leopard: true, l: 'staff', r: 'scroll' },
  serqet: { name: 'Serqet', title: 'She Who Tightens the Throat', body: 'female', skin: F, cloth: '#e8d8a0', accent: GOLD, hair: WIG, head: 'human', crown: 'scorpion', l: 'ankh' },
  renenutet: { name: 'Renenutet', title: 'Lady of the Harvest', body: 'female', skin: F, cloth: '#4a7a3a', accent: GOLD, hair: '#1a2a1a', head: 'cobra', headColor: '#4a7a3a', l: 'ankh' },
  nefertum: { name: 'Nefertum', title: 'Lord of the Lotus', body: 'male', skin: M, cloth: LINEN, accent: '#3a7ae0', hair: WIG, head: 'human', crown: 'lotus', l: 'ankh', r: 'knife' },
  wepwawet: { name: 'Wepwawet', title: 'Opener of the Ways', body: 'male', skin: '#8a8a96', cloth: LINEN, accent: GOLD, hair: '#5a5a66', head: 'wolf', headColor: '#8a8a96', r: 'staff' },
  sokar: { name: 'Sokar', title: 'God of the Memphite Necropolis', body: 'mummy', skin: M, cloth: '#e0d6bc', accent: GOLD, hair: BLUE, head: 'falcon', headColor: '#4a3320', crown: 'atef' },
  nun: { name: 'Nun', title: 'The Primordial Waters', body: 'male', skin: '#2f7a9a', cloth: '#cfe0e0', accent: '#7fd0d8', hair: '#10404a', head: 'human', beard: '#10404a' },
  frogGod: { name: 'Ogdoad (male)', title: 'Frog-headed', body: 'male', skin: '#3f7f8f', cloth: '#d8e0d0', accent: GOLD, head: 'frog', headColor: '#3f7f8f', tint: 'skin' },
  snakeGoddess: { name: 'Ogdoad (female)', title: 'Serpent-headed', body: 'female', skin: '#3f7f8f', cloth: '#d8e0d0', accent: GOLD, hair: '#10202a', head: 'snake', headColor: '#3f7f8f', tint: 'skin' },
  deceased: { name: 'The Deceased', title: 'An Egyptian', body: 'male', skin: M, cloth: '#f4f0e0', accent: '#c9b27a', hair: '#1c1c24', head: 'human', tint: 'cloth' },
};

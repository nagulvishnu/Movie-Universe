import type { ChapterMeta } from './types';

// Chapter metadata. Scene ids begin with the chapter key (e.g. "c4-3" belongs to "c4").
export const CHAPTERS: ChapterMeta[] = [
  { key: 'ti', num: '', title: 'Opening Titles', subtitle: 'The Gods of Ancient Egypt' },
  { key: 'pr', num: 'Prologue', title: 'Before the World Existed', subtitle: 'Nun, Atum, the Ogdoad and Ptah' },
  { key: 'c1', num: 'Chapter I', title: 'The First Divine Family', subtitle: 'The Ennead of Heliopolis' },
  { key: 'c2', num: 'Chapter II', title: 'Ra, the King of the Sun', subtitle: 'The Eye of Ra and the Heavenly Cow' },
  { key: 'c3', num: 'Chapter III', title: 'The Great Pantheon', subtitle: 'Gods of wisdom, life and protection' },
  { key: 'c4', num: 'Chapter IV', title: 'The Murder of Osiris', subtitle: 'Betrayal, mourning and restoration' },
  { key: 'c5', num: 'Chapter V', title: 'The Birth and Childhood of Horus', subtitle: 'Isis in the marshes' },
  { key: 'c6', num: 'Chapter VI', title: 'The Conflict Between Horus and Set', subtitle: 'The Contendings' },
  { key: 'c7', num: 'Chapter VII', title: 'The Kingdom of the Dead', subtitle: 'The Duat and the Hall of Two Truths' },
  { key: 'c8', num: 'Chapter VIII', title: "Ra's Nightly Journey and Apep", subtitle: 'The battle against chaos' },
  { key: 'c9', num: 'Chapter IX', title: 'The Eternal Gods of Egypt', subtitle: 'Kingship, nature and renewal' },
  { key: 'fin', num: '', title: 'Closing Titles & Credits', subtitle: 'Sources and acknowledgements' },
];

export const chapterIndexOf = (sceneId: string): number => {
  const key = sceneId.split('-')[0];
  const i = CHAPTERS.findIndex((c) => c.key === key);
  return i < 0 ? 0 : i;
};

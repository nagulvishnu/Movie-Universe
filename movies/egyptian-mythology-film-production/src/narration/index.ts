import { prologue } from './prologue';
import { chapter1 } from './chapter1';
import { chapter2 } from './chapter2';
import { chapter3 } from './chapter3';
import { chapter4 } from './chapter4';
import { chapter5 } from './chapter5';
import { chapter6 } from './chapter6';
import { chapter7 } from './chapter7';
import { chapter8 } from './chapter8';
import { chapter9 } from './chapter9';

export const NARRATION: Record<string, string[]> = {
  ...prologue, ...chapter1, ...chapter2, ...chapter3, ...chapter4,
  ...chapter5, ...chapter6, ...chapter7, ...chapter8, ...chapter9,
};

// Source and credit lists used by the end credits.
export const SOURCES: string[] = [
  `The Pyramid Texts — translations by R. O. Faulkner and J. P. Allen`,
  `The Ancient Egyptian Coffin Texts — R. O. Faulkner`,
  `The Egyptian Book of the Dead — R. O. Faulkner; T. G. Allen; J. P. Allen`,
  `The Shabaka Stone (Memphite Theology) — British Museum, EA 498`,
  `The Contendings of Horus and Seth — Papyrus Chester Beatty I; Miriam Lichtheim, Ancient Egyptian Literature`,
  `The Book of the Heavenly Cow — texts from the tombs of Tutankhamun and Seti I`,
  `The Amduat and the Book of Gates — Erik Hornung`,
  `The Metternich Stela — The Metropolitan Museum of Art`,
  `Plutarch, On Isis and Osiris — translation by J. Gwyn Griffiths`,
  `Richard H. Wilkinson, The Complete Gods and Goddesses of Ancient Egypt`,
  `Erik Hornung, Conceptions of God in Ancient Egypt`,
  `Jan Assmann, The Search for God in Ancient Egypt`,
  `Geraldine Pinch, Egyptian Mythology: A Guide to the Gods, Goddesses, and Traditions`,
  `UCLA Encyclopedia of Egyptology`,
  `The British Museum, The Metropolitan Museum of Art, the Musée du Louvre, and the Egyptian Museum, Cairo — collections and catalogues`,
];

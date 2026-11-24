import { lazy, type ComponentType } from 'react';
import type { EnvId } from '../film/types';
import type { EnvProps } from './types';

// Environments are lazily loaded so the film can stream them in progressively.
const loaders: Record<EnvId, () => Promise<{ default: ComponentType<EnvProps> }>> = {
  void: () => import('./cosmic').then((m) => ({ default: m.Void })),
  nun: () => import('./cosmic').then((m) => ({ default: m.Nun })),
  mound: () => import('./cosmic').then((m) => ({ default: m.Mound })),
  lotus: () => import('./cosmic').then((m) => ({ default: m.LotusEnv })),
  cosmos: () => import('./cosmic').then((m) => ({ default: m.Cosmos })),
  heavens: () => import('./cosmic').then((m) => ({ default: m.Heavens })),
  nile: () => import('./earth').then((m) => ({ default: m.Nile })),
  heliopolis: () => import('./earth').then((m) => ({ default: m.Heliopolis })),
  marsh: () => import('./earth').then((m) => ({ default: m.Marsh })),
  battlefield: () => import('./earth').then((m) => ({ default: m.Battlefield })),
  fields: () => import('./earth').then((m) => ({ default: m.Fields })),
  temple: () => import('./halls').then((m) => ({ default: m.Temple })),
  palace: () => import('./halls').then((m) => ({ default: m.Palace })),
  judgement: () => import('./halls').then((m) => ({ default: m.Judgement })),
  duat: () => import('./underworld').then((m) => ({ default: m.Duat })),
};

const lazies = new Map<EnvId, ComponentType<EnvProps>>();
export const getEnv = (id: EnvId) => {
  let c = lazies.get(id);
  if (!c) { c = lazy(loaders[id]); lazies.set(id, c); }
  return c;
};
export const prefetchEnv = (id: EnvId) => { void loaders[id](); };

import { useSyncExternalStore } from 'react';
import { engine } from './engine';

export const useFilm = () => useSyncExternalStore(engine.subscribe, engine.getSnapshot);

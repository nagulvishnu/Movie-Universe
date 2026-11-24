import { useCallback, useState } from 'react';
import TitleScreen from './components/TitleScreen';
import MoviePlayer from './components/MoviePlayer';
import { clearProgress, loadProgress, loadSettings, saveSettings, type Settings } from './data/playbackProgress';
import { audio } from './engine/audio';

export default function App() {
  const [screen, setScreen] = useState<'title' | 'play'>('title');
  const [start, setStart] = useState(0);
  const [startT, setStartT] = useState(0);
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [progress, setProgress] = useState(() => loadProgress());

  const updateSettings = useCallback((p: Partial<Settings>) => {
    setSettings((s) => { const n = { ...s, ...p }; saveSettings(n); return n; });
  }, []);

  const play = (index: number, t = 0) => { audio.init(); setStart(index); setStartT(Math.max(0, t)); setScreen('play'); };

  return screen === 'title' ? (
    <TitleScreen
      progress={progress} settings={settings} onSettings={updateSettings}
      onPlay={() => { clearProgress(); play(0); }}
      onContinue={() => play(progress?.index ?? 0, progress?.t ?? 0)}
    />
  ) : (
    <MoviePlayer
      startIndex={start} startTime={startT} settings={settings} onSettings={updateSettings}
      onExit={() => { setProgress(loadProgress()); setScreen('title'); }}
    />
  );
}

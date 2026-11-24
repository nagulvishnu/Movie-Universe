import { useEffect, useRef, useState } from 'react';
import { AudioEngine, type AudioSettings } from './engine/audio';
import { loadProgress, loadSettings } from './engine/settings';
import Player from './components/Player';
import TitleScreen from './components/TitleScreen';

export default function App() {
  const [settings, setSettings] = useState<AudioSettings>(() => loadSettings());
  const audioRef = useRef<AudioEngine | null>(null);
  if (!audioRef.current) audioRef.current = new AudioEngine(settings);
  const audio = audioRef.current;
  useEffect(() => () => audio.dispose(), [audio]);
  const [playing, setPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState(() => loadProgress());

  const update = (s: AudioSettings) => { audio.settings = s; setSettings(s); };

  if (playing !== null) {
    return <Player audio={audio} settings={settings} setSettings={update} startAt={playing} onExit={() => { setProgress(loadProgress()); setPlaying(null); }} />;
  }
  return <TitleScreen audio={audio} settings={settings} setSettings={update} progress={progress} onPlay={(t) => { audio.init(); audio.resume(); setPlaying(t); }} />;
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioEngine, CAST_SETTINGS, DEFAULT_VOICE_CFG, type AudioSettings } from '../engine/audio';
import { saveSettings } from '../engine/settings';
import { MOVIE, TAGLINE, TITLE, allLines, dialogueSheet, fmt } from '../movie';

interface Props { audio: AudioEngine; settings: AudioSettings; setSettings: (s: AudioSettings) => void; progress: number; onPlay: (t: number) => void }

function Forest() {
  const trees = useMemo(() => {
    let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    return Array.from({ length: 46 }, (_, i) => ({ x: (i / 46) * 110 - 5 + r() * 2, h: 30 + r() * 55, w: 5 + r() * 6, o: 0.5 + r() * 0.5 }));
  }, []);
  return (
    <svg className="treeline" viewBox="0 0 100 100" preserveAspectRatio="none">
      {trees.map((t, i) => (
        <g key={i} opacity={t.o}>
          <polygon points={`${t.x},100 ${t.x + t.w / 2},${100 - t.h} ${t.x + t.w},100`} fill="#04070a" />
          <polygon points={`${t.x + 0.5},${100 - t.h * 0.45} ${t.x + t.w / 2},${100 - t.h * 0.95} ${t.x + t.w - 0.5},${100 - t.h * 0.45}`} fill="#04070a" />
        </g>
      ))}
    </svg>
  );
}

export default function TitleScreen({ audio, settings, setSettings, progress, onPlay }: Props) {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(audio.ttsVoices);
  const [assets, setAssets] = useState(audio.assetNames.size);
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => { audio.onVoices = (v) => setVoices(v); setVoices(audio.ttsVoices); return () => { audio.onVoices = undefined; }; }, [audio]);

  const patch = (p: Partial<AudioSettings>) => { const s = { ...settings, ...p }; audio.settings = s; audio.applyVolumes(); setSettings(s); saveSettings(s); };
  const patchVoice = (id: string, p: Partial<{ uri: string; pitch: number; rate: number }>) => {
    const def = DEFAULT_VOICE_CFG[id as keyof typeof DEFAULT_VOICE_CFG];
    const cur = settings.voices[id] ?? { uri: '', pitch: def.pitch, rate: def.rate };
    patch({ voices: { ...settings.voices, [id]: { ...cur, ...p } } });
  };
  const test = (id: string) => {
    audio.init(); audio.resume();
    const samples: Record<string, string> = { adam: 'Open the door. It\u2019s me.', lena: 'Adam, please. I\u2019m freezing.', noah: 'Guys... it\u2019s me.', emily: 'Noah? What\u2019s going on?', shop: 'Don\u2019t answer anyone who calls your name after dark.', creature: 'Next time, bring someone new.' };
    audio.speak({ t: 0, who: '', voice: id as never, text: samples[id] ?? 'Hello.', id: '__test', fx: id === 'creature' ? 'whisper' : undefined, dur: 4 });
  };
  const exportSheet = () => {
    const blob = new Blob([dialogueSheet()], { type: 'text/plain' }); const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = 'skinwalker-dialogue-sheet.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const importFiles = async (files: FileList | null) => { if (!files?.length) return; await audio.importFiles(files); setAssets(audio.assetNames.size); };
  const resume = progress > 20 && progress < MOVIE.total - 15;
  const enVoices = voices.filter((v) => /^en/i.test(v.lang));

  return (
    <div className="title">
      <div className="bg-sky" /><div className="moonlight" />
      <div className="fog f1" /><div className="fog f2" /><div className="fog f3" />
      <Forest />
      <div className="eyes"><i /><i /></div><div className="eyes e2"><i /><i /></div>
      <div className="flicker" /><div className="vignette" /><div className="grain" />
      <div className="title-body">
        <div className="kicker">A MOVIE UNIVERSE ORIGINAL</div>
        <h1 className="logo">{TITLE.split(' ').map((w, i) => <span key={i}>{w}</span>)}</h1>
        <p className="tagline">“{TAGLINE}”</p>
        <div className="chips"><span>Supernatural Horror</span><span>Psychological Thriller</span><span>Mystery</span><span>Survival Horror</span></div>
        <div className="meta">Runtime {fmt(MOVIE.total)} · {MOVIE.scenes.length} scenes · {allLines.length} subtitled lines · Not rated — contains intense scenes</div>
        <div className="row">
          {resume ? (<>
            <button className="btn big" onClick={() => onPlay(Math.max(0, progress - 3))}>▶ Resume · {fmt(progress)}</button>
            <button className="btn ghost" onClick={() => onPlay(0)}>Start from beginning</button>
          </>) : <button className="btn big" onClick={() => onPlay(0)}>▶ Play Movie</button>}
          <button className="btn ghost" onClick={() => setOpen(true)}>⚙ Sound & Settings</button>
        </div>
        <div className="hint">Best experienced in the dark, with headphones. Space = pause · ← → = seek · F = fullscreen · C = subtitles</div>
      </div>

      {open && (
        <div className="modal" onClick={() => setOpen(false)}>
          <div className="panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-head"><h3>Sound & Settings</h3><button className="ic" onClick={() => setOpen(false)}>✕</button></div>
            <div className="panel-body">
              {([['master', 'Master volume'], ['music', 'Music'], ['sfx', 'Sound effects'], ['voice', 'Dialogue'], ['ambience', 'Ambience']] as const).map(([k, l]) => (
                <label key={k} className="field"><span>{l}</span><input type="range" min={0} max={1} step={0.02} value={settings[k]} onChange={(e) => patch({ [k]: Number(e.target.value) } as Partial<AudioSettings>)} /><em>{Math.round(settings[k] * 100)}</em></label>
              ))}
              <label className="field"><span>Render quality</span>
                <select value={settings.quality} onChange={(e) => patch({ quality: e.target.value as AudioSettings['quality'] })}>
                  <option value="low">Low (fastest, no shadows)</option><option value="medium">Medium (recommended)</option><option value="high">High</option>
                </select><em /></label>
              <label className="field chk"><input type="checkbox" checked={settings.subtitles} onChange={(e) => patch({ subtitles: e.target.checked })} /><span>Subtitles for every spoken line</span></label>

              <h4>Dialogue voices</h4>
              <p className="note">This build ships <b>without</b> recorded voice acting. Spoken lines use your browser’s speech synthesis as a fallback — it is not professional voice acting. Install better system voices or import real recordings below. Each character keeps its own voice settings.</p>
              {CAST_SETTINGS.map(({ id, label }) => {
                const def = DEFAULT_VOICE_CFG[id]; const cfg = settings.voices[id] ?? { uri: '', pitch: def.pitch, rate: def.rate };
                return (
                  <div key={id} className="cast">
                    <b>{label}</b>
                    <select value={cfg.uri} onChange={(e) => patchVoice(id, { uri: e.target.value })}>
                      <option value="">Auto-pick ({def.g === 'f' ? 'female' : 'male'})</option>
                      {enVoices.map((v) => <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>)}
                    </select>
                    <label>Pitch<input type="range" min={0.1} max={2} step={0.05} value={cfg.pitch} onChange={(e) => patchVoice(id, { pitch: Number(e.target.value) })} /></label>
                    <label>Rate<input type="range" min={0.5} max={1.6} step={0.05} value={cfg.rate} onChange={(e) => patchVoice(id, { rate: Number(e.target.value) })} /></label>
                    <button className="btn mini" onClick={() => test(id)}>Test</button>
                  </div>
                );
              })}
              {!voices.length && <p className="note warn">No speech voices detected yet. Subtitles will still show every line.</p>}

              <h4>Recorded voice files</h4>
              <p className="note">Drop in audio files named by line ID (e.g. <code>s05_03.mp3</code>) to replace synthesized speech for that line — or ship them in <code>public/audio/voices/</code> with a <code>manifest.json</code> mapping IDs to filenames. Loaded for this session: <b>{assets}</b> / {allLines.length}.</p>
              <div className="row">
                <input ref={fileRef} type="file" accept="audio/*" multiple hidden onChange={(e) => void importFiles(e.target.files)} />
                <button className="btn mini" onClick={() => fileRef.current?.click()}>Import voice files…</button>
                <button className="btn mini" onClick={exportSheet}>Download dialogue sheet</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

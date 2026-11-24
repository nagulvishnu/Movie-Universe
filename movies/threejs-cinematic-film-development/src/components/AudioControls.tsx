import type { Settings } from '../data/playbackProgress';

interface Props { settings: Settings; onChange: (p: Partial<Settings>) => void; showExtras?: boolean }

const Row = ({ label, value, muted, onValue, onMute }: { label: string; value: number; muted: boolean; onValue: (v: number) => void; onMute: (m: boolean) => void }) => (
  <div className="mb-4">
    <div className="mb-1.5 flex items-center justify-between text-[11px] tracking-[0.22em] text-white/70">
      <span>{label.toUpperCase()}</span>
      <label className="flex cursor-pointer items-center gap-1.5 text-white/50"><input type="checkbox" className="chk" checked={muted} onChange={(e) => onMute(e.target.checked)} />MUTE</label>
    </div>
    <input type="range" min={0} max={1} step={0.01} value={value} aria-label={`${label} volume`} style={{ opacity: muted ? 0.35 : 1 }} onChange={(e) => onValue(parseFloat(e.target.value))} />
  </div>
);

export default function AudioControls({ settings: s, onChange, showExtras }: Props) {
  return (
    <div>
      <Row label="Music" value={s.music} muted={s.muteMusic} onValue={(v) => onChange({ music: v })} onMute={(m) => onChange({ muteMusic: m })} />
      <Row label="Dialogue" value={s.dialogue} muted={s.muteDialogue} onValue={(v) => onChange({ dialogue: v })} onMute={(m) => onChange({ muteDialogue: m })} />
      <Row label="Sound effects" value={s.sfx} muted={s.muteSfx} onValue={(v) => onChange({ sfx: v })} onMute={(m) => onChange({ muteSfx: m })} />
      {showExtras && (
        <>
          <label className="mb-4 flex cursor-pointer items-center justify-between text-[11px] tracking-[0.22em] text-white/70">
            SUBTITLES
            <input type="checkbox" className="chk" checked={s.subtitles} onChange={(e) => onChange({ subtitles: e.target.checked })} />
          </label>
          <div className="text-[11px] tracking-[0.22em] text-white/70">
            <div className="mb-1.5">GRAPHICS QUALITY</div>
            <div className="flex gap-2">
              {(['low', 'balanced', 'high'] as const).map((q) => (
                <button key={q} onClick={() => onChange({ quality: q })} className="flex-1 border py-2 text-[11px] tracking-[0.2em]" style={{ borderColor: s.quality === q ? '#ffcf8a' : 'rgba(255,255,255,.2)', color: s.quality === q ? '#ffcf8a' : '#ddd', background: 'transparent', cursor: 'pointer' }}>{q.toUpperCase()}</button>
              ))}
            </div>
            <p className="mt-2 text-[10px] tracking-[0.1em] text-white/40">Optimised for 4 GB GPUs. “Low” renders at reduced resolution with smaller shadow maps.</p>
          </div>
        </>
      )}
    </div>
  );
}

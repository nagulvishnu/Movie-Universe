import type { Line } from '../story/types';
import { SPEAKER_LABEL } from '../story/characters';

interface Props { line: Line | null; visible: boolean; bottom: number }

/** Cinematic subtitles: short lines, speaker label, styled by delivery (whisper / shout / radio / narration). */
export default function SubtitleSystem({ line, visible, bottom }: Props) {
  if (!line || !visible) return null;
  const style = line.style ?? 'normal';
  const label = line.label ?? SPEAKER_LABEL[line.speaker];
  const cls = style === 'narration' ? 'narration' : style === 'whisper' ? 'whisper' : style === 'shout' || style === 'distress' ? 'shout' : style === 'radio' ? 'radio' : '';
  return (
    <div className="subs" style={{ bottom }} aria-live="polite">
      <div className="box">
        {label && style !== 'narration' && <span className="who">{label}</span>}
        <span className={cls}>{style === 'radio' ? `📻 ${line.text}` : line.text}</span>
      </div>
    </div>
  );
}

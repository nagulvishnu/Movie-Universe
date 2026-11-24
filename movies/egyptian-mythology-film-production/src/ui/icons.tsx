import type { ReactNode } from 'react';

const I = ({ children, size = 24 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{children}</svg>
);
export const PlayIcon = ({ size }: { size?: number }) => <I size={size}><path d="M8 5v14l11-7z" /></I>;
export const PauseIcon = ({ size }: { size?: number }) => <I size={size}><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></I>;
export const Back15 = () => <I><path d="M12 5V2L7 6l5 4V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" /><text x="8.2" y="16" fontSize="6.5" fontWeight="700" fill="currentColor">15</text></I>;
export const Fwd15 = () => <I><path d="M12 5V2l5 4-5 4V7a6 6 0 1 0 6 6h2a8 8 0 1 1-8-8z" /><text x="8.2" y="16" fontSize="6.5" fontWeight="700" fill="currentColor">15</text></I>;
export const VolIcon = ({ level }: { level: number }) => (
  <I>
    <path d="M3 9v6h4l5 4V5L7 9z" />
    {level > 0 && <path d="M15.5 8.5a5 5 0 0 1 0 7l-1.2-1.2a3.3 3.3 0 0 0 0-4.6z" />}
    {level > 0.5 && <path d="M18 6a8.5 8.5 0 0 1 0 12l-1.2-1.2a6.8 6.8 0 0 0 0-9.6z" />}
    {level === 0 && <path d="M16 9l5 6m0-6l-5 6" stroke="currentColor" strokeWidth="2" fill="none" />}
  </I>
);
export const CCIcon = ({ on }: { on: boolean }) => <I><path d="M19 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1z" opacity={on ? 1 : 0.45} /></I>;
export const FullIcon = ({ exit }: { exit: boolean }) => <I>{exit ? <path d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z" /> : <path d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z" />}</I>;
export const ListIcon = () => <I><path d="M3 5h2v2H3zm4 0h14v2H7zM3 11h2v2H3zm4 0h14v2H7zM3 17h2v2H3zm4 0h14v2H7z" /></I>;
export const GearIcon = () => <I><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 0 0-1.7-1L15 3h-4l-.4 2.9a7.3 7.3 0 0 0-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1L11 21h4l.4-2.9c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM13 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z" /></I>;
export const ReplayIcon = () => <I><path d="M12 5V1L7 6l5 5V7a6 6 0 1 1-6 6H4a8 8 0 1 0 8-8z" /></I>;

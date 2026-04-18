import type { Coordinates } from '../../utils/geo';

interface StatusStripProps {
  userLocation: Coordinates | null;
  hasLock: boolean;
  deviceHeading: number | null;
}

function pad(n: number, width: number): string {
  return n.toString().padStart(width, '0');
}

function formatCoord(value: number, posHemi: string, negHemi: string): string {
  const hemi = value >= 0 ? posHemi : negHemi;
  const abs = Math.abs(value);
  return `${abs.toFixed(4)}°${hemi}`;
}

function formatClock(): string {
  const d = new Date();
  return `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}:${pad(d.getSeconds(), 2)}`;
}

export function StatusStrip({ userLocation, hasLock, deviceHeading }: StatusStripProps) {
  const coords = userLocation
    ? `${formatCoord(userLocation.latitude, 'N', 'S')}  ${formatCoord(
        userLocation.longitude,
        'E',
        'W',
      )}`
    : '— — — — °N   — — — — °W';

  const hdg = deviceHeading !== null ? `${Math.round(deviceHeading).toString().padStart(3, '0')}°` : '---°';

  return (
    <div className="t-label flex items-center gap-4 text-[9px] py-2 border-b border-[color:var(--panel-border)] overflow-hidden">
      <span className="flex items-center gap-1.5">
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full ${
            hasLock ? 'bg-[color:var(--accent)] animate-flicker' : 'bg-[color:var(--ink-muted)]'
          }`}
        />
        {hasLock ? 'GPS LOCK' : 'GPS SRCH'}
      </span>
      <span className="hidden xs:inline text-[color:var(--ink-faint)]">12 SV</span>
      <span className="truncate num-tabular text-[color:var(--ink-soft)]">{coords}</span>
      <span className="ml-auto flex items-center gap-3 num-tabular">
        <span className="text-[color:var(--ink-faint)] hidden sm:inline">HDG</span>
        <span className="text-[color:var(--ink)]">{hdg}</span>
        <span className="text-[color:var(--ink-faint)] hidden sm:inline">{formatClock()}</span>
      </span>
    </div>
  );
}

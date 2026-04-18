import type { Store } from '../../hooks/useNearestStore';
import { bearingToCardinal, formatDistance } from '../../utils/geo';

interface TargetPanelProps {
  store: Store | null;
  bearing: number | null;
  loading?: boolean;
  onEngage?: () => void;
}

export function TargetPanel({ store, bearing, loading, onEngage }: TargetPanelProps) {
  if (loading && !store) {
    return (
      <div className="t-panel p-4 t-bracket">
        <div className="t-label mb-3 t-caret">TARGET</div>
        <div className="space-y-2">
          <div className="h-4 w-1/2 shimmer" />
          <div className="h-8 w-2/3 shimmer" />
          <div className="h-3 w-1/3 shimmer" />
        </div>
      </div>
    );
  }

  if (!store) return null;

  const dist = formatDistance(store.distance);
  const [distVal, distUnit] = dist.split(' ');
  const bearingDeg = bearing !== null ? Math.round(bearing).toString().padStart(3, '0') : '---';
  const cardinal = bearing !== null ? bearingToCardinal(bearing) : '--';

  return (
    <div className="t-panel p-4 t-bracket">
      <div className="flex items-center justify-between mb-3">
        <div className="t-label t-caret">PRIMARY · TARGET</div>
        <div className="t-label text-[9px] text-[color:var(--ok)]">
          {store.isOpen === true ? '◉ OPEN' : store.isOpen === false ? '○ CLOSED' : '○ UNKN'}
        </div>
      </div>

      <div className="t-mono text-[color:var(--accent)] text-[20px] font-medium leading-none uppercase tracking-wide">
        {store.name}
      </div>
      <div className="t-mono text-[11px] text-[color:var(--ink-soft)] mt-1 truncate uppercase">
        {store.address || '---'}
      </div>

      {/* Telemetry grid */}
      <div className="grid grid-cols-3 gap-2 mt-4 border-t border-[color:var(--panel-border)] pt-3">
        <div>
          <div className="t-label text-[9px] mb-1">RNG</div>
          <div className="t-mono text-[color:var(--ink-strong)] text-[15px] num-tabular">
            {distVal}
            <span className="text-[10px] text-[color:var(--ink-faint)] ml-1">
              {distUnit}
            </span>
          </div>
        </div>
        <div>
          <div className="t-label text-[9px] mb-1">BRG</div>
          <div className="t-mono text-[color:var(--ink-strong)] text-[15px] num-tabular">
            {bearingDeg}°
            <span className="text-[10px] text-[color:var(--ink-faint)] ml-1">{cardinal}</span>
          </div>
        </div>
        <div>
          <div className="t-label text-[9px] mb-1">ETA</div>
          <div className="t-mono text-[color:var(--ink-strong)] text-[15px] num-tabular">
            {Math.max(1, Math.round(store.distance * 20))}m
          </div>
        </div>
      </div>

      {onEngage && (
        <button
          onClick={onEngage}
          className="mt-4 w-full py-2.5 t-label t-label--on-accent text-[10px] bg-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] transition-colors flex items-center justify-center gap-2"
        >
          <span>NAVIGATE</span>
        </button>
      )}
    </div>
  );
}

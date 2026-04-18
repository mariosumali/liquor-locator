import { useMemo } from 'react';
import type { Store } from '../../hooks/useNearestStore';
import type { Coordinates } from '../../utils/geo';
import { calculateBearing } from '../../utils/geo';

interface RadarScopeProps {
  userLocation: Coordinates | null;
  stores: Store[];
  deviceHeading: number | null;
  max?: number;
  selectedStoreId?: string | null;
  onSelectStore?: (placeId: string) => void;
}

export function RadarScope({
  userLocation,
  stores,
  deviceHeading,
  max = 8,
  selectedStoreId,
  onSelectStore,
}: RadarScopeProps) {
  const visible = stores.slice(0, max);

  const maxDist = useMemo(() => {
    if (visible.length === 0) return 1;
    return Math.max(0.3, ...visible.map((s) => s.distance));
  }, [visible]);

  const sweepBg =
    'conic-gradient(from 0deg at 50% 50%, color-mix(in srgb, var(--accent) 26%, transparent) 0deg, color-mix(in srgb, var(--accent) 8%, transparent) 32deg, transparent 48deg, transparent 360deg)';

  return (
    <div className="relative w-full max-w-[22rem] aspect-square mx-auto">
      {/* Sweep wedge — continuous rotation */}
      <div
        aria-hidden
        className="absolute inset-0 animate-radar-sweep pointer-events-none"
        style={{
          background: sweepBg,
          borderRadius: '50%',
          maskImage: 'radial-gradient(circle, #000 40%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 40%, transparent 70%)',
        }}
      />
      {/* Trailing afterglow — slower sweep for depth */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none motion-reduce:hidden"
        style={{
          background: sweepBg,
          borderRadius: '50%',
          maskImage: 'radial-gradient(circle, #000 38%, transparent 68%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 38%, transparent 68%)',
          opacity: 0.45,
          animation: 'radar-sweep 4.8s linear infinite reverse',
          transformOrigin: '50% 50%',
        }}
      />

      <svg viewBox="0 0 100 100" className="relative w-full h-full" aria-hidden>
        {/* Rings */}
        {[48, 36, 24, 12].map((r) => (
          <circle
            key={r}
            cx="50" cy="50" r={r}
            fill="none"
            stroke="var(--panel-border-strong)"
            strokeWidth={r === 48 ? 0.5 : 0.3}
            strokeDasharray={r === 48 ? undefined : '0.8 1.4'}
            className={r === 48 ? 'animate-radar-ring motion-reduce:opacity-100' : undefined}
            style={r === 48 ? { animationDelay: '-0.6s' } : undefined}
          />
        ))}

        {/* Crosshairs */}
        <line x1="50" y1="2" x2="50" y2="98" stroke="var(--panel-border)" strokeWidth="0.25" />
        <line x1="2" y1="50" x2="98" y2="50" stroke="var(--panel-border)" strokeWidth="0.25" />

        {/* N marker */}
        <text
          x="50" y="5.5"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="3.5"
          fontFamily='"JetBrains Mono", monospace'
          fontWeight="600"
          fill="var(--accent)"
          stroke="var(--bg-base)"
          strokeWidth="0.45"
          paintOrder="stroke fill"
        >
          N
        </text>

        {/* Contacts */}
        {visible.map((store) => {
          if (!userLocation) return null;
          const bearing = calculateBearing(userLocation, store.coordinates);
          const rel = deviceHeading !== null ? bearing - deviceHeading : bearing;
          const rad = ((((rel % 360) + 360) % 360) - 90) * (Math.PI / 180);
          const r = 10 + (store.distance / maxDist) * 34;
          const x = 50 + r * Math.cos(rad);
          const y = 50 + r * Math.sin(rad);
          const isSelected = selectedStoreId === store.placeId;
          return (
            <g
              key={store.placeId}
              onClick={() => onSelectStore?.(store.placeId)}
              style={{ cursor: onSelectStore ? 'pointer' : 'default' }}
            >
              {isSelected && (
                <circle
                  cx={x} cy={y} r="3"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="0.3"
                  className="animate-ping-soft"
                />
              )}
              <rect
                x={x - 0.9}
                y={y - 0.9}
                width="1.8"
                height="1.8"
                fill={isSelected ? 'var(--accent)' : 'var(--ink-soft)'}
              />
              <text
                x={x + 2.5}
                y={y - 1.5}
                fontSize="2.6"
                fontFamily='"JetBrains Mono", monospace'
                letterSpacing="0.1em"
                fill={isSelected ? 'var(--accent-ink)' : 'var(--ink-strong)'}
                stroke="var(--bg-base)"
                strokeWidth="0.35"
                paintOrder="stroke fill"
              >
                {store.name.length > 12 ? `${store.name.slice(0, 11).toUpperCase()}…` : store.name.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* Center marker */}
        <circle cx="50" cy="50" r="1.2" fill="var(--accent)" />
        <circle cx="50" cy="50" r="0.4" fill="var(--accent-ink)" />
      </svg>
    </div>
  );
}

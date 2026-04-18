import { useMemo } from 'react';
import type { Store } from '../../hooks/useNearestStore';
import type { Coordinates } from '../../utils/geo';
import { calculateBearing } from '../../utils/geo';

interface RadarMiniProps {
  userLocation: Coordinates | null;
  stores: Store[];
  deviceHeading: number | null;
  max?: number;
  selectedStoreId?: string | null;
  onSelectStore?: (placeId: string) => void;
}

/**
 * Compact radar used inside the Radar tab — shows relative positions of
 * up to `max` stores as simple dots around the user.
 */
export function RadarMini({
  userLocation,
  stores,
  deviceHeading,
  max = 5,
  selectedStoreId,
  onSelectStore,
}: RadarMiniProps) {
  const visible = stores.slice(0, max);

  const maxDist = useMemo(() => {
    if (visible.length === 0) return 1;
    return Math.max(0.3, ...visible.map((s) => s.distance));
  }, [visible]);

  const sweepBg =
    'conic-gradient(from 0deg at 50% 50%, color-mix(in srgb, var(--accent) 22%, transparent) 0deg, color-mix(in srgb, var(--accent) 6%, transparent) 34deg, transparent 50deg, transparent 360deg)';

  return (
    <div className="relative w-full max-w-[18rem] md:max-w-[22rem] aspect-square mx-auto">
      <div
        aria-hidden
        className="absolute inset-0 animate-radar-sweep pointer-events-none"
        style={{
          background: sweepBg,
          borderRadius: '50%',
          maskImage: 'radial-gradient(circle, #000 32%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(circle, #000 32%, transparent 76%)',
        }}
      />

      <svg viewBox="0 0 100 100" className="relative w-full h-full" aria-hidden>
        <circle
          cx="50" cy="50" r="48"
          fill="none"
          stroke="var(--panel-border)"
          strokeWidth="0.3"
          className="animate-radar-ring motion-reduce:opacity-100"
          style={{ animationDelay: '-0.4s' }}
        />
        <circle cx="50" cy="50" r="32" fill="none" stroke="var(--panel-border)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="16" fill="none" stroke="var(--panel-border)" strokeWidth="0.3" />

        {/* N marker */}
        <text
          x="50" y="8"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="5"
          fontFamily='"Cormorant Garamond", serif'
          fontStyle="italic"
          fill="var(--ink-soft)"
        >
          N
        </text>

        {/* Store dots */}
        {visible.map((store) => {
          if (!userLocation) return null;
          const bearing = calculateBearing(userLocation, store.coordinates);
          const rel = deviceHeading !== null ? bearing - deviceHeading : bearing;
          const rad = ((((rel % 360) + 360) % 360) - 90) * (Math.PI / 180);
          const r = 8 + (store.distance / maxDist) * 36;
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
                  cx={x} cy={y} r="3.2"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="0.35"
                  className="animate-ping-soft"
                />
              )}
              <circle
                cx={x} cy={y}
                r={isSelected ? 1.8 : 1.2}
                fill={isSelected ? 'var(--accent)' : 'var(--ink-soft)'}
              />
              <text
                x={x + 3} y={y - 2}
                fontSize="3"
                fontFamily='"Cormorant Garamond", serif'
                fontStyle="italic"
                fill={isSelected ? 'var(--ink-strong)' : 'var(--ink-soft)'}
              >
                {store.name.length > 14 ? `${store.name.slice(0, 14)}…` : store.name}
              </text>
            </g>
          );
        })}

        {/* Center marker */}
        <circle cx="50" cy="50" r="0.8" fill="var(--ink-faint)" />
      </svg>
    </div>
  );
}

import { useMemo } from 'react';
import type { Coordinates } from '../../utils/geo';
import { bearingToCardinal, calculateBearing } from '../../utils/geo';

interface CompassProps {
  userLocation: Coordinates | null;
  storeLocation: Coordinates | null;
  deviceHeading: number | null;
}

const CARDINALS: Array<{ label: string; angle: number }> = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
];

const DIRECTION_PHRASES: Record<string, string> = {
  N: 'head north',
  NE: 'head northeast',
  E: 'head east',
  SE: 'head southeast',
  S: 'head south',
  SW: 'head southwest',
  W: 'head west',
  NW: 'head northwest',
};

export function Compass({ userLocation, storeLocation, deviceHeading }: CompassProps) {
  const hasData = Boolean(userLocation && storeLocation);

  const absBearing = useMemo(() => {
    if (!userLocation || !storeLocation) return null;
    return calculateBearing(userLocation, storeLocation);
  }, [userLocation, storeLocation]);

  const needle = useMemo(() => {
    if (absBearing === null) return 0;
    const a = deviceHeading !== null ? absBearing - deviceHeading : absBearing;
    return ((a % 360) + 360) % 360;
  }, [absBearing, deviceHeading]);

  const phrase = absBearing !== null ? DIRECTION_PHRASES[bearingToCardinal(absBearing)] : null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-[18rem] md:max-w-[22rem] aspect-square">
        <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
          {/* Outer ring */}
          <circle
            cx="50" cy="50" r="48"
            fill="none"
            stroke="var(--panel-border-strong)"
            strokeWidth="0.4"
          />

          {/* Cardinal letters — italic serif, restrained */}
          {CARDINALS.map(({ label, angle }) => {
            const rad = ((angle - 90) * Math.PI) / 180;
            const x = 50 + 42 * Math.cos(rad);
            const y = 50 + 42 * Math.sin(rad);
            const isNorth = label === 'N';
            return (
              <text
                key={label}
                x={x} y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="6.5"
                fontFamily='"Cormorant Garamond", serif'
                fontStyle="italic"
                fontWeight={isNorth ? 600 : 500}
                fill={isNorth ? 'var(--accent)' : 'var(--ink-soft)'}
              >
                {label}
              </text>
            );
          })}

          {/* Needle — single thin tapered line, no tail */}
          <g
            style={{
              transform: `rotate(${needle}deg)`,
              transformOrigin: '50px 50px',
            }}
          >
            <polygon
              points="50,14 48.5,50 51.5,50"
              fill={hasData ? 'var(--accent)' : 'var(--ink-muted)'}
            />
            <circle cx="50" cy="50" r="1.1" fill="var(--ink-strong)" />
          </g>
        </svg>
      </div>

      {phrase && hasData && (
        <div className="mt-3 text-[12px] text-[color:var(--ink-faint)] md:hidden">
          {phrase}
        </div>
      )}
    </div>
  );
}

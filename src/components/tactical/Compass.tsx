import { useEffect, useMemo, useRef, useState } from 'react';
import type { Coordinates } from '../../utils/geo';
import { calculateBearing } from '../../utils/geo';

interface CompassProps {
  userLocation: Coordinates | null;
  storeLocation: Coordinates | null;
  deviceHeading: number | null;
}

function useSmoothedAngle(target: number, active: boolean): number {
  const [display, setDisplay] = useState(target);
  const accumulatedRef = useRef(target);
  const lastTargetRef = useRef(target);
  useEffect(() => {
    if (!active) return;
    const prev = lastTargetRef.current;
    const delta = (((target - prev) % 360) + 540) % 360 - 180;
    accumulatedRef.current = accumulatedRef.current + (Number.isFinite(delta) ? delta : 0);
    lastTargetRef.current = target;
    setDisplay(accumulatedRef.current);
  }, [target, active]);
  return display;
}

const MAJOR_DEGS = [30, 60, 120, 150, 210, 240, 300, 330] as const;
const CARDINALS: Array<{ label: string; angle: number }> = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
];

export function Compass({ userLocation, storeLocation, deviceHeading }: CompassProps) {
  const hasData = Boolean(userLocation && storeLocation);

  const target = useMemo(() => {
    if (!userLocation || !storeLocation) return 0;
    const bearing = calculateBearing(userLocation, storeLocation);
    const rel = deviceHeading !== null ? bearing - deviceHeading : bearing;
    return ((rel % 360) + 360) % 360;
  }, [userLocation, storeLocation, deviceHeading]);

  const needle = useSmoothedAngle(target, hasData);

  return (
    <div className="relative w-full max-w-[20rem] mx-auto aspect-square">
      {/* Top index bracket marker */}
      <div
        aria-hidden
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10"
      >
        <div className="w-[2px] h-3 bg-[color:var(--accent)]" />
      </div>

      <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden>
        {/* Outer ring */}
        <circle cx="50" cy="50" r="49" fill="none" stroke="var(--panel-border-strong)" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="var(--panel-border)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="var(--panel-border)" strokeWidth="0.25" strokeDasharray="0.8 1.2" />
        <circle cx="50" cy="50" r="18" fill="none" stroke="var(--panel-border)" strokeWidth="0.25" strokeDasharray="0.8 1.2" />

        {/* Degree labels */}
        {MAJOR_DEGS.map((deg) => {
          const rad = ((deg - 90) * Math.PI) / 180;
          const x = 50 + 41 * Math.cos(rad);
          const y = 50 + 41 * Math.sin(rad);
          return (
            <text
              key={deg}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="3"
              fontFamily='"JetBrains Mono", monospace'
              fontWeight="500"
              fill="var(--ink-faint)"
            >
              {deg.toString().padStart(3, '0')}
            </text>
          );
        })}

        {/* Ticks */}
        {Array.from({ length: 72 }).map((_, i) => {
          const angle = i * 5;
          const isMajor = angle % 30 === 0;
          const isCardinal = angle % 90 === 0;
          if (isCardinal) return null;
          const outer = 37;
          const length = isMajor ? 2.2 : 1.3;
          const rad = ((angle - 90) * Math.PI) / 180;
          const x1 = 50 + outer * Math.cos(rad);
          const y1 = 50 + outer * Math.sin(rad);
          const x2 = 50 + (outer - length) * Math.cos(rad);
          const y2 = 50 + (outer - length) * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isMajor ? 'var(--ink-faint)' : 'var(--ink-muted)'}
              strokeWidth={isMajor ? 0.5 : 0.3}
              strokeLinecap="square"
            />
          );
        })}

        {/* Cardinals */}
        {CARDINALS.map(({ label, angle }) => {
          const rad = ((angle - 90) * Math.PI) / 180;
          const x = 50 + 32 * Math.cos(rad);
          const y = 50 + 32 * Math.sin(rad);
          const isNorth = label === 'N';
          return (
            <text
              key={label}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="5.5"
              fontFamily='"JetBrains Mono", monospace'
              fontWeight="600"
              letterSpacing="0.1em"
              fill={isNorth ? 'var(--accent)' : 'var(--ink-soft)'}
            >
              {label}
            </text>
          );
        })}

        {/* Crosshair inner ticks */}
        {[0, 90, 180, 270].map((a) => {
          const rad = ((a - 90) * Math.PI) / 180;
          const x1 = 50 + 10 * Math.cos(rad);
          const y1 = 50 + 10 * Math.sin(rad);
          const x2 = 50 + 13 * Math.cos(rad);
          const y2 = 50 + 13 * Math.sin(rad);
          return (
            <line
              key={a}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="var(--ink-muted)"
              strokeWidth="0.3"
            />
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${needle}deg)`,
            transformOrigin: '50px 50px',
            transition: 'transform 500ms cubic-bezier(0.22, 1, 0.36, 1)',
            filter: hasData ? 'drop-shadow(0 0 3px rgba(245, 178, 51, 0.6))' : 'none',
          }}
        >
          <polygon
            points="50,14 47,50 53,50"
            fill={hasData ? 'var(--accent)' : 'var(--ink-muted)'}
          />
          <polygon
            points="50,86 47,50 53,50"
            fill={hasData ? 'rgba(245, 178, 51, 0.18)' : 'rgba(255,255,255,0.04)'}
          />
        </g>

        {/* Center hub */}
        <circle cx="50" cy="50" r="2" fill="var(--bg-base)" stroke="var(--accent)" strokeWidth="0.4" />
        <circle cx="50" cy="50" r="0.8" fill="var(--accent)" />
      </svg>

      {!hasData && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="t-label text-[9px] text-[color:var(--ink-faint)] animate-breathe mt-16">
            SEARCHING
          </div>
        </div>
      )}
    </div>
  );
}

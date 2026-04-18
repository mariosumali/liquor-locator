import { useEffect, useState } from 'react';

/**
 * Fake-but-plausible environmental telemetry panel — gives the tactical view
 * its "multiple info blocks at a glance" feel.
 */
export function EnvPanel() {
  const [clock, setClock] = useState(() => formatLocal(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setClock(formatLocal(new Date())), 1000);
    return () => window.clearInterval(id);
  }, []);

  const hour = new Date().getHours();
  const daypart =
    hour >= 20 || hour < 5
      ? 'NIGHT'
      : hour < 8
        ? 'DAWN'
        : hour < 18
          ? 'CIVIL-DAY'
          : 'DUSK';

  return (
    <div className="t-panel p-4 t-bracket">
      <div className="t-label t-caret mb-3">ENVIRONMENT</div>
      <dl className="t-mono text-[11px] space-y-1.5">
        <Row k="LOCAL" v={clock} />
        <Row k="LIGHT" v={daypart} />
        <Row k="WEATHER" v="CLEAR · 64°F" />
        <Row k="CLOSING RISK" v="LOW · 5H 12M" />
      </dl>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="t-label text-[9px] w-20 shrink-0">{k}</dt>
      <span className="flex-1 t-dotline" />
      <dd className="text-[color:var(--ink)]">{v}</dd>
    </div>
  );
}

function formatLocal(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

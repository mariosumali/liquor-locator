import { useTheme } from '../../theme/useTheme';
import type { ThemeName } from '../../theme/themeTypes';

const OPTIONS: Array<{ id: ThemeName; code: string; title: string; desc: string }> = [
  {
    id: 'tactical',
    code: 'T-01',
    title: 'TACTICAL',
    desc: 'HUD OVERLAY · AMBER PALETTE · MONOSPACE · FULL TELEMETRY.',
  },
  {
    id: 'minimal',
    code: 'M-02',
    title: 'MINIMALIST',
    desc: 'EDITORIAL · WARM CORAL ACCENT · ITALIC SERIF · LOW DENSITY.',
  },
];

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4 pt-1">
      <div className="t-panel p-4 t-bracket">
        <div className="flex items-center justify-between">
          <div className="t-label t-caret">DISPLAY · PROFILE</div>
          <div className="t-label text-[9px] text-[color:var(--ink-faint)]">
            SELECTED · {theme.toUpperCase()}
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                aria-pressed={active}
                className={`w-full text-left px-3 py-3 border transition-colors ${
                  active
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/[0.08]'
                    : 'border-[color:var(--panel-border)] hover:border-[color:var(--panel-border-strong)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`t-mono text-[10px] tracking-widest w-10 ${
                      active ? 'text-[color:var(--accent)]' : 'text-[color:var(--ink-faint)]'
                    }`}
                  >
                    {opt.code}
                  </span>
                  <span
                    className={`t-label text-[11px] ${
                      active ? 'text-[color:var(--accent)]' : 'text-[color:var(--ink)]'
                    }`}
                  >
                    {opt.title}
                  </span>
                  <span
                    aria-hidden
                    className={`ml-auto w-2 h-2 ${
                      active ? 'bg-[color:var(--accent)]' : 'bg-[color:var(--ink-muted)]'
                    }`}
                  />
                </div>
                <p className="t-mono text-[10.5px] text-[color:var(--ink-soft)] mt-1.5 leading-snug">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="t-panel p-4 t-bracket">
        <div className="t-label t-caret mb-2">SYSTEM · INFO</div>
        <dl className="t-mono text-[11px] space-y-1.5 text-[color:var(--ink)]">
          <Row k="BUILD" v="LL-1.0·T" />
          <Row k="LOCALE" v="EN-US · MI · °F" />
          <Row k="DATA LAYER" v="ON-DEVICE" />
          <Row k="MAP HANDOFF" v="OS NAVIGATOR" />
        </dl>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <dt className="t-label text-[9px] w-24 shrink-0">{k}</dt>
      <span className="flex-1 t-dotline" />
      <dd className="text-[color:var(--ink)]">{v}</dd>
    </div>
  );
}

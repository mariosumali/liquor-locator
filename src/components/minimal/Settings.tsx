import { useTheme } from '../../theme/useTheme';
import type { ThemeName } from '../../theme/themeTypes';

const OPTIONS: Array<{ id: ThemeName; title: string; tagline: string; desc: string }> = [
  {
    id: 'minimal',
    title: 'Minimalist',
    tagline: 'editorial · warm · quiet',
    desc:
      'Near-black with a single coral accent. Italic display serif, generous whitespace, and a single orange needle. Feels like a magazine, not a dashboard.',
  },
  {
    id: 'tactical',
    title: 'Tactical',
    tagline: 'HUD · amber · dense',
    desc:
      'Radar rings, corner brackets, monospace telemetry and live bearing. An operator’s console for finding your next bottle.',
  },
];

export function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-7 pt-2">
      <section>
        <h3 className="m-italic text-[color:var(--ink-strong)] text-[20px] leading-none">
          Appearance
        </h3>
        <p className="mt-2 text-[13px] text-[color:var(--ink-soft)] max-w-md leading-relaxed">
          Two completely different takes on finding the nearest bottle shop.
          Pick whichever you feel like today.
        </p>

        <div className="mt-5 space-y-3">
          {OPTIONS.map((opt) => {
            const active = theme === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                aria-pressed={active}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  active
                    ? 'border-[color:var(--accent)] bg-[color:var(--accent)]/[0.06]'
                    : 'border-[color:var(--panel-border)] hover:border-[color:var(--panel-border-strong)]'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`m-display text-[18px] ${
                        active ? 'text-[color:var(--accent)]' : 'text-[color:var(--ink-strong)]'
                      }`}
                    >
                      {opt.title}
                    </span>
                    <span className="m-italic text-[12px] text-[color:var(--ink-faint)]">
                      {opt.tagline}
                    </span>
                  </div>
                  <span
                    aria-hidden
                    className={`shrink-0 w-4 h-4 rounded-full border transition-colors ${
                      active
                        ? 'bg-[color:var(--accent)] border-[color:var(--accent)]'
                        : 'border-[color:var(--panel-border-strong)]'
                    }`}
                  />
                </div>
                <p className="mt-2 text-[12.5px] text-[color:var(--ink-soft)] leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="m-italic text-[color:var(--ink-strong)] text-[20px] leading-none">
          About
        </h3>
        <p className="mt-2 text-[13px] text-[color:var(--ink-soft)] leading-relaxed max-w-md">
          Liquor Locator uses your device location and heading to point you at
          the nearest bottle shop. Data is stored on-device; map launches hand off
          to your OS navigator.
        </p>
      </section>
    </div>
  );
}

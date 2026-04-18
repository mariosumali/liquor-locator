export type TacticalTab = 'compass' | 'radar' | 'settings';

interface TabBarProps {
  value: TacticalTab;
  onChange: (tab: TacticalTab) => void;
}

const TABS: Array<{ id: TacticalTab; label: string }> = [
  { id: 'compass', label: 'COMPASS' },
  { id: 'radar', label: 'RADAR' },
  { id: 'settings', label: 'SETTINGS' },
];

export function TabBar({ value, onChange }: TabBarProps) {
  return (
    <div
      role="tablist"
      aria-label="View"
      className="flex items-stretch border border-[color:var(--panel-border)] divide-x divide-[color:var(--panel-border)] bg-[color:var(--bg-inset)]"
    >
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            className={`t-label flex-1 text-[10px] py-2.5 px-3 transition-colors ${
              active
                ? 't-label--on-accent bg-[color:var(--accent)]'
                : 'text-[color:var(--ink-soft)] hover:text-[color:var(--ink)]'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

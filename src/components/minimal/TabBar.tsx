export type MinimalTab = 'compass' | 'radar' | 'settings';

interface TabBarProps {
  value: MinimalTab;
  onChange: (tab: MinimalTab) => void;
}

const TABS: Array<{ id: MinimalTab; label: string }> = [
  { id: 'compass', label: 'Compass' },
  { id: 'radar', label: 'Radar' },
  { id: 'settings', label: 'Settings' },
];

export function TabBar({ value, onChange }: TabBarProps) {
  return (
    <div role="tablist" aria-label="View" className="flex items-center gap-6">
      {TABS.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.id)}
            data-active={active}
            className={`m-tab-underline pb-1 text-[15px] transition-colors ${
              active
                ? 'font-medium text-[color:var(--accent)]'
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

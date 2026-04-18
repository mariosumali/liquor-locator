import type { Store } from '../../hooks/useNearestStore';
import { openInMaps } from '../../utils/maps';

interface NavigateButtonProps {
  store: Store | null;
}

export function NavigateButton({ store }: NavigateButtonProps) {
  const disabled = !store;
  const label = store ? `Take me to ${store.name}` : 'Take me there';

  return (
    <button
      onClick={() => store && openInMaps(store.coordinates, store.name)}
      disabled={disabled}
      aria-label={label}
      className={`
        group w-full py-3.5 px-5 rounded-xl flex items-center justify-between
        text-[15px] transition-colors
        ${
          disabled
            ? 'bg-[color:var(--bg-inset)] text-[color:var(--ink-muted)] cursor-not-allowed border border-[color:var(--panel-border)]'
            : 'bg-[color:var(--accent)] text-[color:var(--accent-ink)] hover:bg-[color:var(--accent-soft)] active:scale-[0.99]'
        }
      `}
    >
      <span>Take me there</span>
      {!disabled && (
        <svg
          className="w-4 h-4 transition-transform group-hover:translate-x-0.5"
          fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      )}
    </button>
  );
}

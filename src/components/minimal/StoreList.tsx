import type { Store } from '../../hooks/useNearestStore';
import { formatDistance } from '../../utils/geo';
import { openInMaps } from '../../utils/maps';

interface StoreListProps {
  stores: Store[];
  loading?: boolean;
  selectedStoreId?: string | null;
  onSelectStore?: (placeId: string) => void;
}

export function StoreList({ stores, loading, selectedStoreId, onSelectStore }: StoreListProps) {
  if (loading && stores.length === 0) {
    return (
      <div className="w-full space-y-4 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="flex-1 h-5 shimmer" />
            <div className="h-4 w-14 shimmer" />
          </div>
        ))}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <p className="text-sm text-[color:var(--ink-soft)] mt-6">
        No liquor stores found nearby.
      </p>
    );
  }

  return (
    <ul role="list" className="w-full mt-4 divide-y divide-[color:var(--panel-border)]">
      {stores.map((store) => {
        const [value, unit] = formatDistance(store.distance).split(' ');
        const isSelected = selectedStoreId === store.placeId;

        const handleSelect = () => {
          if (onSelectStore) {
            onSelectStore(store.placeId);
          }
        };

        const handleNavigate = (e: React.MouseEvent) => {
          e.stopPropagation();
          openInMaps(store.coordinates, store.name);
        };

        return (
          <li key={store.placeId}>
            <div
              className={`flex items-center gap-2 transition-colors ${
                isSelected
                  ? 'bg-[color:var(--accent)]/[0.06]'
                  : 'hover:bg-white/[0.015]'
              }`}
            >
              <button
                onClick={onSelectStore ? handleSelect : handleNavigate}
                className="flex-1 text-left py-3.5 flex items-baseline justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {isSelected && (
                      <span className="text-[color:var(--accent)] text-[10px]">●</span>
                    )}
                    <span className={`m-display text-[17px] truncate ${
                      isSelected ? 'text-[color:var(--accent)]' : 'text-[color:var(--ink-strong)]'
                    }`}>
                      {store.name}
                    </span>
                  </div>
                  {store.isOpen === false ? (
                    <div className="mt-0.5 text-[11px] text-[color:var(--warn)]">closed</div>
                  ) : store.closesAt ? (
                    <div className="mt-0.5 text-[11px] text-[color:var(--ink-faint)]">
                      closes {store.closesAt.toLowerCase()}
                    </div>
                  ) : null}
                </div>
                <div className="text-right">
                  <span className="m-display text-[16px] text-[color:var(--accent)] num-tabular">
                    {value}
                  </span>
                  <span className="m-italic text-[12px] text-[color:var(--ink-faint)] ml-1">
                    {unit === 'mi' ? 'mi' : 'ft'}
                  </span>
                </div>
              </button>
              {onSelectStore && (
                <button
                  onClick={handleNavigate}
                  className="shrink-0 p-2 mr-1 text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] transition-colors"
                  aria-label={`Navigate to ${store.name}`}
                  title="Open in Maps"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8L22 12L18 16" />
                    <path d="M2 12H22" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

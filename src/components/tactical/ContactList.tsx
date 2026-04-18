import type { Store } from '../../hooks/useNearestStore';
import type { Coordinates } from '../../utils/geo';
import { bearingToCardinal, calculateBearing, formatDistance } from '../../utils/geo';
import { openInMaps } from '../../utils/maps';

interface ContactListProps {
  stores: Store[];
  userLocation: Coordinates | null;
  loading?: boolean;
  title?: string;
  max?: number;
  selectedStoreId?: string | null;
  onSelectStore?: (placeId: string) => void;
  onRefresh?: () => void;
}

export function ContactList({
  stores,
  userLocation,
  loading,
  title = 'CONTACTS',
  max,
  selectedStoreId,
  onSelectStore,
  onRefresh,
}: ContactListProps) {
  const visible = typeof max === 'number' ? stores.slice(0, max) : stores;

  if (loading && stores.length === 0) {
    return (
      <div className="t-panel p-4 t-bracket">
        <div className="t-label t-caret mb-3">{title}</div>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="t-panel p-4 t-bracket">
        <div className="t-label t-caret mb-2">{title}</div>
        <p className="t-mono text-[11px] text-[color:var(--ink-soft)]">
          NO CONTACTS IN AREA.
        </p>
      </div>
    );
  }

  return (
    <div className="t-panel p-4 t-bracket">
      <div className="flex items-center justify-between mb-3">
        <div className="t-label t-caret">{title} · {visible.length.toString().padStart(2, '0')}</div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="t-label text-[9px] text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] transition-colors"
          >
            ↻ RESCAN
          </button>
        )}
      </div>

      <ul role="list" className="space-y-0.5">
        {visible.map((store) => {
          const bearing = userLocation ? calculateBearing(userLocation, store.coordinates) : null;
          const bearingStr =
            bearing !== null ? Math.round(bearing).toString().padStart(3, '0') : '---';
          const cardinal = bearing !== null ? bearingToCardinal(bearing) : '--';
          const [distVal, distUnit] = formatDistance(store.distance).split(' ');
          const isSelected = selectedStoreId === store.placeId;

          const handleClick = () => {
            if (onSelectStore) {
              onSelectStore(store.placeId);
            } else {
              openInMaps(store.coordinates, store.name);
            }
          };

          return (
            <li key={store.placeId}>
              <button
                onClick={handleClick}
                className={`w-full text-left flex items-center gap-2 py-2 px-2 text-[11px] t-mono transition-colors ${
                  isSelected
                    ? 'bg-[color:var(--accent)]/[0.08] hover:bg-[color:var(--accent)]/[0.14]'
                    : 'hover:bg-white/[0.02]'
                }`}
              >
                <span className={`w-4 text-center ${isSelected ? 'text-[color:var(--accent-ink)]' : 'text-[color:var(--ink-faint)]'}`}>
                  {isSelected ? '◆' : '○'}
                </span>
                <span
                  className={`flex-1 truncate uppercase tracking-wide ${
                    isSelected ? 'text-[color:var(--accent-ink)]' : 'text-[color:var(--ink)]'
                  }`}
                >
                  {store.name}
                </span>
                <span
                  className={`num-tabular hidden sm:inline ${isSelected ? 'text-[color:var(--accent-ink)]/80' : 'text-[color:var(--ink-soft)]'}`}
                >
                  {bearingStr}° {cardinal}
                </span>
                <span
                  className={`num-tabular w-14 text-right ${isSelected ? 'text-[color:var(--accent-ink)]' : 'text-[color:var(--accent)]'}`}
                >
                  {distVal}
                  <span
                    className={`text-[9px] ml-1 ${isSelected ? 'text-[color:var(--accent-ink)]/70' : 'text-[color:var(--ink-faint)]'}`}
                  >
                    {distUnit}
                  </span>
                </span>
                <span
                  className={`text-[9px] tracking-widest w-12 text-right ${
                    store.isOpen === true
                      ? 'text-[color:var(--ok)]'
                      : store.isOpen === false
                        ? 'text-[color:var(--warn)]'
                        : 'text-[color:var(--ink-faint)]'
                  }`}
                >
                  {store.isOpen === true ? 'OPEN' : store.isOpen === false ? 'CLOSED' : 'UNKN'}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

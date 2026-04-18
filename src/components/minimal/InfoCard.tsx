import type { Store } from '../../hooks/useNearestStore';
import { formatDistance } from '../../utils/geo';

interface InfoCardProps {
  store: Store | null;
  loading?: boolean;
  /** Show small eyebrow label above the name — used in desktop layout */
  showEyebrow?: boolean;
  /** Is this the nearest store (for eyebrow text) */
  isNearest?: boolean;
  /** Optional walking-time suffix ("~6 min walk"). When provided, rendered before open/closed */
  walkingTime?: string | null;
}

/**
 * Splits "BevMo · 2399 El Camino Real, San Mateo, CA ..." style addresses into
 * "BevMo" + "on El Camino" so we can italicize the secondary phrase.
 * Keeps it short — picks the street / landmark from the first address line.
 */
function deriveOnPhrase(address: string): string | null {
  if (!address) return null;
  const firstSegment = address.split(',')[0]?.trim();
  if (!firstSegment) return null;
  const stripped = firstSegment.replace(/^\d+\s+/, '').trim();
  if (!stripped) return null;
  const words = stripped.split(/\s+/).slice(0, 3).join(' ');
  return words.length > 1 ? words : null;
}

export function InfoCard({ store, loading, showEyebrow, isNearest = true, walkingTime }: InfoCardProps) {
  if (loading && !store) {
    return (
      <div className="w-full space-y-3 pt-2">
        {showEyebrow && <div className="h-3 w-16 shimmer" />}
        <div className="h-6 md:h-10 w-2/3 shimmer" />
        <div className="h-12 md:h-20 w-1/2 shimmer" />
        <div className="h-3 w-24 shimmer" />
      </div>
    );
  }

  if (!store) return null;

  const distanceStr = formatDistance(store.distance);
  const [distValue, distUnit] = distanceStr.split(' ');
  const onPhrase = deriveOnPhrase(store.address);
  const unit = distUnit === 'mi' ? (distValue === '1.0' ? 'mile' : 'miles') : 'ft';

  const statusBits: string[] = [];
  if (walkingTime) statusBits.push(walkingTime);
  if (store.isOpen === true) {
    statusBits.push(store.closesAt ? `open until ${store.closesAt.toLowerCase()}` : 'open now');
  } else if (store.isOpen === false) {
    statusBits.push('closed · reopens tomorrow');
  }

  return (
    <div className="w-full pt-4 md:pt-0">
      {showEyebrow && (
        <div className="hidden md:block text-[11px] tracking-[0.18em] uppercase text-[color:var(--ink-faint)] mb-3">
          {isNearest ? 'nearest' : 'selected'}
        </div>
      )}

      <h2 className="m-display text-[22px] md:text-[44px] leading-tight text-[color:var(--ink-strong)]">
        {store.name}
        {onPhrase && (
          <>
            {showEyebrow ? <br className="hidden md:block" /> : ' '}
            <span className="m-italic text-[color:var(--ink-soft)]">on {onPhrase}</span>
          </>
        )}
      </h2>

      <div className="mt-3 md:mt-5 flex items-baseline gap-2 md:gap-3">
        <span
          className="m-display text-[64px] md:text-[96px] leading-none font-medium text-[color:var(--accent)] num-tabular"
        >
          {distValue}
        </span>
        <span className="m-italic text-[color:var(--ink-soft)] text-[18px] md:text-[22px]">
          {unit}
        </span>
      </div>

      <div className="mt-2 md:mt-3 text-[12px] md:text-[13px] text-[color:var(--ink-faint)]">
        {statusBits.length > 0 ? (
          <>
            {store.isOpen === true && (
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--ok)] mr-1.5 align-middle" />
            )}
            {statusBits.join(' · ')}
          </>
        ) : (
          store.isOpen === undefined && <span className="truncate">{store.address}</span>
        )}
      </div>
    </div>
  );
}

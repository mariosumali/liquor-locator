import { useMemo } from 'react';
import type { Store } from '../hooks/useNearestStore';
import type { Coordinates } from '../utils/geo';
import { calculateBearing, bearingToCardinal } from '../utils/geo';
import { Header } from '../components/minimal/Header';
import { TabBar, type MinimalTab } from '../components/minimal/TabBar';
import { Compass } from '../components/minimal/Compass';
import { InfoCard } from '../components/minimal/InfoCard';
import { NavigateButton } from '../components/minimal/NavigateButton';
import { RadarMini } from '../components/minimal/RadarMini';
import { StoreList } from '../components/minimal/StoreList';
import { Settings } from '../components/minimal/Settings';

interface MinimalScreenProps {
  tab: MinimalTab;
  onTabChange: (tab: MinimalTab) => void;
  userLocation: Coordinates | null;
  deviceHeading: number | null;
  store: Store | null;
  stores: Store[];
  selectedStoreId: string | null;
  isInitialLoad: boolean;
  storeLoading: boolean;
  error: string | null;
  needsCompassPermission: boolean;
  onRequestCompass: () => void;
  orientationError: string | null;
  locationLoading: boolean;
  onSelectStore: (placeId: string) => void;
  onRefresh?: () => void;
}

const DIRECTION_PHRASES: Record<string, string> = {
  N: 'head north',
  NE: 'head northeast',
  E: 'head east',
  SE: 'head southeast',
  S: 'head south',
  SW: 'head southwest',
  W: 'head west',
  NW: 'head northwest',
};

function walkMinutes(miles: number): string | null {
  if (!isFinite(miles) || miles <= 0) return null;
  // ~20 minutes per mile (3 mph walking pace)
  const mins = Math.max(1, Math.round(miles * 20));
  return `~${mins} min walk`;
}

export function MinimalScreen({
  tab,
  onTabChange,
  userLocation,
  deviceHeading,
  store,
  stores,
  selectedStoreId,
  isInitialLoad,
  storeLoading,
  error,
  needsCompassPermission,
  onRequestCompass,
  orientationError,
  locationLoading,
  onSelectStore,
  onRefresh,
}: MinimalScreenProps) {
  const bearing = useMemo(() => {
    if (!userLocation || !store) return null;
    return calculateBearing(userLocation, store.coordinates);
  }, [userLocation, store]);

  const desktopCaption = useMemo(() => {
    if (bearing === null || !store) return null;
    const phrase = DIRECTION_PHRASES[bearingToCardinal(bearing)];
    if (!phrase) return null;
    const d = store.distance;
    const dist = d < 0.1 ? `${Math.round(d * 5280)} feet` : `${d.toFixed(1)} miles`;
    return `${phrase} — ${dist}`;
  }, [bearing, store]);

  const walking = store ? walkMinutes(store.distance) : null;
  const isNearest = !!(store && stores.length > 0 && stores[0].placeId === store.placeId);
  const alsoNearby = stores.filter((s) => store && s.placeId !== store.placeId).slice(0, 3);

  const subtitle = isInitialLoad
    ? locationLoading
      ? 'getting location'
      : 'finding nearest store'
    : 'updated just now';

  return (
    <div className="m-bg relative min-h-[100svh] flex flex-col">
      <div className="relative z-10 mx-auto w-full max-w-md md:max-w-5xl lg:max-w-6xl flex-1 flex flex-col px-6 md:px-10 lg:px-14">
        {/* Mobile: full-width header. Desktop: header sits inside left column (rendered below) */}
        <Header subtitle={subtitle} desktopHide />

        <div className="pb-5 border-b border-[color:var(--panel-border)] md:pb-0 md:border-b-0 md:pt-[max(1.5rem,env(safe-area-inset-top))] md:flex md:items-start md:justify-between md:gap-10">
          {/* Desktop-only brand (matches the mockup's left-aligned header above the compass) */}
          <div className="hidden md:block">
            <h1 className="m-display text-[2.75rem] lg:text-[3.25rem] leading-[1] tracking-tight text-[color:var(--ink-strong)]">
              liquor{' '}
              <span className="m-italic text-[color:var(--accent)]">locator</span>
            </h1>
            <div className="mt-2 text-[13px] text-[color:var(--ink-faint)]">{subtitle}</div>
          </div>
          <div className="md:pt-3">
            <TabBar value={tab} onChange={onTabChange} />
          </div>
        </div>

        {error && !isInitialLoad && (
          <div
            role="alert"
            className="mt-4 p-3 rounded-lg border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/[0.06] text-[13px] text-[color:var(--warn)]"
          >
            {error}
          </div>
        )}

        {needsCompassPermission && !orientationError && userLocation && (
          <button
            onClick={onRequestCompass}
            className="mt-4 w-fit mx-auto md:mx-0 px-3 py-1.5 rounded-full border border-[color:var(--panel-border-strong)] text-[12px] text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]/40 transition-colors"
          >
            tap to enable compass
          </button>
        )}

        <main
          id={`panel-${tab}`}
          role="tabpanel"
          className="flex-1 flex flex-col justify-center py-6 md:py-10"
        >
          {tab === 'compass' && (
            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-16 lg:gap-24 md:items-center">
              {/* Left column — compass */}
              <div className="flex flex-col items-center md:items-start">
                {isInitialLoad ? (
                  <div className="w-full max-w-[18rem] md:max-w-[22rem] aspect-square mx-auto md:mx-0 flex items-center justify-center">
                    <div className="m-italic text-[color:var(--ink-faint)] text-[14px] animate-breathe">
                      searching
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center md:items-start">
                    <Compass
                      userLocation={userLocation}
                      storeLocation={store?.coordinates ?? null}
                      deviceHeading={deviceHeading}
                    />
                    {desktopCaption && (
                      <div className="hidden md:block mt-6 text-[12px] text-[color:var(--ink-faint)] font-mono tracking-[0.02em]">
                        {desktopCaption}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right column — info + also nearby */}
              <div className="w-full mt-0 flex flex-col">
                <InfoCard
                  store={store}
                  loading={storeLoading && !store}
                  showEyebrow
                  isNearest={isNearest}
                  walkingTime={walking}
                />

                {store && (
                  <div className="mt-5 md:mt-8 hidden md:block max-w-sm">
                    <NavigateButton store={store} />
                  </div>
                )}

                {alsoNearby.length > 0 && (
                  <div className="hidden md:block mt-10 pt-6 border-t border-[color:var(--panel-border)]">
                    <div className="text-[11px] tracking-[0.18em] uppercase text-[color:var(--ink-faint)] mb-2">
                      also nearby
                    </div>
                    <StoreList
                      stores={alsoNearby}
                      selectedStoreId={selectedStoreId}
                      onSelectStore={onSelectStore}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'radar' && (
            <div className="flex flex-col md:grid md:grid-cols-2 md:gap-16 lg:gap-24 md:items-start">
              <div className="flex flex-col">
                <div className="mb-1 flex items-center justify-between text-[12px] text-[color:var(--ink-faint)]">
                  <span>{stores.length > 0 ? `${stores.length} stores nearby` : ' '}</span>
                  {onRefresh && stores.length > 0 && (
                    <button
                      onClick={onRefresh}
                      className="text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] transition-colors"
                    >
                      refresh
                    </button>
                  )}
                </div>
                <RadarMini
                  userLocation={userLocation}
                  stores={stores}
                  deviceHeading={deviceHeading}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={onSelectStore}
                />
              </div>
              <div>
                <StoreList
                  stores={stores}
                  loading={storeLoading}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={onSelectStore}
                />
              </div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="md:max-w-xl">
              <Settings />
            </div>
          )}
        </main>

        {tab !== 'settings' && (
          <footer className="pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] md:hidden">
            <NavigateButton store={store} />
          </footer>
        )}
      </div>
    </div>
  );
}

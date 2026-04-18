import { useMemo } from 'react';
import type { Store } from '../hooks/useNearestStore';
import type { Coordinates } from '../utils/geo';
import { calculateBearing } from '../utils/geo';
import { openInMaps } from '../utils/maps';
import { Header } from '../components/tactical/Header';
import { StatusStrip } from '../components/tactical/StatusStrip';
import { TabBar, type TacticalTab } from '../components/tactical/TabBar';
import { Compass } from '../components/tactical/Compass';
import { TargetPanel } from '../components/tactical/TargetPanel';
import { EnvPanel } from '../components/tactical/EnvPanel';
import { RadarScope } from '../components/tactical/RadarScope';
import { ContactList } from '../components/tactical/ContactList';
import { Settings } from '../components/tactical/Settings';

interface TacticalScreenProps {
  tab: TacticalTab;
  onTabChange: (tab: TacticalTab) => void;
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

export function TacticalScreen({
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
}: TacticalScreenProps) {
  const bearing = useMemo(() => {
    if (!userLocation || !store) return null;
    return calculateBearing(userLocation, store.coordinates);
  }, [userLocation, store]);

  const handleEngage = () => {
    if (store) openInMaps(store.coordinates, store.name);
  };

  return (
    <div className="t-bg t-grid t-scanlines relative min-h-[100svh] flex flex-col">
      <div className="relative z-10 mx-auto w-full max-w-md md:max-w-5xl lg:max-w-6xl flex-1 flex flex-col px-4 md:px-8 lg:px-12">
        <Header />
        <StatusStrip
          userLocation={userLocation}
          hasLock={Boolean(userLocation) && !locationLoading}
          deviceHeading={deviceHeading}
        />

        <div className="pt-3">
          <TabBar value={tab} onChange={onTabChange} />
        </div>

        {error && !isInitialLoad && (
          <div
            role="alert"
            className="mt-3 p-3 border border-[color:var(--warn)]/40 bg-[color:var(--warn)]/[0.08] t-mono text-[11px] text-[color:var(--warn)]"
          >
            ERR · {error}
          </div>
        )}

        {needsCompassPermission && !orientationError && userLocation && (
          <button
            onClick={onRequestCompass}
            className="mt-3 self-center md:self-start t-label text-[10px] px-3 py-1.5 border border-[color:var(--panel-border-strong)] text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]/40 transition-colors"
          >
            ▸ ENABLE HEADING SENSOR
          </button>
        )}

        <main
          id={`panel-${tab}`}
          role="tabpanel"
          className="flex-1 flex flex-col gap-3 py-3 md:py-6"
        >
          {tab === 'compass' && (
            <>
              {isInitialLoad ? (
                <div className="t-panel t-bracket p-6 flex flex-col items-center gap-3">
                  <div className="w-full max-w-[18rem] aspect-square flex items-center justify-center t-label text-[10px] text-[color:var(--ink-faint)] animate-breathe">
                    ACQUIRING {locationLoading ? 'GPS LOCK' : 'TARGET'}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 md:items-start">
                  {/* Left column — compass + env */}
                  <div className="flex flex-col gap-3">
                    <div className="t-panel t-bracket p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="t-label t-caret">COMPASS · BEARING</div>
                        <div className="t-label text-[9px] text-[color:var(--ink-faint)]">
                          BRG {bearing !== null ? `${Math.round(bearing).toString().padStart(3, '0')}°` : '---°'}
                        </div>
                      </div>
                      <Compass
                        userLocation={userLocation}
                        storeLocation={store?.coordinates ?? null}
                        deviceHeading={deviceHeading}
                      />
                    </div>

                    <EnvPanel />
                  </div>

                  {/* Right column — target + secondary contacts */}
                  <div className="flex flex-col gap-3">
                    <TargetPanel
                      store={store}
                      bearing={bearing}
                      loading={storeLoading && !store}
                      onEngage={handleEngage}
                    />

                    {stores.length > 1 && (
                      <ContactList
                        stores={stores.slice(1)}
                        userLocation={userLocation}
                        title="SECONDARY · CONTACTS"
                        max={4}
                        selectedStoreId={selectedStoreId}
                        onSelectStore={onSelectStore}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'radar' && (
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4 md:items-start">
              <div className="t-panel t-bracket p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="t-label t-caret">SCAN · 0.3MI SWEEP</div>
                  <div className="t-label text-[9px] text-[color:var(--ok)]">
                    {stores.length > 0 ? `${stores.length.toString().padStart(2, '0')} CONTACTS` : 'NO RETURNS'}
                  </div>
                </div>
                <RadarScope
                  userLocation={userLocation}
                  stores={stores}
                  deviceHeading={deviceHeading}
                  selectedStoreId={selectedStoreId}
                  onSelectStore={onSelectStore}
                />
              </div>

              <ContactList
                stores={stores}
                userLocation={userLocation}
                loading={storeLoading}
                title="CONTACTS · LOG"
                selectedStoreId={selectedStoreId}
                onSelectStore={onSelectStore}
                onRefresh={onRefresh}
              />
            </div>
          )}

          {tab === 'settings' && (
            <div className="md:max-w-xl">
              <Settings />
            </div>
          )}
        </main>

        <div className="pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 t-label text-[9px] text-[color:var(--ink-faint)] flex items-center justify-between border-t border-[color:var(--panel-border)]">
          <span>{new Date().toISOString().replace('T', ' ').slice(0, 19)}Z</span>
          <span>LL·01 · NO COMMS</span>
        </div>
      </div>
    </div>
  );
}

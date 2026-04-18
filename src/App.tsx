import { useCallback, useState } from 'react';
import { useGeolocation } from './hooks/useGeolocation';
import { useDeviceOrientation } from './hooks/useDeviceOrientation';
import { useNearestStore } from './hooks/useNearestStore';
import { useTheme } from './theme/useTheme';
import { LocationPermission as MinimalLocationPermission } from './components/minimal/LocationPermission';
import { LocationPermission as TacticalLocationPermission } from './components/tactical/LocationPermission';
import { MinimalScreen } from './screens/MinimalScreen';
import { TacticalScreen } from './screens/TacticalScreen';

export type AppTab = 'compass' | 'radar' | 'settings';

function App() {
  const { theme } = useTheme();

  const {
    coordinates: userLocation,
    error: locationError,
    loading: locationLoading,
    requestLocation,
  } = useGeolocation();

  const {
    heading: deviceHeading,
    error: orientationError,
    needsPermission: needsCompassPermission,
    requestPermission: requestCompassPermission,
  } = useDeviceOrientation();

  const {
    stores,
    loading: storeLoading,
    error: storeError,
    refresh: refreshStore,
  } = useNearestStore(userLocation);

  const [tab, setTab] = useState<AppTab>('compass');
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);

  // The currently selected store (defaults to nearest if index is out of bounds)
  const store = stores.length > 0 ? stores[Math.min(selectedStoreIndex, stores.length - 1)] : null;

  const handleSelectStore = useCallback((placeId: string) => {
    const index = stores.findIndex((s) => s.placeId === placeId);
    if (index !== -1) {
      setSelectedStoreIndex(index);
      setTab('compass'); // Switch to compass view to show the new target
    }
  }, [stores]);

  const handleRefreshStore = useCallback(() => {
    setSelectedStoreIndex(0); // Reset to nearest when refreshing
    refreshStore();
  }, [refreshStore]);

  const showPermissionScreen = !userLocation && !locationLoading;
  const isInitialLoad = (locationLoading && !userLocation) || (storeLoading && !store);
  const error = locationError || storeError;

  if (showPermissionScreen) {
    const PermissionComponent =
      theme === 'tactical' ? TacticalLocationPermission : MinimalLocationPermission;
    return (
      <PermissionComponent
        onRequestLocation={requestLocation}
        onRequestCompass={needsCompassPermission ? requestCompassPermission : undefined}
        needsCompassPermission={needsCompassPermission}
        loading={locationLoading}
        error={locationError}
      />
    );
  }

  const sharedProps = {
    tab,
    onTabChange: setTab,
    userLocation,
    deviceHeading,
    store,
    stores,
    selectedStoreId: store?.placeId ?? null,
    isInitialLoad,
    storeLoading,
    error,
    needsCompassPermission,
    onRequestCompass: requestCompassPermission,
    orientationError,
    locationLoading,
    onSelectStore: handleSelectStore,
  };

  if (theme === 'tactical') {
    return <TacticalScreen {...sharedProps} onRefresh={handleRefreshStore} />;
  }

  return <MinimalScreen {...sharedProps} onRefresh={handleRefreshStore} />;
}

export default App;

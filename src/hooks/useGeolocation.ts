import { useCallback, useEffect, useState } from 'react';
import type { Coordinates } from '../utils/geo';

interface GeolocationState {
  coordinates: Coordinates | null;
  error: string | null;
  loading: boolean;
}

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  watchPosition?: boolean;
}

function isGeolocationSupported(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Dev-only: allow overriding coordinates via URL query params (?lat=…&lng=…)
 * for design review and local testing when real GPS isn't available.
 */
function readMockCoordinates(): Coordinates | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const lat = parseFloat(params.get('lat') ?? '');
  const lng = parseFloat(params.get('lng') ?? '');
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }
  return null;
}

const UNSUPPORTED_STATE: GeolocationState = {
  coordinates: null,
  error: 'Geolocation is not supported by your browser',
  loading: false,
};

const INITIAL_STATE: GeolocationState = {
  coordinates: null,
  error: null,
  loading: true,
};

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const { enableHighAccuracy = true, watchPosition = true } = options;

  const [state, setState] = useState<GeolocationState>(() => {
    const mock = readMockCoordinates();
    if (mock) return { coordinates: mock, error: null, loading: false };
    return isGeolocationSupported() ? INITIAL_STATE : UNSUPPORTED_STATE;
  });

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let message = 'Unable to get your location';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = 'Location permission denied. Please enable location access.';
        break;
      case error.POSITION_UNAVAILABLE:
        message = 'Location information unavailable.';
        break;
      case error.TIMEOUT:
        message = 'Location request timed out.';
        break;
    }

    setState({
      coordinates: null,
      error: message,
      loading: false,
    });
  }, []);

  const requestLocation = useCallback(() => {
    if (!isGeolocationSupported()) {
      setState(UNSUPPORTED_STATE);
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0,
    };

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  }, [enableHighAccuracy, handleSuccess, handleError]);

  useEffect(() => {
    if (readMockCoordinates()) return;
    if (!isGeolocationSupported()) return;

    const geoOptions: PositionOptions = {
      enableHighAccuracy,
      timeout: 10000,
      maximumAge: 0,
    };

    if (watchPosition) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions,
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geoOptions);
  }, [enableHighAccuracy, watchPosition, handleSuccess, handleError]);

  return { ...state, requestLocation };
}

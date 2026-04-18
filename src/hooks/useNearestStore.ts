import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Coordinates } from '../utils/geo';
import { calculateDistance } from '../utils/geo';

export interface Store {
  placeId: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  distance: number;
  isOpen?: boolean;
  rating?: number;
  closesAt?: string; // e.g. "10:00 PM"
}

interface RawStore {
  placeId: string;
  name: string;
  address: string;
  coordinates: Coordinates;
  isOpen?: boolean;
  rating?: number;
  closesAt?: string;
}

interface InternalState {
  stores: RawStore[];
  loading: boolean;
  error: string | null;
}

const PLACES_API_URL = 'https://places.googleapis.com/v1/places:searchNearby';

interface PlacesPeriodPoint {
  day?: number;
  hour?: number;
  minute?: number;
}
interface PlacesPeriod {
  open?: PlacesPeriodPoint;
  close?: PlacesPeriodPoint;
}

function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  if (minute === 0) return `${displayHour}:00 ${period}`;
  return `${displayHour}:${String(minute).padStart(2, '0')} ${period}`;
}

function getClosingTime(periods: PlacesPeriod[] | undefined): string | undefined {
  if (!Array.isArray(periods) || periods.length === 0) return undefined;

  const now = new Date();
  const today = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Find an open period that contains "now" (handles periods that cross midnight).
  for (const period of periods) {
    const open = period.open;
    const close = period.close;
    if (!open || !close) continue;
    if (open.day === undefined || close.day === undefined) continue;

    const openMinutes = (open.hour ?? 0) * 60 + (open.minute ?? 0);
    const closeMinutes = (close.hour ?? 0) * 60 + (close.minute ?? 0);

    if (open.day === today) {
      if (close.day === today && nowMinutes >= openMinutes && nowMinutes < closeMinutes) {
        return formatTime(close.hour ?? 0, close.minute ?? 0);
      }
      // Crosses midnight.
      if (close.day !== today && nowMinutes >= openMinutes) {
        return formatTime(close.hour ?? 0, close.minute ?? 0);
      }
    }

    // Previous-day period still running through today.
    if (close.day === today && open.day !== today && nowMinutes < closeMinutes) {
      return formatTime(close.hour ?? 0, close.minute ?? 0);
    }
  }
  return undefined;
}

export function useNearestStore(userLocation: Coordinates | null) {
  const [state, setState] = useState<InternalState>({
    stores: [],
    loading: false,
    error: null,
  });

  const inFlightRef = useRef(false);
  const hasAttemptedRef = useRef(false);

  const searchNearbyStores = useCallback(async (location: Coordinates) => {
    if (inFlightRef.current) return;

    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      setState({
        stores: [],
        loading: false,
        error:
          'Google Places API key not configured. Add VITE_GOOGLE_PLACES_API_KEY to your .env file.',
      });
      return;
    }

    inFlightRef.current = true;
    hasAttemptedRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch(PLACES_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': [
            'places.id',
            'places.displayName',
            'places.formattedAddress',
            'places.location',
            'places.currentOpeningHours.openNow',
            'places.currentOpeningHours.periods',
            'places.rating',
          ].join(','),
        },
        body: JSON.stringify({
          includedTypes: ['liquor_store'],
          maxResultCount: 10,
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              radius: 50000,
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.places || data.places.length === 0) {
        setState({
          stores: [],
          loading: false,
          error: 'No liquor stores found nearby',
        });
        return;
      }

      const stores: RawStore[] = data.places.map((place: {
        id: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        location: { latitude: number; longitude: number };
        currentOpeningHours?: { openNow?: boolean; periods?: PlacesPeriod[] };
        rating?: number;
      }) => ({
        placeId: place.id,
        name: place.displayName?.text || 'Unknown Store',
        address: place.formattedAddress || '',
        coordinates: {
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        },
        isOpen: place.currentOpeningHours?.openNow,
        rating: place.rating,
        closesAt:
          place.currentOpeningHours?.openNow === true
            ? getClosingTime(place.currentOpeningHours?.periods)
            : undefined,
      }));

      setState({ stores, loading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to find nearby stores';
      setState({ stores: [], loading: false, error: message });
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  const refresh = useCallback(() => {
    if (userLocation) {
      hasAttemptedRef.current = false;
      setState({ stores: [], loading: false, error: null });
      searchNearbyStores(userLocation);
    }
  }, [userLocation, searchNearbyStores]);

  const lat = userLocation?.latitude;
  const lng = userLocation?.longitude;

  useEffect(() => {
    if (lat === undefined || lng === undefined) return;
    if (hasAttemptedRef.current) return;
    searchNearbyStores({ latitude: lat, longitude: lng });
  }, [lat, lng, searchNearbyStores]);

  // Derive live distances as the user moves without triggering re-fetches.
  const stores: Store[] = useMemo(() => {
    const userCoords =
      lat !== undefined && lng !== undefined
        ? { latitude: lat, longitude: lng }
        : null;
    return state.stores.map((s) => ({
      ...s,
      distance: userCoords
        ? calculateDistance(userCoords, s.coordinates)
        : 0,
    }));
  }, [state.stores, lat, lng]);

  const store = stores[0] ?? null;

  return {
    store,
    stores,
    loading: state.loading,
    error: state.error,
    refresh,
  };
}

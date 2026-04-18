import type { Coordinates } from './geo';

export function openInMaps(destination: Coordinates, storeName?: string): void {
  const { latitude, longitude } = destination;
  const label = storeName ? encodeURIComponent(storeName) : '';

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (isIOS) {
    const appleMapsUrl = `maps://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`;
    window.location.href = appleMapsUrl;
  } else {
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(googleMapsUrl, '_blank');
  }
}

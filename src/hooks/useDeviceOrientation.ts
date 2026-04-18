import { useState, useEffect, useCallback } from 'react';

interface DeviceOrientationState {
  heading: number | null;
  error: string | null;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unsupported';
}

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}

function isIOS(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function requiresPermission(): boolean {
  return (
    isIOS() &&
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> })
      .requestPermission === 'function'
  );
}

function isDeviceOrientationSupported(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
}

export function useDeviceOrientation() {
  const [state, setState] = useState<DeviceOrientationState>(() =>
    isDeviceOrientationSupported()
      ? { heading: null, error: null, permissionState: 'prompt' }
      : {
          heading: null,
          error: 'Device orientation not supported',
          permissionState: 'unsupported',
        },
  );

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const e = event as DeviceOrientationEventiOS;

    let heading: number | null = null;

    if (e.webkitCompassHeading !== undefined) {
      heading = e.webkitCompassHeading;
    } else if (e.alpha !== null) {
      heading = 360 - e.alpha;
    }

    if (heading !== null) {
      setState((prev) => ({
        ...prev,
        heading,
        permissionState: 'granted',
      }));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!requiresPermission()) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setState((prev) => ({ ...prev, permissionState: 'granted' }));
      return true;
    }

    try {
      const permission = await (
        DeviceOrientationEvent as unknown as { requestPermission: () => Promise<'granted' | 'denied'> }
      ).requestPermission();

      if (permission === 'granted') {
        window.addEventListener('deviceorientation', handleOrientation, true);
        setState((prev) => ({ ...prev, permissionState: 'granted' }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          error: 'Compass permission denied',
          permissionState: 'denied',
        }));
        return false;
      }
    } catch {
      setState((prev) => ({
        ...prev,
        error: 'Failed to request compass permission',
        permissionState: 'denied',
      }));
      return false;
    }
  }, [handleOrientation]);

  useEffect(() => {
    if (!isDeviceOrientationSupported()) return;
    if (requiresPermission()) return;

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  return {
    ...state,
    requestPermission,
    needsPermission: requiresPermission() && state.permissionState === 'prompt',
  };
}

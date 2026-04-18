interface LocationPermissionProps {
  onRequestLocation: () => void;
  onRequestCompass?: () => void;
  needsCompassPermission?: boolean;
  loading?: boolean;
  error?: string | null;
}

export function LocationPermission({
  onRequestLocation,
  onRequestCompass,
  needsCompassPermission,
  loading,
  error,
}: LocationPermissionProps) {
  return (
    <div className="m-bg min-h-[100svh] flex flex-col justify-between px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-sm w-full">
        <h1 className="m-display text-[44px] leading-[1.02] text-[color:var(--ink-strong)]">
          liquor
          <br />
          <span className="m-italic text-[color:var(--accent)]">locator</span>
        </h1>
        <p className="mt-5 text-[15px] leading-relaxed text-[color:var(--ink-soft)] max-w-xs">
          A quiet compass that points to the closest bottle shop, with live
          distance. Nothing leaves your device.
        </p>

        {error && (
          <div className="mt-6 p-3.5 rounded-xl border border-[color:var(--warn)]/30 bg-[color:var(--warn)]/[0.08] text-[13px] text-[color:var(--warn)]">
            {error}
          </div>
        )}
      </div>

      <div className="space-y-3 w-full max-w-sm">
        <button
          onClick={onRequestLocation}
          disabled={loading}
          className="w-full py-3.5 px-5 rounded-xl bg-[color:var(--accent)] text-[color:var(--accent-ink)] text-[15px] hover:bg-[color:var(--accent-soft)] disabled:opacity-60 flex items-center justify-between transition-colors"
        >
          <span>{loading ? 'Locating…' : 'Enable location'}</span>
          {!loading && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>

        {needsCompassPermission && onRequestCompass && (
          <button
            onClick={onRequestCompass}
            className="w-full py-3 px-5 rounded-xl border border-[color:var(--panel-border-strong)] text-[13px] text-[color:var(--ink-soft)] hover:text-[color:var(--ink)] hover:border-[color:var(--panel-border-strong)] transition-colors"
          >
            Enable compass motion
          </button>
        )}

        <p className="text-[11px] text-[color:var(--ink-faint)] pt-1 leading-relaxed">
          We use your location only to find nearby stores and compute bearings.
        </p>
      </div>
    </div>
  );
}

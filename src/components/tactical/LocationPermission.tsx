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
    <div className="t-bg t-grid t-scanlines relative min-h-[100svh] flex flex-col px-5 py-6">
      <div className="relative z-10 flex-1 flex flex-col max-w-md w-full mx-auto">
        <div className="t-label text-[color:var(--accent)] text-[12px] tracking-[0.22em]">
          LIQUOR·LOCATOR
        </div>
        <div className="t-label text-[9px] text-[color:var(--ink-faint)] mt-1">
          SYS·STANDBY · AWAITING OPERATOR
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full t-panel p-6 t-bracket space-y-4">
            <div className="t-label t-caret text-[color:var(--accent)]">
              MISSION · BRIEF
            </div>
            <p className="t-mono text-[12px] text-[color:var(--ink)] leading-relaxed">
              ENABLE GPS LOCK AND HEADING SENSORS TO ACQUIRE NEAREST SUPPLY DEPOT.
              POSITION STAYS ON DEVICE.
            </p>
            {error && (
              <div className="border border-[color:var(--warn)]/40 bg-[color:var(--warn)]/[0.08] p-3 t-mono text-[11px] text-[color:var(--warn)]">
                ERR · {error.toUpperCase()}
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                onClick={onRequestLocation}
                disabled={loading}
                className="w-full py-3 t-label t-label--on-accent text-[10px] bg-[color:var(--accent)] hover:bg-[color:var(--accent-soft)] disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
              >
                {loading ? '▸ ACQUIRING LOCK…' : '▸ ACTIVATE GPS LOCK'}
              </button>
              {needsCompassPermission && onRequestCompass && (
                <button
                  onClick={onRequestCompass}
                  className="w-full py-2.5 t-label text-[10px] border border-[color:var(--panel-border-strong)] text-[color:var(--ink-soft)] hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]/40 transition-colors"
                >
                  ▸ ENABLE HEADING SENSOR
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="t-label text-[9px] text-[color:var(--ink-faint)] border-t border-[color:var(--panel-border)] pt-3">
          RTK: DISABLED · COMMS: LOCAL · DATA: ON-DEVICE
        </div>
      </div>
    </div>
  );
}

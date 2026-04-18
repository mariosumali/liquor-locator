export function Header() {
  return (
    <div className="flex items-baseline justify-between pt-[max(1rem,env(safe-area-inset-top))] pb-2">
      <div className="t-label text-[color:var(--accent)] text-[12px] tracking-[0.22em]">
        LIQUOR·LOCATOR
      </div>
      <div className="t-label text-[10px] text-[color:var(--ink-faint)] hidden sm:block">
        TACTICAL · v1.0
      </div>
    </div>
  );
}

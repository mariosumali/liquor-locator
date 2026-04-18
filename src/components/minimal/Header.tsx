interface HeaderProps {
  subtitle?: string;
  desktopHide?: boolean;
}

export function Header({ subtitle = 'updated just now', desktopHide }: HeaderProps) {
  return (
    <header
      className={`pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 ${
        desktopHide ? 'md:hidden' : ''
      }`}
    >
      <h1 className="m-display text-[2rem] md:text-[2.75rem] leading-[1] tracking-tight text-[color:var(--ink-strong)]">
        liquor{' '}
        <span className="m-italic text-[color:var(--accent)]">locator</span>
      </h1>
      <div className="mt-1.5 md:mt-2 text-[12px] md:text-[13px] text-[color:var(--ink-faint)]">
        {subtitle}
      </div>
    </header>
  );
}

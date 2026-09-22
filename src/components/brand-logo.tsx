type BrandLogoProps = {
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/40 bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-600 shadow-[0_0_30px_rgba(34,211,238,0.35)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.75),transparent_35%)]" />
        <svg
          viewBox="0 0 96 96"
          className="relative h-7 w-7"
          aria-label="StockJS logo"
          role="img"
        >
          <defs>
            <linearGradient id="stockjsMark" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#ecfeff" />
              <stop offset="100%" stopColor="#dbeafe" />
            </linearGradient>
          </defs>
          <path d="M18 62 L34 48 L46 56 L60 28 L78 44" fill="none" stroke="url(#stockjsMark)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 72 H78" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="6" strokeLinecap="round" />
          <circle cx="60" cy="28" r="7" fill="#ecfeff" />
        </svg>
      </div>

      {!compact ? (
        <div className="flex flex-col leading-none">
          <span className="text-lg font-black tracking-[0.24em] text-white">STOCK</span>
          <span className="text-xs font-semibold tracking-[0.52em] text-cyan-300">JS</span>
        </div>
      ) : null}
    </div>
  );
}

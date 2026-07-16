// Brand ornaments for the landing kit — same visual language as the main
// site's gold dividers and corner brackets, redrawn here so the kit stays
// self-contained. Sized via className (w-* h-auto) so each use can scale.

// Centered swirl divider with diamond eye — sits inside existing margins.
export function Flourish({ className = "", dark = false }) {
  const eye = dark ? "#1A1408" : "#FDFAF5";
  return (
    <svg
      viewBox="0 0 150 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto ${className}`}
      style={{ color: "#C9A234" }}
      aria-hidden="true"
    >
      <path d="M0 14 L38 14" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <path d="M112 14 L150 14" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <path
        d="M44 14 C 54 14, 54 6, 64 6 C 69 6, 71.5 14, 75 14 C 78.5 14, 81 6, 86 6 C 96 6, 96 14, 106 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="41" cy="14" r="2" fill="currentColor" />
      <circle cx="109" cy="14" r="2" fill="currentColor" />
      <circle cx="75" cy="4.5" r="3.6" fill="currentColor" />
      <circle cx="75" cy="4.5" r="1.7" fill={eye} />
    </svg>
  );
}

// Full-width section divider: hairlines flowing into a central swirl motif.
// Placed at section boundaries so transitions read as designed, not empty.
export function SectionDivider({ dark = false, className = "" }) {
  const eye = dark ? "#1A1408" : "#FDFAF5";
  return (
    <div
      className={`w-full flex items-center ${className}`}
      style={{ color: "#C9A234" }}
      aria-hidden="true"
    >
      <div className="flex-grow h-px bg-current opacity-40" />
      <svg
        viewBox="0 0 300 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 w-[240px] sm:w-[300px] h-auto"
      >
        <path
          d="M 10 26 C 40 26, 40 18, 80 18 C 110 18, 130 38, 150 38 C 170 38, 190 18, 220 18 C 260 18, 260 26, 290 26"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="5" cy="26" r="2.5" fill="currentColor" />
        <circle cx="295" cy="26" r="2.5" fill="currentColor" />
        <circle cx="150" cy="10" r="4" fill="currentColor" />
        <circle cx="150" cy="10" r="1.8" fill={eye} />
      </svg>
      <div className="flex-grow h-px bg-current opacity-40" />
    </div>
  );
}

// Small single-swirl accent — replaces plain gold bars on image cards.
export function MiniFlourish({ className = "" }) {
  return (
    <svg
      viewBox="0 0 44 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto ${className}`}
      style={{ color: "#C9A234" }}
      aria-hidden="true"
    >
      <path
        d="M2 7 C 10 7, 10 2, 18 2 C 22 2, 23 7, 26 7 C 34 7, 34 4, 42 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="2" cy="7" r="1.6" fill="currentColor" />
      <circle cx="42" cy="4" r="1.6" fill="currentColor" />
    </svg>
  );
}

// Diamond bullet used to flank eyebrows and micro-labels.
export function Diamond({ className = "", size = 6 }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 rotate-45 bg-gold ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

function CornerSVG({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5 38 L5 5 L38 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M1.5 5 L5 1.5 L8.5 5 L5 8.5 Z" fill="currentColor" />
      <circle cx="5" cy="39.5" r="2" fill="currentColor" />
      <circle cx="39.5" cy="5" r="2" fill="currentColor" />
    </svg>
  );
}

// Four gold corner brackets, absolutely positioned — zero footprint.
// Parent must be `relative`.
export function CornerFrame({ size = 26, inset = 8, opacity = 0.5, className = "" }) {
  const base = { color: "#C9A234", opacity, position: "absolute", pointerEvents: "none" };
  return (
    <>
      <div style={{ ...base, top: inset, left: inset }} className={className}><CornerSVG size={size} /></div>
      <div style={{ ...base, top: inset, right: inset, transform: "scaleX(-1)" }} className={className}><CornerSVG size={size} /></div>
      <div style={{ ...base, bottom: inset, left: inset, transform: "scaleY(-1)" }} className={className}><CornerSVG size={size} /></div>
      <div style={{ ...base, bottom: inset, right: inset, transform: "scale(-1,-1)" }} className={className}><CornerSVG size={size} /></div>
    </>
  );
}

// Hairline photo frame — inset editorial border laid over images. Zero
// footprint; gives every photograph a mounted, gallery-print feel.
export function PhotoFrame({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-[7px] border border-[#FDFAF5]/30 rounded-[2px] pointer-events-none ${className}`}
    />
  );
}

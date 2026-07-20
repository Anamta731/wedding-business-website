// Brand ornaments for the landing kit — same visual language as the main
// site's gold dividers and corner brackets, redrawn here so the kit stays
// self-contained. Sized via className (w-* h-auto) so each use can scale.

// "Sindoor" — deep bridal red, used ONLY as a detail colour inside the gold
// line-work (blossom petals, lotus tips). Never large fills.
export const SINDOOR = "#96222D";
const SINDOOR_ON_INK = "#C96A72"; // rose tint so red details read on dark bg

// Small four-petal blossom with a gold heart — replaces plain diamonds.
export function Blossom({ className = "", size = 9, color = SINDOOR }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`} aria-hidden="true">
      <circle cx="5" cy="2.1" r="1.8" fill={color} opacity="0.92" />
      <circle cx="7.9" cy="5" r="1.8" fill={color} opacity="0.92" />
      <circle cx="5" cy="7.9" r="1.8" fill={color} opacity="0.92" />
      <circle cx="2.1" cy="5" r="1.8" fill={color} opacity="0.92" />
      <circle cx="5" cy="5" r="1.4" fill="#C9A234" />
    </svg>
  );
}

// Standalone lotus — the heading flourish's centre motif on its own, with
// ivory-filled petals so it stays crisp over photography. Used as the
// enquiry card's crest (where the wax seal used to sit).
export function Lotus({ className = "" }) {
  return (
    <svg
      viewBox="0 0 44 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto ${className}`}
      style={{ color: "#C9A234" }}
      aria-hidden="true"
    >
      {/* outer sweeps */}
      <path d="M22 21 Q 8 20.5 3 15" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      <path d="M22 21 Q 36 20.5 41 15" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
      {/* inner petals */}
      <path d="M22 21 Q 13 17 11 9 Q 18.5 12 22 21 Z" stroke="currentColor" strokeWidth="1.4" fill="#FDFAF5" strokeLinejoin="round" />
      <path d="M22 21 Q 31 17 33 9 Q 25.5 12 22 21 Z" stroke="currentColor" strokeWidth="1.4" fill="#FDFAF5" strokeLinejoin="round" />
      {/* centre petal */}
      <path d="M22 3 Q 25.8 12 22 21 Q 18.2 12 22 3 Z" stroke="currentColor" strokeWidth="1.5" fill="#FDFAF5" strokeLinejoin="round" />
      {/* sindoor tips */}
      <circle cx="22" cy="2.6" r="1.6" fill={SINDOOR} />
      <circle cx="10.7" cy="8.4" r="1.3" fill={SINDOOR} />
      <circle cx="33.3" cy="8.4" r="1.3" fill={SINDOOR} />
    </svg>
  );
}

// Lotus flourish — the swirl divider's floral sibling: hairlines flowing
// into a line-drawn lotus with sindoor petal tips.
export function LotusFlourish({ className = "", dark = false }) {
  const tip = dark ? SINDOOR_ON_INK : SINDOOR;
  return (
    <svg
      viewBox="0 0 150 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-auto ${className}`}
      style={{ color: "#C9A234" }}
      aria-hidden="true"
    >
      <path d="M0 19 L44 19" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <path d="M106 19 L150 19" stroke="currentColor" strokeWidth="1" opacity="0.75" />
      <circle cx="47.5" cy="19" r="1.8" fill="currentColor" />
      <circle cx="102.5" cy="19" r="1.8" fill="currentColor" />
      {/* centre petal */}
      <path d="M75 4 Q 78.5 12 75 21 Q 71.5 12 75 4 Z" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinejoin="round" />
      {/* inner petals */}
      <path d="M75 21 Q 66.5 17 64.5 9.5 Q 71.5 12.5 75 21 Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      <path d="M75 21 Q 83.5 17 85.5 9.5 Q 78.5 12.5 75 21 Z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
      {/* outer sweeps */}
      <path d="M75 21 Q 61 20.5 56 15" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M75 21 Q 89 20.5 94 15" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {/* sindoor tips */}
      <circle cx="75" cy="3.6" r="1.5" fill={tip} />
      <circle cx="64.2" cy="9" r="1.2" fill={tip} />
      <circle cx="85.8" cy="9" r="1.2" fill={tip} />
    </svg>
  );
}

// Marigold toran — the garland strung over wedding entrances: drooping
// strings with hanging marigolds and leaf pairs. The hero's signature.
export function Toran({ className = "" }) {
  const UNIT = 120;
  const COUNT = 12;
  return (
    <div className={`w-full overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <svg
        viewBox={`0 0 ${UNIT * COUNT} 46`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-auto w-full min-w-[760px]"
        style={{ color: "#C9A234" }}
        preserveAspectRatio="xMidYMin meet"
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const x = i * UNIT;
          const mx = x + UNIT / 2;
          return (
            <g key={i}>
              {/* drooping string */}
              <path d={`M${x} 7 Q ${mx} 28 ${x + UNIT} 7`} stroke="currentColor" strokeWidth="1.5" opacity="0.85" fill="none" />
              {/* blossom at the string joint */}
              <circle cx={x} cy="6.5" r="2.6" fill="currentColor" opacity="0.9" />
              <circle cx={x} cy="6.5" r="1.1" fill={SINDOOR} />
              {/* hanging strand + leaf pair + marigold */}
              <path d={`M${mx} 17.5 L${mx} 29`} stroke="currentColor" strokeWidth="1.2" opacity="0.85" />
              <path d={`M${mx} 24 L${mx - 5} 28 M${mx} 24 L${mx + 5} 28`} stroke="currentColor" strokeWidth="1.1" opacity="0.7" />
              <circle cx={mx} cy="34.5" r="4.6" fill="currentColor" opacity="0.95" />
              <circle cx={mx} cy="34.5" r="2" fill={SINDOOR} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// Petal ring — turns the RSVP monogram disc into a flower seal.
export function SealPetals({ className = "" }) {
  return (
    <svg viewBox="0 0 76 76" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, k) => (
        <g key={k} transform={`rotate(${k * 45} 38 38)`}>
          <ellipse cx="38" cy="9.5" rx="5.5" ry="9" fill="#FDFAF5" stroke="#C9A234" strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  );
}

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
        {/* blossom floating above the wave's centre */}
        <circle cx="150" cy="6.2" r="2.1" fill={dark ? SINDOOR_ON_INK : SINDOOR} opacity="0.92" />
        <circle cx="153.6" cy="9.8" r="2.1" fill={dark ? SINDOOR_ON_INK : SINDOOR} opacity="0.92" />
        <circle cx="150" cy="13.4" r="2.1" fill={dark ? SINDOOR_ON_INK : SINDOOR} opacity="0.92" />
        <circle cx="146.4" cy="9.8" r="2.1" fill={dark ? SINDOOR_ON_INK : SINDOOR} opacity="0.92" />
        <circle cx="150" cy="9.8" r="1.7" fill="currentColor" />
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
      {/* vine ends in a sindoor bud */}
      <circle cx="42" cy="4" r="1.9" fill={SINDOOR} opacity="0.95" />
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

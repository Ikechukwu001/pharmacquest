/**
 * Pharmacquest — Scene fallback
 *
 * Shown when the browser can't render WebGL. Replaces the 3D scene with
 * a clean static visual that still feels like Pharmacquest.
 */

export function SceneFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 relative overflow-hidden">
      {/* Static decorative SVG — a simplified version of the 3D scene */}
      <svg
        viewBox="0 0 200 200"
        className="w-32 h-32 sm:w-40 sm:h-40 opacity-90"
        aria-hidden="true"
      >
        {/* Soft glow behind the bottle */}
        <circle cx="100" cy="100" r="60" fill="#378ADD" opacity="0.3" />

        {/* Bottle body */}
        <rect
          x="78"
          y="60"
          width="44"
          height="80"
          rx="22"
          fill="#fef3c7"
          stroke="#d97706"
          strokeWidth="2"
        />
        {/* Bottle cap */}
        <rect x="78" y="60" width="44" height="28" rx="14" fill="#d97706" />
        {/* Label band */}
        <rect x="78" y="100" width="44" height="12" fill="#2563eb" />

        {/* Small floating capsules */}
        <rect
          x="40"
          y="80"
          width="20"
          height="9"
          rx="4.5"
          fill="#dbeafe"
          transform="rotate(-20 50 84)"
        />
        <rect
          x="140"
          y="70"
          width="20"
          height="9"
          rx="4.5"
          fill="#fde68a"
          transform="rotate(25 150 74)"
        />
        <rect
          x="145"
          y="130"
          width="20"
          height="9"
          rx="4.5"
          fill="#dbeafe"
          transform="rotate(-35 155 134)"
        />
        <rect
          x="35"
          y="125"
          width="20"
          height="9"
          rx="4.5"
          fill="#fde68a"
          transform="rotate(15 45 129)"
        />
      </svg>
    </div>
  );
}
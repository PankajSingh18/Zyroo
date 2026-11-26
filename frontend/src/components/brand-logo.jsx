export default function BrandLogo({ size = 32, className = "" }) {
  return (
    <svg
      aria-label="ZyroAI"
      className={className}
      height={size}
      viewBox="0 0 40 40"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zyroai-logo" x1="7" x2="33" y1="5" y2="35" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a78bfa" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect fill="url(#zyroai-logo)" height="40" rx="11" width="40" />
      <path
        d="M10.5 12.5h19L15 27.5h14.5"
        fill="none"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
      />
      <circle cx="29.5" cy="27.5" fill="#c4b5fd" r="2" />
    </svg>
  );
}
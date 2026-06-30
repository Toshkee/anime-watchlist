/**
 * Arc brand mark — a comet arcing across the sky: an ascending trajectory
 * (the "arc") with a glowing head at the leading tip. Uses `currentColor`
 * so it inherits whatever text color it sits in (the accent in the header
 * badge). See src/app/icon.svg for the standalone favicon version.
 */
export function ArcMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path
        d="M4 19C6 12 10.5 7 17.5 6"
        stroke="currentColor"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle cx="18" cy="5.8" r="2.7" fill="currentColor" />
    </svg>
  );
}

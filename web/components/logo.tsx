// The Bravogram mark: four leaning ellipses. Traced from the logo image, so swap in the
// original vector file when there is one. Uses currentColor, so it follows the text color.
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 1250 1250" fill="currentColor" aria-hidden="true">
      <ellipse cx="237" cy="720" rx="105" ry="226" transform="rotate(-11 237 720)" />
      <ellipse cx="478" cy="636" rx="128" ry="446" transform="rotate(-8 478 636)" />
      <ellipse cx="772" cy="636" rx="128" ry="446" transform="rotate(8 772 636)" />
      <ellipse cx="1013" cy="720" rx="105" ry="226" transform="rotate(11 1013 720)" />
    </svg>
  )
}

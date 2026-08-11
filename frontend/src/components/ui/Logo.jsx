/**
 * NutriSense brand mark — deep forest tile with a stylized leaf.
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} wordmark - render the wordmark next to the tile
 * @param {'dark'|'light'} theme - tile variant
 */
export default function Logo({ size = 'md', wordmark = false, theme = 'dark' }) {
  const sizes = {
    sm: { tile: 30, icon: 15 },
    md: { tile: 40, icon: 19 },
    lg: { tile: 52, icon: 24 },
  };
  const { tile, icon } = sizes[size] || sizes.md;

  return (
    <span
      className={`logo ${theme === 'light' ? 'logo--light' : 'logo--dark'}`}
      style={{ '--logo-tile': `${tile}px` }}
    >
      <span className="logo__tile">
        <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M6.2 20.6C6.2 12.6 10.6 6.8 20.4 4.9c-.6 9.2-4.6 14.4-14.2 15.7Z"
            fill="currentColor"
          />
          <path
            d="M6.2 20.6c1.6-3.6 4.3-6.6 8.6-8.9"
            stroke="#FFFFFF"
            strokeWidth="1.1"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      </span>
      {wordmark && (
        <span className="logo__word">
          Nutri<span className="logo__word-sense">Sense</span>
        </span>
      )}
    </span>
  );
}

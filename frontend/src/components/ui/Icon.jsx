import { ICONS } from './icons';

/**
 * Icon — consistent 24×24 stroke icon.
 * @param {string} name - key of the icon in the registry
 */
export default function Icon({ name, size = 18, strokeWidth = 1.7, className, ...rest }) {
  const d = ICONS[name];
  if (!d) return null;
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}

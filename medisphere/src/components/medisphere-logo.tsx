'use client';

interface MedisphereLogoProps {
  className?: string;
  size?: number;
}

function MedisphereLogo({ className, size = 32 }: MedisphereLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect x="10" y="2" width="12" height="28" rx="3" fill="#DC2626" />
      <rect x="2" y="10" width="28" height="12" rx="3" fill="#DC2626" />
    </svg>
  );
}

export { MedisphereLogo };
export default MedisphereLogo;

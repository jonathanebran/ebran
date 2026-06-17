interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 1024 1024"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
      aria-label="Ebran"
      role="img"
    >
      <defs>
        <linearGradient id="ebranGrad" x1="184" y1="154" x2="850" y2="870" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFD84A" />
          <stop offset="0.34" stopColor="#FF9F3D" />
          <stop offset="0.66" stopColor="#FF6B5F" />
          <stop offset="1" stopColor="#FF2F7D" />
        </linearGradient>
      </defs>
      <g stroke="url(#ebranGrad)" strokeWidth="86" strokeLinecap="round" strokeLinejoin="round">
        <path d="M352 248 C286 296 252 384 254 512 C256 640 292 728 356 776" />
        <path d="M365 252 C456 205 591 196 716 238 C758 252 775 280 755 305 C736 330 689 331 642 316 C557 290 470 298 398 338" />
        <path d="M323 512 C414 465 552 461 666 502 C707 517 724 545 704 570 C685 594 641 595 596 579 C515 550 435 557 356 600" />
        <path d="M365 772 C456 819 591 828 716 786 C758 772 775 744 755 719 C736 694 689 693 642 708 C557 734 470 726 398 686" />
      </g>
      <g opacity="0.22" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        <path d="M381 279 C461 241 582 235 688 270" />
        <path d="M354 530 C435 494 548 494 640 527" />
        <path d="M383 744 C462 783 582 789 688 754" />
      </g>
    </svg>
  );
}

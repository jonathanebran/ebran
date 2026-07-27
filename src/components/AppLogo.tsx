import { useId } from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

// O logo é desenhado como SVG inline (e não como imagem) para que o gradiente
// use as variáveis de tema e acompanhe a cor escolhida nas Configurações.
// O viewBox recorta o desenho do mesmo jeito que o PNG antigo aparecia.
export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  // Ids únicos por instância: o logo aparece mais de uma vez na mesma tela
  // (cabeçalho e botão da IA) e ids repetidos fariam os gradientes colidirem.
  const uid = useId().replace(/:/g, '');
  const gradientId = `ebran-gradient-${uid}`;
  const glowId = `ebran-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="158 158 708 708"
      className={`flex-shrink-0 ${className}`}
      style={{ display: 'block', minWidth: size }}
      role="img"
      aria-label="Ebran"
    >
      <defs>
        <linearGradient id={gradientId} x1="184" y1="154" x2="850" y2="870" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--color-start)" />
          <stop offset="0.34" stopColor="var(--color-accent)" />
          <stop offset="0.66" stopColor="var(--color-mid)" />
          <stop offset="1" stopColor="var(--color-end)" />
        </linearGradient>

        {/* Brilho gerado a partir do próprio traço, para herdar a cor do tema
            em vez de um tom quente fixo. */}
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="18" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g
        filter={`url(#${glowId})`}
        stroke={`url(#${gradientId})`}
        strokeWidth="86"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M352 248 C286 296 252 384 254 512 C256 640 292 728 356 776" />
        <path d="M365 252 C456 205 591 196 716 238 C758 252 775 280 755 305 C736 330 689 331 642 316 C557 290 470 298 398 338" />
        <path d="M323 512 C414 465 552 461 666 502 C707 517 724 545 704 570 C685 594 641 595 596 579 C515 550 435 557 356 600" />
        <path d="M365 772 C456 819 591 828 716 786 C758 772 775 744 755 719 C736 694 689 693 642 708 C557 734 470 726 398 686" />
      </g>

      {/* Realce interno, branco e neutro — funciona em qualquer tema. */}
      <g opacity="0.28" stroke="#FFFFFF" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M381 279 C461 241 582 235 688 270" />
        <path d="M354 530 C435 494 548 494 640 527" />
        <path d="M383 744 C462 783 582 789 688 754" />
      </g>
    </svg>
  );
}

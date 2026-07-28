import { useId } from 'react';
import { LOGO_PATH, LOGO_TRANSFORM, LOGO_VIEWBOX } from '../assets/logoPath';

interface AppLogoProps {
  size?: number;
  className?: string;
}

// O logo é desenhado como SVG inline para que o gradiente use as variáveis de
// tema — assim ele acompanha a cor escolhida nas Configurações, o que uma
// imagem não permite.
//
// O traçado veio da vetorização da arte original (ver src/assets/logoPath.ts).
export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  // O logo aparece mais de uma vez na mesma tela (cabeçalho e botão da IA).
  // Gradiente e filtro são referenciados por id, então cada instância precisa
  // dos seus — ids repetidos fariam um sobrescrever o outro.
  const uid = useId().replace(/:/g, '');
  const gradientId = `ebran-grad-${uid}`;
  const glowId = `ebran-glow-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={LOGO_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={`flex-shrink-0 ${className}`}
      style={{ display: 'block', minWidth: size, overflow: 'visible' }}
      role="img"
      aria-label="Ebran"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-start)" />
          <stop offset="0.35" stopColor="var(--color-accent)" />
          <stop offset="0.68" stopColor="var(--color-mid)" />
          <stop offset="1" stopColor="var(--color-end)" />
        </linearGradient>

        {/* O halo de neon nasce do próprio traço borrado, então herda o
            gradiente e muda de cor junto com o tema. */}
        <filter id={glowId} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="34" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#${glowId})`}>
        <g transform={LOGO_TRANSFORM}>
          <path d={LOGO_PATH} fill={`url(#${gradientId})`} />
        </g>
      </g>
    </svg>
  );
}

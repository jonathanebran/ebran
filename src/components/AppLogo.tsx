import logoSvg from '../assets/logo/logo.svg';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  return (
    <img
      src={logoSvg}
      alt="Ebran"
      width={size}
      height={size}
      className={`object-contain flex-shrink-0 ${className}`}
      draggable={false}
    />
  );
}

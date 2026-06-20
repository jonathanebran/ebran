interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt="Ebran"
      className={`flex-shrink-0 rounded-xl object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

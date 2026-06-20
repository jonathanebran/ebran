interface AppLogoProps {
  size?: number;
  className?: string;
}

export function AppLogo({ size = 36, className = '' }: AppLogoProps) {
  return (
    <div
      className={`flex-shrink-0 rounded-xl overflow-hidden ${className}`}
      style={{ width: size, height: size, minWidth: size }}
    >
      <img
        src="/logo.png"
        alt="Ebran"
        style={{
          width: '100%',
          height: '100%',
          transform: 'scale(1.45)',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}

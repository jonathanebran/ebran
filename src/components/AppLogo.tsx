interface AppLogoProps {
  size?: number;
  className?: string;
}

// O logo é a imagem original (um "E" em neon com linhas concêntricas finas).
//
// Já tentei trocar por SVG para que acompanhasse o tema, usando o
// src/assets/logo/logo.svg do repositório — mas aquele arquivo não é o vetor
// deste desenho, é um esboço bem mais simples, e o logo ficou irreconhecível.
// Enquanto não existir um vetor fiel, a imagem fica como está e mantém a
// identidade da marca.
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

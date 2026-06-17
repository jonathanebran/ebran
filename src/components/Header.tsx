import { User } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { mockUser } from '../data/mockData';

interface HeaderProps {
  showGreeting?: boolean;
}

export function Header({ showGreeting = false }: HeaderProps) {
  return (
    <div className="px-5 pt-4 pb-2">
      <div className="flex items-center justify-between">
        <AppLogo size={38} />
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: 'rgba(28,28,30,0.85)',
            border: '1.5px solid rgba(255,111,95,0.5)',
          }}
        >
          {mockUser.avatar_url ? (
            <img src={mockUser.avatar_url} alt="Perfil" className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={18} color="#A8A8A8" />
          )}
        </div>
      </div>

      {showGreeting && (
        <div className="mt-4">
          <h1 className="text-3xl font-bold text-[#F7F7F7] leading-tight">
            Boa noite, {mockUser.name.split(' ')[0]} {mockUser.name.split(' ')[1]}.
          </h1>
          <p className="text-[#A8A8A8] text-sm mt-1">Tudo sob controle. Vamos em frente.</p>
        </div>
      )}
    </div>
  );
}

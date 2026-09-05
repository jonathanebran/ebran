import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { mockUser } from '../data/mockData';
import { useCloudBlob } from '../hooks/useCloudBlob';

const PROFILE_KEY = 'ebran:profile:v1';
const AVATAR_KEY = 'ebran:avatar:v1';

export interface ProfileData {
  name: string;
  avatar: string | null;
}

interface ProfileContextValue {
  profile: ProfileData;
  setName: (name: string) => void;
  setAvatar: (avatar: string | null) => void;
}

function loadInitial(): ProfileData {
  let name = mockUser.name;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) { const p = JSON.parse(raw) as { name?: string }; if (p.name) name = p.name; }
  } catch { /* padrão */ }
  let avatar: string | null = null;
  try { avatar = localStorage.getItem(AVATAR_KEY); } catch { /* padrão */ }
  return { name, avatar };
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ProfileData>(() => loadInitial());

  // Cache local (também alimenta o primeiro render sem piscar).
  useEffect(() => {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: profile.name })); } catch { /* cheio */ }
    try {
      if (profile.avatar) localStorage.setItem(AVATAR_KEY, profile.avatar);
      else localStorage.removeItem(AVATAR_KEY);
    } catch { /* cheio */ }
  }, [profile]);

  const applyRemote = useCallback((remote: ProfileData) => {
    setProfile(prev => ({
      name: remote.name || prev.name,
      avatar: remote.avatar ?? prev.avatar,
    }));
  }, []);
  useCloudBlob('profile', profile, applyRemote);

  const setName = useCallback((name: string) => setProfile(p => ({ ...p, name })), []);
  const setAvatar = useCallback((avatar: string | null) => setProfile(p => ({ ...p, avatar })), []);

  return (
    <ProfileContext.Provider value={{ profile, setName, setAvatar }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used inside ProfileProvider');
  return ctx;
}

import type { ReactNode } from 'react';
import { ToggleSwitch } from './ToggleSwitch';

interface PermissionRowProps {
  icon: ReactNode;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export function PermissionRow({ icon, label, description, value, onChange }: PermissionRowProps) {
  return (
    <div
      className="flex items-center gap-3 py-3.5 border-b"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.07)' }}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[#F7F7F7] text-sm font-medium">{label}</p>
        <p className="text-[#6F6F6F] text-xs mt-0.5">{description}</p>
      </div>
      <ToggleSwitch value={value} onChange={onChange} size="sm" />
    </div>
  );
}

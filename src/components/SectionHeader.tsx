import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function SectionHeader({ title, action, icon }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[#A8A8A8]">{icon}</span>}
        <span className="text-[#F7F7F7] font-semibold text-base">{title}</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

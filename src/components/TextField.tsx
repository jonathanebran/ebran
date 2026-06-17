import type { ReactNode } from 'react';

interface TextFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function TextField({
  label, value, onChange, placeholder, type = 'text',
  multiline = false, rows = 3, icon, disabled = false, className = '',
}: TextFieldProps) {
  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#F7F7F7',
    borderRadius: 14,
    width: '100%',
    padding: icon ? '0.85rem 1rem 0.85rem 2.75rem' : '0.85rem 1rem',
    fontSize: 15,
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm text-[#A8A8A8] font-medium">{label}</label>}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6F6F6F]">
            {icon}
          </div>
        )}
        {multiline ? (
          <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            style={{ ...inputStyle, resize: 'none' }}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,111,95,0.65)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={inputStyle}
            onFocus={e => (e.target.style.borderColor = 'rgba(255,111,95,0.65)')}
            onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
          />
        )}
      </div>
    </div>
  );
}

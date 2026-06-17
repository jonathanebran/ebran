interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export function SelectField({ label, value, onChange, options, className = '' }: SelectFieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && <label className="text-sm text-[#A8A8A8] font-medium">{label}</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#F7F7F7',
          borderRadius: 14,
          width: '100%',
          padding: '0.85rem 1rem',
          fontSize: 15,
          outline: 'none',
          appearance: 'none',
          WebkitAppearance: 'none',
        }}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} style={{ background: '#111' }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

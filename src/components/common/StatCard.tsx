import { ElementType } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  Icon: ElementType;
  iconColor?: string;
  bgColor?: string;
  borderColor?: string;
  color?: string; // Base color for simpler setups (e.g., 'emerald', 'amber')
}

export const StatCard = ({ label, value, Icon, iconColor, bgColor, borderColor, color }: StatCardProps) => {
  // Use provided classes or generate based on 'color' (note: tailwind purges might miss dynamic classes if not careful, 
  // but we assume standard colors are safe or pre-defined in the project).
  const ic = iconColor || (color ? `text-${color}-400` : 'text-slate-400');
  const bg = bgColor || (color ? `bg-${color}-500/20` : 'bg-slate-800/50');
  const bc = borderColor || (color ? `border-${color}-500/30` : 'border-slate-700/50');

  return (
    <div className="bg-slate-900 p-6 rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.2)] border border-slate-800 hover-lift relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity duration-300">
        <Icon className={`w-24 h-24 ${ic} transform translate-x-4 -translate-y-4`} />
      </div>
      <div className="flex items-center relative z-10">
        <div className={`flex-shrink-0 ${bg} rounded-2xl p-3.5 shadow-inner border ${bc}`}>
          <Icon className={`h-7 w-7 ${ic}`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-xs font-bold text-slate-400 uppercase tracking-[0.15em] mb-1.5">{label}</dt>
            <dd className="text-4xl font-extrabold text-white font-heading tracking-tight">{value}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

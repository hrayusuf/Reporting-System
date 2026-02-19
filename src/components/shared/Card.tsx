import React, { ReactNode } from 'react';
import { useApp } from '../../contexts/AppContext';

interface CardProps {
  children?: ReactNode;
  title?: string;
  className?: string;
}

export const Card = ({ children, title, className = '' }: CardProps) => {
  const { t } = useApp();
  return (
    <div className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:border-orange-500/50 hover:bg-white/10 ${className}`}>
      {title && <h3 className="text-lg font-semibold text-slate-100 mb-4">{t(title)}</h3>}
      {children}
    </div>
  );
};

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

export const KPICard = ({ title, value, subValue, icon: Icon, trend = 'neutral' }: KPICardProps) => {
  const { t } = useApp();
  const trendColor = trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-slate-400';
  const bgColor = trend === 'up' ? 'bg-emerald-400/10' : trend === 'down' ? 'bg-rose-400/10' : 'bg-slate-400/10';

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl flex items-center gap-4 transition-all duration-300 hover:border-orange-500 hover:bg-white/10 group">
      <div className={`p-3 rounded-xl ${bgColor} text-slate-200 group-hover:text-orange-400 transition-colors duration-300 flex-shrink-0`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-400 group-hover:text-slate-300 truncate">{t(title)}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight truncate">{value}</h4>
        {subValue && <p className={`text-sm mt-1 ${trendColor}`}>{subValue}</p>}
      </div>
    </div>
  );
};

export const ChartWrapper = ({ children }: { children?: ReactNode }) => (
  <div dir="ltr" className="w-full h-full">
    {children}
  </div>
);

export const chartDarkTheme = {
  contentStyle: { backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f1f5f9' },
  itemStyle: { color: '#f1f5f9' },
  cursor: { fill: 'rgba(255,255,255,0.05)' },
  grid: { stroke: 'rgba(255,255,255,0.05)' },
  tick: { fill: '#94a3b8', fontSize: 12 },
};

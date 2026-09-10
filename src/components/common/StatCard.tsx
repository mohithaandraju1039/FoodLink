import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  color?: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose' | 'teal';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'emerald',
}) => {
  const iconBg = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400',
    blue: 'bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400',
    teal: 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-content-muted uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl ${iconBg[color]}`}>{icon}</div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-content-main">{value}</span>
        {trend && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{trend}</span>}
      </div>
      {description && <p className="mt-1 text-xs text-content-muted">{description}</p>}
    </div>
  );
};

import React from 'react';
import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Items Found',
  description = 'There are no active entries or matches for your query at the moment.',
  icon,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-surface-border rounded-2xl bg-surface-card/50">
      <div className="p-4 rounded-full bg-surface-hover text-content-muted mb-4">
        {icon || <PackageOpen className="w-8 h-8 text-brand-500" />}
      </div>
      <h4 className="text-base font-bold text-content-main mb-1">{title}</h4>
      <p className="text-xs text-content-muted max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
};

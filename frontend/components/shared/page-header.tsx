import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-emerald-100/80 pb-5">
      <div className="flex items-start gap-3">
        <div className="w-1.5 h-10 bg-yellow-400 rounded-full shadow-xs mt-0.5 shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-emerald-950">{title}</h1>
          {description && <p className="text-xs sm:text-sm font-medium text-emerald-800/70 mt-0.5">{description}</p>}
        </div>
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
}

import React from 'react';
import { SiagaLevel } from '../types/sda';

export const SIAGA_META: Record<
  SiagaLevel,
  { label: string; color: string; badgeClass: string; bgHex: string }
> = {
  normal: {
    label: 'Normal',
    color: '#10b981',
    bgHex: '#059669',
    badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  siaga4: {
    label: 'Siaga IV',
    color: '#38bdf8',
    bgHex: '#0284c7',
    badgeClass: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  siaga3: {
    label: 'Siaga III',
    color: '#facc15',
    bgHex: '#ca8a04',
    badgeClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  },
  siaga2: {
    label: 'Siaga II',
    color: '#fb923c',
    bgHex: '#ea580c',
    badgeClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  siaga1: {
    label: 'Siaga I',
    color: '#f43f5e',
    bgHex: '#e11d48',
    badgeClass: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  },
  offline: {
    label: 'Offline',
    color: '#94a3b8',
    bgHex: '#64748b',
    badgeClass: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  },
};

export const StatusBadge: React.FC<{ status: SiagaLevel; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm',
}) => {
  const meta = SIAGA_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${
        size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[11px]'
      } ${meta.badgeClass}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${status === 'siaga1' || status === 'siaga2' ? 'animate-pulse' : ''}`}
        style={{ backgroundColor: meta.color }}
      />
      {meta.label}
    </span>
  );
};

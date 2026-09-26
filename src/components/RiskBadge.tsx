'use client';

/**
 * RiskBadge — displays a risk level with text + icon + color.
 *
 * IMPORTANT: Risk is NEVER conveyed by color alone (WCAG 1.4.1).
 * Each badge includes both an icon and a text label.
 */

import { memo } from 'react';
import { RiskLevel } from '@/lib/schemas/analyze';

interface RiskBadgeProps {
  level: RiskLevel;
  /** Show a larger, more prominent badge */
  size?: 'sm' | 'md';
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; icon: string; className: string; ariaLabel: string }
> = {
  high: {
    label: 'High Risk',
    icon: '⚠',
    className: 'bg-red-100 text-red-800 border-red-200',
    ariaLabel: 'High risk',
  },
  medium: {
    label: 'Medium Risk',
    icon: '△',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    ariaLabel: 'Medium risk',
  },
  low: {
    label: 'Low Risk',
    icon: '✓',
    className: 'bg-green-100 text-green-800 border-green-200',
    ariaLabel: 'Low risk',
  },
  info: {
    label: 'Info',
    icon: 'ℹ',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    ariaLabel: 'Informational',
  },
};

export const RiskBadge = memo(function RiskBadge({ level, size = 'sm' }: RiskBadgeProps) {
  const config = RISK_CONFIG[level];
  const sizeClass = size === 'md' ? 'px-3 py-1.5 text-sm font-semibold' : 'px-2 py-0.5 text-xs font-medium';

  return (
    <span
      role="img"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center gap-1 rounded-full border ${config.className} ${sizeClass}`}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
});


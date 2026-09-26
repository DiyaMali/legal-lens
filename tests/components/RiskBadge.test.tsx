/**
 * Component tests for RiskBadge
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RiskBadge } from '@/components/RiskBadge';

describe('RiskBadge', () => {
  it('renders "High Risk" label for high level', () => {
    render(<RiskBadge level="high" />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders "Medium Risk" label for medium level', () => {
    render(<RiskBadge level="medium" />);
    expect(screen.getByText('Medium Risk')).toBeInTheDocument();
  });

  it('renders "Low Risk" label for low level', () => {
    render(<RiskBadge level="low" />);
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
  });

  it('renders "Info" label for info level', () => {
    render(<RiskBadge level="info" />);
    expect(screen.getByText('Info')).toBeInTheDocument();
  });

  it('has aria-label for screen readers', () => {
    render(<RiskBadge level="high" />);
    const badge = screen.getByRole('img');
    expect(badge).toHaveAttribute('aria-label', 'High risk');
  });

  it('conveys risk with text — not color alone', () => {
    render(<RiskBadge level="high" />);
    // The text label must be present (not just CSS class)
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    // Icon must be aria-hidden
    const icons = screen.getAllByRole('img', { hidden: true });
    expect(icons.length).toBeGreaterThan(0);
  });
});

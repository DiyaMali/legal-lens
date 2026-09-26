/**
 * Component tests for ClauseCard
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClauseCard } from '@/components/ClauseCard';
import { Clause } from '@/lib/schemas/analyze';

const MOCK_CLAUSE: Clause = {
  id: 'c1',
  title: 'Security deposit forfeiture',
  category: 'payment',
  quote: 'If the Tenant vacates before the lock-in period, the security deposit shall be forfeited.',
  quoteVerified: true,
  explanation: 'You lose your full deposit if you leave early.',
  riskLevel: 'high',
  riskReason: 'Full deposit forfeiture is severe and one-sided.',
  questionToAsk: 'Can the forfeiture be partial rather than full?',
};

describe('ClauseCard', () => {
  it('renders the clause title', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('Security deposit forfeiture')).toBeInTheDocument();
  });

  it('renders the risk badge', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('renders the explanation', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('You lose your full deposit if you leave early.')).toBeInTheDocument();
  });

  it('shows question to ask', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Can the forfeiture be partial/)).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const onSelect = vi.fn();
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onSelect).toHaveBeenCalledWith('c1');
  });

  it('calls onSelect on Enter key', () => {
    const onSelect = vi.fn();
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={onSelect} />);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('c1');
  });

  it('shows selected state with aria-pressed', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={true} onSelect={vi.fn()} />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('shows unverified quote warning when quoteVerified is false', () => {
    const unverifiedClause = { ...MOCK_CLAUSE, quoteVerified: false };
    render(<ClauseCard clause={unverifiedClause} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText(/Could not verify/)).toBeInTheDocument();
  });

  it('does NOT show unverified warning when quoteVerified is true', () => {
    render(<ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.queryByText(/Could not verify/)).not.toBeInTheDocument();
  });
});

/**
 * Accessibility tests using vitest-axe.
 * Runs axe on key components to catch WCAG violations.
 *
 * NOTE: These test rendered DOM accessibility, not visual design.
 * We use the axe() function directly and assert on the violations array
 * to avoid type conflicts between vitest-axe and the installed Vitest version.
 */

import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { RiskBadge } from '@/components/RiskBadge';
import { Disclaimer } from '@/components/Disclaimer';
import { KeyFacts } from '@/components/KeyFacts';
import { MissingList } from '@/components/MissingList';
import { ClauseCard } from '@/components/ClauseCard';
import { Clause } from '@/lib/schemas/analyze';

/** Helper: run axe and throw if any violations found */
async function assertNoViolations(container: HTMLElement): Promise<void> {
  const results = await axe(container);
  if (results.violations.length > 0) {
    const messages = results.violations
      .map((v) => `${v.id}: ${v.description} (impact: ${v.impact ?? 'unknown'})`)
      .join('\n');
    throw new Error(`${results.violations.length} axe violation(s) found:\n${messages}`);
  }
}

const MOCK_CLAUSE: Clause = {
  id: 'c1',
  title: 'Security deposit',
  category: 'payment',
  quote: 'The deposit shall be returned within 30 days of vacating.',
  quoteVerified: true,
  explanation: 'You get your deposit back in 30 days.',
  riskLevel: 'low',
  riskReason: 'Standard term.',
  questionToAsk: 'Are there conditions for deductions?',
};

describe('Accessibility: RiskBadge', () => {
  it('has no axe violations for high risk', async () => {
    const { container } = render(<RiskBadge level="high" />);
    await assertNoViolations(container);
  });

  it('has no axe violations for medium risk', async () => {
    const { container } = render(<RiskBadge level="medium" />);
    await assertNoViolations(container);
  });

  it('has no axe violations for low risk', async () => {
    const { container } = render(<RiskBadge level="low" />);
    await assertNoViolations(container);
  });

  it('has no axe violations for info level', async () => {
    const { container } = render(<RiskBadge level="info" />);
    await assertNoViolations(container);
  });
});

describe('Accessibility: Disclaimer', () => {
  it('has no axe violations for banner variant', async () => {
    const { container } = render(<Disclaimer variant="banner" />);
    await assertNoViolations(container);
  });

  it('has no axe violations for footer variant', async () => {
    const { container } = render(<Disclaimer variant="footer" />);
    await assertNoViolations(container);
  });

  it('has no axe violations for inline variant', async () => {
    const { container } = render(<Disclaimer variant="inline" />);
    await assertNoViolations(container);
  });
});

describe('Accessibility: KeyFacts', () => {
  it('has no axe violations with data', async () => {
    const { container } = render(
      <KeyFacts
        keyFacts={{
          obligations: [{ party: 'Tenant', obligation: 'Pay rent by the 5th' }],
          amounts: [{ label: 'Monthly rent', amount: 'Rs. 25,000' }],
          dates: [{ label: 'Start date', date: '1 Feb 2024' }],
        }}
      />,
    );
    await assertNoViolations(container);
  });

  it('has no axe violations when empty', async () => {
    const { container } = render(
      <KeyFacts keyFacts={{ obligations: [], amounts: [], dates: [] }} />,
    );
    await assertNoViolations(container);
  });
});

describe('Accessibility: MissingList', () => {
  it('has no axe violations with missing items', async () => {
    const { container } = render(
      <MissingList
        items={[
          {
            name: 'Registration',
            whyItMatters: 'Required by law in many states.',
            suggestedQuestion: 'Will this be registered?',
          },
        ]}
      />,
    );
    await assertNoViolations(container);
  });

  it('has no axe violations when empty (all clear)', async () => {
    const { container } = render(<MissingList items={[]} />);
    await assertNoViolations(container);
  });
});

describe('Accessibility: ClauseCard', () => {
  it('has no axe violations in default state', async () => {
    const { container } = render(
      <ClauseCard clause={MOCK_CLAUSE} isSelected={false} onSelect={() => {}} />,
    );
    await assertNoViolations(container);
  });

  it('has no axe violations when selected', async () => {
    const { container } = render(
      <ClauseCard clause={MOCK_CLAUSE} isSelected={true} onSelect={() => {}} />,
    );
    await assertNoViolations(container);
  });

  it('has no axe violations with unverified quote', async () => {
    const { container } = render(
      <ClauseCard
        clause={{ ...MOCK_CLAUSE, quoteVerified: false }}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    await assertNoViolations(container);
  });
});

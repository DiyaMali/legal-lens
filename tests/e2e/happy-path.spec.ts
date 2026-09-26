/**
 * E2E happy path test (Playwright)
 *
 * Tests: paste text → analyze → ask a question
 * All API calls are mocked — this test never calls the real Gemini API.
 */

import { test, expect } from '@playwright/test';

const MOCK_ANALYZE_RESPONSE = {
  clauses: [
    {
      id: 'c1',
      title: 'Security deposit forfeiture',
      category: 'payment',
      quote: 'If the Tenant vacates before the lock-in period, the security deposit shall be forfeited.',
      quoteVerified: true,
      explanation: 'You lose your full deposit if you leave early.',
      riskLevel: 'high',
      riskReason: 'Full deposit forfeiture is severe.',
      questionToAsk: 'Can the forfeiture be partial?',
    },
  ],
  keyFacts: {
    obligations: [{ party: 'Tenant', obligation: 'Pay rent monthly' }],
    amounts: [{ label: 'Monthly rent', amount: 'Rs. 25,000' }],
    dates: [{ label: 'Start date', date: '1 Feb 2024' }],
  },
  missingProtections: [],
  lawyerQuestions: ['What happens if the landlord does not return the deposit?'],
  riskSummary: { high: 1, medium: 0, low: 0, info: 0, total: 1 },
  docType: 'rental',
  language: 'en',
};

const MOCK_ASK_RESPONSE = {
  answer: 'According to the document, the notice period is two months.',
  citations: [
    {
      quote: 'Either party may terminate this Agreement by giving two (2) months written notice.',
      verified: true,
    },
  ],
  notInDocument: false,
};

test.describe('Happy path E2E', () => {
  test('paste text, analyse, ask a question', async ({ page }) => {
    // Mock the /api/analyze endpoint
    await page.route('/api/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ANALYZE_RESPONSE),
      });
    });

    // Mock the /api/ask endpoint
    await page.route('/api/ask', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_ASK_RESPONSE),
      });
    });

    // Navigate to the app
    await page.goto('/');

    // Verify h1 is present
    await expect(page.locator('h1')).toContainText('Understand any legal document');

    // Paste document text into the textarea
    const textarea = page.getByLabel('Document text');
    await textarea.fill(
      'This Rental Agreement is entered into on 1st January 2024. ' +
        'If the Tenant vacates before the lock-in period, the security deposit shall be forfeited. ' +
        'Either party may terminate this Agreement by giving two (2) months written notice.',
    );

    // Select document type
    await page.getByLabel('Document type').selectOption('rental');

    // Submit
    await page.getByRole('button', { name: 'Analyse Document' }).click();

    // Wait for results
    await expect(page.getByText('Analysis Complete')).toBeVisible({ timeout: 15000 });

    // Verify a clause card is shown
    await expect(page.getByText('Security deposit forfeiture')).toBeVisible();

    // Verify risk badge shows text, not just color
    await expect(page.getByText('High Risk')).toBeVisible();

    // Verify disclaimer is shown
    await expect(page.getByText(/not legal advice/i).first()).toBeVisible();

    // Click the Q&A tab
    await page.getByRole('tab', { name: /Ask/i }).click();

    // Type a question
    await page.getByLabel('Your question').fill('What is the notice period?');
    await page.getByRole('button', { name: 'Ask' }).click();

    // Verify the answer is shown
    await expect(page.getByText(/notice period is two months/i)).toBeVisible({ timeout: 10000 });

    // Verify citation is shown
    await expect(page.getByText(/two \(2\) months written notice/i)).toBeVisible();
  });

  test('shows error for empty submission', async ({ page }) => {
    await page.goto('/');

    // Try to submit without text
    const submitButton = page.getByRole('button', { name: 'Analyse Document' });
    // Button should be disabled when no text
    await expect(submitButton).toBeDisabled();
  });

  test('disclaimer is visible on landing page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/not legal advice/i).first()).toBeVisible();
  });
});

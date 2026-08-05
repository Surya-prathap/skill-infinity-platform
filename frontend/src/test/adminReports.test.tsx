import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReportsPage } from '@/pages/admin/ReportsPage';
import { renderWithProviders } from './testUtils';

describe('ReportsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header, report count and report cards', async () => {
    renderWithProviders(<ReportsPage />);

    expect(await screen.findByText('Reports')).toBeInTheDocument();
    expect(screen.getByText('8 report types')).toBeInTheDocument();
    // Report titles appear both as report cards and in the schedule widget.
    expect(screen.getAllByText('Revenue Report').length).toBeGreaterThan(0);
    expect(screen.getAllByText('User Report').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Mentor Report').length).toBeGreaterThan(0);
  });

  it('renders the schedule and health widgets', async () => {
    renderWithProviders(<ReportsPage />);

    expect(await screen.findByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Report Health')).toBeInTheDocument();
    expect(screen.getByText(/Every Monday 06:00 UTC/)).toBeInTheDocument();
    expect(screen.getByText('99.2%')).toBeInTheDocument();
  });

  it('generates a report and reveals the format options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ReportsPage />);

    const generateButtons = await screen.findAllByRole('button', { name: 'Generate' });
    await user.click(generateButtons[0]!);

    expect(await screen.findByText('Generating…')).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'EXCEL' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'PDF' })).toBeInTheDocument();
      },
      { timeout: 2500 },
    );
  });
});

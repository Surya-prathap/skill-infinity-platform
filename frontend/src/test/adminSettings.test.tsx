import { describe, expect, it, afterEach, vi } from 'vitest';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPage } from '@/pages/admin/SettingsPage';
import { renderWithProviders } from './testUtils';

const SETTINGS = [
  {
    settingKey: 'platform.name',
    settingValue: 'Skill Infinity',
    dataType: 'STRING',
    category: 'platform',
    description: 'Platform display name',
    encrypted: false,
  },
  {
    settingKey: 'platform.maintenance_mode',
    settingValue: 'false',
    dataType: 'BOOLEAN',
    category: 'platform',
    description: 'Enable maintenance mode',
    encrypted: false,
  },
  {
    settingKey: 'auth.jwt_expiry_minutes',
    settingValue: '15',
    dataType: 'NUMBER',
    category: 'authentication',
    description: 'JWT access token lifetime',
    encrypted: false,
  },
  {
    settingKey: 'auth.max_login_attempts',
    settingValue: '5',
    dataType: 'NUMBER',
    category: 'authentication',
    description: 'Maximum login attempts',
    encrypted: false,
  },
  {
    settingKey: 'registration.email_verification_required',
    settingValue: 'true',
    dataType: 'BOOLEAN',
    category: 'registration',
    description: 'Require email verification on signup',
    encrypted: false,
  },
];

vi.mock('@/features/admin', () => ({
  useAdminSettingsQuery: () => ({ settings: SETTINGS, isLoading: false, isError: false }),
  useUpdateSettingMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe('SettingsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header with live status and category navigation', async () => {
    renderWithProviders(<SettingsPage />);

    expect(await screen.findByText('Platform Settings')).toBeInTheDocument();
    expect(screen.getByText('Live')).toBeInTheDocument();
    // 'Authentication' is both a category tab and the active panel heading.
    expect(screen.getAllByText('Authentication').length).toBeGreaterThan(0);
    expect(screen.queryByRole('tab', { name: /Payments/i })).not.toBeInTheDocument();
  });

  it('shows configuration keys for the active category', async () => {
    renderWithProviders(<SettingsPage />);

    // Categories are sorted alphabetically, so 'authentication' is first.
    expect(await screen.findByText('auth.jwt_expiry_minutes')).toBeInTheDocument();
    expect(screen.getByText('auth.max_login_attempts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
  });

  it('switches categories and updates the settings panel', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    await user.click(await screen.findByText('Platform'));

    expect(await screen.findByText('platform.name')).toBeInTheDocument();
    expect(screen.getByText('platform.maintenance_mode')).toBeInTheDocument();
  });

  it('edits a boolean setting and shows the unsaved state', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />);

    await user.click(await screen.findByText('Registration'));
    const toggle = await screen.findByRole('switch', { name: 'registration.email_verification_required' });
    await user.click(toggle);

    expect(await screen.findByText('unsaved')).toBeInTheDocument();
  });
});

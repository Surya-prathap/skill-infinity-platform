import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorSettingsPage } from '@/pages/mentor/MentorSettingsPage';
import { renderWithProviders } from './testUtils';

describe('MentorSettingsPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header and all settings sections', async () => {
    renderWithProviders(<MentorSettingsPage />);

    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(await screen.findByText('Profile Settings')).toBeInTheDocument();
    expect(await screen.findByText('Studio Preferences')).toBeInTheDocument();
    expect(await screen.findByText('Password & Security')).toBeInTheDocument();
    expect(await screen.findByText('Appearance')).toBeInTheDocument();
    expect(await screen.findByText('Notifications')).toBeInTheDocument();
    expect(await screen.findByText('Privacy')).toBeInTheDocument();
    expect(await screen.findByText('Language & Timezone')).toBeInTheDocument();
  });

  it('renders the profile form ready for the mentor to complete', async () => {
    renderWithProviders(<MentorSettingsPage />);

    // No demo data is prefilled — the form starts empty and waits for the
    // mentor's real profile.
    const headline = await screen.findByLabelText(/Professional headline/);
    expect((headline as HTMLInputElement).value).toBe('');
  });

  it('switches the appearance theme via the segmented control', async () => {
    renderWithProviders(<MentorSettingsPage />);

    expect(await screen.findByText('Light')).toBeInTheDocument();
    expect(await screen.findByText('Dark')).toBeInTheDocument();
    expect(await screen.findByText('System')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getByText('Dark')).toBeInTheDocument();
  });


});

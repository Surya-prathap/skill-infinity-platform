import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorCertificatesPage } from '@/pages/mentor/MentorCertificatesPage';
import { renderWithProviders } from './testUtils';

describe('MentorCertificatesPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header and certificate grid with seed data', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    expect(await screen.findByText('Certificates')).toBeInTheDocument();
    expect(await screen.findByText('Your Credentials')).toBeInTheDocument();
    expect(await screen.findByText('AWS Solutions Architect — Professional')).toBeInTheDocument();
    expect(
      await screen.findByText('Google Cloud Professional Cloud Architect'),
    ).toBeInTheDocument();
  });

  it('shows verification status badges', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    // Two seed certificates are VERIFIED.
    expect((await screen.findAllByText('Verified')).length).toBeGreaterThan(0);
    expect(await screen.findByText('Pending review')).toBeInTheDocument();
  });

  it('filters certificates by search query', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    const search = await screen.findByLabelText('Search certificates');
    fireEvent.change(search, { target: { value: 'Kubernetes' } });

    expect(await screen.findByText('Certified Kubernetes Administrator')).toBeInTheDocument();
    expect(screen.queryByText('AWS Solutions Architect — Professional')).not.toBeInTheDocument();
  });

  it('opens the add-certificate editor', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Add certificate' }));

    expect(await screen.findByText('Add a certificate')).toBeInTheDocument();
    expect(await screen.findByText('Upload certificate document')).toBeInTheDocument();
  });
});

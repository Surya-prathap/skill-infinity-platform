import { describe, expect, it, afterEach } from 'vitest';
import { cleanup, fireEvent, screen } from '@testing-library/react';
import { MentorCertificatesPage } from '@/pages/mentor/MentorCertificatesPage';
import { renderWithProviders } from './testUtils';

describe('MentorCertificatesPage', () => {
  afterEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it('renders the header and credential sections with an honest empty state', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    expect(await screen.findByText('Certificates')).toBeInTheDocument();
    expect(await screen.findByText('Your Credentials')).toBeInTheDocument();
    // Certificates come from the live mentor profile; with no profile loaded
    // the page shows an honest empty state instead of fabricated seed data.
    expect(await screen.findByText('No certificates yet')).toBeInTheDocument();
  });

  it('shows the empty verification summary', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    expect(await screen.findByText('0 verified')).toBeInTheDocument();
    expect(screen.queryByText('Pending review')).not.toBeInTheDocument();
  });

  it('keeps the search box and filter available with no certificates', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    const search = await screen.findByLabelText('Search certificates');
    fireEvent.change(search, { target: { value: 'Kubernetes' } });

    expect(await screen.findByText('No certificates yet')).toBeInTheDocument();
  });

  it('opens the add-certificate editor', async () => {
    renderWithProviders(<MentorCertificatesPage />);

    // Header button and empty-state CTA both say "Add certificate".
    fireEvent.click((await screen.findAllByRole('button', { name: 'Add certificate' }))[0]);

    expect(await screen.findByText('Add a certificate')).toBeInTheDocument();
    expect(await screen.findByText('Upload certificate document')).toBeInTheDocument();
  });
});

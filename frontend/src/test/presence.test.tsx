import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PresenceBadge } from '@/components/communication/PresenceBadge';
import { PRESENCE_META } from '@/components/communication/presence';
import type { PresenceStatus } from '@/types';

describe('PresenceBadge', () => {
  it.each<PresenceStatus>(['online', 'away', 'busy', 'in-session', 'offline', 'invisible'])(
    'renders the %s status label',
    (status) => {
      render(<PresenceBadge status={status} />);
      expect(screen.getByText(PRESENCE_META[status].label)).toBeInTheDocument();
    },
  );

  it('renders a custom label override', () => {
    render(<PresenceBadge status="busy" label="In a meeting" />);
    expect(screen.getByText('In a meeting')).toBeInTheDocument();
  });

  it('hides the label when showLabel is false', () => {
    const { container } = render(<PresenceBadge status="online" showLabel={false} />);
    expect(container.querySelector('span')).not.toHaveTextContent('Online');
  });

  it('exposes the full status vocabulary', () => {
    expect(Object.keys(PRESENCE_META)).toEqual(
      expect.arrayContaining(['online', 'away', 'busy', 'in-session', 'offline', 'invisible']),
    );
  });
});

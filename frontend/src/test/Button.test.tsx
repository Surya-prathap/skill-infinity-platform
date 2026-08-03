import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('renders a loading spinner and disables the button while loading', () => {
    const { container } = render(<Button loading>Save</Button>);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(container.querySelector('.MuiCircularProgress-root')).toBeInTheDocument();
  });

  it('applies disabled state when disabled prop is passed', () => {
    render(<Button disabled>Save</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});

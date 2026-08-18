import { useEffect, useRef, useState } from 'react';
import { Typography } from './Typography';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  variant?: 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2';
  fontWeight?: number;
  color?: string;
  'aria-label'?: string;
}

const easeOutExpo = (progress: number): number =>
  progress >= 1 ? 1 : 1 - Math.pow(2, -10 * progress);

/**
 * Animated count-up number. Animates when the element scrolls into view and
 * re-animates whenever `value` changes.
 */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 550,
  decimals = 0,
  prefix = '',
  suffix = '',
  variant = 'h5',
  fontWeight = 800,
  color,
  'aria-label': ariaLabel,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) setInView(true);
      },
      { threshold: 0.2 },
    );
    observer.observe(element);
    // Fallback so the value always appears (e.g. stubbed observers in tests).
    // Kept short so numbers are visible almost immediately — a 1.2s fallback
    // made the whole dashboard feel like it was still loading.
    const fallback = window.setTimeout(() => setInView(true), 200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(value * easeOutExpo(progress));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration]);

  const formatted = display.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref}>
      <Typography
        component="span"
        variant={variant}
        fontWeight={fontWeight}
        color={color}
        aria-label={ariaLabel ?? `${prefix}${value.toLocaleString('en-US')}${suffix}`}
      >
        {prefix}
        {formatted}
        {suffix}
      </Typography>
    </span>
  );
};

export default AnimatedNumber;

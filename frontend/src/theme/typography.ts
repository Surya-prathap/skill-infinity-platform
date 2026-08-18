export const fontFamily =
  '"Inter", "Roboto", "Helvetica", "Arial", sans-serif';

export const fontWeights = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const headingStyles = {
  h1: { fontWeight: fontWeights.extrabold, letterSpacing: '-0.03em' },
  h2: { fontWeight: fontWeights.bold, letterSpacing: '-0.025em' },
  h3: { fontWeight: fontWeights.bold, letterSpacing: '-0.02em' },
  h4: { fontWeight: fontWeights.semibold, letterSpacing: '-0.015em' },
  h5: { fontWeight: fontWeights.semibold, letterSpacing: '-0.01em' },
  h6: { fontWeight: fontWeights.semibold },
  subtitle1: { fontWeight: fontWeights.medium },
  subtitle2: { fontWeight: fontWeights.medium },
  button: { fontWeight: fontWeights.semibold },
} as const;

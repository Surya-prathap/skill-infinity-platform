/** Brand palette — a refined indigo→violet primary with teal secondary. */
export const brandColors = {
  primary: {
    main: '#6D5DF6',
    light: '#8E80FF',
    dark: '#5443D4',
    darker: '#3F32A8',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#14B8A6',
    light: '#5EEAD4',
    dark: '#0F766E',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#6EE7B7',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: '#F59E0B',
    light: '#FCD34D',
    dark: '#D97706',
    contrastText: '#1F2937',
  },
  error: {
    main: '#EF4444',
    light: '#FCA5A5',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  info: {
    main: '#3B82F6',
    light: '#93C5FD',
    dark: '#2563EB',
    contrastText: '#FFFFFF',
  },
} as const;

export const gradients = {
  brand: 'linear-gradient(135deg, #6D5DF6 0%, #43C6C0 100%)',
  brandWarm: 'linear-gradient(135deg, #6D5DF6 0%, #7C3AED 100%)',
  hero: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #0EA5E9 100%)',
  success: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
  warning: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  danger: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
  text: 'linear-gradient(120deg, #6D5DF6 0%, #43C6C0 100%)',
} as const;

// Color theme configuration
export const colors = {
  light: {
    bg: '#f9fafb',
    cardBg: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    accent: '#059669',
    accentHover: '#047857',
    accentText: '#ffffff',
    border: '#e5e7eb'
  },
  dark: {
    bg: '#111827',
    cardBg: '#1f2937',
    text: '#ffffff',
    textSecondary: '#d1d5db',
    accent: '#059669',
    accentHover: '#047857',
    accentText: '#ffffff',
    border: '#374151'
  }
};

export const getTheme = (isDarkMode) => isDarkMode ? colors.dark : colors.light;
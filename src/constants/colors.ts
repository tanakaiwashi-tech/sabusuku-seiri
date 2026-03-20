export const COLORS = {
  background: '#F8F7F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F3F1EE',

  primary: '#3D5A52',
  primaryLight: '#EBF0EE',

  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9E9E9E',

  border: '#E8E5E0',
  borderLight: '#F0EDE8',

  destructive: '#B04040',
  destructiveLight: '#F5EDED',
  destructiveBorder: '#FFCDD2',

  /** 更新日超過バナー・注意表示用 */
  warning: {
    bg: '#FFF9F0',
    border: '#E6C87A',
    text: '#8D6200',
  },

  status: {
    active: { bg: '#EBF0EE', text: '#3D5A52' },
    reviewing: { bg: '#FFF3E0', text: '#8D6200' },
    cancel_planned: { bg: '#FDECEA', text: '#B04040' },
    stopped: { bg: '#F0F0F0', text: '#757575' },
  },
} as const;

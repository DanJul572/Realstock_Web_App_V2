import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  background: '#f6f4fb',
  border: '#e6e1f0',
  borderStrong: '#cfc7df',
  error: '#e5484d',
  errorSoft: '#fdeced',
  info: '#0b84d8',
  infoSoft: '#e5f2fc',
  onPrimary: '#ffffff',
  onPrimaryMuted: 'rgba(255, 255, 255, 0.78)',
  overlay: 'rgba(22, 10, 44, 0.5)',
  primary: '#6900d1',
  primaryDark: '#47008f',
  primarySoft: '#f2e9fd',
  primaryTint: '#dcc6f8',
  secondary: '#71706e',
  skeleton: '#ebe7f3',
  success: '#1f9d55',
  successSoft: '#e5f6ec',
  surface: '#ffffff',
  surfaceMuted: '#faf8fd',
  text: '#1b1530',
  textMuted: '#6e6880',
  textSubtle: '#9d97ad',
  warning: '#df8106',
  warningSoft: '#fdf2e1',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 999,
};

export const shadows = {
  sm: { boxShadow: '0 1px 2px rgba(27, 21, 48, 0.05), 0 2px 6px rgba(27, 21, 48, 0.06)' },
  md: { boxShadow: '0 6px 16px rgba(27, 21, 48, 0.08)' },
  lg: { boxShadow: '0 12px 28px rgba(71, 0, 143, 0.28)' },
} satisfies Record<string, ViewStyle>;

export const typography = {
  display: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  title: { fontSize: 20, fontWeight: '700', letterSpacing: -0.2 },
  subtitle: { fontSize: 16, fontWeight: '600' },
  body: { fontSize: 15, fontWeight: '400' },
  label: { fontSize: 13, fontWeight: '600' },
  caption: { fontSize: 12, fontWeight: '500' },
} satisfies Record<string, TextStyle>;

export const gradients = {
  primary: 'linear-gradient(135deg, #8a2be2 0%, #6900d1 45%, #47008f 100%)',
};

// Web reads the CSS `backgroundImage`; native (RN 0.76+) reads
// `experimental_backgroundImage`.
export const gradient = (value: string): ViewStyle =>
  Platform.select<ViewStyle>({
    web: { backgroundImage: value } as ViewStyle,
    default: { experimental_backgroundImage: value },
  });

// Removes the browser focus ring on text inputs; fields draw their own
// focus state (primary border + glow).
export const noOutline: TextStyle = Platform.select<TextStyle>({
  web: { outlineStyle: 'none' } as unknown as TextStyle,
  default: {},
});

// `color` must be a #rrggbb hex value.
export const withAlpha = (color: string, alpha: number): string => {
  const value = parseInt(color.slice(1), 16);
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
};

export const contentMaxWidth = 720;

// How far the raised Scan Code tab button sticks out above the tab bar.
export const scanTabButtonRise = 30;

import { Platform } from 'react-native';

const tintColorLight = '#1E5B4F';
const tintColorDark = '#8AD7C1';

export const Colors = {
  light: {
    text: '#17211F',
    background: '#F7FAF8',
    surface: '#FFFFFF',
    border: '#D9E4DF',
    muted: '#5E6C68',
    tint: tintColorLight,
    danger: '#B42318',
    success: '#2E7D32',
    track: '#D9E4DF',
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#EEF7F3',
    background: '#101816',
    surface: '#17231F',
    border: '#2B3A35',
    muted: '#AAB8B3',
    tint: tintColorDark,
    danger: '#F97066',
    success: '#7CD992',
    track: '#2B3A35',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 6,
  md: 8,
};

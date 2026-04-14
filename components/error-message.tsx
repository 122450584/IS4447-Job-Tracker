import { StyleSheet } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { ThemedText } from './themed-text';

type ErrorMessageProps = {
  message: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <ThemedText
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      lightColor={Colors.light.danger}
      darkColor={Colors.dark.danger}
      style={styles.message}>
      {message}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  message: {
    lineHeight: 22,
    marginTop: Spacing.xs,
  },
});

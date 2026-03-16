import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  type TextInputProps as RNTextInputProps,
  type ViewStyle,
} from 'react-native';
import { COLORS } from '@/src/constants/colors';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export function TextInput({ label, hint, error, containerStyle, style, ...props }: TextInputProps) {
  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <RNTextInput
        style={[styles.input, hasError && styles.inputError, style]}
        placeholderTextColor={COLORS.textMuted}
        {...props}
      />
      {hint && !hasError && <Text style={styles.hint}>{hint}</Text>}
      {hasError && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.destructive,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  error: {
    fontSize: 12,
    color: COLORS.destructive,
  },
});

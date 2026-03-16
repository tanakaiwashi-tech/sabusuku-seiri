import React from 'react';
import {
  View,
  Text,
  Platform,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { TextInput } from './TextInput';
import { COLORS } from '@/src/constants/colors';

interface DatePickerFieldProps {
  label?: string;
  value: string;          // YYYY-MM-DD | ''
  onChange: (v: string) => void;
  error?: string;
  containerStyle?: ViewStyle;
  /** 日付なしを許可（クリアボタン表示）。デフォルト true */
  clearable?: boolean;
}

/**
 * 日付入力フィールド。
 * Web: <input type="date"> をネイティブに使用してカレンダー UI を提供。
 * Native: TextInput フォールバック（YYYY-MM-DD 手入力）。
 */
export function DatePickerField({
  label,
  value,
  onChange,
  error,
  containerStyle,
  clearable = true,
}: DatePickerFieldProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}
        <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
          {/* React Native Web では 'input' などの DOM 要素を直接 as any で渡せる */}
          {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
          {/* @ts-ignore */}
          <input
            type="date"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            style={webInputStyle}
          />
        </View>
        {!!error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  // Native フォールバック
  return (
    <TextInput
      label={label}
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      error={error}
      containerStyle={containerStyle}
      maxLength={10}
    />
  );
}

/** インラインスタイル（React Native Web の StyleSheet では CSS props が制限されるため） */
const webInputStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontSize: 16,
  color: COLORS.text,
  fontFamily: 'inherit',
  cursor: 'pointer',
  boxSizing: 'border-box',
  paddingLeft: 2,
};

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    height: 48,
  },
  inputWrapperError: {
    borderColor: COLORS.destructive,
  },
  error: {
    fontSize: 12,
    color: COLORS.destructive,
  },
});

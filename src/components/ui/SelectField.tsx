import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/constants/colors';

interface SelectFieldProps<T extends string> {
  label?: string;
  value: T | null;
  options: readonly T[];
  displayLabel: (value: T) => string;
  onChange: (value: T | null) => void;
  placeholder?: string;
  clearable?: boolean;
  error?: string;
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  displayLabel,
  onChange,
  placeholder = '選択してください',
  clearable = false,
  error,
}: SelectFieldProps<T>) {
  const [visible, setVisible] = useState(false);

  const listData: (T | null)[] = clearable ? [null, ...options] : [...options];

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={[styles.trigger, !!error && styles.triggerError]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? displayLabel(value) : placeholder}
        </Text>
        <View style={styles.iconRow}>
          {clearable && value !== null && (
            <TouchableOpacity
              onPress={() => onChange(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
          <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>

      {error && <Text style={styles.error}>{error}</Text>}

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        />
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <FlatList
            data={listData}
            keyExtractor={(item) => item ?? '__clear__'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, item === value && styles.optionSelected]}
                onPress={() => {
                  onChange(item);
                  setVisible(false);
                }}
              >
                <Text style={[styles.optionText, item === value && styles.optionTextSelected]}>
                  {item ? displayLabel(item) : '選択なし'}
                </Text>
                {item === value && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: { fontSize: 14, fontWeight: '500', color: COLORS.text },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  triggerError: { borderColor: COLORS.destructive },
  triggerText: { flex: 1, fontSize: 16, color: COLORS.text },
  placeholder: { color: COLORS.textMuted },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  error: { fontSize: 12, color: COLORS.destructive },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '60%',
    paddingBottom: 32,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  optionSelected: { backgroundColor: COLORS.primaryLight },
  optionText: { flex: 1, fontSize: 16, color: COLORS.text },
  optionTextSelected: { color: COLORS.primary, fontWeight: '500' },
});

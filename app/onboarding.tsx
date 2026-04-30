import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { router } from 'expo-router';
import { COLORS } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useSettings } from '@/src/hooks/useSettings';

const STEPS = [
  {
    title: 'サブスクを\n整理しよう',
    description:
      'いつの間にか増えているサブスクリプション。\nまず全部書き出すところから始めましょう。',
  },
  {
    title: '本当に使っている?\n正直に記録',
    description:
      '金額だけでなく、「見直し中」「解約予定」も\n記録できます。焦らず、少しずつ整理できます。',
  },
  {
    title: 'データはすべて\nこの端末に',
    description:
      'アカウント登録不要。クラウドに送らない。\nあなたの情報はあなたの端末だけに。\n\nブラウザのデータを消去すると登録内容も消えます。設定画面からエクスポートしてバックアップを取っておくと安心です。',
  },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const { update } = useSettings();

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  const handleNext = async () => {
    if (isLast) {
      await update({ onboardingCompleted: true });
      router.replace('/(main)');
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.description}>{current.description}</Text>
      </View>
      <View style={styles.footer}>
        <Button label={isLast ? 'はじめる' : '次へ'} onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    justifyContent: 'center',
    gap: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  dotActive: {
    backgroundColor: COLORS.primary,
    width: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 44,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 26,
  },
  footer: { padding: 24 },
});

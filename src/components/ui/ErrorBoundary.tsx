import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '@/src/constants/colors';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * アプリ全体をラップするError Boundary。
 * コンポーネントツリーで発生した未捕捉エラーを受け止め、
 * 白画面の代わりにリカバリー画面を表示する。
 * localStorage のデータは無傷のため、再読み込みで復旧できる。
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : String(error);
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // 本番では外部ログサービスへの送信に差し替え可能
    console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    } else {
      this.setState({ hasError: false, message: '' });
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.title}>表示できませんでした</Text>
        <Text style={styles.desc}>
          データは保存されています。{'\n'}再読み込みすると元に戻ります。
        </Text>
        <TouchableOpacity style={styles.button} onPress={this.handleReload} activeOpacity={0.8}>
          <Text style={styles.buttonText}>再読み込み</Text>
        </TouchableOpacity>
        {__DEV__ && (
          <Text style={styles.devMessage}>{this.state.message}</Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F7F4',
    padding: 32,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  devMessage: {
    marginTop: 16,
    fontSize: 11,
    color: COLORS.textMuted,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

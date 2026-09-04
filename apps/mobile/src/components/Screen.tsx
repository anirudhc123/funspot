import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type ScreenProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
};

export const Screen = ({ children, title, subtitle, action }: ScreenProps) => (
  <ScrollView contentContainerStyle={styles.container}>
    {(title || subtitle || action) && (
      <View style={styles.header}>
        {title && <Text style={styles.title}>{title}</Text>}
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {action ? <View style={styles.action}>{action}</View> : null}
      </View>
    )}
    {children}
  </ScrollView>
);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#6b7280',
    fontSize: 14,
  },
  action: {
    marginTop: 4,
  },
});

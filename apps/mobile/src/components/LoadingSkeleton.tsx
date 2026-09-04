import { StyleSheet, View } from 'react-native';

export const LoadingSkeleton = () => (
  <View style={styles.wrapper}>
    <View style={styles.block} />
    <View style={[styles.block, styles.medium]} />
    <View style={[styles.block, styles.short]} />
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  block: {
    height: 72,
    backgroundColor: '#e5e7eb',
    borderRadius: 14,
  },
  medium: {
    height: 88,
  },
  short: {
    height: 48,
  },
});

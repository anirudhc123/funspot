import { StyleSheet, Text, View } from 'react-native';

type StateViewProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export const StateView = ({ title, description, action }: StateViewProps) => (
  <View style={styles.wrapper}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.description}>{description}</Text>
    {action ? <View style={styles.action}>{action}</View> : null}
  </View>
);

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 180,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  action: {
    marginTop: 8,
  },
});

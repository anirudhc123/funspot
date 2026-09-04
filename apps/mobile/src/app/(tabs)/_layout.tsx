import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarStyle: { backgroundColor: '#ffffff', borderTopColor: '#e5e7eb' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: () => <Text>🏠</Text> }} />
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: () => <Text>🔎</Text> }} />
      <Tabs.Screen name="create" options={{ title: 'Create', tabBarIcon: () => <Text>✍️</Text> }} />
      <Tabs.Screen name="notifications" options={{ title: 'Alerts', tabBarIcon: () => <Text>🔔</Text> }} />
      <Tabs.Screen name="messages" options={{ title: 'Messages', tabBarIcon: () => <Text>💬</Text> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: () => <Text>👤</Text> }} />
    </Tabs>
  );
}

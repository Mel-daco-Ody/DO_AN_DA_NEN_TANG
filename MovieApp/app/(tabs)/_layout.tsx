import { Tabs } from 'expo-router';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
    </Tabs>
  );
}


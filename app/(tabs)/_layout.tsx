import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/src/components/organisms/CustomTabBar';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: COLORS.bgDeep },
      }}
    >
      <Tabs.Screen name="index"     options={{ title: 'Aujourd\'hui' }} />
      <Tabs.Screen name="agenda"    options={{ title: 'Agenda' }} />
      <Tabs.Screen name="tasks"     options={{ title: 'Tâches' }} />
      <Tabs.Screen name="assistant" options={{ title: 'Assistant' }} />
      <Tabs.Screen name="profile"   options={{ title: 'Profil' }} />
    </Tabs>
  );
}

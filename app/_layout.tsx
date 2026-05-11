import { useEffect } from 'react';
import { Stack, Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import { GeistMono_400Regular } from '@expo-google-fonts/geist-mono';
import 'react-native-reanimated';
import { useCredentialsStore } from '@/src/store/credentials.store';
import { COLORS } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const loadFromSecureStore = useCredentialsStore(s => s.loadFromSecureStore);
  const isLoaded = useCredentialsStore(s => s.isLoaded);
  const geminiApiKey = useCredentialsStore(s => s.credentials.geminiApiKey);

  const [fontsLoaded] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    GeistMono_400Regular,
  });

  useEffect(() => {
    loadFromSecureStore();
  }, []);

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoaded]);

  if (!fontsLoaded || !isLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.bgDeep }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bgDeep } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="modals/add-task"       options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="modals/add-event"      options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="modals/edit-task"       options={{ presentation: 'transparentModal' }} />
        <Stack.Screen name="modals/confirm-delete"  options={{ presentation: 'transparentModal' }} />
      </Stack>
      {!geminiApiKey && <Redirect href="/splash" />}
      <StatusBar style="dark" backgroundColor={COLORS.bgDeep} />
    </GestureHandlerRootView>
  );
}

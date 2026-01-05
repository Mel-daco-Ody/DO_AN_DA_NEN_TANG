import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { ApiProvider } from '../contexts/ApiContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { SavedMoviesProvider } from '../contexts/SavedMoviesContext';
import { ToastProvider } from '../contexts/ToastContext';
import AppWrapper from '../components/AppWrapper';
import { UpgradeModalProvider } from '../contexts/UpgradeModalContext';
import { UpgradeRequiredModal } from '../components/UpgradeRequiredModal';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <AppWrapper>
      <LanguageProvider>
        <ThemeProvider>
          <UpgradeModalProvider>
          <AuthProvider>
            <SavedMoviesProvider>
              <NotificationProvider>
                <ApiProvider>
                  <ToastProvider>
                    <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
                <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
                <Stack.Screen name="auth/forgot" options={{ headerShown: false }} />
                <Stack.Screen name="auth/mfa-verify" options={{ headerShown: false }} />
                <Stack.Screen name="details/movie/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="details/series/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="about-us" options={{ headerShown: false }} />
                <Stack.Screen name="help-center" options={{ headerShown: false }} />
                <Stack.Screen name="contacts" options={{ headerShown: false }} />
                <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
                <Stack.Screen name="actors" options={{ headerShown: false }} />
                <Stack.Screen name="actor/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="category/[genre]" options={{ headerShown: false }} />
                <Stack.Screen name="player/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="moviebox" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
                    </Stack>

                      <UpgradeRequiredModal onUpgrade={() => router.push('/profile?tab=subscription')} />
                    <StatusBar style="auto" />
                  </ToastProvider>
                </ApiProvider>
              </NotificationProvider>
            </SavedMoviesProvider>
          </AuthProvider>
          </UpgradeModalProvider>
        </ThemeProvider>
      </LanguageProvider>
    </AppWrapper>
  );
}

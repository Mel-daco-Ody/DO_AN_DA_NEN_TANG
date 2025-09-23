import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { LanguageProvider } from '../contexts/LanguageContext';
import { WatchHistoryProvider } from '../contexts/WatchHistoryContext';
import { MovieBoxProvider } from '../contexts/MovieBoxContext';
import AppWrapper from '../components/AppWrapper';

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
          <AuthProvider>
            <SubscriptionProvider>
              <WatchHistoryProvider>
                <MovieBoxProvider>
                  <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <Stack>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/signin" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/signup" options={{ headerShown: false }} />
                  <Stack.Screen name="auth/forgot" options={{ headerShown: false }} />
                  <Stack.Screen name="details/movie/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="details/series/[id]" options={{ headerShown: false }} />
                  <Stack.Screen name="profile" options={{ headerShown: false }} />
                  <Stack.Screen name="recent-views" options={{ headerShown: false }} />
                  <Stack.Screen name="latest-reviews" options={{ headerShown: false }} />
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
                    <StatusBar style="auto" />
                  </NavigationThemeProvider>
                  </MovieBoxProvider>
                </WatchHistoryProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AppWrapper>
  );
}

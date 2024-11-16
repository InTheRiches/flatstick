import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as NavigationBar from 'expo-navigation-bar';
import { Colors } from '@/constants/Colors';
import { SessionProvider } from '@/contexts/ctx';
import {StatusBar, View} from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  NavigationBar.setBackgroundColorAsync(Colors[colorScheme ?? 'light'].background);

  return (
      <SessionProvider>
        <StatusBar backgroundColor={Colors[colorScheme ?? 'light'].background} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SessionProvider>
  );
}

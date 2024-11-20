import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import { SessionProvider } from '@/contexts/ctx';
import {StatusBar, useColorScheme} from "react-native";
import useColors from "@/hooks/useColors";

export default function RootLayout() {
  const colors = useColors();

  const colorScheme = useColorScheme();

  // TODO FIND A WAY TO CHANGE THE STATUS BAR COLOR WHEN A MODAL IS OPEN

  NavigationBar.setBackgroundColorAsync(colors.background);

  return (
      <SessionProvider>
        <StatusBar backgroundColor={colors.background} />
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false
              }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name={"simulation/index"}/>
              <Stack.Screen name={"simulation/recap/index"}/>
              <Stack.Screen name="+not-found" />
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </SessionProvider>
  );
}

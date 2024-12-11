import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform, StatusBar, useColorScheme} from "react-native";
import useColors from "@/hooks/useColors";

import {SafeAreaView} from 'react-native-safe-area-context';
import {AppProvider} from "@/contexts/AppCtx";
import {configureReanimatedLogger, ReanimatedLogLevel} from "react-native-reanimated";

export default function RootLayout() {
  const colors = useColors();

  const colorScheme = useColorScheme();

  configureReanimatedLogger({
    level: ReanimatedLogLevel.warn,
    strict: false, // Reanimated runs in strict mode by default
  });

  // TODO FIND A WAY TO CHANGE THE STATUS BAR COLOR WHEN A MODAL IS OPEN
  if (Platform.OS === "android" || Platform.OS === "default")
    NavigationBar.setBackgroundColorAsync(colors.background.primary);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background.primary}} edges={['top', 'bottom']}>
      <AppProvider>
        <StatusBar backgroundColor={"black"} style={{flex: 1}}/>
        <GestureHandlerRootView>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Screen name="(tabs)"/>
              <Stack.Screen name={"simulation/pressure/index"}/>
              <Stack.Screen name={"simulation/pressure/setup/index"}/>
              <Stack.Screen name={"simulation/round/index"}/>
              <Stack.Screen name={"simulation/round/recap/index"}/>
              <Stack.Screen name={"simulation/real/index"}/>
              <Stack.Screen name="+not-found"/>
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </AppProvider>
    </SafeAreaView>
  );
}

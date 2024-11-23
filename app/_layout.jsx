import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform, StatusBar, useColorScheme} from "react-native";
import useColors from "@/hooks/useColors";

import {SafeAreaView} from 'react-native-safe-area-context';
import {AppProvider} from "@/contexts/AppCtx";

export default function RootLayout() {
  const colors = useColors();

  const colorScheme = useColorScheme();

  // TODO FIND A WAY TO CHANGE THE STATUS BAR COLOR WHEN A MODAL IS OPEN
  if (Platform.OS === "android" || Platform.OS === "default")
    NavigationBar.setBackgroundColorAsync(colors.background.primary);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: colors.background.primary}} edges={['top', 'bottom']}>
      <AppProvider>
        <StatusBar backgroundColor={colors.background.primary} style={{flex: 1}}/>
        <GestureHandlerRootView>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack
              screenOptions={{
                headerShown: false
              }}>
              <Stack.Screen name="(tabs)"/>
              <Stack.Screen name={"simulation/index"}/>
              <Stack.Screen name={"simulation/recap/index"}/>
              <Stack.Screen name="+not-found"/>
            </Stack>
          </ThemeProvider>
        </GestureHandlerRootView>
      </AppProvider>
    </SafeAreaView>
  );
}

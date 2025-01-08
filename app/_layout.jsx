import {DarkTheme, DefaultTheme, ThemeProvider} from '@react-navigation/native';
import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform, StatusBar, useColorScheme} from "react-native";
import useColors from "@/hooks/useColors";
import {AppProvider} from "@/contexts/AppCtx";
import {configureReanimatedLogger, ReanimatedLogLevel} from "react-native-reanimated";
import * as SystemUI from "expo-system-ui";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";

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

  SystemUI.setBackgroundColorAsync(colors.background.primary);

  return (
    <AppProvider>
      <StatusBar backgroundColor={'transparent'} translucent={true} />
      <GestureHandlerRootView>
        <BottomSheetModalProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{
                  headerShown: false,
                }}>
              <Stack.Screen name="(tabs)"/>
              <Stack.Screen name={"simulation/pressure/index"}/>
              <Stack.Screen name={"simulation/pressure/setup/index"}/>
              <Stack.Screen name={"simulation/round/index"}/>
              <Stack.Screen name={"simulation/real/index"}/>
              <Stack.Screen name="+not-found"/>
              <Stack.Screen name={"editputters/index"} options={{
                presentation: 'modal',
                animation: "slide_from_bottom",
                animationDuration: 150,
              }}/>
              <Stack.Screen name={"editgrips/index"} options={{
                presentation: 'modal',
                animation: "slide_from_bottom",
              }}/>
              <Stack.Screen name={"sessions/index"}/>
              <Stack.Screen name={"sessions/individual/index"}/>
              <Stack.Screen name={"settings/stats/index"} options={{
                presentation: 'modal',
                animation: "slide_from_bottom",
                animationDuration: 150,
              }}/>
              <Stack.Screen name={"settings/user/index"}/>
              <Stack.Screen name={"compare/putters/index"} />
              <Stack.Screen name={"compare/grips/index"} />
              <Stack.Screen name={"compare/users/search/index"} />
              <Stack.Screen name={"compare/users/index"} />
            </Stack>
          </ThemeProvider>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </AppProvider>
  );
}

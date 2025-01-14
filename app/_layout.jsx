import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Appearance, Platform, StatusBar} from "react-native";
import useColors from "@/hooks/useColors";
import {AppProvider} from "@/contexts/AppCtx";
import {configureReanimatedLogger, ReanimatedLogLevel} from "react-native-reanimated";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import * as SystemUI from "expo-system-ui";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import React from "react";
import {ErrorBoundary} from "react-error-boundary";

export default function RootLayout() {
  const colors = useColors();

  GoogleSignin.configure({
    webClientId: '737663000705-j570rogkqu8e103nv214rjq52lt01ldg.apps.googleusercontent.com',
  });

  if (Platform.OS === "android" || Platform.OS === "default")
    NavigationBar.setBackgroundColorAsync(colors.background.primary);

  SystemUI.setBackgroundColorAsync("#FFFFFF");
  Appearance.setColorScheme("light");

  function fallbackRender({ error, resetErrorBoundary }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    return (
        <div role="alert">
          <p>Something went wrong:</p>
          <pre style={{ color: "red" }}>{error.message}</pre>
        </div>
    );
  }

  return (
      <ErrorBoundary
          fallbackRender={fallbackRender}
          onReset={(details) => {
            // Reset the state of your app so the error doesn't happen again
          }}
      >
        <AppProvider>
          <StatusBar style="dark" barStyle={"light-content"} backgroundColor={'transparent'} translucent={true} />
          <GestureHandlerRootView>
            <BottomSheetModalProvider>
              <Stack screenOptions={{
                    headerShown: false,
                    navigationBarColor: colors.background.primary,
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
            </BottomSheetModalProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </ErrorBoundary>
  );
}

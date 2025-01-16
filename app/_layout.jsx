import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Appearance, Platform, StatusBar, Text, View} from "react-native";
import useColors from "@/hooks/useColors";
import {AppProvider} from "@/contexts/AppCtx";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import * as SystemUI from "expo-system-ui";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import React, {useEffect} from "react";
import {ErrorBoundary} from "react-error-boundary";
import RootInitializer from "@/app/RootInitializer";
import {LightTheme} from "@/constants/ModularColors";
import mobileAds from "react-native-google-mobile-ads/src";

export default function RootLayout() {
  const colors = useColors();

  useEffect(() => {
    (async () => {
      // // Google AdMob will show any messages here that you just set up on the AdMob Privacy & Messaging page
      // const { status: trackingStatus } = await requestTrackingPermissionsAsync();
      // if (trackingStatus !== 'granted') {
      //   // Do something here such as turn off Sentry tracking, store in context/redux to allow for personalized ads, etc.
      // }

      // Initialize the ads
      await mobileAds().initialize();
    })();
  }, [])

  GoogleSignin.configure({
    webClientId: '737663000705-j570rogkqu8e103nv214rjq52lt01ldg.apps.googleusercontent.com',
  });

  if (Platform.OS === "android" || Platform.OS === "default")
    NavigationBar.setBackgroundColorAsync(LightTheme.background.primary);

  SystemUI.setBackgroundColorAsync(LightTheme.background.primary);
  Appearance.setColorScheme("light");

  function fallbackRender({ error, resetErrorBoundary }) {
    // Call resetErrorBoundary() to reset the error boundary and retry the render.
    return (
        <View>
          <Text>Something went wrong:</Text>
          <Text style={{ color: "red" }}>{error.message}</Text>
        </View>
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
          <RootInitializer/>
          <StatusBar barStyle={"dark-content"} backgroundColor={"transparent"} translucent={true}/>
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
                <Stack.Screen name={"editputters/index"}/>
                <Stack.Screen name={"editgrips/index"}/>
                <Stack.Screen name={"sessions/index"}/>
                <Stack.Screen name={"sessions/individual/index"}/>
                <Stack.Screen name={"settings/stats/index"}/>
                <Stack.Screen name={"settings/user/index"}/>
                <Stack.Screen name={"compare/putters/index"} />
                <Stack.Screen name={"compare/grips/index"} />
                <Stack.Screen name={"compare/users/search/index"} />
                <Stack.Screen name={"compare/users/index"} />
                <Stack.Screen name={"offline/index"}/>
              </Stack>
            </BottomSheetModalProvider>
          </GestureHandlerRootView>

        </AppProvider>
      </ErrorBoundary>
  );
}

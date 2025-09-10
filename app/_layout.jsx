import '../utils/firebase'; // Import to trigger initialization
import {Stack} from 'expo-router';
import 'react-native-reanimated';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import * as NavigationBar from 'expo-navigation-bar';
import {Appearance, Platform, StatusBar, View} from "react-native";
import useColors from "@/hooks/useColors";
import {BottomSheetModalProvider} from "@gorhom/bottom-sheet";
import * as SystemUI from "expo-system-ui";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import React, {useEffect} from "react";
import RootInitializer from "@/app/RootInitializer";
import {LightTheme} from "@/constants/ModularColors";
import mobileAds from "react-native-google-mobile-ads/src";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {AuthProvider} from "@/contexts/AuthContext";
import {AppProvider} from "@/contexts/AppProvider";

export default function RootLayout() {
  const colors = useColors();
  const inset = useSafeAreaInsets();

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

  return (
        <AppProvider>
          <AuthProvider>
            <RootInitializer/>
            <StatusBar barStyle={"dark-content"} backgroundColor={"transparent"} translucent={true}/>
            <View style={{paddingBottom: inset.bottom, flex: 1}}>
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
                    <Stack.Screen name={"simulation/round/demo/index"}/>
                    <Stack.Screen name={"simulation/real/demo/index"}/>
                    <Stack.Screen name={"simulation/real/index"}/>
                    <Stack.Screen name={"simulation/full/setup/index"}/>
                    <Stack.Screen name={"simulation/full/index"}/>
                    <Stack.Screen name={"sessions/individual/full/index"}/>
                    <Stack.Screen name="+not-found"/>
                    <Stack.Screen name={"editputters/index"}/>
                    <Stack.Screen name={"user/stats/index"}/>
                    <Stack.Screen name={"achievements/index"}/>
                    <Stack.Screen name={"editgrips/index"}/>
                    <Stack.Screen name={"sessions/index"}/>
                    <Stack.Screen name={"sessions/individual/index"}/>
                    <Stack.Screen name={"settings/stats/index"}/>
                    <Stack.Screen name={"settings/user/index"}/>
                    <Stack.Screen name={"settings/index"}/>
                    <Stack.Screen name={"friends/index"}/>
                    <Stack.Screen name={"friends/search/index"}/>
                    <Stack.Screen name={"friends/requests/index"}/>
                    <Stack.Screen name={"friends/user/index"}/>
                    <Stack.Screen name={"simulation/putting-green/index"}/>
                    <Stack.Screen name={"compare/putters/index"} />
                    <Stack.Screen name={"compare/grips/index"} />
                    <Stack.Screen name={"compare/users/search/index"} />
                    <Stack.Screen name={"compare/users/index"} />
                    <Stack.Screen name={"offline/index"}/>
                  </Stack>
                </BottomSheetModalProvider>
              </GestureHandlerRootView>
            </View>
          </AuthProvider>
        </AppProvider>
  );
}

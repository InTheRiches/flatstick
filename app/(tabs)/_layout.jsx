import {Redirect, Tabs} from 'expo-router';
import React from 'react';

import {SvgHome, SvgPractice} from '@/assets/svg/SvgComponents';
import {Text} from "react-native";
import {getAuth} from "firebase/auth";
import useColors from "@/hooks/useColors";
import {useSession} from "@/contexts/AppCtx";

export default function TabLayout() {
  const colors = useColors();

  const {session, isLoading} = useSession();

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    // TODO FIGURE OUT IF YOU WANT TO REDIRECT TO SIGN UP OR SIGN IN
    return <Redirect href="/signup"/>;
  }

  const auth = getAuth();

  if (auth.currentUser !== null) {
    if (auth.currentUser.displayName === null) {
      return <Redirect href="/signup/finish"/>
    }
  }

  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.button.primary.border,
      tabBarActiveBackgroundColor: colors.background.primary,
      tabBarInactiveBackgroundColor: colors.background.primary,
      headerShown: false,
      tabBarStyle: {
        borderTopWidth: 0,
        paddingBottom: 0,
        maxHeight: 48 // TODO THIS IS A TEMP FIX, THE STUPID TAB BAR ICONS ARE WAYYY TOO TALL WITHOUT THIS
      }
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({color, focused}) => (
            <SvgHome stroke={focused ? colors.button.primary.border : colors.border.default}
                     fill={focused ? colors.button.primary.border : colors.border.default} width={25} height={25}/>
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({color, focused}) => (
            <SvgPractice stroke={focused ? colors.button.primary.border : colors.border.default}
                         fill={focused ? colors.button.primary.background : "transparent"} width={25} height={25}/>
          ),
        }}
      />
    </Tabs>
  );
}

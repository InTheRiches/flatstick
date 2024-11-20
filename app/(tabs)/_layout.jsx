import {Redirect, Tabs} from 'expo-router';
import React from 'react';

import { SvgHome, SvgPractice } from '@/assets/svg/SvgComponents';
import { useSession } from '@/contexts/ctx';
import {Text} from "react-native";
import {getAuth} from "firebase/auth";
import useColors from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();

  const { session, isLoading } = useSession();

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
    return <Redirect href="/signup" />;
  }

  const auth = getAuth();

  if (auth.currentUser !== null) {
    if (auth.currentUser.displayName === null) {
      return <Redirect href="/signup/finish" />
    }
  }

  return (
    <Tabs screenOptions={{
        tabBarActiveTintColor: colors.buttonPrimaryBorder,
        tabBarActiveBackgroundColor: colors.background,
        tabBarInactiveBackgroundColor: colors.background,
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0, 
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <SvgHome stroke={focused ? colors.buttonPrimaryBorder : colors.border} fill={focused ? colors.buttonPrimaryBackground : colors.border} width={25} height={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <SvgPractice stroke={focused ? colors.buttonPrimaryBorder : colors.border} fill={focused ? colors.buttonPrimaryBackground : "transparent"} width={25} height={25} />
          ),
        }}
      />
    </Tabs>
  );
}

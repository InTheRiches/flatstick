import {Redirect, Tabs} from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SvgHome, SvgPractice } from '@/assets/svg/SvgComponents';
import { useSession } from '@/contexts/ctx';
import {Text} from "react-native";
import {getAuth} from "firebase/auth";

export default function TabLayout() {
  const colorScheme = useColorScheme();

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
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].buttonPrimaryBorder,
        tabBarActiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
        tabBarInactiveBackgroundColor: Colors[colorScheme ?? 'light'].background,
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
            <SvgHome stroke={focused ? Colors[colorScheme ?? 'light'].buttonPrimaryBorder : Colors[colorScheme ?? 'light'].border} fill={focused ? Colors[colorScheme ?? 'light'].buttonPrimaryBackground : Colors[colorScheme ?? 'light'].border} width={25} height={25} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ color, focused }) => (
            <SvgPractice stroke={focused ? Colors[colorScheme ?? 'light'].buttonPrimaryBorder : Colors[colorScheme ?? 'light'].border} fill={focused ? Colors[colorScheme ?? 'light'].buttonPrimaryBackground : "transparent"} width={25} height={25} />
          ),
        }}
      />
    </Tabs>
  );
}

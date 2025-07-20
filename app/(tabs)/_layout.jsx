import {Tabs} from 'expo-router';
import React from 'react';

import {SvgHome} from '@/assets/svg/SvgComponents';
import useColors from "@/hooks/useColors";
import {useAppContext, useSession} from "@/contexts/AppCtx";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import useKeyboardVisible from "@/hooks/useKeyboardVisible";
import ProfileTabIcon from "@/components/tabs/ProfileTabIcon";

export default function TabLayout() {
    const colors = useColors();
    const {isLoading} = useSession();
    const isKeyboardVisible = useKeyboardVisible();
    const {userData} = useAppContext();

    return (
        <GestureHandlerRootView>
            {!isLoading && <Tabs screenOptions={{
                tabBarActiveTintColor: colors.text.primary,
                tabBarActiveBackgroundColor: colors.background.primary,
                tabBarInactiveBackgroundColor: colors.background.primary,
                headerShown: false,
                tabBarStyle: {
                    borderTopWidth: 0,
                    paddingBottom: 0,
                    maxHeight: isKeyboardVisible ? 0 : 48,
                },
                lazy: false,
            }}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: 'Home',
                        tabBarIcon: ({focused}) => (
                            <SvgHome stroke={focused ? colors.text.primary : colors.border.default}
                                     fill={focused ? colors.text.primary : colors.border.default} width={20}
                                     height={20}/>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: 'Stats',
                        tabBarIcon: ({color, focused}) => focused ? (
                            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.primary} width={24} height={24}>
                                <Path fillRule="evenodd"
                                      d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm4.5 7.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-1.5 0v-2.25a.75.75 0 0 1 .75-.75Zm3.75-1.5a.75.75 0 0 0-1.5 0v4.5a.75.75 0 0 0 1.5 0V12Zm2.25-3a.75.75 0 0 1 .75.75v6.75a.75.75 0 0 1-1.5 0V9.75A.75.75 0 0 1 13.5 9Zm3.75-1.5a.75.75 0 0 0-1.5 0v9a.75.75 0 0 0 1.5 0v-9Z"
                                      clipRule="evenodd"/>
                            </Svg>
                        ) : (
                            <Svg xmlns="http://www.w3.org/2000/svg" stroke={colors.border.default}
                                fill={"none"} viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"/>
                            </Svg>
                        )
                    }}
                />
                <Tabs.Screen
                    name="compare"
                    options={{
                        title: 'Compare',
                        tabBarIcon: ({color, focused}) => (
                            <Svg stroke={focused ? colors.text.primary : colors.border.default}
                                 xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                 strokeWidth={1.5} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"/>
                            </Svg>
                        ),
                    }}
                />
                <Tabs.Screen
                    name="profile"
                    options={{
                        title: 'Profile',
                        tabBarIcon: ({color, focused}) => <ProfileTabIcon focused={focused} />
                    }}
                />
            </Tabs>}
        </GestureHandlerRootView>
    );
}

import {Tabs} from 'expo-router';
import React from 'react';

import {SvgHome} from '@/assets/svg/SvgComponents';
import useColors from "@/hooks/useColors";
import {useAppContext} from "@/contexts/AppContext";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import useKeyboardVisible from "@/hooks/useKeyboardVisible";
import ProfileTabIcon from "@/components/tabs/ProfileTabIcon";

export default function TabLayout() {
    const colors = useColors();
    const {isLoading} = useAppContext();
    const isKeyboardVisible = useKeyboardVisible();

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
                    name="practice"
                    options={{
                        title: 'Practice',
                        tabBarIcon: ({color, focused}) => focused ? (
                            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.primary}
                                 width={24} height={24}>
                                <Path fillRule="evenodd"
                                      d="M9 4.5a.75.75 0 0 1 .721.544l.813 2.846a3.75 3.75 0 0 0 2.576 2.576l2.846.813a.75.75 0 0 1 0 1.442l-2.846.813a3.75 3.75 0 0 0-2.576 2.576l-.813 2.846a.75.75 0 0 1-1.442 0l-.813-2.846a3.75 3.75 0 0 0-2.576-2.576l-2.846-.813a.75.75 0 0 1 0-1.442l2.846-.813A3.75 3.75 0 0 0 7.466 7.89l.813-2.846A.75.75 0 0 1 9 4.5ZM18 1.5a.75.75 0 0 1 .728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 0 1 0 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 0 1-1.456 0l-.258-1.036a2.625 2.625 0 0 0-1.91-1.91l-1.036-.258a.75.75 0 0 1 0-1.456l1.036-.258a2.625 2.625 0 0 0 1.91-1.91l.258-1.036A.75.75 0 0 1 18 1.5ZM16.5 15a.75.75 0 0 1 .712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 0 1 0 1.422l-1.183.395c-.447.15-.799.5-.948.948l-.395 1.183a.75.75 0 0 1-1.422 0l-.395-1.183a1.5 1.5 0 0 0-.948-.948l-1.183-.395a.75.75 0 0 1 0-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0 1 16.5 15Z"
                                      clipRule="evenodd"/>
                            </Svg>
                        ) : (
                            <Svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}
                                 width={24} height={24} stroke={colors.border.default}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>
                            </Svg>
                        )
                    }}
                />
                <Tabs.Screen
                    name="stats"
                    options={{
                        title: 'Stats',
                        tabBarIcon: ({color, focused}) => focused ? (
                            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={colors.text.primary}
                                 width={24} height={24}>
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

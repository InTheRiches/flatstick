import {Tabs, useRouter} from 'expo-router';
import React, {useEffect, useState} from 'react';

import {SvgHome} from '@/assets/svg/SvgComponents';
import useColors from "@/hooks/useColors";
import {useSession} from "@/contexts/AppCtx";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import Svg, {Path} from "react-native-svg";
import useKeyboardVisible from "@/hooks/useKeyboardVisible";
import {AnimatedBootSplash} from "@/components/tabs/home/AnimatedBootSplash";

export default function TabLayout() {
    const colors = useColors();
    const {isLoading} = useSession();
    const [visible, setVisible] = useState(true);
    const isKeyboardVisible = useKeyboardVisible();
    const router = useRouter();

    useEffect(() => {
        alert("Loading Use effect! " + isLoading);
    }, [isLoading]);

    return (
        <GestureHandlerRootView>
            {visible && (
                <AnimatedBootSplash
                    ready={!isLoading}
                    onAnimationEnd={() => {
                        setVisible(false);
                        router.push({pathname: "/signup"});
                    }}
                />
            )}
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
                        tabBarIcon: ({color, focused}) => (
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
                        tabBarIcon: ({color, focused}) => (
                            <Svg xmlns="http://www.w3.org/2000/svg"
                                 stroke={focused ? colors.text.primary : colors.border.default}
                                 fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24} height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z"/>
                            </Svg>
                        ),
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
                    name="settings"
                    options={{
                        title: 'Settings',
                        tabBarIcon: ({color, focused}) => (
                            <Svg xmlns="http://www.w3.org/2000/svg"
                                 stroke={focused ? colors.text.primary : colors.border.default}
                                 fill="none" viewBox="0 0 24 24" strokeWidth={1.5} width={24}
                                 height={24}>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"/>
                                <Path strokeLinecap="round" strokeLinejoin="round"
                                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
                            </Svg>
                        ),
                    }}
                />
            </Tabs>}
        </GestureHandlerRootView>
    );
}

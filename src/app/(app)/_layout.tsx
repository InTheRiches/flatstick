// app/(app)/_layout.tsx
import { Tabs } from "expo-router"
import {useAppTheme} from "@/theme/context";
import {Ionicons} from "@expo/vector-icons";

export default function AppLayout() {
    const { theme } = useAppTheme()

    return (
        <Tabs screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: theme.colors.palette.emerald,
        }}>
            <Tabs.Screen name="index" options={{
                title: "Home",
                tabBarIcon: ({ focused }) => (
                    <Ionicons name="home-sharp" size={22} color={focused ? theme.colors.palette.emerald : theme.colors.palette.neutral500 } />
                )
            }}/>
            <Tabs.Screen name="social" options={{
                title: "Social",
                tabBarIcon: ({ focused }) => (
                    <Ionicons name="people-sharp" size={22} color={focused ? theme.colors.palette.emerald : theme.colors.palette.neutral500 } />
                )
            }}/>
            <Tabs.Screen name="profile" options={{
                title: "Profile",
                tabBarIcon: ({ focused }) => (
                    <Ionicons name="person-sharp" size={22} color={focused ? theme.colors.palette.emerald : theme.colors.palette.neutral500 } />
                )
            }}/>
            {/*<Tabs.Screen name="stats" options={{ title: "Stats" }} />*/}
            {/*<Tabs.Screen name="profile" options={{ title: "Index" }} />*/}
        </Tabs>
    )
}

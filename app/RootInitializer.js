import React, {useEffect} from "react";
import {auth} from "../utils/firebase";
import {useRouter} from "expo-router";
import {useAppContext, useSession} from "../contexts/AppCtx";
import {AnimatedBootSplash} from "@/components/tabs/home/AnimatedBootSplash";
import NetInfo from '@react-native-community/netinfo';
import {
    Inter_100Thin,
    Inter_200ExtraLight,
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
    useFonts,
} from '@expo-google-fonts/inter';
import {Platform} from "react-native";
import BootSplash from "react-native-bootsplash";
import * as Notifications from "expo-notifications";

export default function RootInitializer({}) {
    const [visible, setVisible] = React.useState(true);
    const [localLoading, setLocalLoading] = React.useState(true);
    const {setSession, isLoading} = useSession();
    const {initialize} = useAppContext();
    const router = useRouter();
    let [fontsLoaded] = useFonts({
        Inter_100Thin,
        Inter_200ExtraLight,
        Inter_300Light,
        Inter_400Regular,
        Inter_500Medium,
        Inter_600SemiBold,
        Inter_700Bold,
        Inter_800ExtraBold,
        Inter_900Black,
    });

    // Monitor authentication state changes
    useEffect(() => {
        let screenToPush = "/";
        Notifications.getLastNotificationResponseAsync().then(response => {
            console.log("Notification content screen: ", response?.notification?.request?.content?.data?.screen);
            if (response?.notification?.request?.content?.data?.screen) {
                screenToPush = response?.notification?.request?.content?.data?.screen;
            }
        });

        // 2️⃣ Listen for notification taps while app is open or backgrounded
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const screen = response.notification.request.content.data.screen;
            if (screen) {
                console.log("setting screen to: ", screen);
                router.push({pathname: screen})
            }
        });

        BootSplash.hide({fade: true});
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                if (localLoading) setLocalLoading(false);
                router.push({pathname: "/offline"});
            }
        });

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                user.getIdToken().then((token) => {
                    setSession(token);
                    initialize().then(() => {
                        if (screenToPush === "/") return;

                        router.push({pathname: screenToPush});
                    }).catch((error) => {
                        console.error("Initialization error:", error);
                        setLocalLoading(false);
                    });
                });
            }
            else {
                setLocalLoading(false);
                if (Platform.OS === "ios") {
                    router.push({pathname: "/signup"});
                }
            }
        });
        return () => {
            unsubscribe();
            unsubscribeNetInfo();
            subscription.remove();
        }
    }, []);

    return visible ? (
        <AnimatedBootSplash
            ready={(!localLoading || !isLoading) && fontsLoaded}
            onAnimationEnd={() => {
                setVisible(false);
                if (!localLoading) {
                    router.push({pathname: "/signup"});
                }
            }}
        />
    ) : <></>
}
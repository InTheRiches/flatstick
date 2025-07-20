import React, {useEffect} from "react";
import {auth} from "@/utils/firebase";
import {useRouter} from "expo-router";
import {useSession} from "@/contexts/AuthContext";
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
import {useAppContext} from "@/contexts/AppContext";

export default function RootInitializer({}) {
    const [visible, setVisible] = React.useState(true);
    const [localLoading, setLocalLoading] = React.useState(true);
    const {setSession} = useSession();
    const {initialize, userData, updateData, isLoading, refreshStats} = useAppContext();
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
        // TODO use AsyncStorage to make sure this isnt handled more than once (meaning if I open the app
        // next time, will it still follow this behavior even though the notification was already handled?)
        // this might not be necessary, you need to test fully closing and reopening the app after a notification


        // const screen = response?.notification?.request?.content?.data?.screen;
        // const id = response?.notification?.request?.identifier;
        //
        // if (!screen || !id) return;
        //
        // try {
        //     const lastHandledId = await AsyncStorage.getItem(LAST_HANDLED_NOTIFICATION_KEY);
        //     if (lastHandledId === id) {
        //         console.log("Notification already handled:", id);
        //         return;
        //     }
        //
        //     console.log("Handling notification:", id);
        //     await AsyncStorage.setItem(LAST_HANDLED_NOTIFICATION_KEY, id);
        //     notificationScreen = screen;
        //
        // } catch (err) {
        //     console.error("Error checking handled notification:", err);
        // }
        // Cold start
        //     Notifications.getLastNotificationResponseAsync().then(response => {
        //         if (response) handleNotification(response);
        //     });

        Notifications.getLastNotificationResponseAsync().then(response => {
            if (response?.notification?.request?.content?.data?.screen) {
                screenToPush = response?.notification?.request?.content?.data?.screen;
            }
        });

        // 2️⃣ Listen for notification taps while app is open or backgrounded
        const subscription = Notifications.addNotificationResponseReceivedListener(response => {
            const screen = response.notification.request.content.data.screen;
            if (screen) {
                if (screen === "/friends/requests") {
                    // we know that a request is sent, so now we have to update the userData object to show alerts in the right places
                    userData.hasPendingFriendRequests = true;
                    updateData(userData);
                }
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
                user.getIdToken().then(async (token) => {
                    await refreshStats();
                    setSession(token);
                    await initialize().catch((error) => {
                        console.error("Initialization error:", error);
                        setLocalLoading(false);
                    });
                    if (screenToPush === "/") return;

                    router.push({pathname: screenToPush});
                });
            }
            else {
                setLocalLoading(false);
                // if (Platform.OS === "ios") {
                //     router.push({pathname: "/signup"});
                // }
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
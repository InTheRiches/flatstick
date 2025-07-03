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
        if (Platform.OS === "ios") {
            BootSplash.hide({ fade: true });
        }
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                if (localLoading) setLocalLoading(false);
                if (Platform.OS === "ios") {
                    setVisible(false);
                }
                router.push({pathname: "/offline"});
            }
        });

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                alert("Found user");
                user.getIdToken().then((token) => {
                    setSession(token);
                    initialize();
                    if (Platform.OS === "ios") {
                        setVisible(false);
                    }
                });
            }
            else {
                alert("Didnt find user");
                setLocalLoading(false);
                if (Platform.OS === "ios") {
                    setVisible(false);
                    router.push({pathname: "/signup"});
                }
            }
        });
        return () => {
            unsubscribe();
            unsubscribeNetInfo();
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
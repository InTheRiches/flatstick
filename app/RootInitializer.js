import React, {useEffect} from "react";
import {auth} from "../utils/firebase";
import {useRouter} from "expo-router";
import {useAppContext, useSession} from "../contexts/AppCtx";
import {AnimatedBootSplash} from "@/components/tabs/home/AnimatedBootSplash";
import NetInfo from '@react-native-community/netinfo';

export default function RootInitializer({}) {
    const [visible, setVisible] = React.useState(true);
    const [localLoading, setLocalLoading] = React.useState(true);
    const {setSession, isLoading} = useSession();
    const {initialize} = useAppContext();
    const router = useRouter();

    // Monitor authentication state changes
    useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener(state => {
            if (!state.isConnected) {
                router.push({pathname: "/offline"});
            }
        });

        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                user.getIdToken().then((token) => {
                    setSession(token);
                    initialize();
                });
            }
            else {
                setLocalLoading(false);
            }
        });
        return () => {
            unsubscribe();
            unsubscribeNetInfo();
        }
    }, []);

    return visible ? (
        <AnimatedBootSplash
            ready={!localLoading || !isLoading}
            onAnimationEnd={() => {
                setVisible(false);
                if (!localLoading) {
                    router.push({pathname: "/signup"});
                }
            }}
        />
    ) : <></>
}
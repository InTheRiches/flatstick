import React, {useEffect} from "react";
import {auth} from "../utils/firebase";
import {useRouter} from "expo-router";
import {useAppContext, useSession} from "../contexts/AppCtx";
import {AnimatedBootSplash} from "@/components/tabs/home/AnimatedBootSplash";

export default function RootInitializer({}) {
    const [visible, setVisible] = React.useState(true);
    const [localLoading, setLocalLoading] = React.useState(true);
    const {setSession, isLoading} = useSession();
    const {initialize} = useAppContext();
    const router = useRouter();



    // Monitor authentication state changes
    useEffect(() => {
        console.log("RootInitializer mounted");
        const unsubscribe = auth.onAuthStateChanged((user) => {
            console.log("auth state change")
            if (user) {
                console.log("User found");
                user.getIdToken().then((token) => {
                    setSession(token);
                    initialize();
                    console.log("Initializing user data");
                });
            }
            else {
                console.log("No user found");
                setLocalLoading(false);
            }
        });
        return () => unsubscribe();
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
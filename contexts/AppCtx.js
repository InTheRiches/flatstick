import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {signInWithEmailAndPassword} from "firebase/auth";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    runTransaction,
    setDoc
} from "firebase/firestore";
import {calculateTotalStrokesGained} from "@/utils/StrokesGainedUtils";
import {createSimpleRefinedStats, createSimpleStats} from "@/utils/PuttUtils";
import generatePushID from "@/components/general/utils/GeneratePushID";
import {updateBestSession} from "@/utils/sessions/best";
import {getAuth} from "@/utils/firebase";
import {Appearance} from "react-native";
import {initializePutters} from "@/utils/stats/statsHelpers";
import {processSession} from "@/utils/stats/sessionUtils";
import {finalizePutters, finalizeStats} from "@/utils/stats/finalizationUtils";

const breaks = [
    "leftToRight",
    "rightToLeft",
    "straight",
]

const slopes = [
    "downhill",
    "neutral",
    "uphill"
]

// TODO seperate the practices from the sessions, and make two separate folders for them in Firestore
const AppContext = createContext({
    userData: {},
    puttSessions: [],
    currentStats: {},
    putters: [],
    grips: [],
    previousStats: [],
    initialize: () => Promise.resolve(),
    refreshData: () => Promise.resolve(),
    updateData: () => Promise.resolve(),
    setUserData: () => Promise.resolve(),
    updateStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    setStat: () => Promise.resolve(),
    newPutter: () => Promise.resolve(),
    newSession: () => Promise.resolve(),
    getPreviousStats: () => Promise.resolve(),
    deleteSession: () => Promise.resolve(),
    deletePutter: () => {},
    newGrip: () => Promise.resolve(),
    deleteGrip: () => {},
});

const AuthContext = createContext({
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    session: null,
    isLoading: false,
});

// Hook to access AppContext
export const useAppContext = () => useContext(AppContext);

// Hook to access AuthContext
export const useSession = () => useContext(AuthContext);

// Combined Provider
export function AppProvider({children}) {
    // States for user data, sessions, and statistics
    const [userData, setUserData] = useState({});
    const [puttSessions, setPuttSessions] = useState([]);
    const [currentStats, setCurrentStats] = useState({});
    const [session, setSession] = useState(null);
    const [isLoading, setLoading] = useState(true);
    const [putters, setPutters] = useState([]);
    const [grips, setGrips] = useState([]);
    const [previousStats, setPreviousStats] = useState([]);
    const auth = getAuth();
    const firestore = getFirestore();

    // Firebase authentication functions
    const signIn = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            setSession(token || null);
        } catch (error) {
            console.error("Error during sign-in:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await auth.signOut();
            Appearance.setColorScheme(null);
            setSession(null);
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    };

    const getPreviousStats = useMemo(() => async () => {
        const statsQuery = query(collection(firestore, `users/${auth.currentUser.uid}/stats`));
        try {
            const querySnapshot = await getDocs(statsQuery);
            const statDocs = querySnapshot.docs
                .filter(doc => doc.id !== 'current')
                .map(doc => doc.data());
            setPreviousStats(statDocs);
            return statDocs;
        } catch (error) {
            console.error("Error getting previous stats:", error);
        }
        return [];
    }, [puttSessions]);

    // Monitor authentication state changes
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const token = await user.getIdToken();
                setSession(token);
                initialize();
            } else {
                setSession(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const newPutter = (name) => {
        const id = type.toLowerCase().replace(/\s/g, "-");
        setDoc(doc(firestore, `users/${auth.currentUser.uid}/putters/` + id), createSimpleRefinedStats()).catch((error) => {
            console.log(error);
        });

        setPutters(prev => [...prev, {
            type: id,
            name: type,
            stats: createSimpleRefinedStats()
        }]);
    }

    const deletePutter = (type) => {
        // delete the document
        deleteDoc(doc(firestore, `users/${auth.currentUser.uid}/putters/` + type)).catch((error) => {
            console.log(error);
        });
        // remove the putter from the putters array
        setPutters(prev => prev.filter(putter => putter.type !== type));
    }

    const newGrip = (name) => {
        const id = name.toLowerCase().replace(/\s/g, "-");
        setDoc(doc(firestore, `users/${auth.currentUser.uid}/grips/` + id), createSimpleRefinedStats()).catch((error) => {
            console.log(error);
        });

        setGrips(prev => [...prev, {
            type: id,
            name: name,
            stats: createSimpleRefinedStats()
        }]);
    }

    const deleteGrip = (type) => {
        // delete the document
        deleteDoc(doc(firestore, `users/${auth.currentUser.uid}/grips/` + type)).catch((error) => {
            console.log(error);
        });
        // remove the putter from the putters array
        setGrips(prev => prev.filter(grip => grip.type !== type));
    }

    // Initialize user data and sessions
    const initialize = () => {
        if (!auth.currentUser) return;

        getAllStats().then(async (updatedStats) => {
            console.log("updatedStats", updatedStats);

            let localPutters = [{type: "default", name: "No Putter", stats: updatedStats}];

            const putterSessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/putters`));
            try {
                const querySnapshot = await getDocs(putterSessionQuery);

                if (querySnapshot.docs.length !== 0)
                    localPutters = [...localPutters, ...querySnapshot.docs.map((doc) => {
                        return {
                            type: doc.id,
                            name: doc.id.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
                            stats: doc.data()
                        }
                    })];
            } catch (error) {
                console.error("Error refreshing putters:", error);
            }

            let localGrips = [{type: "default", name: "No Grip", stats: updatedStats}];

            const gripSessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/grips`));
            try {
                const querySnapshot = await getDocs(gripSessionQuery);

                if (querySnapshot.docs.length !== 0)
                    localGrips = [...localGrips, ...querySnapshot.docs.map((doc) => {
                        return {
                            type: doc.id,
                            name: doc.id.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" "),
                            stats: doc.data()
                        }
                    })];
            } catch (error) {
                console.error("Error refreshing grips:", error);
            }

            setGrips(localGrips);
            setPutters(localPutters);
        });

        refreshData();

        getPreviousStats();
    };

    // Update user data
    const updateData = async (newData) => {
        setUserData(prev => {
            return {...prev, ...newData};
        });

        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}`);
        try {
            // update the userData state with the new partial data
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("Document does not exist!");
                transaction.update(userDocRef, newData);
            });
        } catch (error) {
            console.error("Update data transaction failed:", error);
        }
    };

    // an internal function to update the stats inside firebase
    const updateStats = async (newData, replace = false) => {
        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/stats/current`);
        getDoc(userDocRef).then(async (doc) => {
            if (!doc.exists()) {
                setDoc(userDocRef, newData).catch((error) => {
                    console.log(error);
                });
                return;
            }

            try {
                await runTransaction(firestore, async (transaction) => {
                    if (replace) {
                        transaction.set(userDocRef, newData);
                        return;
                    }
                    transaction.update(userDocRef, newData);
                });
            } catch (error) {
                console.error("Update stats transaction failed:", error);
            }
        });
    };

    // Refresh user data and sessions
    const refreshData = async () => {
        const docRef = doc(firestore, `users/${auth.currentUser.uid}`);
        try {
            const data = await getDoc(docRef);
            setUserData(data.data());

            const theme = data.data().preferences.theme;

            Appearance.setColorScheme(theme === 0 ? null : theme === 1 ? "dark" : "light");
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }

        const sessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/sessions`), orderBy("timestamp", "desc"));
        try {
            const querySnapshot = await getDocs(sessionQuery);
            const sessions = querySnapshot.docs.map((doc) => {
                return ({
                    id: doc.ref.id,
                    ...doc.data()
                })
            });
            setPuttSessions(sessions);
            return sessions;
        } catch (error) {
            console.error("Error refreshing sessions:", error);
        }

        return [];
    };

    // Update statistics
    const refreshStats = async () => {
        const newStats = createSimpleStats();

        const newPuttSessions = await refreshData();
        const strokesGained = calculateTotalStrokesGained(userData, newPuttSessions);
        const newPutters = initializePutters(putters);

        let totalPutts = 0;

        newPuttSessions.forEach(session => processSession(session, newStats, newPutters, userData));

        if (newStats.rounds > 0)
            finalizeStats(newStats, strokesGained);

        setCurrentStats(newStats);

        await updateData({totalPutts: totalPutts, strokesGained: strokesGained["overall"]});
        await updateStats(newStats, true)

        finalizePutters(setPutters, newStats, newPutters, strokesGained);

        return newStats;
    };

    // Get all statistics
    const getAllStats = async () => {
        let updatedStats = currentStats;
        if (Object.keys(currentStats).length === 0) {
            const document = await getDoc(doc(firestore, `users/${auth.currentUser.uid}/stats/current`));

            if (!document.exists()) {
                return createSimpleRefinedStats();
            }

            setCurrentStats(document.data());
            updatedStats = document.data();
        }

        return updatedStats;
    };

    // Set specific statistic
    const setStat = useMemo(() => (statName, statValue) => {
        console.warn("setStat is not implemented yet:", statName, statValue);
    }, []);

    const newSession = async (file, data) => {
        await setDoc(doc(firestore, file, generatePushID()), data)
        const newStats = await refreshStats();

        const sessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/sessions`));
        getDocs(sessionQuery).then((querySnapshot) => {
            if (querySnapshot.docs.length % 5 === 0) {
                setDoc(doc(firestore, `users/${auth.currentUser.uid}/stats/${new Date().getTime()}`), newStats);
            }
        });

        // Update the best session
        await updateBestSession(data);

        return true;
    }

    const deleteSession = async (sessionId) => {
        const docRef = doc(firestore, `users/${auth.currentUser.uid}/sessions/${sessionId}`);
        try {
            await deleteDoc(docRef);
        } catch(error) {
            console.error("Error deleting session:", error);
            return false;
        }
        await refreshStats();
        return true;
    }

    // Memoized context value
    const appContextValue = useMemo(() => ({
        userData,
        puttSessions,
        currentStats,
        putters,
        grips,
        previousStats,
        initialize,
        refreshData,
        updateData,
        setUserData,
        updateStats: refreshStats,
        getAllStats,
        setStat,
        newPutter,
        newSession,
        getPreviousStats,
        deletePutter,
        deleteSession,
        newGrip,
        deleteGrip,
    }), [userData, puttSessions, currentStats, setStat, putters, getPreviousStats, previousStats, grips]);

    const authContextValue = useMemo(() => ({
        signIn,
        signOut,
        session,
        isLoading,
    }), [signIn, signOut, session, isLoading]);


    return (
        <AuthContext.Provider value={authContextValue}>
            <AppContext.Provider value={appContextValue}>
                {children}
            </AppContext.Provider>
        </AuthContext.Provider>
    );
}
import React, {createContext, useContext, useMemo, useState} from 'react';
import {GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword} from "firebase/auth";
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
import {initializeGrips, initializePutters} from "@/utils/stats/statsHelpers";
import {processSession} from "@/utils/stats/sessionUtils";
import {finalizeGrips, finalizePutters, finalizeStats} from "@/utils/stats/finalizationUtils";
import {GoogleSignin} from "@react-native-google-signin/google-signin";
import {useRouter} from "expo-router";
import {Platform} from "react-native";

const AppContext = createContext({
    userData: {},
    puttSessions: [],
    currentStats: {},
    putters: [],
    grips: [],
    previousStats: [],
    nonPersistentData: {},
    setNonPersistentData: () => {},
    initialize: () => {},
    refreshData: () => Promise.resolve(),
    updateData: () => Promise.resolve(),
    setUserData: () => {},
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
    calculateSpecificStats: () => {},
});

const AuthContext = createContext({
    signIn: () => Promise.resolve(),
    signOut: () => Promise.resolve(),
    googleSignIn: () => {},
    appleSignIn: () => {},
    setSession: () => {},
    setLoading: () => {},
    session: {},
    isLoading: true,
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
    const [session, setSession] = useState({});
    const [isLoading, setLoading] = useState(true);
    const [putters, setPutters] = useState([]);
    const [grips, setGrips] = useState([]);
    const [previousStats, setPreviousStats] = useState([]);
    const [nonPersistentData, setNonPersistentData] = useState({
        filtering: {
            putter: 0,
            grip: 0,
        }
    });
    const auth = getAuth();
    const firestore = getFirestore();
    const router = useRouter();

    // Firebase authentication functions
    const signIn = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const token = await userCredential.user.getIdToken();
        setSession(token || null);

        router.push({pathname: "/"});
    };

    const appleSignIn = (userCredential, firstName, lastName) => {
        getDoc(doc(firestore, `users/${userCredential.user.uid}`)).then((newDoc) => {
            if (newDoc.exists()) {
                userCredential.user.getIdToken().then((token) => {
                    setSession(token || null);
                    router.push({pathname: `/`});
                });
                return;
            }
            setDoc(doc(firestore, `users/${userCredential.user.uid}`), {
                date: new Date().toISOString(),
                totalPutts: 0,
                sessions: 0,
                firstName: firstName,
                lastName: lastName,
                strokesGained: 0,
                preferences: {
                    countMishits: false,
                    selectedPutter: 0,
                    theme: 0,
                    units: 0,
                    reminders: false,
                    selectedGrip: 0,
                }
            }).then(() => {
                userCredential.user.getIdToken().then((token) => {
                    setSession(token || null);
                    router.push({pathname: `/`});
                });
                refreshStats();
            }).catch((error) => {
                console.log(error);
            });
        }).catch((error) => {
            console.log(error);
        });
    }

    const googleSignIn = (user) => {
        const credential = GoogleAuthProvider.credential(user.idToken);

        signInWithCredential(getAuth(), credential).then((userCredential) => {
            getDoc(doc(firestore, `users/${userCredential.user.uid}`)).then((newDoc) => {
                if (newDoc.exists()) {
                    userCredential.user.getIdToken().then((token) => {
                        setSession(token || null);
                        router.push({pathname: `/`});
                    });
                    return;
                }
                setDoc(doc(firestore, `users/${userCredential.user.uid}`), {
                    date: new Date().toISOString(),
                    totalPutts: 0,
                    sessions: 0,
                    firstName: user.user.givenName,
                    lastName: user.user.familyName !== null ? user.user.familyName : "",
                    strokesGained: 0,
                    preferences: {
                        countMishits: false,
                        selectedPutter: 0,
                        theme: 0,
                        units: 0,
                        reminders: false,
                        selectedGrip: 0,
                    }
                }).then(() => {
                    userCredential.user.getIdToken().then((token) => {
                        setSession(token || null);
                        router.push({pathname: `/`});
                    });
                    refreshStats();
                }).catch((error) => {
                    console.log(error);
                });
            }).catch((error) => {
                console.log(error);
            });
        }).catch(console.log);
    }

    const signOut = async () => {
        try {
            await auth.signOut();
            await GoogleSignin.signOut();

            setSession(null);
            if (Platform.OS !== "ios") {
                router.push({pathname: "/login"});
            }
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

    const newPutter = (name) => {
        const id = name.toLowerCase().replace(/\s/g, "-");
        setDoc(doc(firestore, `users/${auth.currentUser.uid}/putters/` + id), createSimpleRefinedStats()).catch((error) => {
            console.log(error);
        });

        setPutters(prev => [...prev, {
            type: id,
            name: name,
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
        console.log("Initializing user data and sessions...");
        if (!auth.currentUser) {
            console.log("No user signed in!");
            setLoading(false);
            return;
        }

        getAllStats().then(async (updatedStats) => {
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

            let localGrips = [{type: "default", name: "Standard", stats: updatedStats}];

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

            refreshData().then(({sessions, newData}) => {
                getPreviousStats().then(() => {
                    console.log("Initialization complete!");
                    setLoading(false);
                })
            });
        });

        return "hey";
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
    const updateStats = async (newData) => {
        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/stats/current`);
        try {
            await runTransaction(firestore, async (transaction) => {
                transaction.update(userDocRef, newData);
            });
        } catch (error) {
            console.warn("Update stats transaction failed, attempting alternative:", error);
            try {
                await setDoc(userDocRef, newData);
            } catch (error) {
                console.error("Update stats failed:", error)
            }
        }
    };

    // Refresh user data and sessions
    const refreshData = async () => {
        let newData = {};
        const docRef = doc(firestore, `users/${auth.currentUser.uid}`);
        try {
            const data = await getDoc(docRef);
            newData = data.data();
            setUserData(data.data());
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
            return {sessions, newData};
        } catch (error) {
            console.error("Error refreshing sessions:", error);
        }

        return {};
    };

    /**
     * Calculate the specific statistics for the user based on their filtering preferences
     *
     * @returns {{stats: {onePutts: number, twoPutts: number, threePutts: number, avgMiss: number, avgMissDistance: number[], puttsByDistance: number[], totalDistance: number, puttsMisread: number, puttsMishits: number, misreads: {misreadLineByDistance: number[], misreadSlopeByDistance: number[], misreadLineBySlope: {downhill: {straight: number[], leftToRight: number[], rightToLeft: number[]}, neutral: {straight: number[], leftToRight: number[], rightToLeft: number[]}, uphill: {straight: number[], leftToRight: number[], rightToLeft: number[]}}, misreadSlopeBySlope: {downhill: {straight: number[], leftToRight: number[], rightToLeft: number[]}, neutral: {straight: number[], leftToRight: number[], rightToLeft: number[]}, uphill: {straight: number[], leftToRight: number[], rightToLeft: number[]}}}, strokesGained: {overall: number, distance: number[], slopes: {downhill: {straight: number[], leftToRight: number[], rightToLeft: number[]}, neutral: {straight: number[], leftToRight: number[], rightToLeft: number[]}, uphill: {straight: number[], leftToRight: number[], rightToLeft: number[]}}}, puttsAHole: {distance: number[], puttsAHole: number, normalHoles: number, puttsAHoleWhenMishit: number, mishitHoles: number, misreadPuttsAHole: number, misreadHoles: number, slopes: {downhill: {straight: number[], leftToRight: number[], rightToLeft: number[]}, neutral: {straight: number[], leftToRight: number[], rightToLeft: number[]}, uphill: {straight: number[], leftToRight: number[], rightToLeft: number[]}}}, madePutts: {distance: number[], slopes: {downhill: {straight: number[], leftToRight: number[], rightToLeft: number[]}, neutral: {straight: number[], leftToRight: number[], rightToLeft: number[]}, uphill: {straight: number[], leftToRight: number[], rightToLeft: number[]}}}, leftRightBias: number, shortPastBias: number, rounds: number}}}
     */
    const calculateSpecificStats = (userData) => {
        const stats = createSimpleStats();
        const filteredSessions = puttSessions
            .filter(session =>
                (nonPersistentData.filtering.putter === 0 || session.putter === putters[nonPersistentData.filtering.putter].type) &&
                (nonPersistentData.filtering.grip === 0 || session.grip === grips[nonPersistentData.filtering.grip].type)
            );
        const strokesGained = calculateTotalStrokesGained(userData, filteredSessions);
        const newPutters = initializePutters(putters);
        const newGrips = initializeGrips(grips);

        filteredSessions.forEach(session => processSession(session, stats, newPutters, newGrips, userData));

        if (stats.rounds > 0)
            finalizeStats(stats, strokesGained);
        else
            return createSimpleRefinedStats();

        return stats;
    }

    // Update statistics
    const refreshStats = async () => {
        const newStats = createSimpleStats();

        const newPuttSessions = (await refreshData()).sessions;
        const strokesGained = calculateTotalStrokesGained(userData, newPuttSessions);
        const newPutters = initializePutters(putters);
        const newGrips = initializeGrips(grips);

        newPuttSessions.forEach(session => processSession(session, newStats, newPutters, newGrips, userData));

        if (newStats.rounds > 0)
            finalizeStats(newStats, strokesGained);

        setCurrentStats(newStats);

        // TODO implement this
        let totalPutts = 0;
        await updateData({totalPutts: totalPutts, strokesGained: strokesGained.overall});
        await updateStats(newStats)

        finalizePutters(setPutters, newStats, newPutters, strokesGained);
        finalizeGrips(setGrips, newStats, newGrips, strokesGained);

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
        let newStats;
        try {
            newStats = await refreshStats();
        } catch (error) {
            console.error("Error updating stats:", error);
            return false;
        }

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
        nonPersistentData,
        setNonPersistentData,
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
        calculateSpecificStats,
    }), [userData, puttSessions, currentStats, setStat, putters, getPreviousStats, previousStats, grips, nonPersistentData]);

    const authContextValue = useMemo(() => ({
        signIn,
        signOut,
        googleSignIn,
        appleSignIn,
        setSession,
        setLoading,
        session,
        isLoading,
    }), [session, isLoading]);


    return (
        <AuthContext.Provider value={authContextValue}>
            <AppContext.Provider value={appContextValue}>
                {children}
            </AppContext.Provider>
        </AuthContext.Provider>
    );
}
import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';
import {getReactNativePersistence, initializeAuth, signInWithEmailAndPassword} from "firebase/auth";
import {initializeApp} from "firebase/app";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import {collection, doc, getDoc, getDocs, initializeFirestore, query, runTransaction} from "firebase/firestore";

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

const firebaseConfig = {
    apiKey: "AIzaSyAP7ZATyBFL934s87r-tvZNAVpq7t2cJas",
    authDomain: "puttperfect-e6438.firebaseapp.com",
    projectId: "puttperfect-e6438",
    storageBucket: "puttperfect-e6438.firebasestorage.app",
    messagingSenderId: "737663000705",
    appId: "1:737663000705:web:d3a6ed8c2e2f8a9c02ed80",
    measurementId: "G-ZM9VDTXJY9"
};

export const app = initializeApp(firebaseConfig);
export const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true,
});
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Create contexts
const AppContext = createContext({
    userData: {},
    puttSessions: [],
    currentStats: {},
    initialize: () => Promise.resolve(),
    refreshData: () => Promise.resolve(),
    updateData: () => Promise.resolve(),
    updateStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    setStat: () => Promise.resolve(),
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

    // Firebase authentication functions
    const signIn = useMemo(() => async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const token = await userCredential.user.getIdToken();
            setSession(token || null);
        } catch (error) {
            console.error("Error during sign-in:", error);
            throw error;
        }
    }, []);

    const signOut = useMemo(() => async () => {
        try {
            await auth.signOut();
            setSession(null);
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    }, []);

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

    // Initialize user data and sessions
    const initialize = () => {
        if (!auth.currentUser) return;

        getAllStats();

        const docRef = doc(firestore, `users/${auth.currentUser.uid}`);
        getDoc(docRef)
            .then((data) => {
                setUserData(data.data());
            })
            .catch((error) => console.error("Error initializing user data:", error));

        const sessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/sessions`));
        getDocs(sessionQuery)
            .then((querySnapshot) => {
                const sessions = querySnapshot.docs.map((doc) => doc.data());
                setPuttSessions(sessions);
            })
            .catch((error) => console.error("Error initializing sessions:", error));
    };

    // Update user data
    const updateData = useMemo(() => async (newData) => {
        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}`);
        try {
            await runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) throw new Error("Document does not exist!");
                transaction.update(userDocRef, newData);
            });
        } catch (error) {
            console.error("Update data transaction failed:", error);
        }
    }, []);

    // Refresh user data and sessions
    const refreshData = async () => {
        const docRef = doc(firestore, `users/${auth.currentUser.uid}`);
        try {
            const data = await getDoc(docRef);
            setUserData(data.data());
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }

        const sessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/sessions`));
        try {
            const querySnapshot = await getDocs(sessionQuery);
            const sessions = querySnapshot.docs.map((doc) => doc.data());
            setPuttSessions(sessions);
            return sessions;
        } catch (error) {
            console.error("Error refreshing sessions:", error);
        }

        return [];
    };

    // Update statistics
    const updateStats = async () => {
        const createCategory = () => {
            return {
                totalPutts: 0,
                rawPutts: 0,

                avgMiss: 0, // in feet

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                totalMissRead: 0, // this is a total not a percent as it is used to determine the percent of the missReadDistribution
                missReadDistribution: {
                    uphill: [0, 0, 0], // uphill, straight, left to right, right to left
                    neutral: [0, 0, 0], // neutral
                    downhill: [0, 0, 0] // downhill
                },

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

                // TODO ADD MISSREAD DATA
                slopeAndBreakDistribution: {
                    uphill: {
                        straight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        leftToRight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        rightToLeft: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        }
                    },
                    neutral: {
                        straight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        leftToRight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        rightToLeft: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        }
                    },
                    downhill: {
                        straight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        leftToRight: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        },
                        rightToLeft: {
                            putts: 0,
                            avgMiss: 0,
                            misses: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left
                            missDistances: [0, 0, 0, 0, 0, 0, 0, 0],
                            made: 0
                        }
                    }
                }
            }
        };

        const newStats = {
            lessThanSix: createCategory(),
            sixToTwelve: createCategory(),
            twelveToTwenty: createCategory(),
            twentyPlus: createCategory()
        };

        const newPuttSessions = await refreshData();

        let totalPutts = 0;

        newPuttSessions.map((session, index) => {
            session.putts.forEach((putt) => {
                const {distance, distanceMissed, missRead, xDistance, yDistance, puttBreak} = putt;

                // Categorize putt distance
                let category;
                if (distance < 6) category = "lessThanSix";
                else if (distance < 12) category = "sixToTwelve";
                else if (distance < 20) category = "twelveToTwenty";
                else category = "twentyPlus";

                const statCategory = newStats[category];

                // Increment total putts
                statCategory.rawPutts++;

                if (distanceMissed === 0) {
                    totalPutts++;
                    statCategory.totalPutts++;
                } else {
                    totalPutts += 2;
                    statCategory.totalPutts += 2;

                    if (statCategory.avgMiss === 0)
                        statCategory.avgMiss += distanceMissed;
                    else {
                        statCategory.avgMiss += distanceMissed;
                        statCategory.avgMiss /= 2;
                    }
                }

                if (missRead) {
                    statCategory.totalMissRead++;
                    statCategory.missReadDistribution[slopes[puttBreak[1]]][breaks[puttBreak[0]]]++;
                }

                // Calculate slope and break distribution
                const slopeBreakStats = statCategory.slopeAndBreakDistribution[slopes[puttBreak[1]]][breaks[puttBreak[0]]];

                // Determine angle/quadrant and increment missDistribution
                const degrees = Math.atan2(yDistance, xDistance) * (180 / Math.PI);
                if (distanceMissed === 0) {
                    statCategory.percentMade++;
                    slopeBreakStats.made++;
                } else if (degrees > -22.5 && degrees <= 22.5) {
                    statCategory.missDistribution[2]++; // right
                    slopeBreakStats.misses[2]++; // right
                    slopeBreakStats.missDistances[2] += distanceMissed;

                } else if (degrees > 22.5 && degrees <= 67.5) {
                    statCategory.missDistribution[1]++; // past right
                    slopeBreakStats.misses[1]++; // past right
                    slopeBreakStats.missDistances[1] += distanceMissed;

                    if (distanceMissed <= 2) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > 67.5 && degrees <= 112.5) {
                    statCategory.missDistribution[0]++; // past
                    slopeBreakStats.misses[0]++; // past
                    slopeBreakStats.missDistances[0] += distanceMissed;

                    if (distanceMissed <= distance + 2) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > 112.5 && degrees <= 157.5) {
                    statCategory.missDistribution[7]++; // past left
                    slopeBreakStats.misses[7]++; // past left
                    slopeBreakStats.missDistances[7] += distanceMissed;

                    if (distanceMissed <= 2) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > -67.5 && degrees <= -22.5) {
                    statCategory.missDistribution[3]++; // short right
                    slopeBreakStats.misses[3]++; // short right
                    slopeBreakStats.missDistances[3] += distanceMissed;

                    statCategory.percentShort++;
                } else if (degrees > -112.5 && degrees <= -67.5) {
                    statCategory.missDistribution[4]++; // short
                    slopeBreakStats.misses[4]++; // short
                    slopeBreakStats.missDistances[4] += distanceMissed;

                    statCategory.percentShort++;
                } else if (degrees > -157.5 && degrees <= -112.5) {
                    statCategory.missDistribution[5]++; // short left
                    slopeBreakStats.misses[5]++; // short left
                    slopeBreakStats.missDistances[5] += distanceMissed;

                    statCategory.percentShort++;
                } else {
                    statCategory.missDistribution[6]++; // left
                    slopeBreakStats.misses[6]++; // left
                    slopeBreakStats.missDistances[6] += distanceMissed;
                }

                // Average miss distance and increment directional miss count
                slopeBreakStats.avgMiss += distanceMissed; // Avg miss distance (will divide later)
                slopeBreakStats.putts++;
            });
        });

        // Finalize average calculations
        for (const category of Object.keys(newStats)) {
            const statCategory = newStats[category];

            // Finalize average miss distances
            for (const slope of ["uphill", "neutral", "downhill"]) {
                for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
                    const slopeBreakStats = statCategory.slopeAndBreakDistribution[slope][breakType];

                    if (slopeBreakStats.putts <= 0)
                        continue;

                    slopeBreakStats.avgMiss /= slopeBreakStats.putts; // Avg miss distance
                    slopeBreakStats.made += slopeBreakStats.putts;

                    // Calculate average of missDistances
                    slopeBreakStats.missDistances = slopeBreakStats.missDistances.map((val, idx) => val === 0 || slopeBreakStats.misses[idx] === 0 ? val : val / slopeBreakStats.misses[idx]);

                    statCategory.slopeAndBreakDistribution[slope][breakType] = slopeBreakStats;
                }
            }

            // Calculate percentages
            if (statCategory.rawPutts > 0) {
                statCategory.percentMade = (statCategory.percentMade / statCategory.rawPutts) * 100;
                statCategory.percentShort = (statCategory.percentShort / statCategory.rawPutts) * 100;
                statCategory.percentTooLong = (statCategory.percentTooLong / statCategory.rawPutts) * 100;
                statCategory.percentJustLong = (statCategory.percentJustLong / statCategory.rawPutts) * 100;
            }
        }

        setCurrentStats(newStats);
        await updateData({totalPutts, stats: newStats});
    };

    // Get all statistics
    const getAllStats = async () => {
        if (Object.keys(currentStats).length === 0) {
            getDoc(doc(firestore, `users/${auth.currentUser.uid}`)).then((doc) => {
                setCurrentStats(doc.data().stats || {});
            }).catch((error) => {
                console.log("couldnt find the documents: " + error)
            });
        }
        return currentStats;
    };

    // Set specific statistic
    const setStat = useMemo(() => (statName, statValue) => {
        console.warn("setStat is not implemented yet:", statName, statValue);
    }, []);

    // Memoized context value
    const appContextValue = useMemo(() => ({
        userData,
        puttSessions,
        currentStats,
        initialize,
        refreshData,
        updateData,
        updateStats,
        getAllStats,
        setStat,
    }), [userData, puttSessions, currentStats, initialize, refreshData, updateData, updateStats, getAllStats, setStat]);

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
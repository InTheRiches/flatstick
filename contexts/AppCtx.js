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
import {calculateTotalStrokesGained, cleanAverageStrokesGained} from "@/utils/StrokesGainedUtils";
import {roundTo} from "@/utils/roundTo";
import {
    cleanMadePutts,
    cleanPuttsAHole,
    createSimpleRefinedStats,
    createSimpleStats,
    updateSimpleStats
} from "@/utils/PuttUtils";
import generatePushID from "@/components/general/utils/GeneratePushID";
import {updateBestSession} from "@/utils/sessions/best";
import {getAuth} from "@/utils/firebase";
import {convertUnits} from "@/utils/Conversions";
import {Appearance} from "react-native";

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

    const newPutter = (type) => {
        const id = type.toLowerCase().replace(/\s/g, "-");
        setDoc(doc(firestore, `users/${auth.currentUser.uid}/putters/` + id), createSimpleRefinedStats()).catch((error) => {
            console.log(error);
        });

        setPutters(prev => [...prev, {
            type: id,
            name: type,
            stats: createSimpleStats()
        }]);
    }

    // Initialize user data and sessions
    const initialize = () => {
        if (!auth.currentUser) return;

        getAllStats().then(async (updatedStats) => {
            let localPutters = [{type: "default", name: "No Putter", stats: updatedStats.averagePerformance}];

            const sessionQuery = query(collection(firestore, `users/${auth.currentUser.uid}/putters`));
            try {
                const querySnapshot = await getDocs(sessionQuery);

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

    const updateStats = async (newData, replace = false) => {
        const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/stats/current`);
        getDoc(userDocRef).then(async (doc) => {
            if (!doc.exists()) {
                setDoc(userDocRef, newData).catch((error) => {
                    console.log(error);
                });
                return;
            }
            // if has been over
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
        const createCategory = () => {
            return {
                totalPutts: 0,
                rawPutts: 0,

                avgMiss: 0, // in feet

                strokesGained: 0,

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                totalMisreadSlopes: 0, // this is a total not a percent as it is used to determine the percent of the missReadDistribution
                totalMisreadLines: 0, // this is a total not a percent as it is used to determine the percent of the missReadDistribution
                misreadSlopesDistribution: {
                    uphill: [0, 0, 0], // uphill, straight, left to right, right to left
                    neutral: [0, 0, 0], // neutral
                    downhill: [0, 0, 0] // downhill
                },
                misreadLinesDistribution: {
                    uphill: [0, 0, 0], // uphill, straight, left to right, right to left
                    neutral: [0, 0, 0], // neutral
                    downhill: [0, 0, 0] // downhill
                },

                totalMishits: 0,

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

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

        let newStats;

        if (userData.preferences.units === 0) {
            newStats = {
                averagePerformance: createSimpleStats(),
                lessThanSix: createCategory(),
                sixToTwelve: createCategory(),
                twelveToTwenty: createCategory(),
                twentyPlus: createCategory()
            };
        } else {
            newStats = {
                averagePerformance: createSimpleStats(),
                lessThanTwo: createCategory(),
                twoToFour: createCategory(),
                fourToSeven: createCategory(),
                sevenPlus: createCategory()
            };
        }

        const newPuttSessions = await refreshData();
        const strokesGained = calculateTotalStrokesGained(userData, newPuttSessions);
        const newPutters = putters.slice(1).map((putter) => {
            putter.stats = createSimpleStats();
            return putter;
        });

        let totalPutts = 0;


        newPuttSessions.forEach((session, index) => {
            // TODO do we want to include the fake rounds too? (this is prompted by total distance, as it is relative to difficulty in the fake rounds)
            const averaging = newStats.averagePerformance.rounds < 5 && (session.type === "round-simulation" || session.type === "real-simulation") && session.holes === 18;
            if (averaging) newStats.averagePerformance.rounds++;

            if (session.putter !== "default")
                newPutters.find((putter) => putter.type === session.putter).stats.rounds += session.holes / 18;

            session.putts.forEach((putt) => {
                let {distance, distanceMissed, misReadLine, misReadSlope, misHit, xDistance, yDistance, puttBreak} = putt;

                distance = convertUnits(distance, session.units, userData.preferences.units);

                distanceMissed = convertUnits(distanceMissed, session.units, userData.preferences.units);
                xDistance = convertUnits(xDistance, session.units, userData.preferences.units);
                yDistance = convertUnits(yDistance, session.units, userData.preferences.units);

                // Categorize putt distance
                let category;
                if (userData.preferences.units === 0) {
                    if (distance < 6) category = "lessThanSix";
                    else if (distance < 12) category = "sixToTwelve";
                    else if (distance < 20) category = "twelveToTwenty";
                    else category = "twentyPlus";
                } else {
                    if (distance < 2) category = "lessThanTwo";
                    else if (distance <= 4) category = "twoToFour";
                    else if (distance <= 7) category = "fourToSeven";
                    else category = "sevenPlus";
                }

                const statCategory = newStats[category];

                // Increment total putts
                statCategory.rawPutts++;

                try {
                    if (averaging) {
                        updateSimpleStats(userData, newStats.averagePerformance, {distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts}, category);
                    }

                    // TODO if the putter no longer exists (was deleted), then we should just use the default putter
                    if (session.putter !== "default") {
                        updateSimpleStats(userData, newPutters.find((putter) => putter.type === session.putter).stats, {distance, distanceMissed, misReadLine, misReadSlope, misHit, puttBreak, xDistance, yDistance, totalPutts: putt.totalPutts}, category);
                    }
                } catch (error) {
                    console.error("Error updating stats:", error);
                }

                if (distanceMissed === 0) {
                    totalPutts++;
                    statCategory.totalPutts++;
                } else {
                    totalPutts += putt.totalPutts;
                    statCategory.totalPutts += putt.totalPutts;

                    if (statCategory.avgMiss === 0)
                        statCategory.avgMiss += distanceMissed;
                    else {
                        statCategory.avgMiss += distanceMissed;
                        statCategory.avgMiss /= 2;
                    }
                }

                if (misReadLine) {
                    statCategory.totalMisreadLines++;
                    statCategory.misreadLinesDistribution[slopes[puttBreak[1]]][breaks[puttBreak[0]]]++;
                }
                if (misReadSlope) {
                    statCategory.totalMisreadSlopes++;
                    statCategory.misreadSlopesDistribution[slopes[puttBreak[1]]][breaks[puttBreak[0]]]++;
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

                    if (distanceMissed <= (userData.preferences.units === 0 ? 2 : 0.75)) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > 67.5 && degrees <= 112.5) {
                    statCategory.missDistribution[0]++; // past
                    slopeBreakStats.misses[0]++; // past
                    slopeBreakStats.missDistances[0] += distanceMissed;

                    if (distanceMissed <= (userData.preferences.units === 0 ? 2 : 0.75)) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > 112.5 && degrees <= 157.5) {
                    statCategory.missDistribution[7]++; // past left
                    slopeBreakStats.misses[7]++; // past left
                    slopeBreakStats.missDistances[7] += distanceMissed;

                    if (distanceMissed <= (userData.preferences.units === 0 ? 2 : 0.75)) statCategory.percentJustLong++;
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

            if (session.putter !== "default") {
                const puttStats = newPutters.find((putter) => putter.type === session.putter).stats;
                if (puttStats.strokesGained.overall === 0) {
                    puttStats.strokesGained.overall += 29 - session.totalPutts;
                    return;
                }
                puttStats.strokesGained.overall += 29 - session.totalPutts;
                puttStats.strokesGained.overall /= 2;
            }
        });

        if (newStats.averagePerformance["rounds"] > 0) {
            newStats.averagePerformance.avgMiss = roundTo(newStats.averagePerformance["avgMiss"] / (newStats.averagePerformance["rounds"] * 18), 1);
            newStats.averagePerformance.totalDistance = roundTo(newStats.averagePerformance["totalDistance"] / newStats.averagePerformance["rounds"], 1);
            newStats.averagePerformance.puttsMisread = roundTo(newStats.averagePerformance["puttsMisread"] / newStats.averagePerformance["rounds"], 1);
            newStats.averagePerformance.onePutts = roundTo(newStats.averagePerformance["onePutts"] / newStats.averagePerformance["rounds"], 1);
            newStats.averagePerformance.twoPutts = roundTo(newStats.averagePerformance["twoPutts"] / newStats.averagePerformance["rounds"], 1);
            newStats.averagePerformance.threePutts = roundTo(newStats.averagePerformance["threePutts"] / newStats.averagePerformance["rounds"], 1);
            newStats.averagePerformance.leftRightBias = roundTo(newStats.averagePerformance.leftRightBias / (newStats.averagePerformance["rounds"]*18), 2);
            newStats.averagePerformance.shortPastBias = roundTo(newStats.averagePerformance.shortPastBias / (newStats.averagePerformance["rounds"]*18), 2);
            newStats.averagePerformance.strokesGained = cleanAverageStrokesGained(newStats.averagePerformance, strokesGained["overall"]);
            newStats.averagePerformance.puttsAHole = cleanPuttsAHole(newStats.averagePerformance);
            newStats.averagePerformance.madePutts = cleanMadePutts(newStats.averagePerformance);
            newStats.averagePerformance.avgMissDistance = newStats.averagePerformance.avgMissDistance.map((val, idx) => {
                if (newStats.averagePerformance.puttsByDistance[idx] === 0) return 0;
                return roundTo(val / newStats.averagePerformance.puttsByDistance[idx], 1);
            });
        }

        // Finalize average calculations
        for (const category of Object.keys(newStats)) {
            if (category === "averagePerformance") continue;
            const statCategory = newStats[category];

            statCategory.strokesGained = strokesGained[category];

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

        await updateData({totalPutts: totalPutts});
        await updateStats(newStats, true)

        newPutters.forEach((putter) => {
            if (putter.stats["rounds"] === 0) return;

            const allPutts = putter.stats["rounds"] * 18;
            // if we are not counting mishits, then we need to remove them from the total putts
            if (putter.stats["totalMishits"] === 0) {
                putter.stats.totalPutts -= putter.stats.puttsMishits;
            }

            putter.stats.avgMiss = roundTo(putter.stats["avgMiss"] / allPutts, 1);
            putter.stats.totalDistance = roundTo(putter.stats["totalDistance"] / putter.stats["rounds"], 1);
            putter.stats.puttsMisread = roundTo(putter.stats["puttsMisread"] / putter.stats["rounds"], 1);
            putter.stats.onePutts = roundTo(putter.stats["onePutts"] / putter.stats["rounds"], 1);
            putter.stats.twoPutts = roundTo(putter.stats["twoPutts"] / putter.stats["rounds"], 1);
            putter.stats.threePutts = roundTo(putter.stats["threePutts"] / putter.stats["rounds"], 1);
            putter.stats.leftRightBias = roundTo(putter.stats.leftRightBias / (putter.stats.rounds * 18), 2);
            putter.stats.shortPastBias = roundTo(putter.stats.shortPastBias / (putter.stats.rounds * 18), 2);

            putter.stats.strokesGained = cleanAverageStrokesGained(putter.stats);
            putter.stats.puttsAHole = cleanPuttsAHole(putter.stats);
            putter.stats.madePutts = cleanMadePutts(putter.stats);

            putter.stats.avgMissDistance = putter.stats.avgMissDistance.map((val, idx) => {
                if (putter.stats.puttsByDistance[idx] === 0) return 0;
                return roundTo(val / putter.stats.puttsByDistance[idx], 1);
            });

            const userDocRef = doc(firestore, `users/${auth.currentUser.uid}/putters/${putter.type}`);
            runTransaction(firestore, async (transaction) => {
                const userDoc = await transaction.get(userDocRef);
                if (!userDoc.exists()) {
                    console.error("Putter " + putter.type + " Document does not exist!");
                    return;
                }
                transaction.update(userDocRef, putter.stats);
            }).catch(error => {
                console.error("Set putter transaction failed:", error);
            });
        });

        console.log("refreshed")

        return newStats;
    };

    // Get all statistics
    const getAllStats = async () => {
        let updatedStats = currentStats;
        if (Object.keys(currentStats).length === 0) {
            const document = await getDoc(doc(firestore, `users/${auth.currentUser.uid}/stats/current`));

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
        deleteSession
    }), [userData, puttSessions, currentStats, updateData, setStat, putters, getPreviousStats, previousStats]);

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
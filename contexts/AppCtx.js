import React, {createContext, useContext, useMemo, useState} from 'react';
import {
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
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
import {
    createSimpleRefinedStats,
    createSimpleStats,
    createSixMonthStats,
    createThreeMonthStats,
    createYearlyStats
} from "@/utils/PuttUtils";
import generatePushID from "@/components/general/utils/GeneratePushID";
import {updateBestSession} from "@/utils/sessions/best";
import {deepMergeDefaults, getAuth} from "@/utils/firebase";
import {initializeGrips, initializePutters} from "@/utils/stats/statsHelpers";
import {processSession} from "@/utils/stats/sessionUtils";
import {finalizeGrips, finalizePutters, finalizeStats} from "@/utils/stats/finalizationUtils";
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from "@react-native-google-signin/google-signin";
import {useRouter} from "expo-router";
import {Platform} from "react-native";
import RNFS from "react-native-fs";
import {appleAuth} from "@invertase/react-native-apple-authentication";

const sessionDirectory = `${RNFS.DocumentDirectoryPath}/sessions`;

const AppContext = createContext({
    userData: {},
    puttSessions: [],
    currentStats: {},
    putters: [],
    grips: [],
    previousStats: [],
    nonPersistentData: {},
    yearlyStats: {},
    sixMonthStats: {},
    threeMonthStats: {},
    setNonPersistentData: () => {},
    initialize: () => {},
    refreshData: () => Promise.resolve(),
    updateData: () => Promise.resolve(),
    setUserData: () => {},
    updateStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    setStat: () => Promise.resolve(),
    createEmailAccount: () => Promise.resolve(),
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
    const [yearlyStats, setYearlyStats] = useState({});
    const [sixMonthStats, setSixMonthStats] = useState({});
    const [threeMonthStats, setThreeMonthStats] = useState({});
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

        router.replace({pathname: "/"});
    };

    const createEmailAccount = async (email, password, firstName, lastName, setLoading, setErrorCode, setInvalidEmail) => {
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                setLoading(false);
                // Signed up
                const user = userCredential.user;

                updateProfile(user, {
                    displayName: firstName.trim() + " " + lastName.trim()
                }).catch((error) => {
                });

                setDoc(doc(firestore, `users/${user.uid}`), {
                    date: new Date().toISOString(),
                    totalPutts: 0,
                    sessions: 0,
                    firstName: firstName.trim(),
                    lastName: firstName.trim(),
                    strokesGained: 0,
                    hasSeenRoundTutorial: false,
                    hasSeenRealTutorial: false,
                    preferences: {
                        countMishits: true,
                        selectedPutter: 0,
                        theme: 0,
                        units: 0,
                        reminders: false,
                        selectedGrip: 0,
                    }
                }).then(() => {
                    setDoc(doc(firestore, `users/${user.uid}/stats/current`), createSimpleRefinedStats()).then(() => {
                        updateStats()
                    });
                }).catch((error) => {
                    console.log(error);
                });

                router.replace({pathname: `/`});
            })
            .catch((error) => {
                setErrorCode(error.code);

                if (error.code === "auth/email-already-in-use")
                    setInvalidEmail(true);

                setLoading(false);
            });
    }

    const appleSignIn = async () => {
        try {
            const { identityToken, nonce, fullName } = await appleAuth.performRequest({
                requestedOperation: appleAuth.Operation.LOGIN,
                requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
            });

            let firstName = fullName && fullName.givenName !== null ? fullName.givenName : "Unknown";
            let lastName = fullName && fullName.familyName != null ? fullName.familyName : "Unknown";

            // can be null in some scenarios
            if (identityToken) {
                console.warn(`Apple Authentication Completed, idToken: ${identityToken}`);
                // 3). create a Firebase `AppleAuthProvider` credential
                const appleCredential = new OAuthProvider('apple.com').credential({
                    idToken: identityToken,
                    rawNonce: nonce,
                });

                const userCredential = await signInWithCredential(auth, appleCredential);

                getDoc(doc(firestore, `users/${userCredential.user.uid}`)).then((newDoc) => {
                    if (newDoc.exists()) {
                        userCredential.user.getIdToken().then((token) => {
                            setSession(token || null);
                            router.replace({pathname: `/`});
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
                            countMishits: true,
                            selectedPutter: 0,
                            theme: 0,
                            units: 0,
                            reminders: false,
                            selectedGrip: 0,
                        }
                    }).then(() => {
                        userCredential.user.getIdToken().then((token) => {
                            setSession(token || null);
                            router.replace({pathname: `/`});
                        });
                        refreshStats();
                    }).catch((error) => {
                        console.log(error);
                    });
                }).catch((error) => {
                    console.log(error);
                });

                // user is now signed in, any Firebase `onAuthStateChanged` listeners you have will trigger
                console.warn(`Firebase authenticated via Apple`);
            } else {}
        } catch (error) {
            if (error.code === appleAuth.Error.CANCELED)
                console.warn('User canceled Apple Sign in.');
            else
                console.error(error);
        }
    }

    const googleSignIn = async (setLoading) => {
        setLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();
            if (isSuccessResponse(response)) {
                const user = response.data;

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
                                countMishits: true,
                                selectedPutter: 0,
                                theme: 0,
                                units: 0,
                                reminders: false,
                                selectedGrip: 0,
                            }
                        }).then(() => {
                            userCredential.user.getIdToken().then((token) => {
                                setSession(token || null);
                                router.replace({pathname: `/`});
                            });
                            refreshStats();
                        }).catch((error) => {
                            console.log(error);
                        });
                    }).catch((error) => {
                        console.log(error);
                    });
                }).catch(console.log);
            } else {
                console.log("Sign in failed");
                alert("Sign in failed, unable to sign in with Google");
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.IN_PROGRESS:
                        // operation (eg. sign in) already in progress
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        // Android only, play services not available or outdated
                        alert("Play services not available or outdated");
                        break;
                    default:
                        alert("An error occurred while trying to sign in with Google");
                    // some other error happened
                }
            } else {
                alert("An error occurred while trying to sign in with Google.");
            }
        }
    }

    const signOut = async () => {
        try {
            await auth.signOut();
            await GoogleSignin.signOut();

            setSession(null);
            if (Platform.OS !== "ios") {
                router.replace({pathname: "/login"});
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
                .filter(doc => doc.id !== 'current' && doc.id.length > 4)
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

        const setupFolder = async () => {
            try {
                const dirExists = await RNFS.exists(sessionDirectory);
                if (!dirExists) {
                    await RNFS.mkdir(sessionDirectory);
                }
            } catch (error) {
                console.error("Error creating session directory:", error);
            }
        }

        setupFolder().then(() => {
            console.log("Session directory setup complete!");
            getAllStats().then(async (updatedStats) => {
                console.log("Stats loaded!");
                let localPutters = [{type: "default", name: "Standard Putter", stats: updatedStats}];

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

                let localGrips = [{type: "default", name: "Standard Method", stats: updatedStats}];

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

                refreshData().then(() => {
                    getPreviousStats().then(() => {
                        console.log("Initialization complete!");
                        setLoading(false);
                    })
                });
            });
        }).catch((error) => {
            console.error("Error during initialization:", error);
        });
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

    const updateOtherStats = async (yearly) => {
        setYearlyStats(yearly);
        const yearlyDocRef = doc(firestore, `users/${auth.currentUser.uid}/stats/` + new Date().getFullYear());
        try {
            await runTransaction(firestore, async (transaction) => {
                transaction.update(yearlyDocRef, yearly);
            });
        } catch (error) {
            console.warn("Update yearly stats transaction failed, attempting alternative:", error);
            try {
                await setDoc(yearlyDocRef, yearly);
            } catch (error) {
                console.error("Update yearly stats failed:", error)
            }
        }
    }

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

        if (newData.sessionsConverted === undefined) {
            // take all of the sessions in the firebase and make them files, and then delete from firebase
            const sessionsQuery = query(collection(firestore, `users/${auth.currentUser.uid}/sessions`), orderBy("date", "desc"));
            try {
                const querySnapshot = await getDocs(sessionsQuery);
                if (querySnapshot.docs.length !== 0) {
                    querySnapshot.forEach(async (doc) => {
                        const sessionData = doc.data();
                        await RNFS.writeFile(`${sessionDirectory}/${generatePushID()}.json`, JSON.stringify(sessionData), 'utf8');
                        await deleteDoc(doc.ref);
                    });
                }
            } catch (error) {
                console.error("Error refreshing sessions:", error);
            }

            // update the user data to reflect that the sessions have been converted
            newData.sessionsConverted = true;
            await updateData(newData);
        }

        try {
            const files = await RNFS.readDir(sessionDirectory);
            const sessions = await Promise.all(files.map(async (file) => {
                const content = await RNFS.readFile(file.path, 'utf8');
                // get the file name from the path
                const fileName = file.name.split('.')[0];
                // add the file name to the session data
                const sessionData = JSON.parse(content);
                sessionData.id = fileName;
                // return the session data with the file name
                return sessionData;
            }));

            // sort by timestamp
            sessions.sort((a, b) => new Date(b.date) - new Date(a.date));

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
        const newYearlyStats = createYearlyStats();

        const newPuttSessions = (await refreshData()).sessions;
        const strokesGained = calculateTotalStrokesGained(userData, newPuttSessions);
        const newPutters = initializePutters(putters);
        const newGrips = initializeGrips(grips);

        newPuttSessions.forEach(session => processSession(session, newStats, newYearlyStats, newPutters, newGrips, userData));

        if (newStats.rounds > 0)
            finalizeStats(newStats, strokesGained);

        setCurrentStats(newStats);

        // TODO implement this
        let totalPutts = 0;
        await updateData({totalPutts: totalPutts, sessions: newPuttSessions.length, strokesGained: strokesGained.overall});
        await updateStats(newStats)

        console.log("yearly stats", newYearlyStats);

        await updateOtherStats(newYearlyStats);

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

            const data = document.data();

            // check to make sure it is updated and has all the necessary fields
            updatedStats = deepMergeDefaults({ ...data }, createSimpleRefinedStats());

            setCurrentStats(updatedStats);

            // if they arent equal, update the stats in firebase
            if (data !== updatedStats) {
                await updateStats(updatedStats);
            }
        }

        if (Object.keys(yearlyStats).length === 0) {
            const yearlyDocument = await getDoc(doc(firestore, `users/${auth.currentUser.uid}/stats/${new Date().getFullYear()}`));
            if (!yearlyDocument.exists()) {
                await updateOtherStats(createYearlyStats());
                return updatedStats;
            }

            const yearlyData = yearlyDocument.data();

            // check to make sure it is updated and has all the necessary fields
            const updatedYearlyStats = deepMergeDefaults({ ...yearlyData }, createYearlyStats());

            setYearlyStats(updatedYearlyStats);

            // if they arent equal, update the stats in firebase
            if (yearlyData !== updatedYearlyStats) {
                await updateOtherStats(updatedYearlyStats);
            }
        }

        return updatedStats;
    };

    const newSession = async (data) => {
        RNFS.writeFile(`${sessionDirectory}/${data.id}.json`, JSON.stringify(data), 'utf8')
        // await setDoc(doc(firestore, file, generatePushID()), data)
        let newStats;
        try {
            newStats = await refreshStats();
        } catch (error) {
            console.error("Error updating stats:", error);
            return false;
        }

        RNFS.readDir(sessionDirectory).then((files) => {
            if (files.length % 5 === 0) {
                setDoc(doc(firestore, `users/${auth.currentUser.uid}/stats/${new Date().getTime()}`), newStats);
            }
        }).catch((error) => {
            console.error("Error reading session files:", error);
        });

        // Update the best session
        await updateBestSession(data);

        return true;
    }

    const deleteSession = async (sessionId) => {
        const sessionFilePath = `${sessionDirectory}/${sessionId}.json`;
        try {
            await RNFS.unlink(sessionFilePath);
        } catch (error) {
            console.error("Error deleting session file:", error);
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
        yearlyStats,
        initialize,
        refreshData,
        updateData,
        setUserData,
        updateStats: refreshStats,
        getAllStats,
        newPutter,
        newSession,
        getPreviousStats,
        createEmailAccount,
        deletePutter,
        deleteSession,
        newGrip,
        deleteGrip,
        calculateSpecificStats,
    }), [userData, puttSessions, currentStats, yearlyStats, putters, getPreviousStats, previousStats, grips, nonPersistentData]);

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
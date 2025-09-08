// Optionally import the services that you want to use
import {collection, getDocs, initializeFirestore, query, where} from "firebase/firestore";
import {getApp, initializeApp} from "firebase/app";
import {getAuth, getReactNativePersistence, initializeAuth} from 'firebase/auth';
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyD6WWVOyLuOT3tHas31vjZXYL5_BpZ_yZI",
    authDomain: "puttperfect-e6438.firebaseapp.com",
    projectId: "puttperfect-e6438",
    storageBucket: "puttperfect-e6438.firebasestorage.app",
    messagingSenderId: "737663000705",
    appId: "1:737663000705:android:4fd3d6a4ff1419e202ed80",
    measurementId: "G-ZM9VDTXJY9"
};

// Initialize Firebase app (only once)
let app;
try {
    console.log("Initializing Firebase app with config:", firebaseConfig);
    app = initializeApp(firebaseConfig);
} catch (error) {
    // If app is already initialized, get the existing instance
    if (error.code === 'app/duplicate-app') {
        app = getApp();
    } else {
        throw error;
    }
}

// Initialize Firestore
const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true,
});

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

// firebase emulators:start http://localhost:4000/
// if (__DEV__) {
//     console.log("Running in development mode, connecting to Firebase emulators");
//     connectAuthEmulator(auth, 'http://localhost:9099');
//     connectFirestoreEmulator(firestore, 'localhost', 8080);
// }

// Recursively merge defaults into target without overwriting existing values.
function deepMergeDefaults(target, defaults) {
    for (const key in defaults) {
        if (defaults.hasOwnProperty(key)) {
            const defaultValue = defaults[key];
            const targetValue = target[key];

            // Check if both the target and default are objects (but not arrays)
            if (
                typeof defaultValue === 'object' &&
                defaultValue !== null &&
                !Array.isArray(defaultValue)
            ) {
                if (typeof targetValue !== 'object' || targetValue === null) {
                    // If the target doesn't have an object here, assign the entire default object.
                    target[key] = defaultValue;
                } else {
                    // Recursively merge the nested objects.
                    deepMergeDefaults(targetValue, defaultValue);
                }
            } else {
                // For non-objects, only add the field if it's missing.
                if (!(key in target)) {
                    target[key] = defaultValue;
                }
            }
        }
    }
    return target;
}

async function getProfilesByDisplayName(displayName) {
    const profilesRef = collection(firestore, "users");

    // Convert search term to lowercase
    const searchTerm = displayName.toLowerCase();

    // Query using the lowercase field
    const q = query(
        profilesRef,
        where("displayNameLower", ">=", searchTerm),
        where("displayNameLower", "<=", searchTerm + "\uf8ff")
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const profiles = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.deleted) return;
            profiles.push({ ...data, uid: doc.id });
        });

        return profiles;
    } catch (e) {
        console.error("Error fetching profiles: " + e);
        return [];
    }
}

async function getProfilesByUsername(username) {
    let firstName, lastName;
    if (username.includes(" ")) {
        [firstName, lastName] = username.split(" ");
    } else {
        firstName = username;
        lastName = "";
    }

    const profilesRef = collection(firestore, "users");
    let q;
    if (lastName === "") {
        q = query(
            profilesRef,
            where("firstName", ">=", firstName),
            where("firstName", "<=", firstName + "\uf8ff"),
        );
    } else {
        q = query(
            profilesRef,
            where("firstName", ">=", firstName),
            where("firstName", "<=", firstName + "\uf8ff"),
            where("lastName", ">=", lastName),
            where("lastName", "<=", lastName + "\uf8ff"),
        );
    }
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return [];

        const profiles = [];
        querySnapshot.forEach((doc) => {
            if (doc.data().deleted !== undefined && doc.data().deleted) return;

            profiles.push({ ...doc.data(), uid: doc.id });
        });

        return profiles;
    } catch (e) {
        console.error("Error fetching profiles: " + e);
        return [];
    }
}

export {firestore, auth, app, deepMergeDefaults, getProfilesByDisplayName, getApp, getAuth, getProfilesByUsername};
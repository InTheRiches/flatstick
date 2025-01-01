// Optionally import the services that you want to use
import {collection, getDocs, initializeFirestore, query, where} from "firebase/firestore";
import {getApp, initializeApp} from "firebase/app";
import {getAuth, getReactNativePersistence, initializeAuth} from 'firebase/auth';
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebase = {
    apiKey: "AIzaSyAP7ZATyBFL934s87r-tvZNAVpq7t2cJas",
    authDomain: "puttperfect-e6438.firebaseapp.com",
    projectId: "puttperfect-e6438",
    storageBucket: "puttperfect-e6438.firebasestorage.app",
    messagingSenderId: "737663000705",
    appId: "1:737663000705:web:d3a6ed8c2e2f8a9c02ed80",
    measurementId: "G-ZM9VDTXJY9"
};

export const app = initializeApp(firebase);
const firestore = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
    ignoreUndefinedProperties: true,
});
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

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
            profiles.push({ ...doc.data(), id: doc.id });
        });

        return profiles;
    } catch (e) {
        console.error("Error fetching profiles: " + e);
        return [];
    }
}

export {firestore, auth, getApp, getAuth, getProfilesByUsername};
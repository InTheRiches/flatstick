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

// TODO improve this search functionality: https://medium.com/google-cloud/firebase-search-a-bigger-boat-c85695546d02
async function getProfilesByUsername(username) {
    const profilesRef = collection(firestore, "users");
    const q = query(profilesRef, where("username", ">=", username), where("username", "<=", username + "\uf8ff"));
    const querySnapshot = await getDocs(q);
    const profiles = [];
    querySnapshot.forEach((doc) => {
        profiles.push({...doc.data(), id: doc.id});
    });

    return profiles;
}

export {firestore, auth, getApp, getAuth, getProfilesByUsername};
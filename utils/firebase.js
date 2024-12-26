// Optionally import the services that you want to use
import {initializeFirestore} from "firebase/firestore";
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

export {firestore, auth, getApp, getAuth};
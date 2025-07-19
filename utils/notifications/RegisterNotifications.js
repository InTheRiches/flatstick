import * as Notifications from 'expo-notifications';
import { collection, doc, setDoc } from "firebase/firestore";
import {firestore} from "../firebase";
import {Platform} from "react-native";

export async function registerForPushNotificationsAsync(userId) {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('myNotificationChannel', {
            name: 'A channel is needed for the permissions prompt to appear',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
    }
    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
        token = (
            await Notifications.getDevicePushTokenAsync()
        ).data;
        console.log(token);
    } catch (e) {
        token = `${e}`;
    }

    //     // Store token in Firestore
    const tokenRef = doc(firestore, "users", userId);
    await setDoc(tokenRef, { pushToken: token }, { merge: true });

    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });

    return token;
}

// export async function registerForPushNotificationsAsync(userId) {
//     console.log("registering");
//
//     registerForPushNotificationsAsync().then(token => token && setExpoPushToken(token));
//
//     if (Platform.OS === 'android') {
//         Notifications.getNotificationChannelsAsync().then(value => setChannels(value ?? []));
//     }
//     if (status !== 'granted') {
//         console.warn("Push notification permissions not granted.");
//         return;
//     }
//
//     console.log("status", status);
//     await getPushToken().then(token => {
//         console.log('Push Token:', token);
//     }).catch(error => {
//         console.error('Error getting push token:', error);
//     });
//
//     Notifications.setNotificationHandler({
//         handleNotification: async () => ({
//             shouldShowAlert: true,
//             shouldPlaySound: false,
//             shouldSetBadge: false,
//         }),
//     });
//
//     if (status !== 'granted') return;
//
//     const tokenData = await Notifications.getExpoPushTokenAsync();
//     const token = tokenData.data;
//
//     // Store token in Firestore
//     const tokenRef = doc(firestore, "users", userId);
//     await setDoc(tokenRef, { pushToken: token }, { merge: true });
//     return token;
// }

async function getPushToken() {
    console.log("getting");
    const tokenData = await Notifications.getExpoPushTokenAsync();
    console.log('Expo Push Token:', tokenData.data);
    return tokenData.data;
}
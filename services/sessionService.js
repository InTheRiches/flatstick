// services/sessionService.js
import {deleteDoc, doc, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import RNFS from 'react-native-fs';
import {fetchUserData, getUserSessionsByID, updateUserData} from "@/services/userService";

const sessionDirectory = `${RNFS.DocumentDirectoryPath}/sessions`;
const fullRoundDirectory = `${RNFS.DocumentDirectoryPath}/fullRounds`;

export const refreshSessions = async (uid) => {
    const { sessions, fullRoundSessions } = await getUserSessionsByID(uid);
    const newData = await fetchUserData(uid);
    if (!newData.sessionsUpdated) {
        const files = await RNFS.readDir(sessionDirectory);
        for (const file of files) {
            const content = await RNFS.readFile(file.path, 'utf8');
            const sessionData = JSON.parse(content);
            const sessionId = file.name.split('.')[0];
            if (!sessionData.synced) {
                await setDoc(doc(firestore, `users/${uid}/sessions`, sessionId), { ...sessionData, synced: true });
                await RNFS.unlink(file.path);
            }
        }
        const fullRoundFiles = await RNFS.readDir(fullRoundDirectory);
        for (const file of fullRoundFiles) {
            const content = await RNFS.readFile(file.path, 'utf8');
            const fullRoundData = JSON.parse(content);
            const sessionId = file.name.split('.')[0];
            if (!fullRoundData.synced) {
                await setDoc(doc(firestore, `users/${uid}/fullRoundSessions`, sessionId), { ...fullRoundData, synced: true });
                await RNFS.unlink(file.path);
            }
        }
        await updateUserData(uid, { sessionsUpdated: true });
    }
    return { sessions, fullRoundSessions };
};

export const newSession = async (uid, data) => {
    await setDoc(doc(firestore, `users/${uid}/sessions`, data.id), data);
};

export const newFullRound = async (uid, data) => {
    await setDoc(doc(firestore, `users/${uid}/fullRoundSessions`, data.id), data);
};

export const deleteSession = async (uid, sessionId) => {
    const sessionFilePath = `${sessionDirectory}/${sessionId}.json`;
    await RNFS.unlink(sessionFilePath);
    await deleteDoc(doc(firestore, `users/${uid}/sessions`, sessionId));
};
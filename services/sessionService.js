// services/sessionService.js
import {deleteDoc, doc, setDoc} from 'firebase/firestore';
import {firestore} from '@/utils/firebase';
import RNFS from 'react-native-fs';
import {adaptOldSession, getUserSessionsByID} from "@/services/userService";

const sessionDirectory = `${RNFS.DocumentDirectoryPath}/sessions`;
const fullRoundDirectory = `${RNFS.DocumentDirectoryPath}/fullRounds`;

export const refreshSessions = async (uid) => {
    const sessions = await getUserSessionsByID(uid);
    if (await RNFS.exists(sessionDirectory)) {
        console.log(`Session directory exists: ${sessionDirectory}`);

        const files = await RNFS.readDir(sessionDirectory);
        for (const file of files) {
            const sessionData = JSON.parse(await RNFS.readFile(file.path, 'utf8'));
            const sessionId = file.name.split('.')[0];

            await setDoc(doc(firestore, `users/${uid}/sessions`, sessionId), adaptOldSession(sessionData));
            await RNFS.unlink(file.path);
        }

        await RNFS.unlink(sessionDirectory);
    }
    if (await RNFS.exists(fullRoundDirectory)) {
        console.log(`Full round directory exists: ${fullRoundDirectory}`);

        const files = await RNFS.readDir(fullRoundDirectory);
        for (const file of files) {
            const fullRoundData = JSON.parse(await RNFS.readFile(file.path, 'utf8'));
            const sessionId = file.name.split('.')[0];

            await setDoc(doc(firestore, `users/${uid}/sessions`, sessionId), adaptOldSession(fullRoundData));
            await RNFS.unlink(file.path);
        }

        await RNFS.unlink(fullRoundDirectory);
    }

    return sessions;
};

export const newSession = async (uid, data) => {
    await setDoc(doc(firestore, `users/${uid}/sessions`, data.id), data);
};

// export const newFullRound = async (uid, data) => {
//     await setDoc(doc(firestore, `users/${uid}/fullRoundSessions`, data.id), data);
// };

export const deleteSession = (uid, sessionId, friends = []) => {
    deleteDoc(doc(firestore, `users/${uid}/sessions`, sessionId));
    deleteDoc(doc(firestore, `userFeed/${uid}/feedItems`, sessionId));

    // loop through friends and delete their feedItems for this session
    for (const friend of friends) {
        deleteDoc(doc(firestore, `userFeed/${friend}/feedItems`, sessionId));
    }
};
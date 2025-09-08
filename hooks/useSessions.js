// hooks/useSessions.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {deleteSession, newSession, refreshSessions} from '@/services/sessionService';
import {updateBestSession} from '@/utils/sessions/best';

export const useSessions = () => {
    const [sessions, setSessions] = useState([]);
    const auth = getAuth();

    const refreshData = async () => {
        const sessions = await refreshSessions(auth.currentUser.uid);

        setSessions(sessions);
        return sessions;
    };

    const addSession = async (data) => {
        await newSession(auth.currentUser.uid, data);
        setSessions((prev) => [...prev, data]);
        await updateBestSession(data);
    };

    // const addFullRound = async (data) => {
    //     await newFullRound(auth.currentUser.uid, data);
    //     setFullRoundSessions((prev) => [...prev, data]);
    //     await updateBestSession(data);
    // };

    const removeSession = async (sessionId) => {
        await deleteSession(auth.currentUser.uid, sessionId);
        setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    };

    return {
        sessions,
        refreshData,
        newSession: addSession,
        deleteSession: removeSession,
    };
};
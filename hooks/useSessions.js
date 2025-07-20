// hooks/useSessions.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {deleteSession, newFullRound, newSession, refreshSessions} from '../services/sessionService';
import {updateBestSession} from '../utils/sessions/best';

export const useSessions = () => {
    const [puttSessions, setPuttSessions] = useState([]);
    const [fullRoundSessions, setFullRoundSessions] = useState([]);
    const auth = getAuth();

    const refreshData = async () => {
        const { sessions, fullRoundSessions } = await refreshSessions(auth.currentUser.uid);
        setPuttSessions(sessions);
        setFullRoundSessions(fullRoundSessions);
        return { sessions, fullRoundSessions };
    };

    const addSession = async (data) => {
        await newSession(auth.currentUser.uid, data);
        setPuttSessions((prev) => [...prev, data]);
        await updateBestSession(data);
    };

    const addFullRound = async (data) => {
        await newFullRound(auth.currentUser.uid, data);
        setFullRoundSessions((prev) => [...prev, data]);
        await updateBestSession(data);
    };

    const removeSession = async (sessionId) => {
        await deleteSession(auth.currentUser.uid, sessionId);
        setPuttSessions((prev) => prev.filter((session) => session.id !== sessionId));
    };

    return {
        puttSessions,
        fullRoundSessions,
        refreshData,
        newSession: addSession,
        newFullRound: addFullRound,
        deleteSession: removeSession,
    };
};
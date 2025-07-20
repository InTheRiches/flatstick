// hooks/useGrips.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {deleteGrip, fetchGrips, newGrip} from '../services/gripService';

export const useGrips = () => {
    const [grips, setGrips] = useState([]);
    const auth = getAuth();

    const initializeGrips = async (stats) => {
        const gripsData = await fetchGrips(auth.currentUser.uid, stats);
        setGrips(gripsData);
    };

    const addGrip = async (name) => {
        const newGripData = await newGrip(auth.currentUser.uid, name);
        setGrips((prev) => [...prev, newGripData]);
    };

    const removeGrip = async (type) => {
        await deleteGrip(auth.currentUser.uid, type);
        setGrips((prev) => prev.filter((grip) => grip.type !== type));
    };

    return { grips, setGrips, newGrip: addGrip, deleteGrip: removeGrip, initializeGrips };
};
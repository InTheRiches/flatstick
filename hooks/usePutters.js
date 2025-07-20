// hooks/usePutters.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {deletePutter, fetchPutters, newPutter} from '../services/putterService';

export const usePutters = () => {
    const [putters, setPutters] = useState([]);
    const auth = getAuth();

    const initializePutters = async (stats) => {
        const puttersData = await fetchPutters(auth.currentUser.uid, stats);
        setPutters(puttersData);
    };

    const addPutter = async (name) => {
        const newPutterData = await newPutter(auth.currentUser.uid, name);
        setPutters((prev) => [...prev, newPutterData]);
    };

    const removePutter = async (type) => {
        await deletePutter(auth.currentUser.uid, type);
        setPutters((prev) => prev.filter((putter) => putter.type !== type));
    };

    return { putters, newPutter: addPutter, deletePutter: removePutter, initializePutters };
};
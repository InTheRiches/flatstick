// hooks/useUser.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {fetchUserData, updateUserData} from '@/services/userService';
import {registerForPushNotificationsAsync} from '@/utils/notifications/RegisterNotifications';

export const useUser = () => {
    const [userData, setUserData] = useState({});
    const auth = getAuth();

    const initialize = async () => {
        if (!auth.currentUser) return;
        const data = await fetchUserData(auth.currentUser.uid);
        setUserData(data);
        await registerForPushNotificationsAsync(auth.currentUser.uid);
    };

    const updateData = async (newData) => {
        setUserData((prev) => ({ ...prev, ...newData }));
        await updateUserData(auth.currentUser.uid, newData);
    };

    return { userData, setUserData, updateData, initialize };
};
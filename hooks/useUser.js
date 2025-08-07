// hooks/useUser.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {fetchUserData, updateUserData} from '@/services/userService';
import {registerForPushNotificationsAsync} from '@/utils/notifications/RegisterNotifications';
import achievementData from "@/assets/achievements.json";

export const useUser = () => {
    const [userData, setUserData] = useState({});
    const auth = getAuth();

    const initialize = async () => {
        if (!auth.currentUser) return;
        const data = await fetchUserData(auth.currentUser.uid);

        if (!data.achievements || data.achievements.length === 0) {
            const initialAchievements = achievementData.map(ach => {
                if (ach.type === "milestone") {
                    return { id: ach.id, type: ach.type, earned: false, earnedAt: null };
                } else if (ach.type === "stat-high" || ach.type === "stat-low") {
                    return { id: ach.id, type: ach.type, value: 0, earnedAt: null };
                }
                return null;
            }).filter(ach => ach !== null);
            setUserData({...data, achievements: initialAchievements});
        }
        else
            setUserData(data);
        await registerForPushNotificationsAsync(auth.currentUser.uid);
    };

    const updateData = async (newData) => {
        setUserData((prev) => ({ ...prev, ...newData }));
        await updateUserData(auth.currentUser.uid, newData);
    };

    return { userData, setUserData, updateData, initialize };
};
// hooks/useUser.js
import {useState} from 'react';
import {getAuth} from '@/utils/firebase';
import {fetchUserData, updateUserData} from '@/services/userService';
import {registerForPushNotificationsAsync} from '@/utils/notifications/RegisterNotifications';
import achievementData from "@/assets/achievements.json";
import {getDefaultData} from "@/utils/userUtils";

export const useUser = () => {
    const [userData, setUserData] = useState({});
    const auth = getAuth();

    const initialize = async (user) => {
        if (!auth.currentUser) return;

        let data = userData;
        console.log("Initializing user data for user:", user);
        if (Object.keys(userData).length === 0) {
            data = getDefaultData(user.displayName.split(" ")[0] || '', user.displayName.split(" ")[1] || '');
        }
        console.log("User is signed in with UID:", auth.currentUser.uid);
        console.log("Fetched user data:", data);

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
        return data;
    };

    const updateData = async (newData) => {
        setUserData((prev) => ({ ...prev, ...newData }));
        await updateUserData(auth.currentUser.uid, newData);
    };

    return { userData, setUserData, updateData, initialize };
};
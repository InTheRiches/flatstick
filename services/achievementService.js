import { useCallback } from "react";
import data from "../assets/achievements.json";

export const useAchievements = ({ userData, updateData }) => {
    const setAchievements = useCallback((newAchievements) => {
        updateData({
            achievements: newAchievements,
        }).then(() => {
            console.log("✅ Successfully updated achievements");
        }).catch(err => {
            console.error("❌ Failed to update achievements:", err);
        });
    }, [updateData]);

    const setMilestone = useCallback((id, state) => {
        const current = userData.achievements || [];
        const updated = current.map(ach =>
            ach.id === id && ach.type === "milestone"
                ? (ach.earned
                    ? ach
                    : { ...ach, earned: !!state, earnedAt: new Date() })
                : ach
        );
        setAchievements(updated);
    }, [userData.achievements, setAchievements]);

    const setStatHighAchievement = useCallback((id, value) => {
        const current = userData.achievements || [];
        const updated = current.map(ach =>
            ach.id === id && ach.type === "stat-high"
                ? (ach.value >= value
                    ? ach
                    : { ...ach, value, earnedAt: new Date() })
                : ach
        );
        setAchievements(updated);
    }, [userData.achievements, setAchievements]);

    const setStatLowAchievement = useCallback((id, value) => {
        const current = userData.achievements || [];
        const updated = current.map(ach =>
            ach.id === id && ach.type === "stat-low"
                ? (ach.value <= value
                    ? ach
                    : { ...ach, value, earnedAt: new Date() })
                : ach
        );
        setAchievements(updated);
    }, [userData.achievements, setAchievements]);

    const evaluateCriteria = useCallback((session, criteria) => {
        const sessionValue = session[criteria.metric];
        switch (criteria.operator) {
            case '>': return sessionValue > criteria.value;
            case '<': return sessionValue < criteria.value;
            case '>=': return sessionValue >= criteria.value;
            case '<=': return sessionValue <= criteria.value;
            case '==': return sessionValue === criteria.value;
            case '!=': return sessionValue !== criteria.value;
            default: return false;
        }
    }, []);

    const checkAchievements = useCallback((session) => {
        const currentAchievements = userData.achievements || [];

        for (const ach of data) {
            if (ach.type === "milestone") {
                const passed = Array.isArray(ach.criteria)
                    ? ach.criteria.every(c => evaluateCriteria(session, c))
                    : evaluateCriteria(session, ach.criteria);

                if (passed) {
                    const alreadyEarned = currentAchievements.find(a => a.id === ach.id)?.earned;
                    if (!alreadyEarned) {
                        console.log("🏅 Milestone achieved:", ach.id);
                        setMilestone(ach.id, true);
                    }
                }

            } else if (ach.type === "stat-high") {
                const userValue = currentAchievements.find(a => a.id === ach.id)?.value || 0;
                const sessionValue = session[ach.criteria.metric];
                if (sessionValue > userValue) {
                    setStatHighAchievement(ach.id, sessionValue);
                }

            } else if (ach.type === "stat-low") {
                const userValue = currentAchievements.find(a => a.id === ach.id)?.value ?? Infinity;
                const sessionValue = session[ach.criteria.metric];
                if (sessionValue < userValue) {
                    setStatLowAchievement(ach.id, sessionValue);
                }
            }
        }
    }, [userData.achievements, evaluateCriteria, setMilestone, setStatHighAchievement, setStatLowAchievement]);

    return {
        checkAchievements,
        setMilestone,
        setStatHighAchievement,
        setStatLowAchievement,
        setAchievements
    };
};

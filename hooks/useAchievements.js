import {useCallback} from "react";
import data from "../assets/achievements.json";

export const useAchievements = ({ userData, updateData }) => {
    const evaluateCriteria = useCallback((session, criteria) => {
        // Normalize metric into an array if it's a string
        const metricPath = Array.isArray(criteria.metric)
            ? criteria.metric
            : [criteria.metric];

        const sessionValue = metricPath.reduce(
            (obj, key) => (obj ? obj[key] : undefined),
            session
        );

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
        console.log("Checking achievements for session:", session.id);

        // Start with current achievements
        let updatedAchievements = [...(userData.achievements || [])];
        let hasChanges = false;

        const updateMilestone = (id, state) => {
            updatedAchievements = updatedAchievements.map(ach =>
                ach.id === id && ach.type === "milestone"
                    ? (ach.earned
                        ? ach
                        : { ...ach, earned: !!state, earnedAt: new Date() })
                    : ach
            );
            hasChanges = true;
        };

        const updateStatHigh = (id, value) => {
            updatedAchievements = updatedAchievements.map(ach =>
                ach.id === id && ach.type === "stat-high"
                    ? (ach.value >= value
                        ? ach
                        : { ...ach, value, earnedAt: new Date() })
                    : ach
            );
            hasChanges = true;
        };

        const updateStatLow = (id, value) => {
            updatedAchievements = updatedAchievements.map(ach =>
                ach.id === id && ach.type === "stat-low"
                    ? (ach.value <= value
                        ? ach
                        : { ...ach, value, earnedAt: new Date() })
                    : ach
            );
            hasChanges = true;
        };

        for (const ach of data) {
            if (ach.type === "milestone") {
                const passed = Array.isArray(ach.criteria)
                    ? ach.criteria.every(c => evaluateCriteria(session, c))
                    : evaluateCriteria(session, ach.criteria);

                if (passed) {
                    const alreadyEarned = updatedAchievements.find(a => a.id === ach.id)?.earned;
                    if (!alreadyEarned) {
                        console.log("🏅 Milestone achieved:", ach.id);
                        updateMilestone(ach.id, true);
                    }
                }

            } else if (ach.type === "stat-high") {
                const userValue = updatedAchievements.find(a => a.id === ach.id)?.value || 0;
                const sessionValue = session[ach.criteria.metric];
                if (sessionValue > userValue) {
                    updateStatHigh(ach.id, sessionValue);
                }

            } else if (ach.type === "stat-low") {
                const userValue = updatedAchievements.find(a => a.id === ach.id)?.value ?? Infinity;
                const sessionValue = session[ach.criteria.metric];
                if (sessionValue < userValue) {
                    updateStatLow(ach.id, sessionValue);
                }
            }
        }

        // Only write once, after processing everything
        if (hasChanges) {
            updateData({ achievements: updatedAchievements })
                .then(() => console.log("✅ Achievements updated in one batch"))
                .catch(err => console.error("❌ Failed to update achievements:", err));
        }
    }, [userData.achievements, evaluateCriteria, updateData]);

    return {
        checkAchievements,
    };
};

import {createContext, useContext} from "react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    limit,
    orderBy,
    query,
    runTransaction
} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const StatisticsContext = createContext({
    updateStats: () => Promise.resolve(),
    getAllStats: () => Promise.resolve(),
    setStat: () => Promise.resolve(),
});

const breaks = [
    "leftToRight",
    "rightToLeft",
    "straight",
]

const slopes = [
    "downhill",
    "neutral",
    "uphill"
]

// Custom hook to access statistical context
export function useStatistics() {
    return useContext(StatisticsContext);
}

export function StatisticsProvider({children}) {
    const db = getFirestore();
    const auth = getAuth();

    let currentStats = {};

    const updateStats = async () => {
        const newStats = {
            lessThanSix: {
                totalPutts: 0,

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

                slopeAndBreakDistribution: {
                    uphill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0], // avg miss distance, past, past right, right, short right, short, short left, left, past left
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    neutral: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    downhill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                }
            },
            sixToTwelve: {
                totalPutts: 0,

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

                slopeAndBreakDistribution: {
                    uphill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0], // avg miss distance, past, past right, right, short right, short, short left, left, past left
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    neutral: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    downhill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                }
            },
            twelveToTwenty: {
                totalPutts: 0,

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

                slopeAndBreakDistribution: {
                    uphill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0], // avg miss distance, past, past right, right, short right, short, short left, left, past left
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    neutral: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    downhill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                }
            },
            twentyPlus: {
                totalPutts: 0,

                percentShort: 0,
                percentTooLong: 0,
                percentJustLong: 0, // within 2ft long, which is the right distance to be long by
                percentMade: 0,

                missDistribution: [0, 0, 0, 0, 0, 0, 0, 0], // past, past right, right, short right, short, short left, left, past left

                slopeAndBreakDistribution: {
                    uphill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0], // avg miss distance, past, past right, right, short right, short, short left, left, past left
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    neutral: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    },
                    downhill: {
                        straight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        leftToRight: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                        rightToLeft: [0, 0, 0, 0, 0, 0, 0, 0, 0]
                    }
                }
            }
        };

        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"));

        const querySnapshot = await getDocs(q);

        let docs = [];
        querySnapshot.forEach((doc) => {
            // doc.data() is never undefined for query doc snapshots
            docs.push(doc.data());
        });

        let totalPutts = 0;

        docs.map((session, index) => {
            session.putts.forEach((putt) => {
                const {distance, distanceMissed, missRead, xDistance, yDistance, slope, puttBreak} = putt;

                if (distanceMissed === 0) totalPutts++;
                else totalPutts += 2;

                // Categorize putt distance
                let category;
                if (distance < 6) category = "lessThanSix";
                else if (distance < 12) category = "sixToTwelve";
                else if (distance < 20) category = "twelveToTwenty";
                else category = "twentyPlus";

                const statCategory = newStats[category];

                // Increment total putts
                statCategory.totalPutts++;

                newStats[distance].totalPutts += 1;

                // Determine angle/quadrant and increment missDistribution
                const degrees = Math.atan2(yDistance, xDistance) * (180 / Math.PI);
                if (distanceMissed === 0)
                    statCategory.totalMade++;
                else if (degrees > -22.5 && degrees <= 22.5) {
                    statCategory.missDistribution[2]++; // right
                } else if (degrees > 22.5 && degrees <= 67.5) {
                    statCategory.missDistribution[1]++; // past right

                    if (distanceMissed <= distance + 2) statCategory.percentJustLong++;
                    else if (distanceMissed > distance) statCategory.percentTooLong++;
                } else if (degrees > 67.5 && degrees <= 112.5) {
                    statCategory.missDistribution[0]++; // past

                    if (distanceMissed <= distance + 2) statCategory.percentJustLong++;
                    else statCategory.percentTooLong++;
                } else if (degrees > 112.5 && degrees <= 157.5) {
                    statCategory.missDistribution[7]++; // past left

                    if (distanceMissed <= distance + 2) statCategory.percentJustLong++;
                    else if (distanceMissed > distance) statCategory.percentTooLong++;
                } else if (degrees > -67.5 && degrees <= -22.5) {
                    statCategory.missDistribution[3]++; // short right
                } else if (degrees > -112.5 && degrees <= -67.5) {
                    statCategory.missDistribution[4]++; // short
                } else if (degrees > -157.5 && degrees <= -112.5) {
                    statCategory.missDistribution[5]++; // short left
                } else {
                    statCategory.missDistribution[6]++; // left
                }

                // Calculate slope and break distribution
                const slopeBreakStats = statCategory.slopeAndBreakDistribution[slopes[puttBreak[1]]][breaks[puttBreak[0]]];

                // Average miss distance and increment directional miss count
                slopeBreakStats[0] += distanceMissed; // Avg miss distance (will divide later)

                if (degrees > -22.5 && degrees <= 22.5) slopeBreakStats[3]++; // right
                else if (degrees > 22.5 && degrees <= 67.5) slopeBreakStats[2]++; // past right
                else if (degrees > 67.5 && degrees <= 112.5) slopeBreakStats[1]++; // past
                else if (degrees > 112.5 && degrees <= 157.5) slopeBreakStats[0]++; // past left
                else if (degrees > -67.5 && degrees <= -22.5) slopeBreakStats[4]++; // short right
                else if (degrees > -112.5 && degrees <= -67.5) slopeBreakStats[5]++; // short
                else if (degrees > -157.5 && degrees <= -112.5) slopeBreakStats[6]++; // short left
                else slopeBreakStats[7]++; // left
            });
        });

        // Finalize average calculations
        for (const category of Object.keys(newStats)) {
            const statCategory = newStats[category];

            // Finalize average miss distances
            for (const slope of ["uphill", "neutral", "downhill"]) {
                for (const breakType of ["straight", "leftToRight", "rightToLeft"]) {
                    const slopeBreakStats = statCategory.slopeAndBreakDistribution[slope][breakType];

                    let totalSlopeBreakPutts = slopeBreakStats[1] + slopeBreakStats[2] + slopeBreakStats[3] + slopeBreakStats[4] + slopeBreakStats[5] + slopeBreakStats[6] + slopeBreakStats[7] + slopeBreakStats[8];

                    if (totalSlopeBreakPutts > 0) {
                        slopeBreakStats[0] /= totalSlopeBreakPutts; // Avg miss distance
                    }
                }
            }

            // Calculate percentages
            if (statCategory.totalPutts > 0) {
                statCategory.percentMade = (statCategory.percentMade / statCategory.totalPutts) * 100;
                statCategory.percentShort = (statCategory.missDistribution[5] / statCategory.totalPutts) * 100;
                statCategory.percentTooLong = (statCategory.missDistribution[1] / statCategory.totalPutts) * 100;
                statCategory.percentJustLong = (statCategory.percentJustLong / statCategory.totalPutts) * 100;
            }
        }

        currentStats = newStats;

        const sfDocRef = doc(db, `users/${auth.currentUser.uid}`);

        runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }

            transaction.update(sfDocRef, {totalPutts: totalPutts, stats: newStats});
        }).then(() => {
            console.log("Update stats successfully committed!");
        }).catch((e) => {
            console.log("Update stats transaction failed: ", e);
        });
    }

    const getAllStats = async () => {
        if (currentStats === {}) {
            const docRef = doc(db, `users/${auth.currentUser.uid}`);
            const data = await getDoc(docRef);

            currentStats = data.data().stats;
        }
        return currentStats;
    }

    const setStat = (statName, statValue) => {
        // TODO IMPLEMENT THIS
        console.log("THIS FEATURE IS NOT IMPLEMENTED YET, SET STAT NEEDS TO BE IMPLEMENTED");
    }

    return (
        <StatisticsContext.Provider
            value={{
                updateStats,
                getAllStats,
                setStat,
            }}
        >
            {children}
        </StatisticsContext.Provider>
    );
}
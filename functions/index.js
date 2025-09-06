/* eslint-disable */
/**
 * Import function triggers from their respective submodules:
 *
 * const { onCall } = require("firebase-functions/v2/https");
 * const { onDocumentWritten } = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

setGlobalOptions({maxInstances: 2});

exports.fanOutFeedItem = functions.firestore
    .onDocumentWritten('users/{userId}/sessions/{sessionId}', async (snap, context) => {
        const userId = snap.data.before.ref.path.split("/")[1];
        const sessionId = snap.data.before.ref.path.split("/")[3];

        const userDoc = await admin.firestore().doc(`users/${userId}`).get();
        const userData = userDoc.data();
        const friends = userData.friends || [];

        // Handle delete (before exists, after does not)
        if (snap.data.before.exists && !snap.data.after.exists) {
            const batch = admin.firestore().batch();

            for (const friendId of friends) {
                const feedItemsRef = admin.firestore().collection(`userFeed/${friendId}/feedItems`);

                // Example: delete a known session's feedItem
                const docToDelete = feedItemsRef.doc(sessionId); // or use a specific known doc ID
                batch.delete(docToDelete);
            }

            await batch.commit();

            return;
        }

        //const sessionData = snap.data.after;
        const sessionData = snap.data.after.data();

        let specifics = {};
        switch(sessionData.meta.type) {
            case "sim":
                specifics = {
                    difficulty: sessionData.meta.difficulty, // Assuming difficulty is part of meta
                    mode: sessionData.meta.mode, // Assuming mode is part of meta
                }
                break;
            case "full":
                specifics = {
                    score: sessionData.stats.score, // Assuming score is part of stats
                    courseName: sessionData.meta.courseName, // Assuming courseName is part of meta
                }
                break;
        }

        const feedItem = {
            user: {
                id: userId,
                displayName: userData.displayName,
            },
            session: {
                id: sessionId,
                type: sessionData.meta.type, // Assuming meta.type is the session type
                date: sessionData.meta.date, // Assuming meta.date is the session date
                units: sessionData.meta.units, // Assuming meta.units is the session units
            },
            stats: {
                strokesGained: sessionData.stats.strokesGained,
                totalPutts: sessionData.stats.totalPutts,
                holesPlayed: sessionData.stats.holesPlayed,
                avgMiss: sessionData.stats.avgMiss,
                puttCounts: sessionData.stats.puttCounts,
                avgDistance: roundTo(sessionData.stats.totalDistance / sessionData.stats.holesPlayed, 1),
            },
            specifics: specifics, // Add specifics based on session type
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            scorecard: sessionData.scorecard, // Assuming scorecard is part of stats
        };

        const batch = admin.firestore().batch();
        for (const friendId of friends) {
            const ref = admin.firestore().collection(`userFeed/${friendId}/feedItems`).doc();
            batch.set(ref, feedItem);
        }
        const feedItemRef = admin.firestore().collection(`userFeed/${userId}/feedItems`).doc(sessionId);
        batch.set(feedItemRef, feedItem);

        await batch.commit();
    });

exports.deletedFedOutRound = functions.firestore
    .onDocumentDeleted('users/{userId}/sessions/{sessionId}', async (snap, context) => {
        const userId = context.params.userId;
        const sessionId = context.params.sessionId;

        const userDoc = await admin.firestore().doc(`users/${userId}`).get();
        const userData = userDoc.data();
        const friends = userData.friends || [];

        const batch = admin.firestore().batch();

        for (const friendId of friends) {
            const feedItemsRef = admin.firestore().collection(`userFeed/${friendId}/feedItems`);

            // Example: delete a known session's feedItem
            const docToDelete = feedItemsRef.doc(sessionId); // or use a specific known doc ID
            batch.delete(docToDelete);
        }

        // Also delete from the user's own feed
        const userFeedRef = admin.firestore().collection(`userFeed/${userId}/feedItems`).doc(sessionId);
        batch.delete(userFeedRef);

        await batch.commit();
    });

const roundTo = (num, decimalPlaces) => {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(num * factor) / factor;
};

// TODO make two separate collections, one for sent and one for received,
//  that way this doesnt get triggered twice for every friend request
exports.sendFriendRequestNotification = functions.firestore
    .onDocumentCreated(
        "users/{userId}/friendRequests/{requestId}",
        async (event) => {
            const snapshot = event.data;
            if (!snapshot) {
                console.log("No data associated with the event");
                return;
            }

            // access a particular field as you would any JS property
            const request = snapshot.data();
            // skip if the request contains the "to" field
            if (request.to) {
                console.log("Request already processed:", request);
                return;
            }
            const userId = event.params.userId;

            try {
                const userDocRef = admin.firestore().doc(`users/${userId}`);
                const userDoc = await userDocRef.get();
                const userData = userDoc.data();

                await userDocRef.update({
                    hasPendingFriendRequests: true,
                });

                if (!userData) {
                    console.error("User data not found for userId:", userId);
                    return;
                }

                if (!userData.pushToken)
                    return;

                const payload = {
                    notification: {
                        title: "New Friend Request",
                        body: "Someone wants to connect! " +
                            "Click to view their friend request!",
                    },
                    data: {
                        screen: "/friends/requests",
                        click_action: "FLUTTER_NOTIFICATION_CLICK",
                    },
                    token: userData.pushToken,
                };

                await admin.messaging().send(payload);
                console.log("Push sent to", userId);
            } catch (error) {
                console.error("Error sending push:", error);
            }
        },
    );

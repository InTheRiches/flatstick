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
        console.log("Fan out feed triggered, context: ", JSON.stringify(context));
        console.log("Fan out feed triggered, snap: ", JSON.stringify(snap.data()));
        const {userId} = snap.data.before._ref._path.segments[1];
        const {sessionId} = snap.data.before._ref._path.segments[3];
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

        const sessionData = snap.data.after;

        const feedItem = {
            authorId: userId,
            sessionId: sessionId,
            displayName: userData.displayName,
            summaryStats: sessionData.summaryStats, // or custom fields
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        };

        const batch = admin.firestore().batch();
        for (const friendId of friends) {
            const ref = admin.firestore().collection(`userFeed/${friendId}/feedItems`).doc();
            batch.set(ref, feedItem);
        }

        await batch.commit();
    });

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

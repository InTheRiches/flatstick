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

          console.log("New friend request:", request, "for userId:", userId);

          try {
            const userDoc = await admin.firestore()
                .doc(`users/${userId}`).get();
            const userData = userDoc.data();

            if (!userData) {
              console.error("User data not found for userId:", userId);
              return;
            }

            if (!userData.pushToken) {
              return;
            }

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

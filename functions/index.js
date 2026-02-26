const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

/**
 * Callable function to save CourseData to Firestore.
 * Only callable by privileged backend services, not directly by clients.
 *
 * Expects data: { courseData: { ... } }
 * Writes to: courses/{osmId}
 */
exports.saveCourseData = functions.https.onCall(async (data, context) => {
  // Only allow authenticated users with a specific claim/role (e.g., admin, server)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only privileged users can write course data. You are missing permissions to perform this action. Your auth: " + JSON.stringify(context.auth)
    );
  }

  const courseData = data.courseData;
  if (!courseData || typeof courseData.osmId !== "number") {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing or invalid courseData.osmId."
    );
  }

  // Add server timestamp for lastFetchedAt
  courseData.lastFetchedAt = Date.now();

  try {
    await admin.firestore().collection("courses").doc(String(courseData.osmId)).set(courseData);
    return { success: true };
  } catch (e) {
    throw new functions.https.HttpsError("internal", "Failed to save course data.");
  }
});

/**
 * Callable function to save PuttingGreenData to Firestore.
 * Only callable by privileged backend services, not directly by clients.
 *
 * Expects data: { osmGreenId: number, greenData: { ... } }
 * Writes to: puttingGreens/{osmGreenId}
 */
exports.savePuttingGreenData = functions.https.onCall(async (data, context) => {
  if (!context.auth || !context.auth.token || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Only privileged users can write putting green data."
    );
  }

  const { osmGreenId, greenData } = data;
  if (!greenData || typeof osmGreenId !== "number") {
    throw new functions.httpsHttpsError(
      "invalid-argument",
      "Missing or invalid osmGreenId."
    );
  }

  greenData.lastFetchedAt = Date.now();

  try {
    await admin.firestore().collection("puttingGreens").doc(String(osmGreenId)).set(greenData);
    return { success: true };
  } catch (e) {
    throw new functions.https.HttpsError("internal", "Failed to save putting green data.");
  }
});

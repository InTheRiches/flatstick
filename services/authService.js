// services/authService.js
import {
    createUserWithEmailAndPassword,
    getAuth,
    GoogleAuthProvider,
    OAuthProvider,
    signInWithCredential,
    signInWithEmailAndPassword
} from 'firebase/auth';
import {GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {doc, getDoc, getFirestore, setDoc} from 'firebase/firestore';
import {getDefaultData} from "@/utils/userUtils";

const auth = getAuth();
const firestore = getFirestore();

export const signIn = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user.getIdToken();
};

export const signOut = async () => {
    await auth.signOut();
    await GoogleSignin.signOut();
};

export const createEmailAccount = async (email, password, firstName, lastName, setLoading, setErrorCode, setInvalidEmail) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await setDoc(doc(firestore, `users/${user.uid}`), getDefaultData(firstName, lastName));
        return user.getIdToken();
    } catch (error) {
        setErrorCode(error.code);
        if (error.code === 'auth/email-already-in-use') setInvalidEmail(true);
        throw error;
    } finally {
        setLoading(false);
    }
}

// TODO when you cancel a google sign in, it keeps the loading screen up
export const googleSignIn = async () => {
    try {
        await GoogleSignin.hasPlayServices();
        const response = await GoogleSignin.signIn();
        if (!isSuccessResponse(response)) throw new Error('Sign in failed');
        const user = response.data;
        const credential = GoogleAuthProvider.credential(user.idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const userDoc = await getDoc(doc(firestore, `users/${userCredential.user.uid}`));
        if (!userDoc.exists()) {
            await setDoc(doc(firestore, `users/${userCredential.user.uid}`), getDefaultData(user.user.givenName, user.user.familyName || ''));
            return {token: userCredential.user.getIdToken(), data: getDefaultData(user.user.givenName, user.user.familyName || '')};
        }
        return {token: userCredential.user.getIdToken(), data: userDoc.data()};
    } catch (error) {
        if (isErrorWithCode(error)) {
            switch (error.code) {
                case statusCodes.IN_PROGRESS:
                    break;
                case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                    throw new Error('Play services not available or outdated');
                default:
                    throw new Error('An error occurred while trying to sign in with Google');
            }
        } else {
            throw new Error('An error occurred while trying to sign in with Google');
        }
    }
};

export const appleSignIn = async () => {
    try {
        const { identityToken, nonce, fullName } = await appleAuth.performRequest({
            requestedOperation: appleAuth.Operation.LOGIN,
            requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
        });
        if (!identityToken) throw new Error('Apple Sign-In failed: No identity token');
        const firstName = fullName?.givenName || 'Unknown';
        const lastName = fullName?.familyName || 'Unknown';
        const appleCredential = new OAuthProvider('apple.com').credential({ idToken: identityToken, rawNonce: nonce });
        const userCredential = await signInWithCredential(auth, appleCredential);
        const userDoc = await getDoc(doc(firestore, `users/${userCredential.user.uid}`));
        if (!userDoc.exists()) {
            await setDoc(doc(firestore, `users/${userCredential.user.uid}`), getDefaultData(firstName, lastName));
        }
        return userCredential.user.getIdToken();
    } catch (error) {
        if (error.code !== appleAuth.Error.CANCELED) {
            throw error;
        }
    }
};
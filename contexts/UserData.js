import {createContext, useContext, useEffect, useState} from "react";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    query,
    runTransaction
} from "firebase/firestore";
import {getAuth} from "firebase/auth";

const UserDataContext = createContext({
    userData: null,
    puttSessions: null,
    updateData: () => Promise.resolve(),
    refreshData: () => Promise.resolve(),
    initialize: () => Promise.resolve(),
});

// Custom hook to access statistical context
export function useUserData() {
    return useContext(UserDataContext);
}

export function UserDataProvider({children}) {
    const db = getFirestore();
    const auth = getAuth();

    const [userData, setUserData] = useState({});
    const [puttSessions, setPuttSessions] = useState([]);

    const initialize = () => {
        if (auth.currentUser === null) return;

        const docRef = doc(db, `users/${auth.currentUser.uid}`);

        getDoc(docRef).then((data) => {
            setUserData(data.data());
        }).catch((error) => {
            console.log("Error: " + error)
        });

        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"));

        getDocs(q).then((querySnapshot) => {
            let docs = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                docs.push(doc.data());
            });

            setPuttSessions(docs)
        }).catch((error) => {
            console.log("Error: " + error)
        });
    }

    const updateData = async (newData) => {
        const sfDocRef = doc(db, `users/${auth.currentUser.uid}`);

        runTransaction(db, async (transaction) => {
            const sfDoc = await transaction.get(sfDocRef);
            if (!sfDoc.exists()) {
                throw "Document does not exist!";
            }

            transaction.update(sfDocRef, newData);
        }).then(() => {
            console.log("Update stats successfully committed!");
        }).catch((e) => {
            console.log("Update stats transaction failed: ", e);
        });
    }

    const refreshData = async () => {
        const docRef = doc(db, `users/${auth.currentUser.uid}`);
        getDoc(docRef).then((data) => {
            setUserData(data.data());
        }).catch((error) => {
            console.log("Error: " + error)
        });

        const q = query(collection(db, "users/" + auth.currentUser.uid + "/sessions"));

        getDocs(q).then((querySnapshot) => {
            let docs = [];
            querySnapshot.forEach((doc) => {
                // doc.data() is never undefined for query doc snapshots
                docs.push(doc.data());
            });

            setPuttSessions(docs)
        }).catch((error) => {
            console.log("Error: " + error)
        });
    }

    return (
        <UserDataContext.Provider
            value={{
                userData: userData,
                puttSessions: puttSessions,
                updateData: updateData,
                refreshData: refreshData,
                initialize: initialize,
            }}>
            {children}
        </UserDataContext.Provider>
    );
}
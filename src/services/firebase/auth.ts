// src/app/services/firebase/auth.ts
import auth from "@react-native-firebase/auth"

export const firebaseAuth = () => auth()

export function signOut() {
  return auth().signOut()
}

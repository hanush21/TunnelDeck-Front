import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type Unsubscribe,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'
import { firebaseAuth, googleAuthProvider } from '@/shared/config/firebase'

export function subscribeToAuthState(callback: (user: User | null) => void): Unsubscribe {
  return onAuthStateChanged(firebaseAuth, callback)
}

export async function signInWithEmailPassword(email: string, password: string) {
  return signInWithEmailAndPassword(firebaseAuth, email, password)
}

export async function signInWithGoogle() {
  return signInWithPopup(firebaseAuth, googleAuthProvider)
}

export async function signOutSession() {
  await signOut(firebaseAuth)
}

export async function getCurrentIdToken(forceRefresh = false): Promise<string | null> {
  const user = firebaseAuth.currentUser
  if (!user) {
    return null
  }

  return user.getIdToken(forceRefresh)
}

import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthContext } from '../contexts/AuthContext';
import { createUserProfile, getUserProfile } from '../lib/firestore';

export function useAuth() {
  const { user, loading } = useAuthContext();

  const signInWithGoogle = async (): Promise<void> => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { uid, email, displayName, photoURL } = result.user;

    const existingProfile = await getUserProfile(uid);
    if (!existingProfile) {
      await createUserProfile(uid, email ?? '', displayName, photoURL);
    }
  };

  const signOut = async (): Promise<void> => {
    await firebaseSignOut(auth);
  };

  return { user, loading, signInWithGoogle, signOut };
}

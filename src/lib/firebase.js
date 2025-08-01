
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Pre-specified Google accounts that are allowed to access the system

// Fetch allowed emails from Firestore collection 'FBS_allowed_emails'
export const getAllowedEmails = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'FBS_allowed_emails'));
    return snapshot.docs.map(doc => (doc.data().email || '').trim());
  } catch (error) {
    console.error('Error fetching allowed emails:', error);
    return [];
  }
};

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Fetch allowed emails from Firestore
    const allowedEmails = await getAllowedEmails();
    if (!allowedEmails.includes(user.email)) {
      await signOut(auth);
      throw new Error('Unauthorized email address. Please contact administrator for access.');
    }
    return result;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

export const signOutUser = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// Firestore operations
export const addCustomerRecord = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'customers'), {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: auth.currentUser?.email || 'unknown'
    });
    return docRef;
  } catch (error) {
    console.error('Error adding customer record:', error);
    throw error;
  }
};

export const getCustomerRecords = async () => {
  try {
    const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting customer records:', error);
    throw error;
  }
};

export const updateCustomerRecord = async (id, data) => {
  try {
    const docRef = doc(db, 'customers', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
      updatedBy: auth.currentUser?.email || 'unknown'
    });
  } catch (error) {
    console.error('Error updating customer record:', error);
    throw error;
  }
};

export const deleteCustomerRecord = async (id) => {
  try {
    const docRef = doc(db, 'customers', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting customer record:', error);
    throw error;
  }
}; 
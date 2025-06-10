import { db, auth, isAdmin } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';

export interface Destination {
  id?: string;
  title: string;
  description: string;
  hashtags: string[];
  images: string[];
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  createdAt?: Timestamp;
  userId?: string;
  createdBy?: {
    email?: string;
  };
}

export const addDestination = async (destination: Omit<Destination, 'id'>, userId: string) => {
  try {
    const currentUser = auth.currentUser;
    const docRef = await addDoc(collection(db, 'destinations'), {
      ...destination,
      userId,
      createdAt: Timestamp.now(),
      createdBy: {
        email: currentUser?.email || null
      }
    });
    return { 
      id: docRef.id, 
      ...destination,
      createdBy: {
        email: currentUser?.email || null
      }
    };
  } catch (error) {
    console.error('Error adding destination:', error);
    throw error;
  }
};

export const getDestinations = async () => {
  try {
    const q = query(collection(db, 'destinations'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Destination[];
  } catch (error) {
    console.error('Error getting destinations:', error);
    throw error;
  }
};

export const deleteDestination = async (destinationId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to delete a destination');
    }

    // Get the destination document first to check permissions
    const destinationRef = doc(db, 'destinations', destinationId);
    const destinationDoc = await getDoc(destinationRef);
    
    if (!destinationDoc.exists()) {
      throw new Error('Destination not found');
    }

    const destinationData = destinationDoc.data();
    
    // Check if user has permission to delete
    if (!isAdmin(currentUser) && destinationData.userId !== currentUser.uid) {
      throw new Error('You do not have permission to delete this destination');
    }

    // If we get here, user has permission to delete
    await deleteDoc(destinationRef);
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
}; 
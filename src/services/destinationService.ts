import { db } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc } from 'firebase/firestore';

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
}

export const addDestination = async (destination: Omit<Destination, 'id'>, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, 'destinations'), {
      ...destination,
      userId,
      createdAt: Timestamp.now()
    });
    return { id: docRef.id, ...destination };
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
    await deleteDoc(doc(db, 'destinations', destinationId));
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
}; 
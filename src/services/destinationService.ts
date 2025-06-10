import { db, auth, isAdmin } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Destination {
  id: string;
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

// Function to compress and resize image
const compressImage = async (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 800;
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with 0.7 quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
      resolve(compressedBase64);
    };
    img.onerror = reject;
  });
};

export const addDestination = async (destination: Omit<Destination, 'id'>, userId: string) => {
  try {
    const currentUser = auth.currentUser;
    
    // Compress all images
    const compressedImages = await Promise.all(
      destination.images.map(image => compressImage(image))
    );
    
    // Create destination document with compressed images
    const docRef = await addDoc(collection(db, 'destinations'), {
      ...destination,
      images: compressedImages,
      userId,
      createdAt: Timestamp.now(),
      createdBy: {
        email: currentUser?.email || null
      }
    });
    
    return { 
      id: docRef.id, 
      ...destination,
      images: compressedImages,
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
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdBy: {
          email: data.createdBy?.email || null
        }
      } as Destination;
    });
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
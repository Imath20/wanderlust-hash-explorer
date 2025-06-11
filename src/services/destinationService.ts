import { db, auth, isAdmin } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';

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

// Function to estimate document size more accurately
const estimateDocumentSize = (data: any): number => {
  const jsonString = JSON.stringify(data);
  // Firebase adds some overhead, so we add 10% to be safe
  return Math.ceil(jsonString.length * 1.1);
};

// Function to ensure image is under size limit
const ensureImageSize = async (imageData: string, maxSizeBytes: number): Promise<string> => {
  const approximateBytes = Math.round((imageData.length * 3) / 4);
  if (approximateBytes <= maxSizeBytes) return imageData;

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Start with more aggressive compression
      let quality = 0.5; // Start with lower quality
      let maxDimension = Math.min(1000, Math.max(width, height)); // Start with smaller max dimension
      
      const tryCompress = () => {
        // Calculate new dimensions
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressed = canvas.toDataURL('image/jpeg', quality);
        const newSize = Math.round((compressed.length * 3) / 4);
        
        if (newSize > maxSizeBytes) {
          if (quality > 0.15) { // Allow for lower quality
            quality -= 0.2; // Reduce quality more aggressively
            return tryCompress();
          } else if (maxDimension > 500) { // Allow for smaller dimensions
            maxDimension = maxDimension * 0.5; // Reduce size more aggressively
            quality = 0.5; // Reset quality for the new size
            return tryCompress();
          } else {
            // If we can't reduce further, use the smallest possible version
            maxDimension = 500;
            quality = 0.15;
            return tryCompress();
          }
        }
        
        resolve(compressed);
      };
      
      tryCompress();
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageData;
  });
};

export const addDestination = async (destination: Omit<Destination, 'id'>, userId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to add a destination');
    }

    // Calculate max size per image to stay under Firestore limit
    const numImages = destination.images.length;
    const reservedSpace = 25000; // Reserve even more space for other fields
    const maxSizePerImage = Math.floor((900000 - reservedSpace) / numImages); // Use 900KB limit to be extra safe

    // Process images with size limit per image
    const processedImages = await Promise.all(
      destination.images.map(imageData => ensureImageSize(imageData, maxSizePerImage))
    );
    
    // Create the document data
    const docData = {
      ...destination,
      images: processedImages,
      userId,
      createdAt: Timestamp.now(),
      createdBy: {
        email: currentUser?.email || null
      }
    };

    // Estimate document size more accurately
    const estimatedSize = estimateDocumentSize(docData);
    if (estimatedSize >= 900000) { // Use 900KB as very safe limit
      console.warn('Document size estimation:', estimatedSize, 'bytes');
      throw new Error('Imaginile sunt în continuare prea mari după compresie. Te rugăm să încerci cu mai puține imagini.');
    }
    
    // Create destination document
    const docRef = await addDoc(collection(db, 'destinations'), docData);
    
    return { 
      id: docRef.id,
      ...destination,
      images: processedImages,
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

    // Delete the document
    await deleteDoc(destinationRef);
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
}; 
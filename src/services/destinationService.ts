import { db, auth, isAdmin } from '../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, Timestamp, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { uploadImage, deleteImage, getOptimizedImageUrl } from './imagekitService';

export interface Destination {
  id: string;
  title: string;
  description: string;
  hashtags: string[];
  images: string[]; // Acum vor fi URL-uri ImageKit
  imageIds?: string[]; // ID-urile imaginilor din ImageKit pentru ștergere
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

// Funcție pentru estimarea dimensiunii documentului
const estimateDocumentSize = (data: any): number => {
  const jsonString = JSON.stringify(data);
  return Math.ceil(jsonString.length * 1.1);
};

// Funcție pentru optimizarea imaginii înainte de upload
const optimizeImageForUpload = async (base64String: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Redimensionare la maxim 1200px
      const maxDimension = 1200;
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
        resolve(base64String); // Fallback la original
        return;
      }
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      
      // Compresie la 80% calitate
      const compressed = canvas.toDataURL('image/jpeg', 0.8);
      resolve(compressed);
    };
    img.onerror = () => resolve(base64String); // Fallback la original
    img.src = base64String;
  });
};

export const addDestination = async (destination: Omit<Destination, 'id'>, userId: string) => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to add a destination');
    }

    // Upload imaginile către ImageKit
    const uploadPromises = destination.images.map(async (imageData) => {
      if (imageData.startsWith('data:')) {
        // Optimizează imaginea înainte de upload
        const optimizedImage = await optimizeImageForUpload(imageData);
        const uploadResult = await uploadImage(optimizedImage);
        return {
          url: uploadResult.url,
          fileId: uploadResult.fileId
        };
      } else {
        // Dacă este deja un URL, păstrează-l
        return {
          url: imageData,
          fileId: null
        };
      }
    });

    const uploadResults = await Promise.all(uploadPromises);
    
    // Extrage URL-urile și ID-urile
    const imageUrls = uploadResults.map(result => result.url);
    const imageIds = uploadResults.map(result => result.fileId).filter(Boolean) as string[];
    
    // Creează datele documentului
    const docData = {
      ...destination,
      images: imageUrls,
      imageIds: imageIds.length > 0 ? imageIds : undefined, // Doar dacă există ID-uri
      userId,
      createdAt: Timestamp.now(),
      createdBy: {
        email: currentUser?.email || null
      }
    };

    // Estimează dimensiunea documentului
    const estimatedSize = estimateDocumentSize(docData);
    if (estimatedSize >= 900000) {
      console.warn('Document size estimation:', estimatedSize, 'bytes');
      throw new Error('Documentul este prea mare. Te rugăm să încerci cu mai puține imagini.');
    }
    
    // Creează documentul în Firestore
    const docRef = await addDoc(collection(db, 'destinations'), docData);
    
    return { 
      id: docRef.id,
      ...destination,
      images: imageUrls,
      imageIds,
      createdBy: {
        email: currentUser?.email || null
      }
    };
  } catch (error) {
    console.error('Error adding destination:', error);
    throw error;
  }
};

export const getDestinations = async (): Promise<Destination[]> => {
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

export const deleteDestination = async (destinationId: string): Promise<void> => {
  try {
    // Obține documentul pentru a șterge imaginile
    const docRef = doc(db, 'destinations', destinationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as Destination;
      
      // Șterge imaginile din ImageKit dacă există
      if (data.imageIds && data.imageIds.length > 0) {
        const deletePromises = data.imageIds.map(imageId => 
          deleteImage(imageId).catch(error => {
            console.warn(`Failed to delete image ${imageId}:`, error);
            // Continuă cu ștergerea documentului chiar dacă ștergerea imaginii eșuează
          })
        );
        
        await Promise.allSettled(deletePromises);
      }
    }
    
    // Șterge documentul din Firestore
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting destination:', error);
    throw error;
  }
};

// Funcție pentru obținerea URL-ului optimizat pentru afișare
export const getOptimizedDestinationImage = (imageUrl: string, width?: number, height?: number): string => {
  if (!imageUrl) return '';
  
  // Dacă este un URL ImageKit, optimizează-l
  if (imageUrl.includes('imagekit.io')) {
    return getOptimizedImageUrl(imageUrl, width, height, 80);
  }
  
  // Dacă este un URL extern (Unsplash etc.), returnează-l cu parametrii de optimizare
  if (imageUrl.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('fit', 'crop');
    params.append('crop', 'entropy');
    params.append('auto', 'format');
    params.append('q', '80');
    
    const separator = imageUrl.includes('?') ? '&' : '?';
    return `${imageUrl}${separator}${params.toString()}`;
  }
  
  // Pentru alte URL-uri, returnează originalul
  return imageUrl;
}; 
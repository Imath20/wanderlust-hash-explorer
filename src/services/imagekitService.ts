import ImageKit from 'imagekit';

// Configurare ImageKit
const imagekit = new ImageKit({
  publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '',
  privateKey: import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '',
});

// Extrag cheile pentru a le folosi direct
const publicKey = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY || '';
const privateKey = import.meta.env.VITE_IMAGEKIT_PRIVATE_KEY || '';
const urlEndpoint = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT || '';

export interface ImageKitResponse {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl: string;
  height: number;
  width: number;
  size: number;
  filePath: string;
}

// Funcție pentru optimizarea imaginii înainte de upload
const optimizeImage = (base64String: string, maxWidth: number = 1200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Redimensionare dacă este necesar
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Convertire la JPEG cu calitate optimizată
      const optimizedImage = canvas.toDataURL('image/jpeg', quality);
      resolve(optimizedImage);
    };
    img.onerror = () => resolve(base64String); // Fallback la original
  });
};

// Funcție pentru convertirea base64 la Blob
const base64ToBlob = (base64: string): Blob => {
  const arr = base64.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Funcție pentru generarea unui nume unic pentru fișier
const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `destination_${timestamp}_${randomString}.${extension}`;
};

// Funcție pentru generarea semnăturii de upload (simplificată)
const generateUploadSignature = (): { signature: string; expire: number; token: string } => {
  const timestamp = Math.floor(Date.now() / 1000);
  const expire = timestamp + 3600; // Expiră în 1 oră
  
  // Pentru moment, folosim o abordare simplificată
  // În producție, aceasta ar trebui să fie generată pe server
  return {
    signature: 'dummy_signature',
    expire,
    token: 'dummy_token',
  };
};

// Funcție principală pentru upload
export const uploadImage = async (base64Image: string, fileName?: string): Promise<ImageKitResponse> => {
  try {
    // Optimizează imaginea
    const optimizedImage = await optimizeImage(base64Image);
    
    // Convertește la Blob
    const blob = base64ToBlob(optimizedImage);
    
    // Generează nume unic pentru fișier
    const uniqueFileName = fileName || generateUniqueFileName('image.jpg');
    
    // Creează FormData pentru upload
    const formData = new FormData();
    formData.append('file', blob, uniqueFileName);
    formData.append('fileName', uniqueFileName);
    formData.append('folder', 'destinations'); // Folder în ImageKit
    
    // Pentru moment, folosim o abordare simplificată fără semnătură
    // În producție, ar trebui să folosești un backend pentru generarea semnăturii
    
    // Upload către ImageKit folosind cheia publică
    const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(privateKey + ':')}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error:', errorText);
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    return {
      fileId: result.fileId,
      name: result.name,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      height: result.height,
      width: result.width,
      size: result.size,
      filePath: result.filePath,
    };
  } catch (error) {
    console.error('Error uploading image to ImageKit:', error);
    throw new Error('Nu s-a putut încărca imaginea. Te rugăm să încerci din nou.');
  }
};

// Funcție pentru ștergerea unei imagini
export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${btoa(privateKey + ':')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting image from ImageKit:', error);
    throw new Error('Nu s-a putut șterge imaginea.');
  }
};

// Funcție pentru generarea URL-ului optimizat
export const getOptimizedImageUrl = (imageUrl: string, width?: number, height?: number, quality?: number): string => {
  if (!imageUrl) return '';
  
  // Dacă este deja un URL ImageKit, adaugă parametrii de optimizare
  if (imageUrl.includes('imagekit.io')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality) params.append('q', quality.toString());
    
    const separator = imageUrl.includes('?') ? '&' : '?';
    return params.toString() ? `${imageUrl}${separator}${params.toString()}` : imageUrl;
  }
  
  // Dacă este un URL extern, returnează ca atare
  return imageUrl;
};

// Funcție pentru validarea URL-ului ImageKit
export const isValidImageKitUrl = (url: string): boolean => {
  return url.includes('imagekit.io') || url.startsWith('data:');
}; 
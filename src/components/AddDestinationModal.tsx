import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { useDropzone } from 'react-dropzone';
import { FaImage } from 'react-icons/fa';
import { X, MapPin } from 'lucide-react';
import styles from './AddDestinationModal.module.css';
import { Destination } from '../services/destinationService';
import LocationPickerModal from './LocationPickerModal';

interface AddDestinationModalProps {
  show: boolean;
  onHide: () => void;
  onAdd: (destination: Omit<Destination, 'id'>) => void;
}

const MAX_IMAGE_SIZE = 600; // Reducem la 600px
const COMPRESSION_QUALITY = 0.6; // Reducem calitatea la 60%

const compressImage = (base64String: string): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Redimensionăm toate imaginile, indiferent de dimensiune
      if (width > height) {
        height = Math.round((height * MAX_IMAGE_SIZE) / width);
        width = MAX_IMAGE_SIZE;
      } else {
        width = Math.round((width * MAX_IMAGE_SIZE) / height);
        height = MAX_IMAGE_SIZE;
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compresie mai agresivă pentru toate imaginile
      const compressedImage = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
      
      // Verificăm dacă imaginea este încă prea mare și mai comprimăm o dată dacă este necesar
      if (compressedImage.length > 100000) { // Dacă e mai mare de ~100KB
        const secondCanvas = document.createElement('canvas');
        const secondCtx = secondCanvas.getContext('2d');
        const secondImg = new Image();
        secondImg.src = compressedImage;
        
        secondImg.onload = () => {
          // Reducem și mai mult dimensiunea pentru imaginile mari
          const finalWidth = Math.round(width * 0.8);
          const finalHeight = Math.round(height * 0.8);
          
          secondCanvas.width = finalWidth;
          secondCanvas.height = finalHeight;
          secondCtx?.drawImage(secondImg, 0, 0, finalWidth, finalHeight);
          
          resolve(secondCanvas.toDataURL('image/jpeg', COMPRESSION_QUALITY * 0.8));
        };
      } else {
        resolve(compressedImage);
      }
    };
  });
};

const AddDestinationModal: React.FC<AddDestinationModalProps> = ({ show, onHide, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; name: string }>({
    lat: 45.9432,
    lng: 24.9668,
    name: 'România'
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [numSlots, setNumSlots] = useState(3);
  const [images, setImages] = useState<string[]>(Array(3).fill(''));
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [currentHashtag, setCurrentHashtag] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [pendingNumSlots, setPendingNumSlots] = useState(numSlots);

  const handleImageDrop = (acceptedFiles: File[], slotIndex: number) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (!file.type.startsWith('image/')) {
      setError('Te rugăm să încarci doar fișiere imagine');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      const compressedImage = await compressImage(base64String);
      setImages(prev => {
        const newImages = [...prev];
        newImages[slotIndex] = compressedImage;
        return newImages;
      });
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleGlobalDrop = (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => file.type.startsWith('image/'));
    let processedCount = 0;

    const processFile = async (file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64String = reader.result as string;
          const compressedImage = await compressImage(base64String);
          resolve(compressedImage);
        };
        reader.readAsDataURL(file);
      });
    };

    const processAllFiles = async () => {
      const newImages = [...images];
      for (let i = 0; i < imageFiles.length && processedCount < numSlots; i++) {
        const emptyIndex = newImages.findIndex(img => img === '');
        if (emptyIndex === -1) break;

        const compressedImage = await processFile(imageFiles[i]);
        newImages[emptyIndex] = compressedImage;
        processedCount++;
      }
      setImages(newImages);
    };

    processAllFiles();
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = '';
      return newImages;
    });
  };

  const handleNumSlotsInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPendingNumSlots(Number(e.target.value));
  };

  const commitNumSlots = () => {
    const newNumSlots = Math.min(10, Math.max(1, Number(pendingNumSlots) || 1));
    setNumSlots(newNumSlots);
    setImages(prev => {
      const newImages = Array(newNumSlots).fill('');
      prev.forEach((img, i) => {
        if (i < newNumSlots) newImages[i] = img;
      });
      return newImages;
    });
  };

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentHashtag.trim()) {
      e.preventDefault();
      const hashtag = currentHashtag.trim().startsWith('#') ? 
        currentHashtag.trim() : 
        `#${currentHashtag.trim()}`;
      if (!hashtags.includes(hashtag)) {
        setHashtags([...hashtags, hashtag]);
      }
      setCurrentHashtag('');
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Te rugăm să introduci un titlu');
      return;
    }
    if (!description.trim()) {
      setError('Te rugăm să introduci o descriere');
      return;
    }
    if (!location.name) {
      setError('Te rugăm să selectezi o locație');
      return;
    }
    if (!images.some(img => img !== '')) {
      setError('Te rugăm să adaugi cel puțin o imagine');
      return;
    }

    setLoading(true);
    try {
      const filteredImages = images.filter(img => img !== '');
      await onAdd({
        title,
        description,
        hashtags,
        location,
        images: filteredImages
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a putut adăuga destinația');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setLocation({ lat: 45.9432, lng: 24.9668, name: 'România' });
    setHashtags([]);
    setImages(Array(numSlots).fill(''));
    setError('');
    setLoading(false);
    onHide();
  };

  const ImageUploadSlot: React.FC<{ index: number }> = ({ index }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => handleImageDrop(files, index),
      accept: { 'image/*': [] },
      multiple: false,
      onDragEnter: (e) => {
        e.stopPropagation();
      }
    });

    return (
      <div 
        {...getRootProps()} 
        className={`${styles.imageUploadSlot} ${isDragActive ? styles.dragActive : ''}`}
      >
        <input {...getInputProps()} />
        {images[index] ? (
          <div className={styles.imagePreviewContainer}>
            <img src={images[index]} alt={`Preview ${index + 1}`} className={styles.imagePreview} />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage(index);
              }}
              className={styles.removeImageButton}
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        ) : (
          <div className={styles.uploadPlaceholder}>
            <FaImage size={24} />
            <p>Click sau drag & drop</p>
          </div>
        )}
      </div>
    );
  };

  useEffect(() => { setPendingNumSlots(numSlots); }, [numSlots]);

  return (
    <>
      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>Adaugă o Nouă Destinație</Modal.Title>
        </Modal.Header>
        <Modal.Body onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const files = Array.from(e.dataTransfer.files);
          handleGlobalDrop(files);
        }} onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <div className="mb-3">
              <label className="form-label">
                Titlu <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Introdu titlul destinației"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Descriere <span className="text-danger">*</span>
              </label>
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descrie destinația"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">
                Imagini <span className="text-danger">*</span>
              </label>
              <div className="mb-2">
                <label className="form-label text-muted small">
                  Câte imagini vrei să încarci? (1-10)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="form-control"
                  min={1}
                  max={10}
                  step={1}
                  value={pendingNumSlots}
                  onChange={handleNumSlotsInput}
                  onBlur={commitNumSlots}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); commitNumSlots(); } }}
                />
                <button type="button" className="btn btn-sm btn-secondary ms-2" style={{marginTop: 4}} onClick={() => { setPendingNumSlots(1); setNumSlots(1); setImages(Array(1).fill('')); }}>Reset</button>
              </div>
              <div className={styles.imageUploadsContainer}>
                {Array.from({ length: numSlots }).map((_, index) => (
                  <ImageUploadSlot key={index} index={index} />
                ))}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Hashtag-uri</label>
              <input
                type="text"
                className="form-control"
                value={currentHashtag}
                onChange={(e) => setCurrentHashtag(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="Apasă Enter pentru a adăuga un hashtag"
              />
              {hashtags.length > 0 && (
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="badge bg-primary d-flex align-items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-2"
                        style={{ fontSize: '0.5rem' }}
                        onClick={() => removeHashtag(tag)}
                      />
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Locație</label>
              <button
                type="button"
                className="form-control text-start d-flex align-items-center justify-content-center"
                style={{
                  background: 'linear-gradient(to right, #3b82f6, #f97316)',
                  color: 'white',
                  border: 'none'
                }}
                onClick={() => setShowLocationPicker(true)}
              >
                <MapPin className="me-2" color="white" size={20} />
                Alege pe hartă
              </button>
              {location.name && (
                <div className="form-text">
                  Locație selectată: {location.name}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn"
                style={{
                  backgroundColor: '#25D366',
                  color: 'white'
                }}
                disabled={loading}
              >
                {loading ? 'Se adaugă...' : 'Salvează Destinația'}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <LocationPickerModal
        show={showLocationPicker}
        onHide={() => setShowLocationPicker(false)}
        onLocationSelect={(loc) => {
          setLocation(loc);
          setShowLocationPicker(false);
        }}
        initialLocation={location}
      />
    </>
  );
};

export default AddDestinationModal; 
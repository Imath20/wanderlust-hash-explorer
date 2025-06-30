# Configurarea ImageKit pentru Wanderlust Hash Explorer

## Pași pentru configurarea ImageKit

### 1. Creează un cont ImageKit
1. Mergi la [imagekit.io](https://imagekit.io) și creează un cont gratuit
2. După înregistrare, vei fi redirecționat către dashboard-ul ImageKit

### 2. Obține credențialele
În dashboard-ul ImageKit, găsește:
- **Public Key**: În secțiunea "Developer Options" > "Public Key"
- **Private Key**: În secțiunea "Developer Options" > "Private Key" 
- **URL Endpoint**: În secțiunea "Developer Options" > "URL Endpoint"

### 3. Configurează variabilele de mediu
Creează un fișier `.env` în rădăcina proiectului cu următoarele variabile:

```env
# Firebase Configuration (existente)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# ImageKit Configuration (noi)
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 4. Configurare pentru producție
Pentru securitate în producție, cheia privată ar trebui să fie gestionată pe server. 
Pentru moment, aplicația folosește o abordare simplificată pentru upload.

### 5. Testează configurarea
1. Rulează aplicația cu `npm run dev`
2. Încearcă să adaugi o destinație cu imagini
3. Verifică în dashboard-ul ImageKit dacă imaginile au fost încărcate

## Avantajele folosirii ImageKit

1. **Optimizare automată**: Imaginile sunt optimizate automat pentru diferite dimensiuni
2. **CDN global**: Livrare rapidă a imaginilor din toată lumea
3. **Transformări on-the-fly**: Redimensionare și compresie în timp real
4. **Costuri reduse**: Nu mai stochezi imagini mari în Firestore
5. **Performanță îmbunătățită**: Încărcare mai rapidă a paginilor

## Structura folderelor în ImageKit

Imaginile vor fi organizate în folderul `destinations/` în contul tău ImageKit, cu nume unice generate automat.

## Note importante

- Cheia privată nu ar trebui să fie expusă în frontend în producție
- Pentru o implementare completă, ar trebui să creezi un backend pentru generarea semnăturilor de upload
- ImageKit oferă 20GB de stocare și 20GB de transfer lunar în planul gratuit 
# Wanderlust Hash Explorer

O aplicație modernă pentru explorarea și partajarea destinațiilor de călătorie, construită cu React, TypeScript și Firebase.

## Caracteristici

- 🌍 **Explorare destinații**: Vizualizează destinații de călătorie cu imagini și descrieri
- 📸 **Upload imagini**: Încarcă imagini optimizate folosind ImageKit
- 🏷️ **Hashtags**: Organizează destinațiile cu hashtags personalizate
- 📍 **Locații**: Vezi destinațiile pe hartă interactivă
- 🔍 **Căutare**: Caută destinații după titlu, descriere sau hashtags
- 🌙 **Temă întunecată**: Suport pentru temă întunecată și deschisă
- 📱 **Responsive**: Design optimizat pentru toate dispozitivele

## Tehnologii utilizate

- **Frontend**: React, TypeScript, Vite
- **UI**: shadcn-ui, Tailwind CSS
- **Backend**: Firebase (Firestore, Authentication)
- **Imagini**: ImageKit pentru optimizare și CDN
- **Hartă**: Leaflet cu React Leaflet
- **Deployment**: Lovable

## Configurare

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare Firebase

Creează un proiect Firebase și configurează:
- Authentication
- Firestore Database
- Storage (opțional, pentru backup)

### 3. Configurare ImageKit

1. Creează un cont la [imagekit.io](https://imagekit.io)
2. Obține credențialele din dashboard:
   - Public Key
   - Private Key  
   - URL Endpoint

### 4. Variabile de mediu

Creează un fișier `.env` în rădăcina proiectului:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# ImageKit Configuration
VITE_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
VITE_IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
VITE_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 5. Rulare aplicație

```bash
npm run dev
```

## Structura proiectului

```
src/
├── components/          # Componente React
│   ├── ui/             # Componente UI (shadcn-ui)
│   ├── AddDestinationModal.tsx
│   ├── TravelCard.tsx
│   └── TravelModal.tsx
├── contexts/           # Context-uri React
│   └── AuthContext.tsx
├── services/           # Servicii și API-uri
│   ├── destinationService.ts
│   └── imagekitService.ts
├── pages/              # Pagini principale
│   ├── Index.tsx
│   └── NotFound.tsx
└── lib/                # Utilități și configurare
    ├── firebase.ts
    └── utils.ts
```

## Avantajele ImageKit

- **Optimizare automată**: Imaginile sunt optimizate automat pentru diferite dimensiuni
- **CDN global**: Livrare rapidă a imaginilor din toată lumea
- **Transformări on-the-fly**: Redimensionare și compresie în timp real
- **Costuri reduse**: Nu mai stochezi imagini mari în Firestore
- **Performanță îmbunătățită**: Încărcare mai rapidă a paginilor

## Deployment

### Cu Lovable

1. Deschide [Lovable](https://lovable.dev)
2. Navighează la proiectul tău
3. Click pe Share -> Publish

### Cu domeniu personalizat

Pentru a conecta un domeniu personalizat:
1. Navighează la Project > Settings > Domains
2. Click pe Connect Domain
3. Urmează instrucțiunile pentru configurarea DNS

## Contribuții

1. Fork proiectul
2. Creează o branch pentru feature (`git checkout -b feature/AmazingFeature`)
3. Commit schimbările (`git commit -m 'Add some AmazingFeature'`)
4. Push la branch (`git push origin feature/AmazingFeature`)
5. Deschide un Pull Request

## Licență

Acest proiect este licențiat sub MIT License.

## Suport

Pentru suport și întrebări, deschide un issue în repository-ul GitHub.

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDRfFLv4zBc41mgqQkM75E2cUbhdIozfZ4",
  authDomain: "firehawk-tech-project-21b64.firebaseapp.com",
  projectId: "firehawk-tech-project-21b64",
  storageBucket: "firehawk-tech-project-21b64.firebasestorage.app",
  messagingSenderId: "641221493418",
  appId: "1:641221493418:web:c77dd86ce7c8a2598306d3"
};

export const appConfig: ApplicationConfig = {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth())
  ]

};

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyAMUTmFOP3VrDbmY5D4vzbKB91rpG-GDtY',
  authDomain: 'gsi-landingpage.firebaseapp.com',
  projectId: 'gsi-landingpage',
  storageBucket: 'gsi-landingpage.firebasestorage.app',
  messagingSenderId: '817765462554',
  appId: '1:817765462554:web:c88a14e727bd74646717a3',
  measurementId: 'G-DJ3C6Q7YZ0',
};

export const firebaseApp = initializeApp(firebaseConfig);

export let analytics: Analytics | null = null;
isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(firebaseApp);
    }
  })
  .catch(() => {
    analytics = null;
  });

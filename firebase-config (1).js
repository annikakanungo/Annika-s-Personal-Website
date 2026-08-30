// =========================================================
// TEACHING NOTE: these values are safe to be public.
// Unlike a real password, Firebase's apiKey/projectId etc. are
// meant to be visible in client-side code — they just identify
// WHICH project to talk to. The actual security comes from the
// Firestore rules (firestore.rules) checked on Google's servers,
// not from hiding these values. This is a common point of
// confusion worth walking through with students.
// =========================================================
const firebaseConfig = {
  apiKey: "AIzaSyAmKYPjbeFNOD8JhQPhsynlyZcRowHWGfo",
  authDomain: "annika-s-website.firebaseapp.com",
  projectId: "annika-s-website",
  storageBucket: "annika-s-website.firebasestorage.app",
  messagingSenderId: "982408615453",
  appId: "1:982408615453:web:179254f7f9a216efe1d8f4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

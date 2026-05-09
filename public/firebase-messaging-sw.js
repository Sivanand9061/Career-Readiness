importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCM36IIwe-fcXnKw_RMOJeXl0Zthfol4a4",
  authDomain: "tasknotif-2b734.firebaseapp.com",
  projectId: "tasknotif-2b734",
  storageBucket: "tasknotif-2b734.firebasestorage.app",
  messagingSenderId: "145610089305",
  appId: "1:145610089305:web:4921c555e52226f532a248"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/favicon.ico",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

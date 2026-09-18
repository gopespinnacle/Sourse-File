importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdkE",
  authDomain: "gopes-pinnacle-academy.firebaseapp.com",
  projectId: "gopes-pinnacle-academy",
  storageBucket: "gopes-pinnacle-academy.firebasestorage.app",
  messagingSenderId: "445901611941",
  appId: "1:445901611941:web:67b591a372eb5c52fb3e4c",
  measurementId: "G-M6GFBXPN4S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {

    console.log(
        "[firebase-messaging-sw.js] Background message:",
        payload
    );

    const notificationTitle =
        payload.notification?.title || "GPA Messenger";

    const notificationOptions = {
        body:
            payload.notification?.body ||
            "You have a new message.",
        icon: "/favicon.ico",
        data: {
            url:
                payload.fcmOptions?.link ||
                "https://www.gopespinnacle.com/gpa-messenger.html"
        }
    };

    self.registration.showNotification(
        notificationTitle,
        notificationOptions
    );
});

self.addEventListener("notificationclick", function(event) {

    event.notification.close();

    const targetUrl =
        event.notification?.data?.url ||
        "https://www.gopespinnacle.com/gpa-messenger.html";

    event.waitUntil(
        clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(function(clientList) {

            for (const client of clientList) {

                if ("focus" in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }

            if (clients.openWindow) {
                return clients.openWindow(targetUrl);
            }
        })
    );
});
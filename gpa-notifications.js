// ==========================================
// GPA PUSH NOTIFICATIONS - FCM
// ==========================================

const GPA_FIREBASE_CONFIG = {
    apiKey: "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdkE",
    authDomain: "gopes-pinnacle-academy.firebaseapp.com",
    projectId: "gopes-pinnacle-academy",
    storageBucket: "gopes-pinnacle-academy.firebasestorage.app",
    messagingSenderId: "445901611941",
    appId: "1:445901611941:web:67b591a372eb5c52fb3e4c"
};

// Your Firebase Web Push public VAPID key
const GPA_VAPID_KEY = "BI6SwaAVxhppd01Rt8EKJGV4Gl8qQ55irUIsvSX4FGirZ5FbvyB800fyQDYQxy0KqVYKExn43I5vIiky2_XTThU";


// ------------------------------------------
// Load Firebase
// ------------------------------------------

if (!window.firebase) {
    console.error("Firebase SDK is not loaded.");
} else {

    try {

        if (!firebase.apps.length) {
            firebase.initializeApp(GPA_FIREBASE_CONFIG);
        }

        const messaging = firebase.messaging();


        // ------------------------------------------
        // Register Service Worker
        // ------------------------------------------

        async function registerGPAMessaging() {

    try {

        // ------------------------------------------
        // Browser support
        // ------------------------------------------

        if (!("serviceWorker" in navigator)) {

            console.warn(
                "Service Worker is not supported."
            );

            return;

        }


        if (!("Notification" in window)) {

            console.warn(
                "Browser notifications are not supported."
            );

            return;

        }


        // ------------------------------------------
        // Register GPA Firebase Service Worker
        // ------------------------------------------

        const registration =
            await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js",
                {
                    scope: "/"
                }
            );


        console.log(
            "GPA Firebase Service Worker registered:",
            registration.scope
        );


        // ------------------------------------------
        // Make sure Service Worker is ready
        // ------------------------------------------

        await navigator.serviceWorker.ready;


        // ------------------------------------------
        // Notification permission
        // ------------------------------------------

        let permission =
            Notification.permission;


        if (permission === "default") {

            permission =
                await Notification.requestPermission();

        }


        console.log(
            "GPA Notification permission:",
            permission
        );


        if (permission !== "granted") {

            console.warn(
                "GPA notification permission was not granted."
            );

            return;

        }


        // ------------------------------------------
        // Get latest FCM token
        // ------------------------------------------

        const currentToken =
            await messaging.getToken({

                vapidKey:
                    GPA_VAPID_KEY,

                serviceWorkerRegistration:
                    registration

            });


        if (!currentToken) {

            console.warn(
                "No FCM registration token available."
            );

            return;

        }


        console.log(
            "GPA FCM TOKEN:",
            currentToken
        );


        // ------------------------------------------
        // Get logged-in GPA user token
        // ------------------------------------------

        const token =
            sessionStorage.getItem("token") ||
            localStorage.getItem("token");


        if (!token) {

            console.warn(
                "No GPA login token found. Notification registration will be retried."
            );

            setTimeout(
                registerGPAMessaging,
                5000
            );

            return;

        }


        // ------------------------------------------
        // Register FCM token with GPA backend
        // ------------------------------------------

        const response =
            await fetch(
                "https://academy-backend-eatl.onrender.com/api/messenger/fcm-token",
                {
                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            "Bearer " + token

                    },

                    body: JSON.stringify({

                        token:
                            currentToken,

                        platform:
                            "web"

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "FCM token registration failed. HTTP " +
                response.status
            );

        }


        const data =
            await response.json();


        console.log(
            "GPA FCM token registration:",
            data
        );


        // ------------------------------------------
        // Confirm registration
        // ------------------------------------------

        if (data.success) {

            console.log(
                "✅ GPA PUSH NOTIFICATIONS READY"
            );

        }

    }

    catch (error) {

        console.error(
            "GPA FCM REGISTRATION ERROR:",
            error
        );

        // Retry automatically after temporary failure

        setTimeout(
            registerGPAMessaging,
            10000
        );

    }

}


        // ------------------------------------------
        // Foreground notification
        // ------------------------------------------

        messaging.onMessage(async function(payload) {

    console.log(
        "GPA foreground notification:",
        payload
    );

    const title =
        payload.notification?.title ||
        "GPA Messenger";

    const body =
        payload.notification?.body ||
        "You have a new message.";

    try {

        if (
            Notification.permission !==
            "granted"
        ) {

            console.warn(
                "GPA notification permission is not granted."
            );

            return;

        }


        // ------------------------------------------
        // SHOW NOTIFICATION THROUGH SERVICE WORKER
        // ------------------------------------------

        const registration =
            await navigator.serviceWorker.ready;


        await registration.showNotification(
            title,
            {
                body: body,

                icon:
                    "/favicon.ico",

                badge:
                    "/favicon.ico",

                tag:
                    "gpa-messenger",

                renotify:
                    true,

                data: {
                    url:
                        payload.data?.url ||
                        "https://www.gopespinnacle.com/gpa-messenger.html",

                    conversationId:
                        payload.data?.conversationId ||
                        ""
                }
            }
        );


        console.log(
            "✅ GPA FOREGROUND NOTIFICATION DISPLAYED"
        );

    }
    catch (error) {

        console.error(
            "❌ GPA FOREGROUND NOTIFICATION ERROR:",
            error
        );

    }

});


        // Start registration
        registerGPAMessaging();

    }

    catch (error) {

        console.error(
            "GPA Firebase initialization error:",
            error
        );

    }

}
// ==========================================
// GPA PUSH FIREBASE — NEW SYSTEM
// ==========================================

(function () {

    "use strict";


    // ==========================================
    // FIREBASE CONFIG
    // ==========================================

    const GPA_FIREBASE_CONFIG = {

        apiKey:
            "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdk",

        authDomain:
            "gopes-pinnacle-academy.firebaseapp.com",

        projectId:
            "gopes-pinnacle-academy",

        storageBucket:
            "gopes-pinnacle-academy.firebasestorage.app",

        messagingSenderId:
            "445901611941",

        appId:
            "1:445901611941:web:67b591a372eb5c52fb3e4c"

    };


    // ==========================================
    // VAPID KEY
    // ==========================================

    const GPA_VAPID_KEY =
        "BI6SwaAVxhppd01Rt8EKJGV4Gl8qQ55irUIsvSX4FGirZ5FbvyB800fyQDYQxy0KqVYKExn43I5vIiky2_XTThU";


    // ==========================================
    // INITIALIZE
    // ==========================================

    async function initializeGPAPushFirebase() {

        try {

            // ----------------------------------
            // CHECK FIREBASE
            // ----------------------------------

            if (!window.firebase) {

                console.error(
                    "❌ GPA PUSH: Firebase SDK not loaded."
                );

                return;

            }


            // ----------------------------------
            // INITIALIZE FIREBASE
            // ----------------------------------

            if (!firebase.apps.length) {

                firebase.initializeApp(
                    GPA_FIREBASE_CONFIG
                );

            }


            const messaging =
                firebase.messaging();


            // ----------------------------------
            // CHECK SERVICE WORKER
            // ----------------------------------

            if (!("serviceWorker" in navigator)) {

                console.error(
                    "❌ GPA PUSH: Service Worker not supported."
                );

                return;

            }


            // ----------------------------------
            // REGISTER SERVICE WORKER
            // ----------------------------------

            const registration =
                await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    {
                        scope: "/"
                    }
                );


            console.log(
                "✅ GPA PUSH SERVICE WORKER:",
                registration.scope
            );


            await navigator.serviceWorker.ready;


            // ----------------------------------
            // CHECK NOTIFICATION SUPPORT
            // ----------------------------------

            if (!("Notification" in window)) {

                console.error(
                    "❌ GPA PUSH: Notifications not supported."
                );

                return;

            }


            // ----------------------------------
            // REQUEST PERMISSION
            // ----------------------------------

            let permission =
                Notification.permission;


            if (permission === "default") {

                permission =
                    await Notification.requestPermission();

            }


            console.log(
                "GPA PUSH PERMISSION:",
                permission
            );


            if (permission !== "granted") {

                console.warn(
                    "⚠️ GPA PUSH: Notification permission not granted."
                );

                return;

            }


            // ----------------------------------
            // GET FCM TOKEN
            // ----------------------------------

            const currentToken =
                await messaging.getToken({

                    vapidKey:
                        GPA_VAPID_KEY,

                    serviceWorkerRegistration:
                        registration

                });


            if (!currentToken) {

                console.error(
                    "❌ GPA PUSH: FCM token was not generated."
                );

                return;

            }


            console.log(
                "✅ GPA PUSH FCM TOKEN GENERATED:",
                currentToken
            );


            // ----------------------------------
            // DEVICE ID
            // ----------------------------------

            let deviceId =
                localStorage.getItem(
                    "gpaPushDeviceId"
                );


            if (!deviceId) {

                deviceId =
                    crypto.randomUUID();

                localStorage.setItem(
                    "gpaPushDeviceId",
                    deviceId
                );

            }


            console.log(
                "GPA PUSH DEVICE ID:",
                deviceId
            );


            // ----------------------------------
            // REGISTER WITH NEW BACKEND
            // ----------------------------------

            if (
                typeof window.registerGPAPushToken !==
                "function"
            ) {

                console.error(
                    "❌ GPA PUSH: Registration function not available."
                );

                return;

            }


            const registered =
                await window.registerGPAPushToken(
                    currentToken,
                    "web",
                    deviceId
                );


            if (registered) {

                console.log(
                    "=========================================="
                );

                console.log(
                    "✅ GPA PUSH SYSTEM REGISTERED"
                );

                console.log(
                    "=========================================="
                );

            }

        }
        catch (error) {

            console.error(
                "❌ GPA PUSH FIREBASE ERROR:",
                error
            );

        }

    }


    // ==========================================
    // MAKE AVAILABLE GLOBALLY
    // ==========================================

   window.initializeGPAPushFirebase =
    initializeGPAPushFirebase;


// ==========================================
// START GPA PUSH SYSTEM
// ==========================================

initializeGPAPushFirebase();


})();
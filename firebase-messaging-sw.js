
/* GPA Messenger - Firebase Cloud Messaging service worker */

importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js"
);
importScripts(
    "https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js"
);

// Replace these placeholder values with your copied Firebase Web App config.
firebase.initializeApp({
    apiKey: "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdkE",
    authDomain: "gopes-pinnacle-academy.firebaseapp.com",
    projectId: "gopes-pinnacle-academy",
    storageBucket: "gopes-pinnacle-academy.firebasestorage.app",
    messagingSenderId: "445901611941",
    appId: "1:445901611941:web:0f595217e4780839fb3e4c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
    console.log(
        "[GPA FCM] Background message received:",
        payload
    );

    const notification = payload.notification || {};
    const data = payload.data || {};

    const title =
        notification.title ||
        data.title ||
        "Gopes Pinnacle Academy";

    const options = {
        body:
            notification.body ||
            data.body ||
            "You have a new message",
        icon: "/images/logo.png",
        badge: "/images/logo.png",
        data: {
            url: data.url || "/messenger/messenger.html",
            conversationId: data.conversationId || ""
        },
        tag: data.messageId
            ? "gpa-message-" + data.messageId
            : "gpa-messenger-message"
    };

    return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
    event.notification.close();

    const data = event.notification.data || {};
    const targetUrl = new URL(
        data.url || "/messenger/messenger.html",
        self.location.origin
    ).href;

    event.waitUntil(
        (async function () {
            const windows = await self.clients.matchAll({
                type: "window",
                includeUncontrolled: true
            });

            for (const client of windows) {
                if (new URL(client.url).origin === self.location.origin) {
                    await client.focus();

                    if ("navigate" in client) {
                        await client.navigate(targetUrl);
                    }

                    client.postMessage({
                        type: "GPA_OPEN_CONVERSATION",
                        conversationId: data.conversationId || ""
                    });

                    return;
                }
            }

            await self.clients.openWindow(targetUrl);
        })()
    );
});

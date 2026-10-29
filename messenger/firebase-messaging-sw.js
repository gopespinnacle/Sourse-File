importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdkE",
    authDomain: "gopes-pinnacle-academy.firebaseapp.com",
    projectId: "gopes-pinnacle-academy",
    storageBucket: "gopes-pinnacle-academy.firebasestorage.app",
    messagingSenderId: "445901611941",
    appId: "1:445901611941:web:0f595217e4780839fb3e4c"
});

const messaging = firebase.messaging();


messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const isCall = data.type === "incoming_call";

  const title = isCall
    ? "📞 Incoming GPA Audio Call"
    : (data.title ||
       payload.notification?.title ||
       "Gopes Pinnacle Academy");

  const options = {
    body: isCall
      ? `${data.callerName || "Someone"} is calling you. Open GPA Messenger to answer.`
      : (data.body ||
         payload.notification?.body ||
         "You have a new message."),

    icon: "/images/logo.png",

    tag: isCall
      ? `gpa-call-${data.callId || "incoming"}`
      : undefined,

    requireInteraction: isCall,

    data: {
      ...data,
      url: data.url || "/messenger/messenger.html"
    }
  };

  return self.registration.showNotification(title, options);
});


self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const targetUrl = new URL(
        event.notification.data?.url || "/messenger/messenger.html",
        self.location.origin
    ).href;

    event.waitUntil((async () => {
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
                return;
            }
        }

        await self.clients.openWindow(targetUrl);
    })());
});
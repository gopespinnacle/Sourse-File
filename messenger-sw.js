/* GPA Messenger service worker: handles Web Push while the page is hidden/closed. */
self.addEventListener("push", (event) => {
    let payload = {};
    try { payload = event.data ? event.data.json() : {}; }
    catch (_) { payload = { body: event.data ? event.data.text() : "You have a new message" }; }

    event.waitUntil((async () => {
        // Avoid duplicate popups if a GPA page is currently visible. The page's
        // Socket.IO notification handler covers background-tab notification.
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const visibleClient = windows.some((client) => client.visibilityState === "visible" && client.focused);
        if (visibleClient) return;

        const title = payload.title || "Gopes Pinnacle Academy";
        const options = {
            body: payload.body || "You have a new message",
            icon: payload.icon || "/images/logo.png",
            badge: payload.badge || "/images/logo.png",
            tag: payload.tag || (payload.data && payload.data.messageId ? "gpa-message-" + payload.data.messageId : "gpa-messenger-message"),
            renotify: false,
            data: payload.data || { url: "/messenger/messenger.html" }
        };
        await self.registration.showNotification(title, options);
    })());
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const data = event.notification.data || {};
    const targetUrl = new URL(data.url || "/messenger/messenger.html", self.location.origin).href;
    event.waitUntil((async () => {
        const windows = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        for (const client of windows) {
            if (new URL(client.url).origin === self.location.origin) {
                await client.focus();
                if ("navigate" in client) await client.navigate(targetUrl);
                client.postMessage({ type: "GPA_OPEN_CONVERSATION", conversationId: data.conversationId || "" });
                return;
            }
        }
        await self.clients.openWindow(targetUrl);
    })());
});

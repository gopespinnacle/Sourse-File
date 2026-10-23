/* GPA Messenger Web Push + desktop notification registration. */
(function () {
    "use strict";

    const BACKEND_URL = "https://academy-backend-eatl.onrender.com";
    const SW_URL = "/messenger-sw.js";

    function getToken() {
        return localStorage.getItem("token") || sessionStorage.getItem("token") || "";
    }
    function decodeUserId() {
        try {
            const token = getToken();
            const part = token.split(".")[1];
            if (!part) return "";
            const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - base64.length % 4) % 4);
            const payload = JSON.parse(atob(padded));
            return String(payload.id || payload._id || payload.userId || payload.sub || "");
        } catch (_) { return ""; }
    }
    function urlBase64ToUint8Array(base64String) {
        const padding = "=".repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
        const raw = atob(base64);
        const output = new Uint8Array(raw.length);
        for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
        return output;
    }

    
async function registerGPAFCMToken() {
    const authToken =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        "";

    if (!authToken) {
        console.warn("[GPA FCM] User is not logged in.");
        return false;
    }

    if (!window.firebase || !firebase.messaging) {
        console.error("[GPA FCM] Firebase SDK is not loaded.");
        return false;
    }

    try {
        // Initialize Firebase only once.
        const firebaseConfig = {
            apiKey: "AIzaSyCBpiA8270xJXQiLfreO-F4GqKdWhXXdkE",
            authDomain: "gopes-pinnacle-academy.firebaseapp.com",
            projectId: "gopes-pinnacle-academy",
            storageBucket: "gopes-pinnacle-academy.firebasestorage.app",
            messagingSenderId: "445901611941",
            appId: "1:445901611941:web:0f595217e4780839fb3e4c"
        };

        const app =
            firebase.apps.length > 0
                ? firebase.app()
                : firebase.initializeApp(firebaseConfig);

        const messaging = firebase.messaging(app);

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.warn("[GPA FCM] Notification permission was not granted.");
            return false;
        }

        const registration = await navigator.serviceWorker.ready;

        const vapidKey = "BI6SwaAVxhppd01Rt8EKJGV4Gl8qQ55irUIsvSX4FGirZ5FbvyB800fyQDYQxy0KqVYKExn43I5vIiky2_XTThU";

        const fcmToken = await messaging.getToken({
            vapidKey,
            serviceWorkerRegistration: registration
        });

        if (!fcmToken) {
            console.error("[GPA FCM] Firebase did not return a token.");
            return false;
        }

        const response = await fetch(
            BACKEND_URL + "/api/fcm/register-token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + authToken
                },
                body: JSON.stringify({ fcmToken })
            }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Backend could not save the FCM token."
            );
        }

        console.log("[GPA FCM] Browser token registered successfully.");
        return true;
    } catch (error) {
        console.error("[GPA FCM] Registration failed:", error);
        return false;
    }
}


    const notifications = {
        initialized: false,
        currentUserId: "",
        activeConversationId: "",
        pushEnabled: false,
        button: null,

        async initialize() {
            if (this.initialized) return this;
            this.initialized = true;
            this.currentUserId = decodeUserId();
            if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
                console.warn("[GPA WEB PUSH] This browser does not support Web Push notifications.");
                return this;
            }
            this.activeConversationId = String(window.GPAMessengerConversationId || "");
            try {
                await navigator.serviceWorker.register(SW_URL, { scope: "/" });
                console.log("[GPA WEB PUSH] Service worker registered.");
            } catch (error) {
                console.error("[GPA WEB PUSH] Service worker registration failed:", error);
            }
            this.addButton();
            await this.refreshSubscriptionState();
            return this;
        },

        addButton() {
            const header = document.querySelector(".gpa-primary-messenger-header");
            if (!header || this.button) return;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "gpa-web-notifications-enable";
            button.textContent = "Enable Desktop Notifications";
            button.style.cssText = "float:right;margin:0 12px;padding:8px 12px;border:1px solid #d5dced;border-radius:8px;background:#fff;color:#23468c;font-weight:600;cursor:pointer;font-size:12px;";
            button.addEventListener("click", () => this.enablePush());
            header.appendChild(button);
            this.button = button;
        },

        async refreshSubscriptionState() {
            if (!this.button) return;
            if (Notification.permission === "denied") {
                this.button.textContent = "Allow Notifications in Browser Settings";
                return;
            }
            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription && Notification.permission === "granted") {
                    // Re-register on login/page load so the server can recover
                    // if its subscription record was removed or restored.
                    const response = await fetch(BACKEND_URL + "/api/messenger/push/subscribe", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
                        body: JSON.stringify({ subscription: subscription.toJSON() })
                    });
                    if (response.ok) {
                        this.pushEnabled = true;
                        this.button.textContent = "Desktop Notifications Enabled";
                        this.button.disabled = true;
                        this.button.style.opacity = "0.75";
                    }
                }
            } catch (error) {
                console.warn("[GPA WEB PUSH] Could not inspect subscription:", error.message);
            }
        },

        async enablePush() {
            if (!getToken()) {
                alert("Please sign in again before enabling desktop notifications.");
                return;
            }
            if (Notification.permission === "denied") {
                alert("Notifications are blocked for this site. Allow them in your browser's site settings, then try again.");
                return;
            }
            try {
                
const permission = await Notification.requestPermission();

if (permission !== "granted") {
    if (this.button) {
        this.button.textContent = "Notifications Permission Needed";
    }
    return;
}

// Register this browser with Firebase Cloud Messaging.
const fcmRegistered = await registerGPAFCMToken();

if (!fcmRegistered) {
    console.warn(
        "[GPA FCM] Registration failed; continuing with existing Web Push."
    );
}

                const registration = await navigator.serviceWorker.ready;
                let subscription = await registration.pushManager.getSubscription();
                if (!subscription) {
                    const keyResponse = await fetch(BACKEND_URL + "/api/messenger/push/vapid-public-key");
                    const keyData = await keyResponse.json();
                    if (!keyResponse.ok || !keyData.publicKey) throw new Error(keyData.message || "Server Web Push key is not configured.");
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey)
                    });
                }
                const response = await fetch(BACKEND_URL + "/api/messenger/push/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + getToken() },
                    body: JSON.stringify({ subscription: subscription.toJSON() })
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) throw new Error(result.message || "The server could not save this device.");
                this.pushEnabled = true;
                if (this.button) {
                    this.button.textContent = "Desktop Notifications Enabled";
                    this.button.disabled = true;
                    this.button.style.opacity = "0.75";
                }
                alert("Desktop notifications are enabled on this device.");
            } catch (error) {
                console.error("[GPA WEB PUSH] Could not enable notifications:", error);
                alert("Could not enable desktop notifications. " + (error.message || "Please try again."));
            }
        },

        setCurrentUser(userId) { this.currentUserId = userId ? String(userId) : decodeUserId(); },
        setActiveConversation(conversationId) { this.activeConversationId = conversationId ? String(conversationId) : ""; },

        handleIncomingMessage(message) {
            // Socket notification is the fallback for an open but backgrounded tab.
            // When Web Push is registered, the service worker owns background/closed delivery.
            if (!message || !("Notification" in window) || Notification.permission !== "granted") return;
            if (this.pushEnabled) return;
            const userId = this.currentUserId || decodeUserId();
            if (!userId || String(message.receiverId || "") !== userId) return;
            const title = message.senderName || message.sender?.name || message.sender?.fullName || "New message";
            const body = String(message.text || "You have a new message").slice(0, 160);
            const notification = new Notification(title, { body, icon: "/images/logo.png", tag: "gpa-messenger-" + String(message.id || message.messageId || Date.now()) });
            notification.onclick = () => { window.focus(); notification.close(); };
        }
    };

    window.GPAMessengerWebNotifications = notifications;
    document.addEventListener("DOMContentLoaded", () => notifications.initialize());
})();

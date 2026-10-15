
/*
============================================================
GPA MESSENGER — WEB NOTIFICATIONS
============================================================
Responsibilities:
- Request browser notification permission
- Show incoming message notifications
- Avoid notifying for messages sent by the current user
- Avoid notifications while the user is viewing the active chat
- Reuse the existing Messenger Socket.IO connection
============================================================
*/

(function () {
    "use strict";

    const GPAMessengerWebNotifications = {
        initialized: false,
        currentUserId: null,
        activeConversationId: null,

        initialize() {
            if (this.initialized) return this;

            if (!("Notification" in window)) {
                console.warn(
                    "[GPA WEB NOTIFICATIONS] Browser notifications are unsupported."
                );
                return this;
            }

            this.initialized = true;

            console.log(
                "[GPA WEB NOTIFICATIONS] Module initialized."
            );

            return this;
        },

        requestPermission() {
            if (!("Notification" in window)) {
                return Promise.resolve(false);
            }

            if (Notification.permission === "granted") {
                return Promise.resolve(true);
            }

            if (Notification.permission === "denied") {
                console.warn(
                    "[GPA WEB NOTIFICATIONS] Permission is blocked in browser settings."
                );
                return Promise.resolve(false);
            }

            return Notification.requestPermission().then(
                (permission) => permission === "granted"
            );
        },

        setCurrentUser(userId) {
            this.currentUserId = userId
                ? String(userId)
                : null;
        },

        setActiveConversation(conversationId) {
            this.activeConversationId = conversationId
                ? String(conversationId)
                : null;
        },

        handleIncomingMessage(message) {
            if (!message || typeof message !== "object") {
                return;
            }

            if (
                !("Notification" in window) ||
                Notification.permission !== "granted"
            ) {
                return;
            }

            const senderId =
                message.senderId ||
                message.sender?._id ||
                message.sender?.id ||
                message.sender;

            // Do not notify the person who sent the message.
            if (
                this.currentUserId &&
                senderId &&
                String(senderId) === this.currentUserId
            ) {
                return;
            }

            const conversationId =
                message.conversationId ||
                message.conversation?._id ||
                message.conversation?.id;

            // Suppress notification when this conversation
            // is already open and the browser tab is visible.
            if (
                document.visibilityState === "visible" &&
                conversationId &&
                this.activeConversationId &&
                String(conversationId) ===
                    this.activeConversationId
            ) {
                return;
            }

            const senderName =
                message.senderName ||
                message.sender?.name ||
                message.sender?.fullName ||
                "New message";

            const messageText =
                message.text ||
                message.message ||
                message.content ||
                "You received a new message.";

            const notification = new Notification(
                String(senderName),
                {
                    body: String(messageText).slice(0, 180),
                    tag: conversationId
                        ? "gpa-chat-" + conversationId
                        : undefined,
                    icon: "/favicon.ico"
                }
            );

            notification.onclick = () => {
                window.focus();
                notification.close();

                // Open the messenger page if it has a known URL.
                // Conversation navigation can be connected after
                // checking the existing page routing.
            };
        }
    };

    window.GPAMessengerWebNotifications =
        GPAMessengerWebNotifications;

    document.addEventListener("DOMContentLoaded", () => {
        GPAMessengerWebNotifications.initialize();
    });
})();

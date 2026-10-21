/*
============================================================
GPA MESSENGER — WEB NOTIFICATIONS
============================================================
- Uses the existing Messenger Socket.IO connection.
- Requests permission only after the user clicks Enable Notifications.
- Notifies only when the current user is the message recipient.
- Suppresses notifications when the matching conversation is visible.
============================================================
*/

(function () {
    "use strict";

    const GPAMessengerWebNotifications = {
        initialized: false,
        currentUserId: null,
        activeConversationId: null,
        enableButton: null,

        getToken() {
            return localStorage.getItem("token") ||
                sessionStorage.getItem("token");
        },

        readCurrentUserId() {
            if (this.currentUserId) return this.currentUserId;

            const token = this.getToken();
            if (!token) return null;

            try {
                const payloadPart = token.split(".")[1];
                if (!payloadPart) return null;

                const normalized = payloadPart
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");

                const payload = JSON.parse(atob(normalized));
                this.currentUserId = payload.id
                    ? String(payload.id)
                    : null;
            } catch (error) {
                console.warn(
                    "[GPA WEB NOTIFICATIONS] Could not read login token."
                );
            }

            return this.currentUserId;
        },

        initialize() {
            if (this.initialized) return this;

            if (!("Notification" in window)) {
                console.warn(
                    "[GPA WEB NOTIFICATIONS] Browser notifications are unsupported."
                );
                return this;
            }

            this.initialized = true;
            this.activeConversationId =
                window.GPAMessengerConversationId
                    ? String(window.GPAMessengerConversationId)
                    : null;

            this.addEnableButton();
            this.updateButtonState();

            console.log(
                "[GPA WEB NOTIFICATIONS] Module initialized."
            );

            return this;
        },

        addEnableButton() {
            const header = document.querySelector(
                ".gpa-primary-messenger-header"
            );

            if (!header || this.enableButton) return;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "gpa-web-notifications-enable";
            button.textContent = "Enable Notifications";
            button.style.cssText =
                "float:right;margin:0 12px;padding:8px 12px;" +
                "border:1px solid #d5dced;border-radius:8px;" +
                "background:#fff;color:#23468c;font-weight:600;" +
                "cursor:pointer;font-size:12px;";

            button.addEventListener("click", async () => {
                const granted = await this.requestPermission();

                if (granted) {
                    button.textContent = "Notifications Enabled";
                    button.disabled = true;
                    button.style.cursor = "default";
                    button.style.opacity = "0.75";
                } else if (Notification.permission === "denied") {
                    button.textContent = "Allow in Browser Settings";
                    button.disabled = true;
                    button.style.cursor = "default";
                } else {
                    button.textContent = "Enable Notifications";
                }
            });

            header.appendChild(button);
            this.enableButton = button;
        },

        updateButtonState() {
            if (!this.enableButton || !("Notification" in window)) return;

            if (Notification.permission === "granted") {
                this.enableButton.textContent = "Notifications Enabled";
                this.enableButton.disabled = true;
                this.enableButton.style.cursor = "default";
                this.enableButton.style.opacity = "0.75";
            } else if (Notification.permission === "denied") {
                this.enableButton.textContent = "Allow in Browser Settings";
                this.enableButton.disabled = true;
                this.enableButton.style.cursor = "default";
            }
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
            this.currentUserId = userId ? String(userId) : null;
        },

        setActiveConversation(conversationId) {
            this.activeConversationId = conversationId
                ? String(conversationId)
                : null;
        },

        handleIncomingMessage(message) {
            if (!message || typeof message !== "object") return;
            if (!("Notification" in window)) return;
            if (Notification.permission !== "granted") return;

            const currentUserId = this.readCurrentUserId();
            if (!currentUserId) return;

            // The backend message should identify the actual recipient.
            // Do not notify unless this logged-in user is the recipient.
            if (message.receiverId) {
                if (String(message.receiverId) !== currentUserId) return;
            } else {
                // Fallback only when sender identity is explicitly available.
                const senderId = message.senderId ||
                    message.sender?._id ||
                    message.sender?.id;

                if (!senderId || String(senderId) === currentUserId) return;
            }

            const conversationId =
                message.conversationId ||
                message.conversation?._id ||
                message.conversation?.id;

            const activeConversationId =
                window.GPAMessengerConversationId ||
                this.activeConversationId;

            // No notification when this conversation is open in the
            // visible Messenger tab.
            if (
                document.visibilityState === "visible" &&
                conversationId &&
                activeConversationId &&
                String(conversationId) === String(activeConversationId)
            ) {
                return;
            }

            let senderName =
                message.senderName ||
                message.sender?.name ||
                message.sender?.fullName ||
                message.sender?.username;

            if (!senderName && message.senderId &&
                Array.isArray(window.GPAMessengerContacts)) {
                const contact = window.GPAMessengerContacts.find(
                    (item) =>
                        String(item._id) === String(message.senderId)
                );
                if (contact) senderName = contact.name;
            }

            const messageText =
                message.text ||
                message.message ||
                message.content ||
                "You received a new message.";

            try {
                const notification = new Notification(
                    String(senderName || "GPA Messenger"),
                    {
                        body: String(messageText).slice(0, 180),
                        tag: conversationId
                            ? "gpa-chat-" + String(conversationId)
                            : undefined,
                        icon: "/favicon.ico"
                    }
                );

                notification.onclick = () => {
                    window.focus();
                    notification.close();
                };
            } catch (error) {
                console.error(
                    "[GPA WEB NOTIFICATIONS] Could not show notification:",
                    error
                );
            }
        }
    };

    window.GPAMessengerWebNotifications =
        GPAMessengerWebNotifications;

    function initializeNotifications() {
        GPAMessengerWebNotifications.initialize();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initializeNotifications,
            { once: true }
        );
    } else {
        initializeNotifications();
    }
})();

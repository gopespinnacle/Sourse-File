/**
 * GPA MESSENGER — SOCKET CLIENT
 * Complete replacement module compatible with existing backend event names.
 */
(function () {
    "use strict";

    const BACKEND_URL = "https://academy-backend-eatl.onrender.com";

    function decodeTokenPayload(token) {
        if (!token || typeof token !== "string") return null;
        try {
            const part = token.split(".")[1];
            if (!part) return null;
            const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
            return JSON.parse(atob(padded));
        } catch (error) {
            console.error("[GPA CHAT SOCKET] Could not decode login token.", error);
            return null;
        }
    }

    function getToken() {
        return sessionStorage.getItem("token") || localStorage.getItem("token") || "";
    }

    function getCurrentUserId() {
        const payload = decodeTokenPayload(getToken());
        const id = payload && (payload.id || payload._id || payload.userId || payload.sub);
        if (id) window.GPACurrentUserId = String(id);
        return id ? String(id) : "";
    }

    function normalizeId(value) {
        if (value == null || value === "") return "";
        if (typeof value === "object") return String(value._id || value.id || value.userId || "");
        return String(value);
    }

    function directionFor(message, currentUserId) {
        const senderId = normalizeId(
            message.senderId ?? message.sender?._id ?? message.sender?.id ?? message.sender?.userId ?? message.fromUserId
        );
        if (currentUserId && senderId) return senderId === currentUserId ? "outgoing" : "incoming";
        return String(message.direction || "").toLowerCase() === "outgoing" ? "outgoing" : "incoming";
    }

    class PrimaryUserChatSocket {
        constructor() {
            this.socket = null;
            this.connected = false;
            this.pendingHistoryConversationId = "";
        }

        initialize() {
            if (typeof window.io !== "function") {
                console.error("[GPA CHAT SOCKET] Socket.IO client script is not loaded.");
                return;
            }
            const token = getToken();
            if (!token) {
                console.error("[GPA CHAT SOCKET] Login token is missing.");
                return;
            }

            this.socket = window.io(BACKEND_URL, {
                transports: ["websocket", "polling"],
                withCredentials: true,
                auth: { token }
            });

            this.socket.on("connect", () => {
                this.connected = true;
                console.log("[GPA CHAT SOCKET] Connected:", this.socket.id);
                const conversationId = window.GPAMessengerConversationId || this.pendingHistoryConversationId;
                if (conversationId) this.loadConversationHistory(conversationId);
            });

            this.socket.on("disconnect", (reason) => {
                this.connected = false;
                console.warn("[GPA CHAT SOCKET] Disconnected:", reason);
            });

            this.socket.on("connect_error", (error) => {
                this.connected = false;
                console.error("[GPA CHAT SOCKET] Connection error:", error.message || error);
            });

            this.socket.on("gpa:primary:notification:message", (message) => {
                const notifier = window.GPAMessengerWebNotifications;
                if (notifier && typeof notifier.handleIncomingMessage === "function") {
                    notifier.handleIncomingMessage(message);
                }
            });

            this.socket.on("gpa:primary:message:received", (message) => {
                // Backend confirmation only; the optimistic bubble is already shown.
                if (!message) return;
                const conversationId = String(message.conversationId || "");
                if (conversationId !== String(window.GPAMessengerConversationId || "")) return;
                if (message.id && message.deliveryStatus && window.GPAPrimaryUserChat) {
                    window.GPAPrimaryUserChat.updateMessageStatus(message.id, message.deliveryStatus);
                }
            });

            this.socket.on("gpa:primary:message:status", (receipt) => {
                if (!receipt) return;
                if (String(receipt.conversationId) !== String(window.GPAMessengerConversationId || "")) return;
                const chat = window.GPAPrimaryUserChat;
                if (chat && typeof chat.updateMessageStatus === "function") {
                    chat.updateMessageStatus(receipt.messageId, receipt.deliveryStatus);
                }
            });

            this.socket.on("gpa:primary:conversation:message", (message) => {
                if (!message) return;
                if (String(message.conversationId || "") !== String(window.GPAMessengerConversationId || "")) return;
                // Backend includes socketId. Ignore the same socket's own broadcast.
                if (message.socketId && this.socket && message.socketId === this.socket.id) return;

                const chat = window.GPAPrimaryUserChat;
                if (!chat || typeof chat.displayMessage !== "function") return;

                const currentUserId = getCurrentUserId();
                const direction = directionFor(message, currentUserId);
                const messageId = message.id || message.messageId || message._id;

                chat.displayMessage({
                    id: messageId,
                    messageId,
                    conversationId: message.conversationId,
                    senderId: normalizeId(message.senderId || message.sender?._id || message.sender?.id),
                    receiverId: normalizeId(message.receiverId || message.receiver?._id || message.receiver?.id),
                    sender: message.sender,
                    text: message.text,
                    createdAt: message.sentAt || message.receivedAt || message.createdAt,
                    direction,
                    deliveryStatus: message.deliveryStatus || "sent"
                });

                // Acknowledge only messages actually addressed to this logged-in user.
                if (
                    direction === "incoming" && this.socket && this.socket.connected &&
                    messageId && message.conversationId
                ) {
                    this.socket.emit("gpa:primary:message:delivered", {
                        messageId,
                        conversationId: message.conversationId
                    });
                    this.socket.emit("gpa:primary:message:read", {
                        messageId,
                        conversationId: message.conversationId
                    });
                }
            });

            this.socket.on("gpa:primary:message:history:received", (messages) => {
                if (!Array.isArray(messages)) {
                    console.warn("[GPA CHAT SOCKET] Invalid message history received.");
                    return;
                }
                const chat = window.GPAPrimaryUserChat;
                if (!chat || typeof chat.displayMessage !== "function") return;

                const currentUserId = getCurrentUserId();
                messages.forEach((message) => {
                    if (!message) return;
                    const senderId = normalizeId(message.senderId || message.sender?._id || message.sender?.id);
                    const receiverId = normalizeId(message.receiverId || message.receiver?._id || message.receiver?.id);
                    const direction = directionFor(message, currentUserId);
                    const status = message.readAt || message.read === true || message.deliveryStatus === "read"
                        ? "read"
                        : message.deliveredAt || message.deliveryStatus === "delivered"
                            ? "delivered"
                            : message.deliveryStatus || "sent";
                    const id = message.messageId || message.id || message._id;

                    chat.displayMessage({
                        id,
                        messageId: id,
                        conversationId: message.conversationId || window.GPAMessengerConversationId,
                        senderId,
                        receiverId,
                        sender: message.sender,
                        text: message.text,
                        createdAt: message.sentAt || message.createdAt,
                        direction,
                        deliveryStatus: status
                    });

                    if (direction === "incoming" && id && window.GPAMessengerConversationId && this.socket?.connected) {
                        this.socket.emit("gpa:primary:message:delivered", {
                            messageId: id,
                            conversationId: window.GPAMessengerConversationId
                        });
                        this.socket.emit("gpa:primary:message:read", {
                            messageId: id,
                            conversationId: window.GPAMessengerConversationId
                        });
                    }
                });
            });

            console.log("[GPA CHAT SOCKET] Module initialized.");
        }

        loadConversationHistory(conversationId) {
            if (!conversationId) return;
            this.pendingHistoryConversationId = String(conversationId);
            if (!this.socket || !this.connected) return;
            this.socket.emit("gpa:primary:conversation:join", { conversationId: String(conversationId) });
            this.socket.emit("gpa:primary:message:history", { conversationId: String(conversationId) });
        }

        sendMessage(message) {
            if (!this.socket || !this.connected) {
                console.error("[GPA CHAT SOCKET] Socket is not connected. Message was not sent to backend.");
                return false;
            }
            const conversation = window.GPAMessengerConversation;
            const conversationId = window.GPAMessengerConversationId || conversation?._id;
            const currentUserId = getCurrentUserId();
            if (!conversationId || !currentUserId) {
                console.error("[GPA CHAT SOCKET] Conversation or authenticated user ID is missing.");
                return false;
            }
            const participants = Array.isArray(conversation?.participants) ? conversation.participants : [];
            const receiverId = normalizeId(window.GPAMessengerReceiverId) || participants
                .map(normalizeId)
                .find((id) => id && id !== currentUserId) || "";
            if (!receiverId) {
                console.error("[GPA CHAT SOCKET] Receiver ID could not be determined.");
                return false;
            }
            this.socket.emit("gpa:primary:message", {
                id: message.id,
                text: String(message.text || "").trim(),
                sender: "primary-user",
                senderId: currentUserId,
                receiverId,
                conversationId: String(conversationId),
                receivedAt: new Date().toISOString()
            });
            return true;
        }
    }

    function start() {
        if (window.GPAPrimaryUserSocket) return;
        const socketModule = new PrimaryUserChatSocket();
        window.GPAPrimaryUserSocket = socketModule;
        socketModule.initialize();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();

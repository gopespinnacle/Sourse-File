/**
 * GPA MESSENGER — PRIMARY CHAT UI
 * Complete replacement module.
 * Direction rule: authenticated current user sent it => RIGHT;
 * otherwise => LEFT. The same rule is used for optimistic, live and history messages.
 */
(function () {
    "use strict";

    function decodeTokenPayload(token) {
        if (!token || typeof token !== "string") return null;
        try {
            const part = token.split(".")[1];
            if (!part) return null;
            const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
            const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
            return JSON.parse(atob(padded));
        } catch (error) {
            console.warn("[GPA CHAT] Could not decode login token.", error);
            return null;
        }
    }

    function getCurrentUserId() {
        const explicit = window.GPACurrentUserId;
        if (explicit) return String(explicit).trim();
        const token = sessionStorage.getItem("token") || localStorage.getItem("token");
        const payload = decodeTokenPayload(token);
        const id = payload && (payload.id || payload._id || payload.userId || payload.sub);
        if (id) {
            window.GPACurrentUserId = String(id);
            return String(id).trim();
        }
        return "";
    }

    function normalizeId(value) {
        if (value == null || value === "") return "";
        if (typeof value === "object") {
            return String(value._id || value.id || value.userId || "").trim();
        }
        return String(value).trim();
    }

    function getSenderId(message) {
        return normalizeId(
            message.senderId ??
            message.sender?._id ??
            message.sender?.id ??
            message.sender?.userId ??
            message.fromUserId ??
            message.from
        );
    }

    class PrimaryUserChat {
        constructor() {
            this.conversation = document.getElementById("gpaPrimaryConversation");
            this.input = document.getElementById("gpaPrimaryMessageInput");
            this.sendButton = document.getElementById("gpaPrimarySendButton");
            this.renderedIds = new Set();

            this.isTyping = false;
this.typingTimer = null;
        }

        initialize() {
            if (!this.conversation || !this.input || !this.sendButton) {
                console.error("[GPA CHAT] Required chat elements are missing.");
                return;
            }
            this.sendButton.addEventListener("click", () => this.sendMessage());
            this.input.addEventListener("keydown", (event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    this.sendMessage();
                }
            });
            this.input.addEventListener("input", () => {
    const socketModule = window.GPAPrimaryUserSocket;
    if (!socketModule || typeof socketModule.sendTyping !== "function") return;

    if (!this.isTyping) {
        this.isTyping = true;
        socketModule.sendTyping(true);
    }

    clearTimeout(this.typingTimer);

    this.typingTimer = setTimeout(() => {
        this.isTyping = false;
        socketModule.sendTyping(false);
    }, 1200);
});
            getCurrentUserId();
            console.log("[GPA CHAT] Chat UI ready.");
        }

        sendMessage() {
            const text = String(this.input.value || "").trim();
            if (!text) return;

            const currentUserId = getCurrentUserId();
            const conversation = window.GPAMessengerConversation;
            const conversationId = window.GPAMessengerConversationId || conversation?._id;
            if (!conversationId) {
                console.warn("[GPA CHAT] Select a conversation before sending a message.");
                return;
            }
            if (!currentUserId) {
                console.error("[GPA CHAT] Cannot identify the logged-in user from the login token.");
                return;
            }

            const message = {
                id: this.createMessageId(),
                messageId: null,
                conversationId: String(conversationId),
                senderId: currentUserId,
                receiverId: normalizeId(window.GPAMessengerReceiverId),
                text,
                sender: "primary-user",
                createdAt: new Date().toISOString(),
                direction: "outgoing",
                deliveryStatus: "sent"
            };

            // Render immediately. Sender ID is included so the same direction logic applies.
            this.displayMessage(message);
            this.input.value = "";
            this.input.focus();

            const socketModule = window.GPAPrimaryUserSocket;
            if (socketModule && typeof socketModule.sendMessage === "function") {
                socketModule.sendMessage(message);
            } else {
                console.error("[GPA CHAT] Socket module is unavailable; message was shown locally only.");
            }
        }

        displayMessage(message) {
            if (!this.conversation || !message) return null;

            const id = normalizeId(message.id || message.messageId || message._id);
            if (id && this.renderedIds.has(id)) return null;

            const currentUserId = getCurrentUserId();
            const senderId = getSenderId(message);
            let direction;

            // Sender identity is authoritative for live and stored messages.
            if (currentUserId && senderId) {
                direction = senderId === currentUserId ? "outgoing" : "incoming";
            } else {
                direction = String(message.direction || "").toLowerCase() === "outgoing"
                    ? "outgoing"
                    : "incoming";
                if (!senderId && !message.direction) {
                    console.warn("[GPA CHAT] Message direction could not be verified; defaulting left.", message);
                }
            }

            const row = document.createElement("div");
            row.className = `gpa-primary-message-row ${direction}`;
            if (id) {
                row.dataset.messageId = id;
                this.renderedIds.add(id);
            }

            const bubble = document.createElement("div");
            bubble.className = "gpa-primary-message-bubble";

            const text = document.createElement("span");
text.className = "gpa-primary-message-text";
text.textContent = String(message.text || "");
bubble.appendChild(text);

// Display the message sent time.
const timestamp = document.createElement("span");
timestamp.className = "gpa-primary-message-time";

const sentTime = message.sentAt || message.createdAt || message.receivedAt;
const sentDate = sentTime ? new Date(sentTime) : null;

timestamp.textContent =
    sentDate && !Number.isNaN(sentDate.getTime())
        ? sentDate.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true
          })
        : "";

bubble.appendChild(timestamp);

            if (direction === "outgoing") {
                const tick = document.createElement("span");
                tick.className = "gpa-primary-message-status";
                this.setTick(tick, message.deliveryStatus || "sent");
                bubble.appendChild(tick);
            }

            row.appendChild(bubble);
            this.conversation.appendChild(row);
            this.conversation.scrollTop = this.conversation.scrollHeight;
            return row;
        }

        setTick(tick, status) {
            tick.classList.remove("delivered", "read");
            tick.dataset.status = status;
            tick.textContent = (status === "delivered" || status === "read") ? "✓✓" : "✓";
            tick.setAttribute("aria-label", status === "read" ? "Read" : status === "delivered" ? "Delivered" : "Sent");
            if (status === "delivered" || status === "read") tick.classList.add(status);
        }

        updateMessageStatus(messageId, deliveryStatus) {
            if (!messageId || !this.conversation) return;
            const row = Array.from(this.conversation.querySelectorAll(".gpa-primary-message-row"))
                .find((item) => item.dataset.messageId === String(messageId));
            const tick = row && row.querySelector(".gpa-primary-message-status");
            if (tick) this.setTick(tick, deliveryStatus || "sent");
        }

        showTypingIndicator(data) {
    if (!this.conversation || !data) return;

    // Remove any previous typing indicator.
    const existing = this.conversation.querySelector(
        ".gpa-primary-typing-indicator"
    );

    if (existing) existing.remove();

    // Only display the indicator while the other user is typing.
    if (data.isTyping !== true) return;

    const indicator = document.createElement("div");
    indicator.className =
        "gpa-primary-message-row incoming gpa-primary-typing-indicator";

    const bubble = document.createElement("div");
    bubble.className = "gpa-primary-message-bubble";

    const text = document.createElement("span");
    text.className = "gpa-primary-message-text";
    text.textContent = "Typing…";

    bubble.appendChild(text);
    indicator.appendChild(bubble);
    this.conversation.appendChild(indicator);
    this.conversation.scrollTop = this.conversation.scrollHeight;

    // Automatically remove the indicator if a stop event is missed.
    clearTimeout(this.typingIndicatorTimer);

    this.typingIndicatorTimer = setTimeout(() => {
        indicator.remove();
    }, 3000);
}

        clearConversation() {
            if (this.conversation) this.conversation.replaceChildren();
            this.renderedIds.clear();
        }

        createMessageId() {
            return `primary_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
        }
    }

    function start() {
        if (window.GPAPrimaryUserChat) return;
        const chat = new PrimaryUserChat();
        window.GPAPrimaryUserChat = chat;
        chat.initialize();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start, { once: true });
    } else {
        start();
    }
})();

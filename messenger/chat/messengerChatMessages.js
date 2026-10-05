// ============================================================
// GPA MESSENGER - CHAT MESSAGES
// ============================================================
// Purpose:
// - Render chat messages
// - Display sent and received messages
// - Append new messages
// - Clear messages
// - Scroll to latest message
//
// IMPORTANT:
// - No API calls
// - No Socket.IO
// - No message sending
// - No conversation loading
// - No permission logic
// - No read-status logic
//
// Other modules handle:
// - History       -> messengerChatHistory.js
// - Sending       -> messengerChatComposer.js
// - Realtime      -> messengerChatSocket.js
// - Window        -> messengerChatWindow.js
// ============================================================


const GPAMessengerChatMessages = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    container: null,

    currentUserId: null,


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize(
        container = null
    ) {

        if (this.initialized) {

            console.log(
                "[GPA CHAT MESSAGES] Already initialized."
            );

            return this;

        }


        if (typeof container === "string") {

            this.container =
                document.getElementById(container);

        } else {

            this.container = container;

        }


        if (!this.container) {

            console.warn(
                "[GPA CHAT MESSAGES] Message container not available yet."
            );

            return this;

        }


        this.initialized = true;


        console.log(
            "[GPA CHAT MESSAGES] Initialized."
        );


        return this;

    },


    // ========================================================
    // SET CURRENT USER
    // ========================================================

    setCurrentUser(userId) {

        this.currentUserId =
            userId ? String(userId) : null;


        console.log(
            "[GPA CHAT MESSAGES] Current user set:",
            this.currentUserId
        );

    },


    // ========================================================
    // SET CONTAINER
    // ========================================================

    setContainer(container) {

        if (typeof container === "string") {

            this.container =
                document.getElementById(container);

        } else {

            this.container = container;

        }


        if (this.container) {

            this.initialized = true;

        }


        return this.container;

    },


    // ========================================================
    // CLEAR MESSAGES
    // ========================================================

    clear() {

        if (!this.container) {

            console.warn(
                "[GPA CHAT MESSAGES] Cannot clear. Container not available."
            );

            return;

        }


        this.container.innerHTML = "";


        console.log(
            "[GPA CHAT MESSAGES] Messages cleared."
        );

    },


    // ========================================================
    // RENDER MESSAGE LIST
    // ========================================================

    renderMessages(
        messages = [],
        currentUserId = null
    ) {

        if (!this.container) {

            console.warn(
                "[GPA CHAT MESSAGES] Cannot render. Container not available."
            );

            return;

        }


        if (!Array.isArray(messages)) {

            console.warn(
                "[GPA CHAT MESSAGES] Invalid messages list."
            );

            return;

        }


        if (currentUserId) {

            this.setCurrentUser(currentUserId);

        }


        this.container.innerHTML = "";


        if (messages.length === 0) {

            this.renderEmptyState();

            return;

        }


        messages.forEach(
            (message) => {

                this.appendMessage(
                    message,
                    false
                );

            }
        );


        this.scrollToBottom();


        console.log(
            "[GPA CHAT MESSAGES] Messages rendered:",
            messages.length
        );

    },


    // ========================================================
    // APPEND MESSAGE
    // ========================================================

    appendMessage(
        message,
        scroll = true
    ) {

        if (!this.container) {

            console.warn(
                "[GPA CHAT MESSAGES] Cannot append. Container not available."
            );

            return null;

        }


        if (!message) {

            console.warn(
                "[GPA CHAT MESSAGES] Empty message received."
            );

            return null;

        }


        const messageElement =
            this.createMessageElement(message);


        if (!messageElement) {

            return null;

        }


        this.container.appendChild(
            messageElement
        );


        if (scroll) {

            this.scrollToBottom();

        }


        console.log(
            "[GPA CHAT MESSAGES] Message appended:",
            message._id || message.id || "unknown"
        );


        return messageElement;

    },


    // ========================================================
    // CREATE MESSAGE ELEMENT
    // ========================================================

    createMessageElement(message) {

        const senderId =
            message.sender?._id ||
            message.sender?.id ||
            message.sender ||
            null;


        const isMine =
            this.currentUserId &&
            senderId &&
            String(senderId) ===
            String(this.currentUserId);


        const wrapper =
            document.createElement("div");


        wrapper.className =
            isMine
                ? "gpa-messenger-message gpa-messenger-message-sent"
                : "gpa-messenger-message gpa-messenger-message-received";


        const bubble =
            document.createElement("div");


        bubble.className =
            "gpa-messenger-message-bubble";


        const messageText =
            document.createElement("div");


        messageText.className =
            "gpa-messenger-message-text";


        messageText.textContent =
            message.message || "";


        bubble.appendChild(
            messageText
        );


        const time =
            document.createElement("div");


        time.className =
            "gpa-messenger-message-time";


        time.textContent =
            this.formatTime(
                message.createdAt
            );


        bubble.appendChild(
            time
        );


        wrapper.appendChild(
            bubble
        );


        return wrapper;

    },


    // ========================================================
    // EMPTY STATE
    // ========================================================

    renderEmptyState() {

        if (!this.container) {

            return;

        }


        const empty =
            document.createElement("div");


        empty.className =
            "gpa-messenger-chat-empty";


        empty.textContent =
            "No messages yet. Start the conversation.";


        this.container.appendChild(
            empty
        );

    },


    // ========================================================
    // FORMAT TIME
    // ========================================================

    formatTime(value) {

        if (!value) {

            return "";

        }


        const date =
            new Date(value);


        if (Number.isNaN(
            date.getTime()
        )) {

            return "";

        }


        return date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );

    },


    // ========================================================
    // SCROLL TO BOTTOM
    // ========================================================

    scrollToBottom() {

        if (!this.container) {

            return;

        }


        this.container.scrollTop =
            this.container.scrollHeight;

    },


    // ========================================================
    // GET MESSAGE COUNT
    // ========================================================

    getMessageCount() {

        if (!this.container) {

            return 0;

        }


        return this.container.querySelectorAll(
            ".gpa-messenger-message"
        ).length;

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerChatMessages =
    GPAMessengerChatMessages;


// ============================================================
// END GPA MESSENGER CHAT MESSAGES
// ============================================================
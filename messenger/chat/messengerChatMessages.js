// ============================================================
// GPA MESSENGER - CHAT MESSAGES
// ============================================================
//
// Purpose:
// - Render chat messages
// - Display sender / receiver messages
// - Display message text
// - Display timestamps
// - Handle empty conversation state
// - Handle scrolling
//
// IMPORTANT:
//
// This module does NOT:
//
// - Load messages from API
// - Send messages
// - Handle Socket.IO
// - Handle permissions
// - Handle user selection
// - Handle chat window layout
//
// Those responsibilities belong to other Messenger modules.
//
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

    initialize(container = null) {

        // ----------------------------------------------------
        // Prevent invalid initialization
        // ----------------------------------------------------

        if (!container) {

            console.warn(
                "[GPA CHAT MESSAGES] Message container not provided."
            );

            return this;

        }


        // ----------------------------------------------------
        // Store container
        // ----------------------------------------------------

        this.container = container;


        // ----------------------------------------------------
        // Try to identify current Messenger user
        // ----------------------------------------------------

        this.resolveCurrentUser();


        // ----------------------------------------------------
        // Mark initialized
        // ----------------------------------------------------

        this.initialized = true;


        console.log(
            "[GPA CHAT MESSAGES] Initialized."
        );


        return this;

    },


    // ========================================================
    // RESOLVE CURRENT USER
    // ========================================================
    //
    // We use the already authenticated Messenger user.
    //
    // No new authentication system is created.
    //
    // ========================================================

    resolveCurrentUser() {

        this.currentUserId = null;


        // ----------------------------------------------------
        // Try Messenger Socket Client
        // ----------------------------------------------------

        try {

            const socketClient =
                window.GPAMessengerSocketClient;


            if (
                socketClient &&
                socketClient.user &&
                socketClient.user._id
            ) {

                this.currentUserId =
                    String(socketClient.user._id);

            }

        } catch (error) {

            console.warn(
                "[GPA CHAT MESSAGES] Unable to resolve current user:",
                error
            );

        }


        if (this.currentUserId) {

            console.log(
                "[GPA CHAT MESSAGES] Current user:",
                this.currentUserId
            );

        } else {

            console.warn(
                "[GPA CHAT MESSAGES] Current user ID not available yet."
            );

        }

    },


    // ========================================================
    // SET CURRENT USER
    // ========================================================
    //
    // Future modules can explicitly provide the authenticated
    // user ID if required.
    //
    // ========================================================

    setCurrentUser(userId) {

        if (!userId) {

            this.currentUserId = null;

            return;

        }


        this.currentUserId =
            String(userId);


        console.log(
            "[GPA CHAT MESSAGES] Current user set:",
            this.currentUserId
        );

    },


    // ========================================================
    // RENDER MESSAGES
    // ========================================================

    renderMessages(messages = []) {

        if (!this.container) {

            console.warn(
                "[GPA CHAT MESSAGES] Container is not initialized."
            );

            return;

        }


        // ----------------------------------------------------
        // Clear existing messages
        // ----------------------------------------------------

        this.clear();


        // ----------------------------------------------------
        // Validate message array
        // ----------------------------------------------------

        if (!Array.isArray(messages)) {

            console.warn(
                "[GPA CHAT MESSAGES] Invalid messages data."
            );

            this.renderEmptyState();

            return;

        }


        // ----------------------------------------------------
        // Empty conversation
        // ----------------------------------------------------

        if (messages.length === 0) {

            this.renderEmptyState();

            return;

        }


        // ----------------------------------------------------
        // Render every message
        // ----------------------------------------------------

        messages.forEach(
            (message) => {

                this.appendMessage(
                    message,
                    false
                );

            }
        );


        // ----------------------------------------------------
        // Scroll to latest message
        // ----------------------------------------------------

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
                "[GPA CHAT MESSAGES] Container is not initialized."
            );

            return;

        }


        if (!message) {

            return;

        }


        const element =
            this.createMessageElement(
                message
            );


        if (!element) {

            return;

        }


        this.container.appendChild(
            element
        );


        if (scroll) {

            this.scrollToBottom();

        }

    },


    // ========================================================
    // CREATE MESSAGE ELEMENT
    // ========================================================

    createMessageElement(message) {

        const wrapper =
            document.createElement("div");


        wrapper.className =
            "gpa-messenger-message";


        // ----------------------------------------------------
        // Determine sender
        // ----------------------------------------------------

        const senderId =
            this.getUserId(
                message.sender
            );


        const receiverId =
            this.getUserId(
                message.receiver
            );


        let isSent = false;


        if (
            this.currentUserId &&
            senderId
        ) {

            isSent =
                String(senderId) ===
                String(this.currentUserId);

        }


        // ----------------------------------------------------
        // Message alignment
        // ----------------------------------------------------

        wrapper.classList.add(
            isSent
                ? "sent"
                : "received"
        );


        // ----------------------------------------------------
        // Message bubble
        // ----------------------------------------------------

        const bubble =
            document.createElement("div");


        bubble.className =
            "gpa-messenger-message-bubble";


        // ----------------------------------------------------
        // Message text
        // ----------------------------------------------------

        const text =
            document.createElement("div");


        text.className =
            "gpa-messenger-message-text";


        text.textContent =
            message.message || "";


        bubble.appendChild(
            text
        );


        // ----------------------------------------------------
        // Timestamp
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Read status
        // ----------------------------------------------------

        if (isSent) {

            const status =
                document.createElement("span");


            status.className =
                "gpa-messenger-message-status";


            status.textContent =
                message.read
                    ? "✓✓"
                    : "✓";


            bubble.appendChild(
                status
            );

        }


        wrapper.appendChild(
            bubble
        );


        return wrapper;

    },


    // ========================================================
    // GET USER ID
    // ========================================================

    getUserId(user) {

        if (!user) {

            return null;

        }


        if (
            typeof user === "string"
        ) {

            return user;

        }


        if (user._id) {

            return String(
                user._id
            );

        }


        return null;

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


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

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
    // CLEAR
    // ========================================================

    clear() {

        if (!this.container) {

            return;

        }


        this.container.innerHTML = "";

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
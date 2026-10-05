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


window.GPAMessengerChatMessages = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

container: null,

currentUserId: null,

authenticationListenerBound: false,


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

    // ========================================================
    // RESET CURRENT USER
    // ========================================================

    this.currentUserId = null;


    // ========================================================
    // GET MESSENGER SOCKET CLIENT
    // ========================================================

    const socketClient =
        window.GPAMessengerSocketClient;


    if (!socketClient) {

        console.warn(
            "[GPA CHAT MESSAGES] Messenger Socket Client not available yet."
        );

        return;

    }


    // ========================================================
    // CHECK WHETHER AUTHENTICATION ALREADY COMPLETED
    // ========================================================

    if (
        socketClient.user &&
        socketClient.user._id
    ) {

        this.setCurrentUser(
            socketClient.user._id
        );

        return;

    }


    // ========================================================
    // WAIT FOR SOCKET AUTHENTICATION
    // ========================================================
    //
    // The Messenger Socket connects first.
    //
    // Authentication completes slightly later.
    //
    // Therefore we listen for:
    //
    // messenger:socket:authenticated
    //
    // No polling.
    // No second authentication system.
    // ========================================================

    if (
        !this.authenticationListenerBound &&
        socketClient.socket &&
        typeof socketClient.socket.on === "function"
    ) {

        this.authenticationListenerBound = true;


        socketClient.socket.on(
            "messenger:socket:authenticated",
            (data) => {

                console.log(
                    "[GPA CHAT MESSAGES] Messenger authentication received."
                );


                const user =
                    data?.user;


                if (
                    user &&
                    user._id
                ) {

                    this.setCurrentUser(
                        user._id
                    );

                } else {

                    console.warn(
                        "[GPA CHAT MESSAGES] Authentication event did not contain a user ID."
                    );

                }

            }
        );


        console.log(
            "[GPA CHAT MESSAGES] Waiting for Messenger authentication..."
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
// Refresh authenticated Messenger user
// ----------------------------------------------------

this.resolveCurrentUser();


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
    "gpa-messenger-chat-message";


        // ----------------------------------------------------
        // Determine sender
        // ----------------------------------------------------

        // ----------------------------------------------------
// Resolve current authenticated user again
// ----------------------------------------------------
// Socket authentication may finish after the module
// was initially initialized.
//
// Therefore we refresh the current user before deciding
// whether this message is SENT or RECEIVED.
// ----------------------------------------------------

if (!this.currentUserId) {
    this.resolveCurrentUser();
}


const senderId =
    this.getUserId(
        message.sender
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

if (isSent) {

    wrapper.classList.add("mine");

} else {

    wrapper.classList.add("theirs");

}


        // ----------------------------------------------------
        // Message bubble
        // ----------------------------------------------------

        const bubble =
            document.createElement("div");


        bubble.className =
    "gpa-messenger-chat-bubble";


        // ----------------------------------------------------
        // Message text
        // ----------------------------------------------------

        const text =
            document.createElement("div");


        text.className =
    "gpa-messenger-chat-message-text";


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
    "gpa-messenger-chat-message-time";


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
    ".gpa-messenger-chat-message"
).length;

    }

};





// ============================================================
// END GPA MESSENGER CHAT MESSAGES
// ============================================================
/**
 * ============================================================
 * GPA MESSENGER
 * MODULE 2
 * PRIMARY USER CHAT SOCKET
 * ============================================================
 *
 * FRONTEND SOCKET CONNECTION
 *
 * ============================================================
 */

(function () {

    "use strict";

    class PrimaryUserChatSocket {

        constructor() {
            this.socket = null;
            this.connected = false;
        }

        initialize() {

            if (
                typeof io !==
                "function"
            ) {
                console.error(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Socket.IO client is not available."
                );
                return;
            }

            this.socket = io(
                "https://academy-backend-eatl.onrender.com",
                {
                    transports: [
                        "websocket",
                        "polling"
                    ],
                    withCredentials: true
                }
            );

            this.socket.on(
                "connect",
                () => {

                    this.connected = true;

                    console.log(
                        "[GPA PRIMARY CHAT SOCKET] " +
                        "Connected:",
                        this.socket.id
                    );

                }
            );

            // ========================================================
            // MESSAGE CONFIRMATION
            // ========================================================

            this.socket.on(
                "gpa:primary:message:received",
                (message) => {

                    console.log(
                        "[GPA PRIMARY CHAT SOCKET] " +
                        "Backend confirmed message:",
                        message
                    );

                }
            );

            // ========================================================
// REAL-TIME CONVERSATION MESSAGE
// ========================================================

this.socket.on(
    "gpa:primary:conversation:message",
    (message) => {

        console.log(
            "[GPA PRIMARY CHAT SOCKET] " +
            "Real-time conversation message received:",
            message
        );

        if (!message) {
            return;
        }

        if (
            !window.GPAMessengerConversationId ||
            message.conversationId !==
                window.GPAMessengerConversationId
        ) {

            console.log(
                "[GPA PRIMARY CHAT SOCKET] " +
                "Message belongs to another conversation."
            );

            return;
        }

        if (
            !window.GPAPrimaryUserChat ||
            typeof window.GPAPrimaryUserChat.displayMessage !==
                "function"
        ) {

            console.warn(
                "[GPA PRIMARY CHAT SOCKET] " +
                "Primary User Chat is not available."
            );

            return;
        }

        window.GPAPrimaryUserChat.displayMessage({

            id:
                message.id,

            text:
                message.text,

            sender:
                message.sender,

            createdAt:
                message.receivedAt

        });

    }
);

            // ========================================================
            // MESSAGE HISTORY RECEIVED
            // ========================================================

            this.socket.on(
                "gpa:primary:message:history:received",
                (messages) => {

                    console.log(
                        "[GPA PRIMARY MESSAGE HISTORY] " +
                        "History received:",
                        messages
                    );

                    if (!Array.isArray(messages)) {

                        console.warn(
                            "[GPA PRIMARY MESSAGE HISTORY] " +
                            "Invalid history received."
                        );

                        return;
                    }

                    if (
                        !window.GPAPrimaryUserChat ||
                        typeof window.GPAPrimaryUserChat.displayMessage !==
                            "function"
                    ) {

                        console.warn(
                            "[GPA PRIMARY MESSAGE HISTORY] " +
                            "Primary User Chat is not available."
                        );

                        return;
                    }

                    messages.forEach(
                        (message) => {

                            window.GPAPrimaryUserChat.displayMessage({

                                id:
                                    message.messageId,

                                text:
                                    message.text,

                                sender:
                                    message.sender,

                                createdAt:
                                    message.sentAt

                            });

                        }
                    );

                }
            );

            // ========================================================
            // DISCONNECT
            // ========================================================

            this.socket.on(
                "disconnect",
                (reason) => {

                    this.connected = false;

                    console.log(
                        "[GPA PRIMARY CHAT SOCKET] " +
                        "Disconnected:",
                        reason
                    );

                }
            );

            // ========================================================
            // CONNECTION ERROR
            // ========================================================

            this.socket.on(
                "connect_error",
                (error) => {

                    console.error(
                        "[GPA PRIMARY CHAT SOCKET] " +
                        "Connection error:",
                        error
                    );

                }
            );

        }

        // ========================================================
        // LOAD SELECTED CONVERSATION HISTORY
        // ========================================================

        loadConversationHistory(conversationId) {

            if (!this.socket) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Socket is not initialized."
                );

                return;
            }

            if (!this.connected) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Socket is not connected."
                );

                return;
            }

            if (!conversationId) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Conversation ID is missing."
                );

                return;
            }

            console.log(
                "[GPA PRIMARY MESSAGE HISTORY] " +
                "Requesting history for conversation:",
                conversationId
            );


            // ========================================================
// JOIN CURRENT CONVERSATION ROOM
// ========================================================

console.log(
    "[GPA PRIMARY CHAT SOCKET] " +
    "Joining conversation room:",
    conversationId
);

this.socket.emit(
    "gpa:primary:conversation:join",
    {
        conversationId:
            conversationId
    }
);

            this.socket.emit(
                "gpa:primary:message:history",
                {
                    conversationId:
                        conversationId
                }
            );

        }

        // ========================================================
        // SEND MESSAGE
        // ========================================================

        sendMessage(message) {

            if (!this.socket) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Socket is not initialized."
                );

                return;
            }

            if (!this.connected) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Socket is not connected."
                );

                return;
            }

            // ========================================================
            // ACTIVE CONVERSATION
            // ========================================================

            const conversation =
                window.GPAMessengerConversation;

            if (
                !conversation ||
                !conversation._id
            ) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "No active conversation selected."
                );

                return;
            }

            const participants =
                conversation.participants || [];

            if (
                !Array.isArray(participants) ||
                participants.length < 2
            ) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Conversation participants are missing."
                );

                return;
            }

            // ========================================================
            // LOGIN TOKEN
            // ========================================================

            const token =
                localStorage.getItem("token");

            if (!token) {

                console.warn(
                    "[GPA PRIMARY CHAT SOCKET] " +
                    "Login token is missing."
                );

                return;
            }

            // ========================================================
            // RECEIVER
            // ========================================================

            const receiverId =
                participants[1];

            // ========================================================
            // ADD CONVERSATION INFORMATION
            // ========================================================

            const messageWithConversation = {

                ...message,

                conversationId:
                    conversation._id,

                receiverId:
                    receiverId

            };

            // ========================================================
            // SEND TO BACKEND
            // ========================================================

            this.socket.emit(
                "gpa:primary:message",
                messageWithConversation
            );

            console.log(
                "[GPA PRIMARY CHAT SOCKET] " +
                "Message sent to backend:",
                messageWithConversation
            );

        }

    }

    // ============================================================
    // CREATE SOCKET INSTANCE
    // ============================================================

    const primaryUserChatSocket =
        new PrimaryUserChatSocket();

    window.GPAPrimaryUserSocket =
        primaryUserChatSocket;

    // ============================================================
    // START
    // ============================================================

    function start() {

        primaryUserChatSocket.initialize();

    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            start
        );

    } else {

        start();

    }

})();
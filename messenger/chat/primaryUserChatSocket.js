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

        withCredentials: true,

        auth: {
            token:
                localStorage.getItem("token") ||
                sessionStorage.getItem("token")
        }
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

            
/* Update outgoing message ticks when backend confirms status */
this.socket.on(
    "gpa:primary:message:status",
    (receipt) => {
        if (!receipt) return;

        if (
            String(receipt.conversationId) !==
            String(window.GPAMessengerConversationId)
        ) {
            return;
        }

        if (
            window.GPAPrimaryUserChat &&
            typeof window.GPAPrimaryUserChat.updateMessageStatus === "function"
        ) {
            window.GPAPrimaryUserChat.updateMessageStatus(
                receipt.messageId,
                receipt.deliveryStatus
            );
        }
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
        message.receivedAt,

    // ========================================================
    // REAL-TIME MESSAGE IS FROM THE OTHER PARTICIPANT
    // ========================================================
    //
    // The backend now sends the realtime message only to the
    // other socket.
    //
    // Therefore this message is an INCOMING message.
    //
    // Incoming → LEFT
    // ========================================================

    direction:
        "incoming"

});


        // Acknowledge delivery to the sender
        
        // Mark the incoming message as read
        if (
            this.socket &&
            this.socket.connected &&
            message.id &&
            message.conversationId
        ) {
            this.socket.emit(
                "gpa:primary:message:read",
                {
                    messageId: message.id,
                    conversationId: message.conversationId
                }
            );
        }



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


        // ====================================================
        // VALIDATE HISTORY
        // ====================================================

        if (!Array.isArray(messages)) {

            console.warn(
                "[GPA PRIMARY MESSAGE HISTORY] " +
                "Invalid history received."
            );

            return;
        }


        // ====================================================
        // CHECK CHAT MODULE
        // ====================================================

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


        // ====================================================
        // GET CURRENT USER ID
        // ====================================================

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");


        let currentUserId =
            null;


        if (token) {

            try {

                const tokenPayload =
                    JSON.parse(
                        atob(
                            token
                                .split(".")[1]
                                .replace(/-/g, "+")
                                .replace(/_/g, "/")
                        )
                    );


                currentUserId =
                    tokenPayload.id;


                console.log(
                    "[GPA PRIMARY MESSAGE HISTORY] " +
                    "Current user ID:",
                    currentUserId
                );

            }
            catch (error) {

                console.error(
                    "[GPA PRIMARY MESSAGE HISTORY] " +
                    "Unable to read current user ID:",
                    error
                );

                return;
            }

        }
        else {

            console.warn(
                "[GPA PRIMARY MESSAGE HISTORY] " +
                "Login token is missing."
            );

            return;
        }


        // ====================================================
        // DISPLAY HISTORY
        // ====================================================

        messages.forEach(
            (message) => {

                // ==================================================
                // DETERMINE MESSAGE DIRECTION
                // ==================================================
                //
                // receiverId === currentUserId
                //
                // Someone else sent this message.
                //
                // INCOMING → LEFT
                //
                //
                // receiverId !== currentUserId
                //
                // Current user sent this message.
                //
                // OUTGOING → RIGHT
                // ==================================================

                let messageDirection =
                    "outgoing";


                if (
                    message.receiverId &&
                    String(message.receiverId) ===
                        String(currentUserId)
                ) {

                    messageDirection =
                        "incoming";

                }


                console.log(
                    "[GPA PRIMARY MESSAGE HISTORY] " +
                    "Message direction:",
                    {
                        messageId:
                            message.messageId,

                        receiverId:
                            message.receiverId,

                        currentUserId:
                            currentUserId,

                        direction:
                            messageDirection
                    }
                );


                // ==================================================
                // DISPLAY MESSAGE
                // ==================================================

                window.GPAPrimaryUserChat.displayMessage({

                    id:
                        message.messageId,

                    text:
                        message.text,

                    sender:
                        message.sender,

                    createdAt:
                        message.sentAt,

                    direction:
                        messageDirection

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
// FIND THE OTHER PARTICIPANT
// ========================================================

const token =
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

if (!token) {
    console.warn(
        "[GPA PRIMARY CHAT SOCKET] " +
        "Login token is missing."
    );
    return;
}


// ========================================================
// READ CURRENT USER ID FROM JWT
// ========================================================

let currentUserId;

try {

    const tokenPayload =
        JSON.parse(
            atob(
                token.split(".")[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/")
            )
        );

    currentUserId =
        tokenPayload.id;

}
catch (error) {

    console.error(
        "[GPA PRIMARY CHAT SOCKET] " +
        "Unable to read user ID from token:",
        error
    );

    return;

}


// ========================================================
// FIND RECEIVER
// ========================================================

const receiverId =
    participants.find(
        participant =>
            String(participant) !==
            String(currentUserId)
    );

if (!receiverId) {

    console.warn(
        "[GPA PRIMARY CHAT SOCKET] " +
        "Receiver could not be determined."
    );

    return;

}

console.log(
    "[GPA PRIMARY CHAT SOCKET] " +
    "Current user:",
    currentUserId
);

console.log(
    "[GPA PRIMARY CHAT SOCKET] " +
    "Receiver:",
    receiverId
);

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
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


        // ========================================================
        // INITIALIZE
        // ========================================================

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


            // ----------------------------------------------------
            // CONNECT
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // CONNECTED
            // ----------------------------------------------------

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
// MODULE 4
// REQUEST MESSAGE HISTORY
// ========================================================

this.socket.emit(
    "gpa:primary:message:history"
);

console.log(
    "[GPA PRIMARY MESSAGE HISTORY] " +
    "History requested."
);


            // ----------------------------------------------------
            // SERVER CONFIRMATION
            // ----------------------------------------------------

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
// MODULE 4
// RECEIVE MESSAGE HISTORY
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


            // ----------------------------------------------------
            // DISCONNECTED
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // CONNECTION ERROR
            // ----------------------------------------------------

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


            this.socket.emit(
                "gpa:primary:message",
                message
            );


            console.log(
                "[GPA PRIMARY CHAT SOCKET] " +
                "Message sent to backend:",
                message
            );

        }

    }


    // ============================================================
    // CREATE MODULE
    // ============================================================

    const primaryUserChatSocket =
        new PrimaryUserChatSocket();


    // ============================================================
    // GLOBAL ACCESS
    // ============================================================

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
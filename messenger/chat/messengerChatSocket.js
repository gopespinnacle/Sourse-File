/**
 * ============================================================
 * GPA MESSENGER - WEB CHAT SOCKET
 * ============================================================
 *
 * Responsibility:
 * - Connect Web Messenger Chat to Socket.IO
 * - Send realtime chat messages
 * - Receive realtime chat messages
 * - Receive read-status updates
 * - Handle socket connection state
 *
 * This file does NOT:
 * - Create Chat UI
 * - Call REST APIs
 * - Handle permissions
 * - Handle database operations
 * - Handle audio/video calls
 * - Handle notifications
 *
 * ============================================================
 */

const GPAMessengerChatSocket = {

    /**
     * --------------------------------------------------------
     * STATE
     * --------------------------------------------------------
     */

    socket: null,

    initialized: false,

    connected: false,

    listeners: {
        message: [],
        sent: [],
        read: [],
        error: [],
        connected: [],
        disconnected: []
    },


    /**
     * --------------------------------------------------------
     * INITIALIZE
     * --------------------------------------------------------
     */
    initialize() {

        if (this.initialized) {

            console.log(
                "[GPA WEB CHAT SOCKET] Already initialized."
            );

            return this;
        }


        /*
         * ----------------------------------------------------
         * Get the existing Messenger Socket Client.
         * ----------------------------------------------------
         *
         * We DO NOT create another Socket.IO connection.
         *
         * The main Messenger Socket Client already handles:
         *
         * - JWT
         * - Messenger authentication
         * - Socket.IO connection
         */
        if (
            typeof GPAMessengerSocketClient ===
            "undefined"
        ) {

            console.error(
                "[GPA WEB CHAT SOCKET] " +
                "GPAMessengerSocketClient not found."
            );

            return this;
        }


        /*
         * ----------------------------------------------------
         * Get the existing Socket.IO instance.
         * ----------------------------------------------------
         */
        const existingSocket =
            GPAMessengerSocketClient.socket;


        if (!existingSocket) {

            console.error(
                "[GPA WEB CHAT SOCKET] " +
                "Messenger Socket.IO instance not available."
            );

            return this;
        }


        this.socket =
            existingSocket;


        this.registerSocketEvents();


        this.initialized = true;


        /*
         * The existing Messenger Socket Client may already
         * be connected before Chat initializes.
         */
        this.connected =
            this.socket.connected === true;


        console.log(
            "[GPA WEB CHAT SOCKET] " +
            "Chat socket initialized."
        );


        return this;
    },


    /**
     * --------------------------------------------------------
     * REGISTER SOCKET EVENTS
     * --------------------------------------------------------
     */
    registerSocketEvents() {

        if (!this.socket) {

            return;
        }


        /*
         * ----------------------------------------------------
         * CONNECT
         * ----------------------------------------------------
         */
        this.socket.on(
            "connect",
            () => {

                this.connected = true;


                console.log(
                    "[GPA WEB CHAT SOCKET] Connected."
                );


                this.emitLocalEvent(
                    "connected",
                    {
                        socketId:
                            this.socket.id
                    }
                );
            }
        );


        /*
         * ----------------------------------------------------
         * DISCONNECT
         * ----------------------------------------------------
         */
        this.socket.on(
            "disconnect",
            (reason) => {

                this.connected = false;


                console.log(
                    "[GPA WEB CHAT SOCKET] Disconnected:",
                    reason
                );


                this.emitLocalEvent(
                    "disconnected",
                    {
                        reason
                    }
                );
            }
        );


        /*
         * ----------------------------------------------------
         * MESSAGE RECEIVED
         * ----------------------------------------------------
         *
         * Backend event:
         *
         * messenger:chat:message
         */
        // ============================================================
// REALTIME MESSAGE RECEIVED
// ============================================================
//
// Backend sends:
// messenger:chat:message
//
// This module receives the realtime message.
//
// It then passes the message to:
// GPAMessengerChatMessages
//
// This keeps Socket.IO logic separate from
// message rendering logic.
// ============================================================

this.socket.on(
    "messenger:chat:message",
    (message) => {

        console.log(
            "[GPA WEB CHAT SOCKET] Realtime message received:",
            message
        );


        // ----------------------------------------------------
        // Make sure Chat Messages module exists
        // ----------------------------------------------------

        const chatMessages =
            window.GPAMessengerChatMessages;


        if (
            !chatMessages ||
            typeof chatMessages.appendMessage !== "function"
        ) {

            console.warn(
                "[GPA WEB CHAT SOCKET] Chat Messages module is not available yet."
            );

            return;
        }


        // ----------------------------------------------------
        // Pass realtime message to Chat Messages module
        // ----------------------------------------------------

        chatMessages.appendMessage(
            message,
            true
        );


        console.log(
            "[GPA WEB CHAT SOCKET] Realtime message passed to Chat Messages module."
        );

    }
);


        /*
         * ----------------------------------------------------
         * MESSAGE SENT
         * ----------------------------------------------------
         *
         * Backend confirmation:
         *
         * messenger:chat:sent
         */
        this.socket.on(
            "messenger:chat:sent",
            (message) => {

                console.log(
                    "[GPA WEB CHAT SOCKET] " +
                    "Message sent:",
                    message
                );


                this.emitLocalEvent(
                    "sent",
                    message
                );
            }
        );


        /*
         * ----------------------------------------------------
         * MESSAGE READ
         * ----------------------------------------------------
         */
        this.socket.on(
            "messenger:chat:read",
            (data) => {

                console.log(
                    "[GPA WEB CHAT SOCKET] " +
                    "Message read:",
                    data
                );


                this.emitLocalEvent(
                    "read",
                    data
                );
            }
        );


        /*
         * ----------------------------------------------------
         * CHAT ERROR
         * ----------------------------------------------------
         */
        this.socket.on(
            "messenger:chat:error",
            (error) => {

                console.error(
                    "[GPA WEB CHAT SOCKET] " +
                    "Chat error:",
                    error
                );


                this.emitLocalEvent(
                    "error",
                    error
                );
            }
        );
    },


    /**
     * --------------------------------------------------------
     * SEND MESSAGE
     * --------------------------------------------------------
     */
    sendMessage(
        receiverId,
        message,
        callback
    ) {

        if (!this.socket) {

            const error = {
                success: false,
                message:
                    "Messenger socket is not available."
            };


            this.emitLocalEvent(
                "error",
                error
            );


            if (
                typeof callback ===
                "function"
            ) {

                callback(error);
            }


            return;
        }


        if (!this.connected) {

            const error = {
                success: false,
                message:
                    "Messenger socket is not connected."
            };


            this.emitLocalEvent(
                "error",
                error
            );


            if (
                typeof callback ===
                "function"
            ) {

                callback(error);
            }


            return;
        }


        if (!receiverId) {

            const error = {
                success: false,
                message:
                    "Receiver ID is required."
            };


            if (
                typeof callback ===
                "function"
            ) {

                callback(error);
            }


            return;
        }


        if (
            typeof message !== "string" ||
            !message.trim()
        ) {

            const error = {
                success: false,
                message:
                    "Message cannot be empty."
            };


            if (
                typeof callback ===
                "function"
            ) {

                callback(error);
            }


            return;
        }


        /*
         * IMPORTANT:
         *
         * We deliberately DO NOT send senderId.
         *
         * Backend determines the sender from the
         * authenticated Messenger socket.
         */
        this.socket.emit(
            "messenger:chat:send",
            {
                receiverId,
                message:
                    message.trim()
            },
            (
                response
            ) => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        response
                    );
                }
            }
        );
    },


    /**
     * --------------------------------------------------------
     * MARK MESSAGE AS READ
     * --------------------------------------------------------
     */
    markMessageAsRead(
        messageId,
        callback
    ) {

        if (!this.socket) {

            return;
        }


        this.socket.emit(
            "messenger:chat:read",
            {
                messageId
            },
            (
                response
            ) => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        response
                    );
                }
            }
        );
    },


    /**
     * --------------------------------------------------------
     * MARK CONVERSATION AS READ
     * --------------------------------------------------------
     */
    markConversationAsRead(
        userId,
        callback
    ) {

        if (!this.socket) {

            return;
        }


        this.socket.emit(
            "messenger:chat:conversation:read",
            {
                userId
            },
            (
                response
            ) => {

                if (
                    typeof callback ===
                    "function"
                ) {

                    callback(
                        response
                    );
                }
            }
        );
    },


    /**
     * --------------------------------------------------------
     * ADD LOCAL EVENT LISTENER
     * --------------------------------------------------------
     */
    on(
        event,
        callback
    ) {

        if (
            !this.listeners[event]
        ) {

            console.warn(
                "[GPA WEB CHAT SOCKET] " +
                "Unknown event:",
                event
            );

            return;
        }


        if (
            typeof callback !==
            "function"
        ) {

            return;
        }


        this.listeners[event].push(
            callback
        );
    },


    /**
     * --------------------------------------------------------
     * REMOVE LOCAL EVENT LISTENER
     * --------------------------------------------------------
     */
    off(
        event,
        callback
    ) {

        if (
            !this.listeners[event]
        ) {

            return;
        }


        this.listeners[event] =
            this.listeners[event].filter(
                listener =>
                    listener !== callback
            );
    },


    /**
     * --------------------------------------------------------
     * EMIT LOCAL EVENT
     * --------------------------------------------------------
     */
    emitLocalEvent(
        event,
        data
    ) {

        const eventListeners =
            this.listeners[event];


        if (!eventListeners) {

            return;
        }


        eventListeners.forEach(
            callback => {

                try {

                    callback(data);

                } catch (error) {

                    console.error(
                        "[GPA WEB CHAT SOCKET] " +
                        "Local listener error:",
                        error
                    );
                }
            }
        );
    },


    /**
     * --------------------------------------------------------
     * CHECK CONNECTION
     * --------------------------------------------------------
     */
    isConnected() {

        return (
            this.connected === true &&
            this.socket &&
            this.socket.connected === true
        );
    }
};


/**
 * ------------------------------------------------------------
 * GLOBAL WEB MESSENGER CHAT SOCKET
 * ------------------------------------------------------------
 */
window.GPAMessengerChatSocket =
    GPAMessengerChatSocket;
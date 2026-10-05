/**
 * ============================================================
 * GPA MESSENGER - WEB CHAT SERVICE
 * ============================================================
 *
 * Responsibility:
 * - Communicate with GPA Messenger Chat REST API
 * - Send messages
 * - Load conversations
 * - Mark messages as read
 * - Get unread counts
 *
 * This file does NOT:
 * - Create UI
 * - Handle Socket.IO
 * - Handle calls
 * - Handle WebRTC
 * - Handle notifications
 *
 * ============================================================
 */

const GPAMessengerChatService = {

    /**
     * --------------------------------------------------------
     * BACKEND URL
     * --------------------------------------------------------
     */
    backendURL:
        "https://academy-backend-eatl.onrender.com",


    /**
     * --------------------------------------------------------
     * GET AUTHENTICATION TOKEN
     * --------------------------------------------------------
     */
    getToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );
    },


    /**
     * --------------------------------------------------------
     * BUILD AUTHORIZATION HEADERS
     * --------------------------------------------------------
     */
    getHeaders() {

        const token =
            this.getToken();


        const headers = {
            "Content-Type": "application/json"
        };


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;
        }


        return headers;
    },


    /**
     * --------------------------------------------------------
     * SEND MESSAGE
     * --------------------------------------------------------
     *
     * POST
     * /api/messenger/chat/message
     */
    async sendMessage(
        receiverId,
        message
    ) {

        if (!receiverId) {

            throw new Error(
                "Receiver ID is required."
            );
        }


        if (
            typeof message !== "string" ||
            !message.trim()
        ) {

            throw new Error(
                "Message cannot be empty."
            );
        }


        const response =
            await fetch(
                `${this.backendURL}/api/messenger/chat/message`,
                {
                    method: "POST",

                    headers:
                        this.getHeaders(),

                    body: JSON.stringify({
                        receiverId,
                        message:
                            message.trim()
                    })
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to send message."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * GET CONVERSATION
     * --------------------------------------------------------
     *
     * GET
     * /api/messenger/chat/conversation/:userId
     *
     * Optional:
     * before
     * limit
     */
    async getConversation(
        userId,
        options = {}
    ) {

        if (!userId) {

            throw new Error(
                "User ID is required."
            );
        }


        const params =
            new URLSearchParams();


        if (options.before) {

            params.set(
                "before",
                options.before
            );
        }


        if (options.limit) {

            params.set(
                "limit",
                options.limit
            );
        }


        const queryString =
            params.toString();


        const url =
            `${this.backendURL}` +
            `/api/messenger/chat/conversation/${encodeURIComponent(userId)}` +
            (
                queryString
                    ? `?${queryString}`
                    : ""
            );


        const response =
            await fetch(
                url,
                {
                    method: "GET",

                    headers:
                        this.getHeaders()
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load conversation."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * MARK SINGLE MESSAGE AS READ
     * --------------------------------------------------------
     *
     * PATCH
     * /api/messenger/chat/message/:messageId/read
     */
    async markMessageAsRead(
        messageId
    ) {

        if (!messageId) {

            throw new Error(
                "Message ID is required."
            );
        }


        const response =
            await fetch(
                `${this.backendURL}` +
                `/api/messenger/chat/message/${encodeURIComponent(messageId)}/read`,
                {
                    method: "PATCH",

                    headers:
                        this.getHeaders()
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to mark message as read."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * MARK CONVERSATION AS READ
     * --------------------------------------------------------
     *
     * PATCH
     * /api/messenger/chat/conversation/:userId/read
     */
    async markConversationAsRead(
        userId
    ) {

        if (!userId) {

            throw new Error(
                "User ID is required."
            );
        }


        const response =
            await fetch(
                `${this.backendURL}` +
                `/api/messenger/chat/conversation/${encodeURIComponent(userId)}/read`,
                {
                    method: "PATCH",

                    headers:
                        this.getHeaders()
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to mark conversation as read."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * GET TOTAL UNREAD COUNT
     * --------------------------------------------------------
     *
     * GET
     * /api/messenger/chat/unread
     */
    async getUnreadCount() {

        const response =
            await fetch(
                `${this.backendURL}/api/messenger/chat/unread`,
                {
                    method: "GET",

                    headers:
                        this.getHeaders()
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load unread count."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * GET CONVERSATION UNREAD COUNT
     * --------------------------------------------------------
     *
     * GET
     * /api/messenger/chat/conversation/:userId/unread
     */
    async getConversationUnreadCount(
        userId
    ) {

        if (!userId) {

            throw new Error(
                "User ID is required."
            );
        }


        const response =
            await fetch(
                `${this.backendURL}` +
                `/api/messenger/chat/conversation/${encodeURIComponent(userId)}/unread`,
                {
                    method: "GET",

                    headers:
                        this.getHeaders()
                }
            );


        const data =
            await this.parseResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load conversation unread count."
            );
        }


        return data;
    },


    /**
     * --------------------------------------------------------
     * PARSE RESPONSE
     * --------------------------------------------------------
     */
    async parseResponse(
        response
    ) {

        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            return await response.json();
        }


        const text =
            await response.text();


        return {
            message:
                text ||
                "Unexpected server response."
        };
    }
};


/**
 * ------------------------------------------------------------
 * GLOBAL WEB MESSENGER CHAT SERVICE
 * ------------------------------------------------------------
 */
window.GPAMessengerChatService =
    GPAMessengerChatService;
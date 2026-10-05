// ============================================================
// GPA MESSENGER - CHAT SERVICE
// ============================================================
// Purpose:
// - Communicate with Messenger Chat REST APIs
// - Handle authentication token
// - Send and retrieve messages
// - Handle read/unread operations
//
// IMPORTANT:
// - No UI code
// - No Socket.IO code
// - No chat rendering
// - No permission logic
//
// The backend remains responsible for:
// - Authentication
// - Permission validation
// - User mapping
// - Message storage
// ============================================================


const GPAMessengerChatService = {

    // ========================================================
    // BACKEND URL
    // ========================================================

    backendURL:
        "https://academy-backend-eatl.onrender.com",


    // ========================================================
    // GET AUTHENTICATION TOKEN
    // ========================================================

    getToken() {

        return (
            localStorage.getItem("token") ||
            sessionStorage.getItem("token")
        );

    },


    // ========================================================
    // GET REQUEST HEADERS
    // ========================================================

    getHeaders() {

        const token = this.getToken();

        const headers = {
            "Content-Type": "application/json"
        };


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;

        }


        return headers;

    },


    // ========================================================
    // SEND MESSAGE
    // ========================================================

    async sendMessage(receiverId, message) {

        try {

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


            const response = await fetch(
                `${this.backendURL}/api/messenger/chat/message`,
                {
                    method: "POST",

                    headers: this.getHeaders(),

                    body: JSON.stringify({
                        receiverId: receiverId,
                        message: message.trim()
                    })
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Send message failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // GET CONVERSATION
    // ========================================================

    async getConversation(userId, options = {}) {

        try {

            if (!userId) {

                throw new Error(
                    "User ID is required."
                );

            }


            const params =
                new URLSearchParams();


            if (options.limit) {

                params.set(
                    "limit",
                    options.limit
                );

            }


            if (options.before) {

                params.set(
                    "before",
                    options.before
                );

            }


            const queryString =
                params.toString();


            const url =
                `${this.backendURL}/api/messenger/chat/conversation/${encodeURIComponent(userId)}` +
                (queryString
                    ? `?${queryString}`
                    : "");


            const response = await fetch(
                url,
                {
                    method: "GET",
                    headers: this.getHeaders()
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Get conversation failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // MARK ONE MESSAGE AS READ
    // ========================================================

    async markMessageAsRead(messageId) {

        try {

            if (!messageId) {

                throw new Error(
                    "Message ID is required."
                );

            }


            const response = await fetch(
                `${this.backendURL}/api/messenger/chat/message/${encodeURIComponent(messageId)}/read`,
                {
                    method: "PATCH",

                    headers: this.getHeaders()
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Mark message as read failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // MARK CONVERSATION AS READ
    // ========================================================

    async markConversationAsRead(userId) {

        try {

            if (!userId) {

                throw new Error(
                    "User ID is required."
                );

            }


            const response = await fetch(
                `${this.backendURL}/api/messenger/chat/conversation/${encodeURIComponent(userId)}/read`,
                {
                    method: "PATCH",

                    headers: this.getHeaders()
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Mark conversation as read failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // GET TOTAL UNREAD COUNT
    // ========================================================

    async getUnreadCount() {

        try {

            const response = await fetch(
                `${this.backendURL}/api/messenger/chat/unread`,
                {
                    method: "GET",

                    headers: this.getHeaders()
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Get unread count failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // GET CONVERSATION UNREAD COUNT
    // ========================================================

    async getConversationUnreadCount(userId) {

        try {

            if (!userId) {

                throw new Error(
                    "User ID is required."
                );

            }


            const response = await fetch(
                `${this.backendURL}/api/messenger/chat/conversation/${encodeURIComponent(userId)}/unread`,
                {
                    method: "GET",

                    headers: this.getHeaders()
                }
            );


            return await this.parseResponse(response);

        } catch (error) {

            console.error(
                "[GPA CHAT SERVICE] Get conversation unread count failed:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // COMMON RESPONSE HANDLER
    // ========================================================

    async parseResponse(response) {

        let data = null;


        try {

            data = await response.json();

        } catch (error) {

            data = null;

        }


        if (!response.ok) {

            const message =
                data?.message ||
                `Request failed with status ${response.status}`;


            throw new Error(message);

        }


        return data;

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerChatService =
    GPAMessengerChatService;


// ============================================================
// END GPA MESSENGER CHAT SERVICE
// ============================================================
// ============================================================
// GPA MESSENGER - CHAT HISTORY
// ============================================================
// Purpose:
// - Load 1-to-1 conversation history
// - Store the currently loaded messages
// - Provide conversation data to the Chat Window
//
// IMPORTANT:
// - Uses messengerChatService.js
// - No direct fetch()
// - No Socket.IO
// - No message sending
// - No permission logic
// ============================================================


const GPAMessengerChatHistory = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    messages: [],

    currentUserId: null,

    loading: false,


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize() {

        if (this.initialized) {

            console.log(
                "[GPA CHAT HISTORY] Already initialized."
            );

            return this;

        }


        this.initialized = true;


        console.log(
            "[GPA CHAT HISTORY] Initialized."
        );


        return this;

    },


    // ========================================================
    // LOAD CONVERSATION
    // ========================================================

    async loadConversation(userId) {

        if (!userId) {

            console.warn(
                "[GPA CHAT HISTORY] User ID is required."
            );

            return [];

        }


        if (
            typeof GPAMessengerChatService === "undefined"
        ) {

            console.error(
                "[GPA CHAT HISTORY] Chat Service is not available."
            );

            return [];

        }


        if (this.loading) {

            console.log(
                "[GPA CHAT HISTORY] Conversation loading already in progress."
            );

        }


        this.loading = true;


        this.currentUserId =
            String(userId);


        try {

            console.log(
                "[GPA CHAT HISTORY] Loading conversation:",
                this.currentUserId
            );


            const response =
                await GPAMessengerChatService.getConversation(
                    this.currentUserId
                );


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to load conversation."
                );

            }


            this.messages =
                Array.isArray(response.messages)
                    ? response.messages
                    : [];


            console.log(
                "[GPA CHAT HISTORY] Messages loaded:",
                this.messages.length
            );


            return [
                ...this.messages
            ];

        } catch (error) {

            console.error(
                "[GPA CHAT HISTORY] Failed to load conversation:",
                error
            );


            this.messages = [];


            throw error;

        } finally {

            this.loading = false;

        }

    },


    // ========================================================
    // GET MESSAGES
    // ========================================================

    getMessages() {

        return [
            ...this.messages
        ];

    },


    // ========================================================
    // GET CURRENT USER
    // ========================================================

    getCurrentUserId() {

        return this.currentUserId;

    },


    // ========================================================
    // CLEAR
    // ========================================================

    clear() {

        this.messages = [];

        this.currentUserId = null;

        this.loading = false;


        console.log(
            "[GPA CHAT HISTORY] Cleared."
        );

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerChatHistory =
    GPAMessengerChatHistory;


// ============================================================
// END GPA MESSENGER CHAT HISTORY
// ============================================================
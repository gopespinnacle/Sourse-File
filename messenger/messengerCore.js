// ============================================================
// GPA MESSENGER - CORE / HEART
// ============================================================
// Purpose:
// - Central coordinator for GPA Messenger modules
// - Does NOT contain chat/call/notification logic
// - Registers individual Messenger modules
// - Starts the Messenger Socket Client
// ============================================================

const GPAMessengerChatSocket =
    typeof window !== "undefined"
        ? window.GPAMessengerChatSocket
        : null;

const GPAMessengerCore = {

    initialized: false,

    modules: {},

    options: {},


    // ========================================================
    // INITIALIZE MESSENGER
    // ========================================================

    initialize(options = {}) {

        if (this.initialized) {

            console.log(
                "GPA Messenger Core already initialized."
            );

            return this;
        }


        console.log(
            "=============================================="
        );

        console.log(
            "        GPA MESSENGER CORE STARTING"
        );

        console.log(
            "=============================================="
        );


        // ----------------------------------------------------
        // Store options
        // ----------------------------------------------------

        this.options = options;


        // ----------------------------------------------------
        // Prepare module registry
        // ----------------------------------------------------

        this.modules = {

    chat: null,

    call: null,

    notification: null,

    permissions: null,

    monitoring: null,

    retention: null,

    socketClient: null,

    chatSocket: null

};


        // ====================================================
        // SOCKET CLIENT
        // ====================================================
        // The Socket Client is a separate module.
        //
        // The Core only starts it.
        // Socket logic remains inside:
        //
        // messengerSocketClient.js
        // ====================================================

        if (
            typeof GPAMessengerSocketClient !== "undefined"
        ) {

            console.log(
                "GPA Messenger Core: Initializing Socket Client..."
            );


            GPAMessengerSocketClient.initialize();


            this.registerModule(
                "socketClient",
                GPAMessengerSocketClient
            );


                } else {

            console.warn(
                "GPA Messenger Core: Socket Client module not found."
            );

            console.warn(
                "Make sure messengerSocketClient.js is loaded before messengerCore.js."
            );

        }


        // ====================================================
        // CHAT SOCKET
        // ====================================================
        // The Chat Socket is a separate module.
        //
        // The Core only starts it.
        // Realtime chat logic remains inside:
        //
        // messenger/chat/messengerChatSocket.js
        // ====================================================

        if (
            GPAMessengerChatSocket &&
            typeof GPAMessengerChatSocket.initialize === "function"
        ) {

            console.log(
                "GPA Messenger Core: Initializing Chat Socket..."
            );


            GPAMessengerChatSocket.initialize();


            this.registerModule(
                "chatSocket",
                GPAMessengerChatSocket
            );


            console.log(
                "GPA Messenger Chat Socket initialized."
            );


        } else {

            console.warn(
                "GPA Messenger Core: Chat Socket module not found."
            );

            console.warn(
                "Make sure messengerChatSocket.js is loaded before messengerCore.js."
            );

        }


        // ====================================================
        // CORE READY
        // ====================================================

        this.initialized = true;


        console.log(
            "GPA Messenger Core initialized."
        );

        console.log(
            "GPA Messenger modules ready."
        );


        console.log(
            "=============================================="
        );


        return this;

    },


    // ========================================================
    // REGISTER MODULE
    // ========================================================

    registerModule(name, module) {

        if (!name) {

            console.error(
                "GPA Messenger Core: Module name is required."
            );

            return false;
        }


        this.modules[name] = module;


        console.log(
            "GPA Messenger Module Registered:",
            name
        );


        return true;

    },


    // ========================================================
    // GET MODULE
    // ========================================================

    getModule(name) {

        return this.modules[name] || null;

    },


    // ========================================================
    // CHECK CORE
    // ========================================================

    isInitialized() {

        return this.initialized === true;

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerCore = GPAMessengerCore;


// ============================================================
// END GPA MESSENGER CORE
// ============================================================
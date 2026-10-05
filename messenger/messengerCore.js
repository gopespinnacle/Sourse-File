// ============================================================
// GPA MESSENGER - CORE / HEART
// ============================================================
// Purpose:
// - Central coordinator for GPA Messenger modules
// - Does NOT contain chat/call/notification logic
// - Registers individual Messenger modules
// - Starts the Messenger Socket Client
// ============================================================

const gpaMessengerChatWindowModule =
    typeof window !== "undefined"
        ? window.GPAMessengerChatWindow
        : null;

const GPAMessengerCore = {

    initialized: false,

    modules: {},

    options: {},



    // ========================================================
    // INITIALIZE MESSENGER
    // ========================================================

    async initialize(options = {}) {

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

        const chatSocket = window.GPAMessengerChatSocket;

if (
    chatSocket &&
    typeof chatSocket.initialize === "function"
) {
    console.log("GPA Messenger Core: Initializing Chat Socket...");

    chatSocket.initialize();

    this.registerModule("chatSocket", chatSocket);

    console.log("GPA Messenger Chat Socket initialized.");
} else {
    console.warn("GPA Messenger Core: Chat Socket module not found.");
    console.warn(
        "Make sure messengerChatSocket.js is loaded before messengerCore.js."
    );
}


// ====================================================
// USER LIST
// ====================================================
// The Core only coordinates the User List modules.
//
// User data remains inside:
// users/messengerUserService.js
//
// User organization remains inside:
// users/messengerUserList.js
//
// User display remains inside:
// users/messengerUserListUI.js
// ====================================================

const userList =
    window.GPAMessengerUserList;

const userListUI =
    window.GPAMessengerUserListUI;


if (
    userList &&
    typeof userList.initialize === "function"
) {

    console.log(
        "GPA Messenger Core: Initializing User List..."
    );


    try {

        await userList.initialize();


        this.registerModule(
            "userList",
            userList
        );


        console.log(
            "GPA Messenger User List initialized."
        );


        if (
            userListUI &&
            typeof userListUI.initialize === "function"
        ) {

            console.log(
                "GPA Messenger Core: Initializing User List UI..."
            );


            userListUI.initialize();


            this.registerModule(
                "userListUI",
                userListUI
            );


            userListUI.renderUsers(
                userList.getAllUsers()
            );


            console.log(
                "GPA Messenger User List UI initialized."
            );

        } else {

            console.warn(
                "GPA Messenger Core: User List UI module not found."
            );

        }

    } catch (error) {

        console.error(
            "GPA Messenger Core: User List initialization failed:",
            error
        );

    }

    } else {

        console.warn(
            "GPA Messenger Core: User List module not found."
        );

    }


// ====================================================
// CHAT WINDOW
// ====================================================
// The Core only coordinates the Chat Window.
//
// Chat Window display and selected-user state remain inside:
//
// chat/messengerChatWindow.js
// ====================================================

if (
    gpaMessengerChatWindowModule &&
    typeof gpaMessengerChatWindowModule.initialize === "function"
) {

    console.log(
        "GPA Messenger Core: Initializing Chat Window..."
    );


    gpaMessengerChatWindowModule.initialize(
    "gpaMessengerChatWindow"
);


    this.registerModule(
    "chatWindow",
    gpaMessengerChatWindowModule
);


    console.log(
        "GPA Messenger Chat Window initialized."
    );

} else {

    console.warn(
        "GPA Messenger Core: Chat Window module not found."
    );

    console.warn(
        "Make sure messengerChatWindow.js is loaded before messengerCore.js."
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
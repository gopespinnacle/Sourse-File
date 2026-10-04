// ============================================================
// GPA MESSENGER - SOCKET.IO CLIENT
// ============================================================
// Purpose:
// - Connect Web Messenger to backend Socket.IO
// - Authenticate using existing Academy JWT
// - Support Founder token from localStorage
// - Support Teacher token from sessionStorage
// - Keep Messenger Socket.IO separate from existing Academy logic
// ============================================================

const GPAMessengerSocketClient = {

    socket: null,

    connected: false,

    authenticated: false,

    initialized: false,

    backendURL: "https://academy-backend-eatl.onrender.com",


    // ========================================================
    // INITIALIZE SOCKET CONNECTION
    // ========================================================

    initialize() {

        if (this.initialized) {

            console.log(
                "GPA Messenger Socket Client already initialized."
            );

            return this.socket;
        }


        // ----------------------------------------------------
        // Check Socket.IO library
        // ----------------------------------------------------

        if (typeof io === "undefined") {

            console.error(
                "GPA Messenger Socket Client: Socket.IO library not found."
            );

            return null;
        }


        // ----------------------------------------------------
        // Get existing Academy login token
        // ----------------------------------------------------
        // Founder uses localStorage
        // Teacher uses sessionStorage
        // ----------------------------------------------------

        const token =
            localStorage.getItem("token") ||
            sessionStorage.getItem("token");


        if (!token) {

            console.error(
                "GPA Messenger Socket Client: No login token found."
            );

            return null;
        }


        console.log(
            "GPA Messenger Socket Client: Login token found."
        );


        // ====================================================
        // CREATE SOCKET CONNECTION
        // ====================================================

        this.socket = io(this.backendURL, {

            transports: [
                "websocket",
                "polling"
            ],

            withCredentials: true,

            // ------------------------------------------------
            // IMPORTANT
            // This tells backend:
            // "This Socket.IO connection is for Messenger."
            //
            // Existing Academy Socket.IO connections
            // are NOT affected.
            // ------------------------------------------------

            auth: {

                messenger: true,

                token: token

            }

        });


        // ====================================================
        // SOCKET CONNECTED
        // ====================================================

        this.socket.on("connect", () => {

            this.connected = true;

            console.log(
                "GPA Messenger Socket Connected:",
                this.socket.id
            );

        });


        // ====================================================
        // MESSENGER AUTHENTICATED
        // ====================================================

        this.socket.on(
            "messenger:socket:authenticated",
            (data) => {

                this.authenticated =
                    data?.authenticated === true;


                if (this.authenticated) {

                    console.log(
                        "GPA Messenger Socket Authentication SUCCESS"
                    );

                    console.log(
                        "Messenger User:",
                        data.user
                    );

                } else {

                    console.error(
                        "GPA Messenger Socket Authentication FAILED"
                    );

                }

            }
        );


        // ====================================================
        // MESSENGER SOCKET ERROR
        // ====================================================

        this.socket.on(
            "messenger:socket:error",
            (data) => {

                this.authenticated = false;

                console.error(
                    "GPA Messenger Socket Error:",
                    data
                );

            }
        );


        // ====================================================
        // CONNECTION ERROR
        // ====================================================

        this.socket.on(
            "connect_error",
            (error) => {

                this.connected = false;

                console.error(
                    "GPA Messenger Socket Connection Error:",
                    error
                );

            }
        );


        // ====================================================
        // DISCONNECTED
        // ====================================================

        this.socket.on(
            "disconnect",
            (reason) => {

                this.connected = false;

                this.authenticated = false;

                console.log(
                    "GPA Messenger Socket Disconnected:",
                    reason
                );

            }
        );


        this.initialized = true;


        console.log(
            "GPA Messenger Socket Client initialized."
        );


        return this.socket;

    },


    // ========================================================
    // GET SOCKET
    // ========================================================

    getSocket() {

        return this.socket;

    },


    // ========================================================
    // CHECK CONNECTION
    // ========================================================

    isConnected() {

        return (
            this.connected === true &&
            this.socket !== null
        );

    },


    // ========================================================
    // CHECK AUTHENTICATION
    // ========================================================

    isAuthenticated() {

        return (
            this.authenticated === true &&
            this.socket !== null
        );

    },


    // ========================================================
    // DISCONNECT
    // ========================================================

    disconnect() {

        if (!this.socket) {

            return;

        }


        console.log(
            "GPA Messenger Socket Client disconnecting..."
        );


        this.socket.disconnect();


        this.socket = null;

        this.connected = false;

        this.authenticated = false;

        this.initialized = false;

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerSocketClient =
    GPAMessengerSocketClient;


// ============================================================
// END GPA MESSENGER SOCKET CLIENT
// ============================================================
// ============================================================
// GPA MESSENGER - FRONTEND USER SERVICE
// ============================================================
// Purpose:
// - Load users available to the logged-in Messenger user
// - Communicate with the Messenger Users API
// - Keep user-list API logic separate from UI
//
// IMPORTANT:
// - No UI code
// - No HTML manipulation
// - No Socket.IO code
// - No permission decisions
// - Backend remains the authority for permissions
// ============================================================


const GPAMessengerUserService = {

    // ========================================================
    // BACKEND URL
    // ========================================================

    backendURL:
        "https://academy-backend-eatl.onrender.com",


    // ========================================================
    // GET LOGIN TOKEN
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
    // GET MESSENGER USERS
    // ========================================================

    async getUsers() {

        try {

            console.log(
                "[GPA USER SERVICE] Loading Messenger users..."
            );


            const response = await fetch(
                `${this.backendURL}/api/messenger/users`,
                {
                    method: "GET",
                    headers: this.getHeaders()
                }
            );


            const data =
                await this.parseResponse(response);


            console.log(
                "[GPA USER SERVICE] Messenger users loaded:",
                data?.count ?? 0
            );


            return data;

        } catch (error) {

            console.error(
                "[GPA USER SERVICE] Failed to load Messenger users:",
                error
            );

            throw error;

        }

    },


    // ========================================================
    // GET SINGLE USER FROM LOADED LIST
    // ========================================================
    // This does NOT make another backend request.
    //
    // It is only a small helper for future Messenger modules.
    // ========================================================

    findUserById(users, userId) {

        if (!Array.isArray(users)) {

            return null;

        }


        if (!userId) {

            return null;

        }


        return (
            users.find(
                user =>
                    String(user._id) === String(userId)
            ) || null
        );

    },


    // ========================================================
    // FILTER USERS BY ROLE
    // ========================================================
    // Also does NOT make another backend request.
    // ========================================================

    filterByRole(users, role) {

        if (!Array.isArray(users)) {

            return [];

        }


        if (!role) {

            return users;

        }


        return users.filter(
            user => user.role === role
        );

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

window.GPAMessengerUserService =
    GPAMessengerUserService;


// ============================================================
// END GPA MESSENGER FRONTEND USER SERVICE
// ============================================================
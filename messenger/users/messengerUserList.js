// ============================================================
// GPA MESSENGER - USER LIST MODULE
// ============================================================
// Purpose:
// - Load Messenger users
// - Organize users by role
// - Provide user-list data to the Messenger UI
//
// IMPORTANT:
// - No backend API code
// - No Socket.IO code
// - No chat logic
// - No HTML page structure
// - No permission decisions
//
// Permissions are already enforced by the backend.
// This module only handles the returned user list.
// ============================================================


const GPAMessengerUserList = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    loading: false,

    users: [],

    admins: [],

    teachers: [],

    students: [],


    // ========================================================
    // INITIALIZE
    // ========================================================

    async initialize() {

        if (this.initialized) {

            console.log(
                "[GPA USER LIST] Already initialized."
            );

            return this;

        }


        console.log(
            "[GPA USER LIST] Initializing..."
        );


        await this.loadUsers();


        this.initialized = true;


        console.log(
            "[GPA USER LIST] Initialized."
        );


        return this;

    },


    // ========================================================
    // LOAD USERS
    // ========================================================

    async loadUsers() {

        if (this.loading) {

            console.log(
                "[GPA USER LIST] User loading already in progress."
            );

            return this.users;

        }


        this.loading = true;


        try {

            // ------------------------------------------------
            // User Service is responsible for API communication.
            // ------------------------------------------------

            if (
                typeof GPAMessengerUserService === "undefined"
            ) {

                throw new Error(
                    "GPAMessengerUserService is not available."
                );

            }


            const response =
                await GPAMessengerUserService.getUsers();


            if (
                !response ||
                response.success !== true
            ) {

                throw new Error(
                    response?.message ||
                    "Failed to load Messenger users."
                );

            }


            // ------------------------------------------------
            // Store complete returned list.
            // ------------------------------------------------

            this.users =
                Array.isArray(response.users)
                    ? response.users
                    : [];


            // ------------------------------------------------
            // Organize users by role.
            // ------------------------------------------------

            this.organizeUsers();


            console.log(
                "[GPA USER LIST] Users loaded:",
                this.users.length
            );


            console.log(
                "[GPA USER LIST] Admins:",
                this.admins.length
            );


            console.log(
                "[GPA USER LIST] Teachers:",
                this.teachers.length
            );


            console.log(
                "[GPA USER LIST] Students:",
                this.students.length
            );


            return this.users;

        } catch (error) {

            console.error(
                "[GPA USER LIST] Failed to load users:",
                error
            );


            throw error;

        } finally {

            this.loading = false;

        }

    },


    // ========================================================
    // ORGANIZE USERS
    // ========================================================

    organizeUsers() {

        this.admins = this.users.filter(
            user => user.role === "admin"
        );


        this.teachers = this.users.filter(
            user => user.role === "teacher"
        );


        this.students = this.users.filter(
            user => user.role === "student"
        );

    },


    // ========================================================
    // GET ALL USERS
    // ========================================================

    getAllUsers() {

        return [...this.users];

    },


    // ========================================================
    // GET ADMINS
    // ========================================================

    getAdmins() {

        return [...this.admins];

    },


    // ========================================================
    // GET TEACHERS
    // ========================================================

    getTeachers() {

        return [...this.teachers];

    },


    // ========================================================
    // GET STUDENTS
    // ========================================================

    getStudents() {

        return [...this.students];

    },


    // ========================================================
    // FIND USER
    // ========================================================

    findUser(userId) {

        if (!userId) {

            return null;

        }


        return (
            this.users.find(
                user =>
                    String(user._id) === String(userId)
            ) || null
        );

    },


    // ========================================================
    // CLEAR STATE
    // ========================================================

    clear() {

        this.users = [];

        this.admins = [];

        this.teachers = [];

        this.students = [];

        this.initialized = false;

        this.loading = false;


        console.log(
            "[GPA USER LIST] State cleared."
        );

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerUserList =
    GPAMessengerUserList;


// ============================================================
// END GPA MESSENGER USER LIST
// ============================================================
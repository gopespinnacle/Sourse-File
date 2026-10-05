// ============================================================
// GPA MESSENGER - USER LIST UI
// ============================================================
// Purpose:
// - Display Messenger users
// - Display users grouped by role
// - Provide search
// - Notify future modules when a user is selected
//
// IMPORTANT:
// - No API calls
// - No Socket.IO
// - No permission logic
// - No message logic
//
// Data comes from:
// GPAMessengerUserList
// ============================================================


const GPAMessengerUserListUI = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    container: null,

    searchInput: null,


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize(containerId = "gpaMessengerUserList") {

        if (this.initialized) {

            console.log(
                "[GPA USER LIST UI] Already initialized."
            );

            return this;

        }


        this.container =
            document.getElementById(containerId);


        if (!this.container) {

            console.error(
                "[GPA USER LIST UI] Container not found:",
                containerId
            );

            return this;

        }


        this.renderBase();


        this.initialized = true;


        console.log(
            "[GPA USER LIST UI] Initialized."
        );


        return this;

    },


    // ========================================================
    // BASE STRUCTURE
    // ========================================================

    renderBase() {

        this.container.innerHTML = `
            <div class="gpa-messenger-user-list">

                <div class="gpa-messenger-user-list-header">

                    <h2 class="gpa-messenger-user-list-title">
                        Messenger
                    </h2>

                    <input
                        type="text"
                        class="gpa-messenger-user-search"
                        placeholder="Search people..."
                        autocomplete="off"
                    >

                </div>

                <div
                    class="gpa-messenger-user-content"
                ></div>

            </div>
        `;


        this.searchInput =
            this.container.querySelector(
                ".gpa-messenger-user-search"
            );


        this.searchInput.addEventListener(
            "input",
            () => {

                this.renderUsers(
                    this.getFilteredUsers(
                        this.searchInput.value
                    )
                );

            }
        );

    },


    // ========================================================
    // SHOW LOADING
    // ========================================================

    showLoading() {

        const content =
            this.getContentContainer();


        if (!content) {
            return;
        }


        content.innerHTML = `
            <div class="gpa-messenger-user-status">
                Loading Messenger users...
            </div>
        `;

    },


    // ========================================================
    // SHOW ERROR
    // ========================================================

    showError(message) {

        const content =
            this.getContentContainer();


        if (!content) {
            return;
        }


        content.innerHTML = `
            <div class="gpa-messenger-user-status gpa-messenger-user-error">
                ${this.escapeHTML(message)}
            </div>
        `;

    },


    // ========================================================
    // RENDER USERS
    // ========================================================

    renderUsers(users) {

        const content =
            this.getContentContainer();


        if (!content) {
            return;
        }


        if (!Array.isArray(users) || users.length === 0) {

            content.innerHTML = `
                <div class="gpa-messenger-user-status">
                    No Messenger users found.
                </div>
            `;

            return;

        }


        const founders =
    users.filter(
        user => user.role === "founder"
    );


const admins =
    users.filter(
        user => user.role === "admin"
    );


const teachers =
    users.filter(
        user => user.role === "teacher"
    );


const students =
    users.filter(
        user => user.role === "student"
    );


content.innerHTML = "";


// ========================================================
// FOUNDER
// ========================================================

if (founders.length > 0) {

    content.appendChild(
        this.createGroup(
            "Founder",
            founders
        )
    );

}


// ========================================================
// ADMINS
// ========================================================

if (admins.length > 0) {

    content.appendChild(
        this.createGroup(
            "Admins",
            admins
        )
    );

}


// ========================================================
// TEACHERS
// ========================================================

if (teachers.length > 0) {

    content.appendChild(
        this.createGroup(
            "Teachers",
            teachers
        )
    );

}


// ========================================================
// STUDENTS
// ========================================================

if (students.length > 0) {

    content.appendChild(
        this.createGroup(
            "Students",
            students
        )
    );

}

    },


    // ========================================================
    // CREATE USER GROUP
    // ========================================================

    createGroup(title, users) {

        const group =
            document.createElement("div");


        group.className =
            "gpa-messenger-user-group";


        const titleElement =
            document.createElement("div");


        titleElement.className =
            "gpa-messenger-user-group-title";


        titleElement.textContent =
            title;


        group.appendChild(titleElement);


        users.forEach(user => {

            group.appendChild(
                this.createUserItem(user)
            );

        });


        return group;

    },


    // ========================================================
    // CREATE USER ITEM
    // ========================================================

    createUserItem(user) {

        const button =
            document.createElement("button");


        button.type = "button";


        button.className =
            "gpa-messenger-user-item";


        const avatar =
            document.createElement("div");


        avatar.className =
            "gpa-messenger-user-avatar";


        avatar.textContent =
            this.getInitials(user.name);


        const info =
            document.createElement("div");


        info.className =
            "gpa-messenger-user-info";


        const name =
            document.createElement("div");


        name.className =
            "gpa-messenger-user-name";


        name.textContent =
            user.name || "Unknown User";


        const role =
            document.createElement("div");


        role.className =
            "gpa-messenger-user-role";


        role.textContent =
            this.formatRole(user.role);


        info.appendChild(name);

        info.appendChild(role);


        button.appendChild(avatar);

        button.appendChild(info);


        button.addEventListener(
            "click",
            () => {

                this.handleUserSelected(user);

            }
        );


        return button;

    },


    // ========================================================
    // USER SELECTED
    // ========================================================

    handleUserSelected(user) {

        console.log(
            "[GPA USER LIST UI] User selected:",
            user
        );


        // Future Chat Window module will listen for this.
        // No chat logic is placed here.

        window.dispatchEvent(
            new CustomEvent(
                "gpa:messenger:user:selected",
                {
                    detail: {
                        user: user
                    }
                }
            )
        );

    },


    // ========================================================
    // FILTER USERS
    // ========================================================

    getFilteredUsers(searchText) {

        if (
            !window.GPAMessengerUserList ||
            !Array.isArray(
                window.GPAMessengerUserList.users
            )
        ) {

            return [];

        }


        const search =
            String(searchText || "")
                .trim()
                .toLowerCase();


        if (!search) {

            return [
                ...window.GPAMessengerUserList.users
            ];

        }


        return window.GPAMessengerUserList.users.filter(
            user => {

                const name =
                    String(user.name || "")
                        .toLowerCase();


                const role =
                    String(user.role || "")
                        .toLowerCase();


                const studentId =
                    String(user.studentId || "")
                        .toLowerCase();


                const teacherId =
                    String(user.teacherId || "")
                        .toLowerCase();


                const adminId =
                    String(user.adminId || "")
                        .toLowerCase();


                return (
                    name.includes(search) ||
                    role.includes(search) ||
                    studentId.includes(search) ||
                    teacherId.includes(search) ||
                    adminId.includes(search)
                );

            }
        );

    },


    // ========================================================
    // GET CONTENT CONTAINER
    // ========================================================

    getContentContainer() {

        if (!this.container) {
            return null;
        }


        return this.container.querySelector(
            ".gpa-messenger-user-content"
        );

    },


    // ========================================================
    // GET INITIALS
    // ========================================================

    getInitials(name) {

        if (!name) {
            return "?";
        }


        const parts =
            String(name)
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (parts.length === 1) {

            return parts[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();

    },


    // ========================================================
    // FORMAT ROLE
    // ========================================================

    formatRole(role) {

        if (!role) {
            return "";
        }


        return String(role)
            .charAt(0)
            .toUpperCase() +
            String(role).slice(1);

    },


    // ========================================================
    // ESCAPE HTML
    // ========================================================

    escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerUserListUI =
    GPAMessengerUserListUI;


// ============================================================
// END GPA MESSENGER USER LIST UI
// ============================================================
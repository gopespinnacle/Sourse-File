
const GPAMessengerChatHistory =
    typeof window !== "undefined"
        ? window.GPAMessengerChatHistory
        : null;
// ============================================================
// GPA MESSENGER - CHAT WINDOW
// ============================================================
// Purpose:
// - Display the selected Messenger user
// - Open the Chat Window when a user is selected
// - Maintain selected-user state
//
// IMPORTANT:
// - No API calls
// - No Socket.IO
// - No message sending
// - No conversation loading
// - No permission logic
//
// Future modules will handle:
// - Message history
// - Sending messages
// - Realtime messages
// - Read status
// ============================================================


const GPAMessengerChatWindow = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    container: null,

    selectedUser: null,


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize(
        containerId = "gpaMessengerChatWindow"
    ) {

        if (this.initialized) {

            console.log(
                "[GPA CHAT WINDOW] Already initialized."
            );

            return this;

        }


        this.container =
            document.getElementById(containerId);


        if (!this.container) {

            console.error(
                "[GPA CHAT WINDOW] Container not found:",
                containerId
            );

            return this;

        }


        this.renderEmptyState();


        this.registerUserSelectionListener();


        this.initialized = true;


        console.log(
            "[GPA CHAT WINDOW] Initialized."
        );


        return this;

    },


    // ========================================================
    // REGISTER USER SELECTION
    // ========================================================

    registerUserSelectionListener() {

        window.addEventListener(
            "gpa:messenger:user:selected",
            (event) => {

                const user =
                    event?.detail?.user;


                if (!user) {

                    console.warn(
                        "[GPA CHAT WINDOW] User selection event contained no user."
                    );

                    return;

                }


                this.openUser(user);

            }
        );

    },


    // ========================================================
    // OPEN USER
    // ========================================================

    openUser(user) {

    if (!user || !user._id) {

        console.warn(
            "[GPA CHAT WINDOW] Invalid user selected."
        );

        return;

    }


    this.selectedUser = user;


    console.log(
        "[GPA CHAT WINDOW] Opening conversation with:",
        user.name
    );


    this.renderUserHeader(user);


    // ========================================================
    // LOAD MESSAGE HISTORY
    // ========================================================

    if (
        GPAMessengerChatHistory &&
        typeof GPAMessengerChatHistory.loadConversation === "function"
    ) {

        GPAMessengerChatHistory.loadConversation(
            user._id
        )
        .then(() => {

            console.log(
                "[GPA CHAT WINDOW] Conversation history loaded for:",
                user.name
            );

        })
        .catch((error) => {

            console.error(
                "[GPA CHAT WINDOW] Failed to load conversation history:",
                error
            );

        });

    } else {

        console.warn(
            "[GPA CHAT WINDOW] Chat History module not found."
        );

    }

},


    // ========================================================
    // RENDER EMPTY STATE
    // ========================================================

    renderEmptyState() {

        this.container.innerHTML = `
            <div class="gpa-messenger-chat-window">

                <div class="gpa-messenger-chat-empty">
                    Select a person to start a conversation.
                </div>

            </div>
        `;

    },


    // ========================================================
    // RENDER USER HEADER
    // ========================================================

    renderUserHeader(user) {

        this.container.innerHTML = `
            <div class="gpa-messenger-chat-window">

                <div class="gpa-messenger-chat-header">

                    <div class="gpa-messenger-chat-header-avatar">
                        ${this.escapeHTML(
                            this.getInitials(user.name)
                        )}
                    </div>

                    <div class="gpa-messenger-chat-header-info">

                        <div class="gpa-messenger-chat-header-name">
                            ${this.escapeHTML(
                                user.name || "Unknown User"
                            )}
                        </div>

                        <div class="gpa-messenger-chat-header-role">
                            ${this.escapeHTML(
                                this.formatRole(user.role)
                            )}
                        </div>

                    </div>

                </div>

                <div class="gpa-messenger-chat-content">

                    <div class="gpa-messenger-chat-messages">

                        <div class="gpa-messenger-chat-empty">
                            Conversation will appear here.
                        </div>

                    </div>

                    <div class="gpa-messenger-chat-input-area">

                        <div class="gpa-messenger-chat-input-placeholder">
                            Message input will be added in the next module.
                        </div>

                    </div>

                </div>

            </div>
        `;

    },


    // ========================================================
    // RENDER CONVERSATION PLACEHOLDER
    // ========================================================

    renderConversationPlaceholder(user) {

        console.log(
            "[GPA CHAT WINDOW] Conversation placeholder ready for:",
            user.name
        );

    },


    // ========================================================
    // GET SELECTED USER
    // ========================================================

    getSelectedUser() {

        return this.selectedUser;

    },


    // ========================================================
    // CLEAR SELECTION
    // ========================================================

    clearSelection() {

        this.selectedUser = null;


        if (this.container) {

            this.renderEmptyState();

        }


        console.log(
            "[GPA CHAT WINDOW] Selection cleared."
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


        const value =
            String(role);


        return (
            value.charAt(0).toUpperCase() +
            value.slice(1)
        );

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

window.GPAMessengerChatWindow =
    GPAMessengerChatWindow;


// ============================================================
// END GPA MESSENGER CHAT WINDOW
// ============================================================
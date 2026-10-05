// ============================================================
// GPA MESSENGER - CHAT COMPOSER
// ============================================================
// Purpose:
// - Display message input
// - Display Send button
// - Handle typing
// - Handle Enter key
// - Send messages through existing Chat Socket
//
// IMPORTANT:
// - No API calls
// - No new Socket.IO connection
// - No permission logic
// - No message history logic
// - No conversation loading
//
// Existing modules used:
// - GPAMessengerChatSocket
// - gpa:messenger:user:selected event
//
// Future modules will handle:
// - Message rendering
// - Read status
// - Attachments
// - Typing indicator
// ============================================================


const GPAMessengerChatComposer = {

    // ========================================================
    // STATE
    // ========================================================

    initialized: false,

    container: null,

    selectedUser: null,

    input: null,

    sendButton: null,


    // ========================================================
    // INITIALIZE
    // ========================================================

    initialize(
        containerSelector = ".gpa-messenger-chat-input-area"
    ) {

        if (this.initialized) {

            console.log(
                "[GPA CHAT COMPOSER] Already initialized."
            );

            return this;

        }


        this.container =
    containerSelector instanceof HTMLElement
        ? containerSelector
        : document.querySelector(containerSelector);


        /*
         * The Chat Window creates the input-area
         * after a user is selected.
         *
         * Therefore the Composer does not fail if
         * the container does not exist yet.
         */

        if (!this.container) {

            console.log(
                "[GPA CHAT COMPOSER] Input container not available yet."
            );

        }


        this.registerUserSelectionListener();


        this.initialized = true;


        console.log(
            "[GPA CHAT COMPOSER] Initialized."
        );


        return this;

    },


    // ========================================================
    // USER SELECTION
    // ========================================================

    registerUserSelectionListener() {

        window.addEventListener(
            "gpa:messenger:user:selected",
            (event) => {

                const user =
                    event?.detail?.user;


                if (!user) {

                    console.warn(
                        "[GPA CHAT COMPOSER] No user received."
                    );

                    return;

                }


                this.selectedUser = user;


                /*
                 * Chat Window has already received the same
                 * user-selection event and rendered its UI.
                 */

                setTimeout(() => {

                    this.findContainer();

                    this.render();

                }, 0);

            }
        );

    },


    // ========================================================
    // FIND CONTAINER
    // ========================================================

    findContainer() {

        this.container =
            document.querySelector(
                ".gpa-messenger-chat-input-area"
            );


        return !!this.container;

    },


    // ========================================================
    // RENDER COMPOSER
    // ========================================================

    render() {

        if (!this.container) {

            console.warn(
                "[GPA CHAT COMPOSER] Input container not found."
            );

            return;

        }


        this.container.innerHTML = `

            <div class="gpa-messenger-chat-composer">

                <input
                    type="text"
                    class="gpa-messenger-chat-input"
                    placeholder="Type a message..."
                    maxlength="5000"
                    autocomplete="off"
                >

                <button
                    type="button"
                    class="gpa-messenger-chat-send-button"
                >
                    Send
                </button>

            </div>

        `;


        this.input =
            this.container.querySelector(
                ".gpa-messenger-chat-input"
            );


        this.sendButton =
            this.container.querySelector(
                ".gpa-messenger-chat-send-button"
            );


        this.registerInputEvents();


        /*
         * Automatically focus the message box.
         */

        if (this.input) {

            this.input.focus();

        }


        console.log(
            "[GPA CHAT COMPOSER] Composer rendered for:",
            this.selectedUser?.name
        );

    },


    // ========================================================
    // INPUT EVENTS
    // ========================================================

    registerInputEvents() {

        if (!this.input || !this.sendButton) {

            return;

        }


        /*
         * Send button
         */

        this.sendButton.addEventListener(
            "click",
            () => {

                this.send();

            }
        );


        /*
         * Enter key
         */

        this.input.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    this.send();

                }

            }
        );

    },


    // ========================================================
    // SEND MESSAGE
    // ========================================================

    send() {

        if (!this.selectedUser) {

            console.warn(
                "[GPA CHAT COMPOSER] No conversation selected."
            );

            return;

        }


        if (!this.input) {

            console.warn(
                "[GPA CHAT COMPOSER] Message input not found."
            );

            return;

        }


        const message =
            this.input.value.trim();


        /*
         * Prevent empty messages.
         */

        if (!message) {

            return;

        }


        /*
         * Make sure the existing Chat Socket
         * is available.
         */

        if (
            !window.GPAMessengerChatSocket ||
            typeof window.GPAMessengerChatSocket.sendMessage !== "function"
        ) {

            console.error(
                "[GPA CHAT COMPOSER] Chat Socket is not available."
            );

            return;

        }


        /*
         * Disable button while sending.
         */

        if (this.sendButton) {

            this.sendButton.disabled = true;

        }


        console.log(
            "[GPA CHAT COMPOSER] Sending message to:",
            this.selectedUser.name
        );


        /*
         * IMPORTANT:
         *
         * We send ONLY the receiver ID.
         *
         * The backend gets the sender identity
         * from the authenticated Socket.IO socket.
         */

        window.GPAMessengerChatSocket.sendMessage(
            this.selectedUser._id,
            message,
            (result) => {

                /*
                 * Re-enable Send button.
                 */

                if (this.sendButton) {

                    this.sendButton.disabled = false;

                }


                /*
                 * Successful send.
                 */

                if (
                    result &&
                    result.success === true
                ) {

                    console.log(
                        "[GPA CHAT COMPOSER] Message sent successfully."
                    );


                    /*
                     * Clear input.
                     */

                    this.input.value = "";


                    this.input.focus();


                    /*
                     * Tell future message-rendering modules
                     * that a message was sent.
                     */

                    window.dispatchEvent(
                        new CustomEvent(
                            "gpa:messenger:message:sent",
                            {
                                detail: {
                                    message:
                                        result.message || null,

                                    receiver:
                                        this.selectedUser
                                }
                            }
                        )
                    );


                    return;

                }


                /*
                 * Send failed.
                 */

                console.error(
                    "[GPA CHAT COMPOSER] Message send failed:",
                    result
                );

            }
        );

    },


    // ========================================================
    // CLEAR
    // ========================================================

    clear() {

        if (this.input) {

            this.input.value = "";

        }

    },


    // ========================================================
    // GET SELECTED USER
    // ========================================================

    getSelectedUser() {

        return this.selectedUser;

    }

};


// ============================================================
// GLOBAL ACCESS
// ============================================================

window.GPAMessengerChatComposer =
    GPAMessengerChatComposer;


// ============================================================
// END GPA MESSENGER CHAT COMPOSER
// ============================================================
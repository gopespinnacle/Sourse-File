/**
 * ============================================================
 * GPA MESSENGER
 * MODULE 1
 * PRIMARY USER CHAT
 * ============================================================
 *
 * PURPOSE:
 *
 * The Primary User sends a message.
 *
 * The message immediately appears in the Primary User's
 * conversation area.
 *
 * This module is FRONTEND ONLY.
 *
 * ============================================================
 */

(function () {

    "use strict";


    // ============================================================
    // PRIMARY USER CHAT
    // ============================================================

    class PrimaryUserChat {

        constructor() {

            this.conversation =
                document.getElementById(
                    "gpaPrimaryConversation"
                );

            this.input =
                document.getElementById(
                    "gpaPrimaryMessageInput"
                );

            this.sendButton =
                document.getElementById(
                    "gpaPrimarySendButton"
                );


            console.log(
                "[GPA PRIMARY CHAT] Module loaded."
            );
        }


        // ========================================================
        // INITIALIZE
        // ========================================================

        initialize() {

            if (!this.conversation) {

                console.error(
                    "[GPA PRIMARY CHAT] " +
                    "Conversation element not found."
                );

                return;
            }


            if (!this.input) {

                console.error(
                    "[GPA PRIMARY CHAT] " +
                    "Message input not found."
                );

                return;
            }


            if (!this.sendButton) {

                console.error(
                    "[GPA PRIMARY CHAT] " +
                    "Send button not found."
                );

                return;
            }


            // ----------------------------------------------------
            // SEND BUTTON
            // ----------------------------------------------------

            this.sendButton.addEventListener(
                "click",
                () => {

                    this.sendMessage();

                }
            );


            // ----------------------------------------------------
            // ENTER KEY
            // ----------------------------------------------------

            this.input.addEventListener(
                "keydown",
                (event) => {

                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {

                        event.preventDefault();

                        this.sendMessage();

                    }

                }
            );


            console.log(
                "[GPA PRIMARY CHAT] " +
                "Module initialized successfully."
            );
        }


        // ========================================================
        // SEND MESSAGE
        // ========================================================

        sendMessage() {

            const messageText =
                this.input.value.trim();


            // ----------------------------------------------------
            // DO NOTHING IF EMPTY
            // ----------------------------------------------------

            if (!messageText) {

                return;
            }


            console.log(
                "[GPA PRIMARY CHAT] " +
                "Primary user sending:",
                messageText
            );


            // ----------------------------------------------------
            // CREATE MESSAGE
            // ----------------------------------------------------

            const message = {

                id:
                    this.createMessageId(),

                text:
                    messageText,

                sender:
                    "primary-user",

                createdAt:
                    new Date().toISOString(),

                // =================================================
                // MESSAGE DIRECTION
                // =================================================
                // This message was created by the current user.
                //
                // Therefore it must appear on the RIGHT.
                // =================================================

                direction:
                    "outgoing"

            };


            // ----------------------------------------------------
            // IMPORTANT
            //
            // Display the message IMMEDIATELY.
            //
            // We are intentionally not waiting for any server.
            // ----------------------------------------------------

            this.displayMessage(
                message
            );


            // ----------------------------------------------------
            // CLEAR INPUT
            // ----------------------------------------------------

            this.input.value = "";


            // ----------------------------------------------------
            // RETURN FOCUS TO INPUT
            // ----------------------------------------------------

            this.input.focus();


            // ========================================================
            // MODULE 2
            // SEND MESSAGE TO BACKEND SOCKET
            // ========================================================

            if (
                window.GPAPrimaryUserSocket &&
                typeof window.GPAPrimaryUserSocket.sendMessage ===
                    "function"
            ) {

                window.GPAPrimaryUserSocket.sendMessage(
                    message
                );

            }


            console.log(
                "[GPA PRIMARY CHAT] " +
                "Message displayed immediately."
            );
        }


        // ========================================================
        // DISPLAY MESSAGE
        // ========================================================

        displayMessage(message) {

            // ----------------------------------------------------
            // MESSAGE ROW
            // ----------------------------------------------------

            const messageRow =
                document.createElement(
                    "div"
                );


            messageRow.className =
                "gpa-primary-message-row";

                if (message.id) {
    messageRow.dataset.messageId = message.id;
}


            // ====================================================
            // MESSAGE DIRECTION
            // ====================================================

            /*
             *
             * outgoing
             * --------
             * Current user's message.
             *
             * This will be displayed on the RIGHT.
             *
             *
             * incoming
             * --------
             * Other person's message.
             *
             * This will be displayed on the LEFT.
             *
             */

            if (
                message.direction ===
                "incoming"
            ) {

                messageRow.classList.add(
                    "incoming"
                );

            }
            else {

                messageRow.classList.add(
                    "outgoing"
                );

            }


            // ----------------------------------------------------
            // MESSAGE BUBBLE
            // ----------------------------------------------------

            const messageBubble =
                document.createElement(
                    "div"
                );


            messageBubble.className =
                "gpa-primary-message-bubble";


            /*
             * IMPORTANT:
             *
             * textContent is used instead of innerHTML.
             *
             * This prevents the user from inserting HTML or
             * JavaScript into the conversation.
             */

            
const messageText = document.createElement("span");
messageText.textContent = message.text || "";
messageBubble.appendChild(messageText);

if (message.direction !== "incoming") {
    const statusTick = document.createElement("span");

    statusTick.className = "gpa-primary-message-status";
    statusTick.textContent = "✓";
    statusTick.dataset.status = message.deliveryStatus || "sent";
    statusTick.setAttribute("aria-label", "Sent");

    if (message.deliveryStatus === "delivered" ||
        message.deliveryStatus === "read") {
        statusTick.textContent = "✓✓";
        statusTick.classList.add(message.deliveryStatus);
        statusTick.setAttribute(
            "aria-label",
            message.deliveryStatus === "read" ? "Read" : "Delivered"
        );
    }

    messageBubble.appendChild(statusTick);
}



            // ----------------------------------------------------
            // ADD BUBBLE TO ROW
            // ----------------------------------------------------

            messageRow.appendChild(
                messageBubble
            );


            // ----------------------------------------------------
            // ADD ROW TO CONVERSATION
            // ----------------------------------------------------

            this.conversation.appendChild(
                messageRow
            );


            // ----------------------------------------------------
            // SCROLL TO LATEST MESSAGE
            // ----------------------------------------------------

            this.conversation.scrollTop =
                this.conversation.scrollHeight;
        }

        
updateMessageStatus(messageId, deliveryStatus) {
    if (!messageId) return;

    const rows = this.conversation.querySelectorAll(
        ".gpa-primary-message-row"
    );

    rows.forEach((row) => {
        if (row.dataset.messageId !== String(messageId)) return;

        const tick = row.querySelector(".gpa-primary-message-status");
        if (!tick) return;

        tick.classList.remove("delivered", "read");

        if (deliveryStatus === "read") {
            tick.textContent = "✓✓";
            tick.classList.add("read");
            tick.setAttribute("aria-label", "Read");
        } else if (deliveryStatus === "delivered") {
            tick.textContent = "✓✓";
            tick.classList.add("delivered");
            tick.setAttribute("aria-label", "Delivered");
        } else {
            tick.textContent = "✓";
            tick.setAttribute("aria-label", "Sent");
        }

        tick.dataset.status = deliveryStatus;
    });
}



        // ========================================================
        // MESSAGE ID
        // ========================================================

        createMessageId() {

            return (
                "primary_" +
                Date.now() +
                "_" +
                Math.random()
                    .toString(36)
                    .substring(2, 10)
            );
        }

    }


    // ============================================================
    // START MODULE
    // ============================================================

    function startPrimaryUserChat() {

        const primaryUserChat =
            new PrimaryUserChat();


        primaryUserChat.initialize();


        /*
         * Make the module available globally.
         *
         * Later modules can communicate with this module
         * without modifying this module's internal code.
         */

        window.GPAPrimaryUserChat =
            primaryUserChat;
    }


    // ============================================================
    // DOM READY
    // ============================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startPrimaryUserChat
        );

    }
    else {

        startPrimaryUserChat();

    }

})();

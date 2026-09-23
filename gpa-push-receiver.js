// ==========================================
// GPA PUSH RECEIVER — NEW SYSTEM
// ==========================================

(function () {

    "use strict";


    // ==========================================
    // WAIT FOR FIREBASE
    // ==========================================

    if (!window.firebase) {

        console.error(
            "❌ GPA PUSH RECEIVER: Firebase SDK not loaded."
        );

        return;

    }


    try {

        // --------------------------------------
        // GET FIREBASE MESSAGING
        // --------------------------------------

        const messaging =
            firebase.messaging();


        // --------------------------------------
        // FOREGROUND PUSH MESSAGE
        // --------------------------------------

        messaging.onMessage(
            async function (payload) {

                console.log(
                    "🔥 GPA NEW PUSH RECEIVED:",
                    payload
                );


                const title =
                    payload.notification?.title ||
                    payload.data?.title ||
                    "GPA Messenger";


                const body =
                    payload.notification?.body ||
                    payload.data?.body ||
                    "You have a new message.";


                const conversationId =
                    payload.data?.conversationId ||
                    "";


                const messageId =
                    payload.data?.messageId ||
                    "";


                const senderId =
                    payload.data?.senderId ||
                    "";


                const targetUrl =
                    payload.data?.url ||
                    "https://www.gopespinnacle.com/gpa-messenger.html";


                console.log(
                    "GPA PUSH TITLE:",
                    title
                );

                console.log(
                    "GPA PUSH BODY:",
                    body
                );

                console.log(
                    "GPA PUSH CONVERSATION:",
                    conversationId
                );

                console.log(
                    "GPA PUSH MESSAGE:",
                    messageId
                );


                // ----------------------------------
                // DISPLAY NOTIFICATION
                // ----------------------------------

                try {

                    const registration =
                        await navigator.serviceWorker.ready;


                    await registration.showNotification(

                        title,

                        {

                            body:
                                body,

                            icon:
                                "/favicon.ico",

                            badge:
                                "/favicon.ico",

                            tag:
                                "gpa-message-" +
                                messageId,

                            renotify:
                                true,

                            data: {

                                type:
                                    "gpa_message",

                                url:
                                    targetUrl,

                                conversationId:
                                    conversationId,

                                messageId:
                                    messageId,

                                senderId:
                                    senderId

                            }

                        }

                    );


                    console.log(
                        "✅ GPA NEW PUSH NOTIFICATION DISPLAYED"
                    );

                }
                catch (notificationError) {

                    console.error(
                        "❌ GPA PUSH DISPLAY ERROR:",
                        notificationError
                    );

                }

            }
        );


        console.log(
            "✅ GPA PUSH FOREGROUND RECEIVER READY"
        );

    }
    catch (error) {

        console.error(
            "❌ GPA PUSH RECEIVER ERROR:",
            error
        );

    }

})();
// ==========================================
// GPA PUSH REGISTRATION — NEW SYSTEM
// ==========================================

(function () {

    "use strict";


    // ==========================================
    // CONFIGURATION
    // ==========================================

    const GPA_PUSH_API =
        "https://academy-backend-eatl.onrender.com/api/push-token/register";


    // ==========================================
    // REGISTER PUSH TOKEN
    // ==========================================

    async function registerGPAPushToken(
        pushToken,
        platform,
        deviceId = ""
    ) {

        try {

            if (!pushToken) {

                console.warn(
                    "GPA PUSH: No push token supplied."
                );

                return false;

            }


            const loginToken =
                sessionStorage.getItem("token") ||
                localStorage.getItem("token");


            if (!loginToken) {

                console.warn(
                    "GPA PUSH: User is not logged in."
                );

                return false;

            }


            const response =
                await fetch(
                    GPA_PUSH_API,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                "Bearer " +
                                loginToken
                        },

                        body: JSON.stringify({

                            token:
                                pushToken,

                            platform:
                                platform,

                            deviceId:
                                deviceId

                        })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                console.error(
                    "GPA PUSH REGISTRATION FAILED:",
                    data
                );

                return false;

            }


            console.log(
                "✅ GPA PUSH TOKEN REGISTERED:",
                data
            );


            return true;

        }
        catch (error) {

            console.error(
                "❌ GPA PUSH REGISTRATION ERROR:",
                error
            );

            return false;

        }

    }


    // ==========================================
    // MAKE FUNCTION AVAILABLE GLOBALLY
    // ==========================================

    window.registerGPAPushToken =
        registerGPAPushToken;


})();
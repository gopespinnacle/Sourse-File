/* =========================================================
   GPA GLOBAL NOTIFICATION LOADER
   ========================================================= */

(function () {

    function loadScript(src) {

        return new Promise(function (resolve, reject) {

            const script = document.createElement("script");

            script.src = src;

            script.onload = resolve;

            script.onerror = function () {
                reject(
                    new Error(
                        "Failed to load: " + src
                    )
                );
            };

            document.head.appendChild(script);

        });

    }


    async function initializeGPANotifications() {

        try {

            // Firebase App
            await loadScript(
                "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
            );


            // Firebase Messaging
            await loadScript(
                "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
            );


            // GPA notification system
            await loadScript(
                "/gpa-notifications.js"
            );


            console.log(
                "GPA Global Notification System Loaded."
            );

        }
        catch (error) {

            console.error(
                "GPA GLOBAL NOTIFICATION LOADER ERROR:",
                error
            );

        }

    }


    initializeGPANotifications();

})();
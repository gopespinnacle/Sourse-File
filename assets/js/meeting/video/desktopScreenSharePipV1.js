/*
===========================================================
GOPES PINNACLE ACADEMY
DESKTOP SCREEN SHARE PIP V1

STEP 1
Desktop-only Document Picture-in-Picture foundation.

DO NOT TOUCH:
- Screen Share WebRTC
- Server signaling
- Mobile layout
- Annotation PIP
===========================================================
*/

window.DesktopScreenSharePip = {

    pipWindow: null,

    pipVideo: null,

    prepared: false,


    /*
    =======================================================
    DESKTOP CHECK
    =======================================================
    */

    isDesktop() {

        return (
            window.innerWidth > 768 &&
            window.innerWidth > window.innerHeight
        );

    },


    /*
    =======================================================
    SUPPORTED CHECK
    =======================================================
    */

    isSupported() {

        return (
            "documentPictureInPicture" in window &&
            typeof documentPictureInPicture.requestWindow ===
                "function"
        );

    },


    /*
    =======================================================
    PREPARE PIP WINDOW

    Called directly from the Share Screen button.

    This is intentionally called BEFORE
    ScreenShare.start() so the browser still has
    the user's click activation.
    =======================================================
    */

    async prepare() {

        /*
        ---------------------------------------------------
        DESKTOP ONLY
        ---------------------------------------------------
        */

        if (!this.isDesktop()) {

            console.log(
                "DESKTOP PIP V1: MOBILE/TABLET — SKIPPED"
            );

            return false;

        }


        /*
        ---------------------------------------------------
        BROWSER SUPPORT
        ---------------------------------------------------
        */

        if (!this.isSupported()) {

            console.warn(
                "DESKTOP PIP V1: DOCUMENT PIP NOT SUPPORTED"
            );

            return false;

        }


        /*
        ---------------------------------------------------
        ALREADY OPEN
        ---------------------------------------------------
        */

        if (
            this.pipWindow &&
            !this.pipWindow.closed
        ) {

            return true;

        }


        try {

            console.log(
                "DESKTOP PIP V1: OPENING PIP WINDOW"
            );


            /*
            ------------------------------------------------
            CREATE DOCUMENT PIP WINDOW
            ------------------------------------------------
            */

            this.pipWindow =
                await documentPictureInPicture.requestWindow({

                    width: 360,

                    height: 240

                });


            /*
            ------------------------------------------------
            PIP WINDOW BASIC STYLE
            ------------------------------------------------
            */

            const pipDocument =
                this.pipWindow.document;


            pipDocument.documentElement.style.margin =
                "0";

            pipDocument.documentElement.style.padding =
                "0";

            pipDocument.documentElement.style.width =
                "100%";

            pipDocument.documentElement.style.height =
                "100%";

            pipDocument.body.style.margin =
                "0";

            pipDocument.body.style.padding =
                "0";

            pipDocument.body.style.width =
                "100%";

            pipDocument.body.style.height =
                "100%";

            pipDocument.body.style.background =
                "#202124";

            pipDocument.body.style.overflow =
                "hidden";


            /*
            ------------------------------------------------
            GOOGLE-MEET STYLE PIP ROOT
            ------------------------------------------------
            */

            const pipRoot =
                pipDocument.createElement("div");

            pipRoot.id =
                "desktopScreenSharePip";

            pipRoot.style.position =
                "relative";

            pipRoot.style.width =
                "100%";

            pipRoot.style.height =
                "100%";

            pipRoot.style.background =
                "#202124";

            pipRoot.style.borderRadius =
                "12px";

            pipRoot.style.overflow =
                "hidden";


            /*
            ------------------------------------------------
            TEMPORARY STATUS
            ------------------------------------------------
            */

            const status =
                pipDocument.createElement("div");

            status.id =
                "desktopPipStatus";

            status.textContent =
                "Starting screen share…";

            status.style.position =
                "absolute";

            status.style.left =
                "50%";

            status.style.top =
                "50%";

            status.style.transform =
                "translate(-50%, -50%)";

            status.style.color =
                "#ffffff";

            status.style.fontFamily =
                "Arial, sans-serif";

            status.style.fontSize =
                "14px";

            status.style.opacity =
                "0.85";

            status.style.zIndex =
                "10";


            /*
            ------------------------------------------------
            ADD TO PIP
            ------------------------------------------------
            */

            pipRoot.appendChild(
                status
            );

            pipDocument.body.appendChild(
                pipRoot
            );


            /*
            ------------------------------------------------
            PIP CLOSED
            ------------------------------------------------
            */

            this.pipWindow.addEventListener(
                "pagehide",
                () => {

                    console.log(
                        "DESKTOP PIP V1: PIP WINDOW CLOSED"
                    );

                    this.pipWindow =
                        null;

                    this.pipVideo =
                        null;

                    this.prepared =
                        false;

                }
            );


            this.prepared =
                true;


            console.log(
                "DESKTOP PIP V1: PIP WINDOW READY"
            );


            return true;

        }

        catch (error) {

            console.error(
                "DESKTOP PIP V1: PIP OPEN ERROR:",
                error
            );


            this.pipWindow =
                null;

            this.prepared =
                false;


            return false;

        }

    },


    /*
    =======================================================
    SHOW SCREEN VIDEO
    =======================================================
    */

    showScreen(stream) {

        if (
            !this.pipWindow ||
            this.pipWindow.closed
        ) {

            console.warn(
                "DESKTOP PIP V1: PIP WINDOW NOT AVAILABLE"
            );

            return;

        }


        const pipDocument =
            this.pipWindow.document;


        const root =
            pipDocument.getElementById(
                "desktopScreenSharePip"
            );


        if (!root) {

            return;

        }


        /*
        ---------------------------------------------------
        REMOVE STATUS
        ---------------------------------------------------
        */

        const status =
            pipDocument.getElementById(
                "desktopPipStatus"
            );

        if (status) {

            status.remove();

        }


        /*
        ---------------------------------------------------
        CREATE VIDEO
        ---------------------------------------------------
        */

        if (!this.pipVideo) {

            this.pipVideo =
                pipDocument.createElement(
                    "video"
                );


            this.pipVideo.autoplay =
                true;

            this.pipVideo.playsInline =
                true;

            this.pipVideo.muted =
                true;

            this.pipVideo.style.position =
                "absolute";

            this.pipVideo.style.left =
                "0";

            this.pipVideo.style.top =
                "0";

            this.pipVideo.style.width =
                "100%";

            this.pipVideo.style.height =
                "100%";

            this.pipVideo.style.objectFit =
                "contain";

            this.pipVideo.style.background =
                "#000";


            root.appendChild(
                this.pipVideo
            );

        }


        /*
        ---------------------------------------------------
        ATTACH SCREEN STREAM
        ---------------------------------------------------
        */

        this.pipVideo.srcObject =
            stream;


        this.pipVideo.play()
            .catch(
                error => {

                    console.warn(
                        "DESKTOP PIP V1: VIDEO PLAY ERROR:",
                        error
                    );

                }
            );


        console.log(
            "DESKTOP PIP V1: SCREEN VIDEO ATTACHED"
        );

    },


    /*
    =======================================================
    CLOSE
    =======================================================
    */

    close() {

        if (
            this.pipWindow &&
            !this.pipWindow.closed
        ) {

            this.pipWindow.close();

        }


        this.pipWindow =
            null;

        this.pipVideo =
            null;

        this.prepared =
            false;


        console.log(
            "DESKTOP PIP V1: CLOSED"
        );

    }

};
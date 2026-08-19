/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION PAGE V1

NEW STANDALONE ANNOTATION PAGE

IMPORTANT:

This controller is ONLY for annotation.html.

It does NOT use:

- AnnotationManagerV1
- whiteboard.html
- screenContainer
- participantGrid
- WebRTC
- PIP
- meeting layout

It reuses the existing:

- AnnotationCanvasV1
- AnnotationToolbarV1

without changing their internal code.
===========================================================
*/

window.AnnotationPageV1 = (() => {

    let initialized = false;

    let canvas = null;

    let materialDetails = null;


    /*
    =======================================================
    READ MATERIAL INFORMATION
    =======================================================
    */

    function loadMaterialDetails() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const key =
            params.get(
                "key"
            );


        if (!key) {

            console.error(
                "ANNOTATION PAGE V1: KEY NOT FOUND"
            );

            return false;

        }


        const saved =
            localStorage.getItem(
                key
            );


        if (!saved) {

            console.error(
                "ANNOTATION PAGE V1: MATERIAL DATA NOT FOUND",
                key
            );

            return false;

        }


        try {

            materialDetails =
                JSON.parse(
                    saved
                );

        }
        catch (error) {

            console.error(
                "ANNOTATION PAGE V1: INVALID MATERIAL DATA",
                error
            );

            return false;

        }


        console.log(
            "ANNOTATION PAGE V1: MATERIAL LOADED",
            materialDetails
        );


        return true;

    }


    /*
    =======================================================
    DISPLAY MATERIAL INFORMATION
    =======================================================
    */

    function displayMaterialDetails() {

        if (!materialDetails) {

            return;

        }


        const subject =
            document.getElementById(
                "materialSubject"
            );


        const topic =
            document.getElementById(
                "materialTopic"
            );


        const chapter =
            document.getElementById(
                "materialChapter"
            );


        const description =
            document.getElementById(
                "materialDescription"
            );


        if (subject) {

            subject.textContent =
                materialDetails.subject ||
                "";

        }


        if (topic) {

            topic.textContent =
                materialDetails.topic ||
                "";

        }


        if (chapter) {

            chapter.textContent =
                (
                    materialDetails.chapterNo ||
                    ""
                ) +
                " " +
                (
                    materialDetails.chapterName ||
                    ""
                );

        }


        if (description) {

            description.textContent =
                materialDetails.description ||
                "";

        }

    }


    /*
    =======================================================
    CREATE CANVAS
    =======================================================
    */

    function createCanvas() {

        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (!workspace) {

            console.error(
                "ANNOTATION PAGE V1: WORKSPACE NOT FOUND"
            );

            return false;

        }


        /*
        ---------------------------------------------------
        CHECK EXISTING CANVAS
        ---------------------------------------------------
        */

        canvas =
            document.getElementById(
                "annotationCanvasV1"
            );


        if (!canvas) {

            canvas =
                document.createElement(
                    "canvas"
                );


            canvas.id =
                "annotationCanvasV1";


            canvas.style.position =
                "absolute";


            canvas.style.left =
                "0";


            canvas.style.top =
                "0";


            canvas.style.width =
                "100%";


            canvas.style.height =
                "100%";


            canvas.style.display =
                "block";


            canvas.style.background =
                "#ffffff";


            canvas.style.touchAction =
                "none";


            canvas.style.cursor =
                "crosshair";


            workspace.appendChild(
                canvas
            );

        }


        /*
        ---------------------------------------------------
        INITIALIZE EXISTING CANVAS ENGINE
        ---------------------------------------------------
        */

        if (
            window.AnnotationCanvasV1 &&
            typeof AnnotationCanvasV1.init ===
                "function"
        ) {

            AnnotationCanvasV1.init(
                canvas
            );

        }
        else {

            console.error(
                "ANNOTATION PAGE V1: AnnotationCanvasV1 NOT AVAILABLE"
            );

            return false;

        }


        console.log(
            "ANNOTATION PAGE V1: CANVAS READY"
        );


        return true;

    }


    /*
    =======================================================
    INITIALIZE EXISTING TOOLBAR
    =======================================================
    */

    function initializeToolbar() {

        if (
            !window.AnnotationToolbarV1
        ) {

            console.error(
                "ANNOTATION PAGE V1: AnnotationToolbarV1 NOT AVAILABLE"
            );

            return false;

        }


        if (
            typeof AnnotationToolbarV1.init !==
                "function"
        ) {

            console.error(
                "ANNOTATION PAGE V1: Toolbar init() NOT FOUND"
            );

            return false;

        }


        AnnotationToolbarV1.init();


        /*
        ---------------------------------------------------
        SHOW TOOLBAR
        ---------------------------------------------------
        */

        if (
            typeof AnnotationToolbarV1.show ===
                "function"
        ) {

            AnnotationToolbarV1.show();

        }


        console.log(
            "ANNOTATION PAGE V1: TOOLBAR READY"
        );


        return true;

    }


    /*
    =======================================================
    RESIZE
    =======================================================
    */

    function resize() {

        if (
            window.AnnotationCanvasV1 &&
            typeof AnnotationCanvasV1.resize ===
                "function"
        ) {

            AnnotationCanvasV1.resize();

        }

    }


    /*
    =======================================================
    WINDOW RESIZE
    =======================================================
    */

    function bindResize() {

        window.addEventListener(
            "resize",
            () => {

                requestAnimationFrame(
                    () => {

                        resize();

                    }
                );

            }
        );

    }


    /*
    =======================================================
    CLOSE PAGE
    =======================================================
    */

    function bindClose() {

        const closeButton =
            document.getElementById(
                "closeButton"
            );


        if (!closeButton) {

            return;

        }


        closeButton.addEventListener(
            "click",
            () => {

                window.close();

            }
        );

    }


    /*
    =======================================================
    INITIALIZE
    =======================================================
    */

    function init() {

        if (initialized) {

            console.log(
                "ANNOTATION PAGE V1: ALREADY INITIALIZED"
            );

            return;

        }


        console.log(
            "=========================================="
        );


        console.log(
            "ANNOTATION PAGE V1: INITIALIZING"
        );


        console.log(
            "=========================================="
        );


        /*
        ---------------------------------------------------
        LOAD MATERIAL
        ---------------------------------------------------
        */

        if (
            !loadMaterialDetails()
        ) {

            return;

        }


        /*
        ---------------------------------------------------
        DISPLAY MATERIAL
        ---------------------------------------------------
        */

        displayMaterialDetails();


        /*
        ---------------------------------------------------
        CREATE / INITIALIZE CANVAS
        ---------------------------------------------------
        */

        if (
            !createCanvas()
        ) {

            return;

        }


        /*
        ---------------------------------------------------
        INITIALIZE EXISTING TOOLBAR
        ---------------------------------------------------
        */

        if (
            !initializeToolbar()
        ) {

            return;

        }


        /*
        ---------------------------------------------------
        RESIZE
        ---------------------------------------------------
        */

        bindResize();


        /*
        ---------------------------------------------------
        CLOSE
        ---------------------------------------------------
        */

        bindClose();


        /*
        ---------------------------------------------------
        FINAL RESIZE
        ---------------------------------------------------
        */

        requestAnimationFrame(
            () => {

                resize();

            }
        );


        initialized = true;


        console.log(
            "ANNOTATION PAGE V1: READY"
        );

    }


    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

        init,

        resize

    };

})();


/*
===========================================================
START AFTER PAGE LOAD
===========================================================
*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        AnnotationPageV1.init();

    }
);
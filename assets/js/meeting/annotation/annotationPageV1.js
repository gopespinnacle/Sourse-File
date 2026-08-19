/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION PAGE V1
===========================================================
*/

window.AnnotationPageV1 = (() => {

    let initialized = false;
    let canvas = null;


    /*
    =======================================================
    INITIALIZE CANVAS
    =======================================================
    */

    function initializeCanvas() {

        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (!workspace) {

            console.error(
                "ANNOTATION PAGE V1: annotationWorkspaceV1 NOT FOUND"
            );

            return false;

        }


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


            /*
===========================================================
SET REAL PIXEL SIZE

IMPORTANT:

Do NOT use:

    100%

The existing AnnotationCanvasV1 coordinate system
needs the actual logical canvas size.
===========================================================
*/

const workspaceRect =
    workspace.getBoundingClientRect();


canvas.style.width =
    Math.floor(
        workspaceRect.width
    ) + "px";


canvas.style.height =
    Math.floor(
        workspaceRect.height
    ) + "px";


canvas.style.display =
    "block";


canvas.style.background =
    "#ffffff";


canvas.style.touchAction =
    "none";


canvas.style.position =
    "absolute";


canvas.style.left =
    "0px";


canvas.style.top =
    "0px";


workspace.appendChild(
    canvas
);

}


        /*
        ===================================================
        CONNECT TO EXISTING CANVAS ENGINE
        ===================================================
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
                "ANNOTATION PAGE V1: AnnotationCanvasV1 NOT FOUND"
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
    INITIALIZE TOOLBAR
    =======================================================
    */

    function initializeToolbar() {

        if (
            !window.AnnotationToolbarV1
        ) {

            console.error(
                "ANNOTATION PAGE V1: AnnotationToolbarV1 NOT FOUND"
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

    function resizeCanvas() {

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
    INITIALIZE PAGE
    =======================================================
    */

    function init() {

        if (initialized) {

            return;

        }


        console.log(
            "ANNOTATION PAGE V1: START"
        );


        /*
        ===================================================
        CANVAS
        ===================================================
        */

        if (
            !initializeCanvas()
        ) {

            return;

        }


        /*
        ===================================================
        TOOLBAR
        ===================================================
        */

        if (
            !initializeToolbar()
        ) {

            return;

        }


        /*
        ===================================================
        WINDOW RESIZE
        ===================================================
        */

        window.addEventListener(
            "resize",
            () => {

                requestAnimationFrame(
                    () => {

                        resizeCanvas();

                    }
                );

            }
        );


        /*
        ===================================================
        FIRST RESIZE
        ===================================================
        */

        requestAnimationFrame(
            () => {

                resizeCanvas();

            }
        );


        initialized = true;


        console.log(
            "ANNOTATION PAGE V1: READY"
        );

    }


    return {

        init,

        resize:
            resizeCanvas

    };

})();


/*
===========================================================
START
===========================================================
*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        AnnotationPageV1.init();

    }
);
/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION MANAGER V1
===========================================================

CENTRAL CONTROLLER FOR:

- Annotation workspace
- Annotation canvas
- Annotation toolbar
- Open / Close annotation
- Teacher / Student presentation layer

DO NOT HANDLE HERE:

- WebRTC
- Screen Share WebRTC
- Socket communication
- MongoDB
- PDF generation

Those are separate modules.
===========================================================
*/

window.AnnotationManagerV1 = (() => {

    /*
    =======================================================
    STATE
    =======================================================
    */

    let initialized = false;

    let open = false;

    let workspace = null;

    let canvas = null;

    let annotateButton = null;


    /*
    =======================================================
    INITIALIZE
    =======================================================
    */

    function init() {

        if (initialized) {

            console.log(
                "ANNOTATION MANAGER V1: ALREADY INITIALIZED"
            );

            return;

        }


        console.log(
            "ANNOTATION MANAGER V1: INITIALIZING"
        );


        createWorkspace();

        createAnnotateButton();

        bindResize();


        /*
        ---------------------------------------------------
        INITIALIZE TOOLBAR
        ---------------------------------------------------
        */

        if (
            window.AnnotationToolbarV1
        ) {

            AnnotationToolbarV1.init();

        }


        initialized = true;


        console.log(
            "ANNOTATION MANAGER V1: INITIALIZED"
        );

    }


    /*
    =======================================================
    CREATE WORKSPACE
    =======================================================
    */

    function createWorkspace() {

        /*
        ---------------------------------------------------
        ALREADY EXISTS
        ---------------------------------------------------
        */

        const existing =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (existing) {

            workspace =
                existing;

            canvas =
                document.getElementById(
                    "annotationCanvasV1"
                );

            return;

        }


        /*
        ---------------------------------------------------
        WORKSPACE
        ---------------------------------------------------
        */

        workspace =
            document.createElement(
                "div"
            );


        workspace.id =
            "annotationWorkspaceV1";


        workspace.innerHTML = `

            <div
                id="annotationStageV1"
            >

                <canvas
                    id="annotationCanvasV1"
                ></canvas>

            </div>

        `;


        document.body.appendChild(
            workspace
        );


        canvas =
            document.getElementById(
                "annotationCanvasV1"
            );


        /*
        ---------------------------------------------------
        CANVAS INITIALIZE
        ---------------------------------------------------
        */

        if (
            canvas &&
            window.AnnotationCanvasV1
        ) {

            AnnotationCanvasV1.init(
                canvas
            );

        }

    }


    /*
    =======================================================
    CREATE ANNOTATE BUTTON
    =======================================================
    */

    function createAnnotateButton() {

        /*
        ---------------------------------------------------
        ALREADY EXISTS
        ---------------------------------------------------
        */

        const existing =
            document.getElementById(
                "annotationOpenButtonV1"
            );


        if (existing) {

            annotateButton =
                existing;

            return;

        }


        /*
        ---------------------------------------------------
        CREATE BUTTON
        ---------------------------------------------------
        */

        annotateButton =
            document.createElement(
                "button"
            );


        annotateButton.id =
            "annotationOpenButtonV1";


        annotateButton.type =
            "button";


        annotateButton.title =
            "Annotate";


        annotateButton.innerHTML = `
            ✏️
            <span>
                Annotate
            </span>
        `;


        /*
        ---------------------------------------------------
        BUTTON CLICK
        ---------------------------------------------------
        */

        annotateButton.addEventListener(
            "click",
            () => {

                if (open) {

                    close();

                }
                else {

                    openAnnotation();

                }

            }
        );


        /*
        ---------------------------------------------------
        TRY TO PLACE INSIDE EXISTING
        MEETING CONTROLS
        ---------------------------------------------------
        */

        const controlArea =
            document.querySelector(
                "#meetingControls"
            );


        if (controlArea) {

            controlArea.appendChild(
                annotateButton
            );

        }
        else {

            document.body.appendChild(
                annotateButton
            );

        }

    }


    /*
    =======================================================
    OPEN ANNOTATION
    =======================================================
    */

    function openAnnotation() {

        if (!initialized) {

            init();

        }


        console.log(
            "ANNOTATION MANAGER V1: OPEN"
        );


        open = true;


        /*
        ---------------------------------------------------
        SHOW WORKSPACE
        ---------------------------------------------------
        */

        if (workspace) {

            workspace.style.display =
                "block";

        }


        /*
        ---------------------------------------------------
        SHOW TOOLBAR
        ---------------------------------------------------
        */

        if (
            window.AnnotationToolbarV1
        ) {

            AnnotationToolbarV1.show();

        }


        /*
        ---------------------------------------------------
        RESIZE CANVAS
        ---------------------------------------------------
        */

        requestAnimationFrame(
            () => {

                if (
                    window.AnnotationCanvasV1
                ) {

                    AnnotationCanvasV1.resize();

                }

            }
        );


        /*
        ---------------------------------------------------
        BUTTON STATE
        ---------------------------------------------------
        */

        if (annotateButton) {

            annotateButton.classList.add(
                "active"
            );

        }

    }


    /*
    =======================================================
    CLOSE ANNOTATION
    =======================================================
    */

    function close() {

        console.log(
            "ANNOTATION MANAGER V1: CLOSE"
        );


        open = false;


        /*
        ---------------------------------------------------
        HIDE WORKSPACE
        ---------------------------------------------------
        */

        if (workspace) {

            workspace.style.display =
                "none";

        }


        /*
        ---------------------------------------------------
        HIDE TOOLBAR
        ---------------------------------------------------
        */

        if (
            window.AnnotationToolbarV1
        ) {

            AnnotationToolbarV1.hide();

        }


        /*
        ---------------------------------------------------
        BUTTON STATE
        ---------------------------------------------------
        */

        if (annotateButton) {

            annotateButton.classList.remove(
                "active"
            );

        }

    }


    /*
    =======================================================
    RESIZE
    =======================================================
    */

    function bindResize() {

        window.addEventListener(
            "resize",
            () => {

                if (!open) {

                    return;

                }


                if (
                    window.AnnotationCanvasV1
                ) {

                    AnnotationCanvasV1.resize();

                }

            }
        );

    }


    /*
    =======================================================
    IS OPEN
    =======================================================
    */

    function isOpen() {

        return open;

    }


    /*
    =======================================================
    GET CANVAS
    =======================================================
    */

    function getCanvas() {

        return canvas;

    }


    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

        init,

        open: openAnnotation,

        close,

        isOpen,

        getCanvas

    };

})();
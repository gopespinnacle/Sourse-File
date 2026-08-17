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

    /*
===========================================================
CREATE ANNOTATION PRESENTATION WORKSPACE
===========================================================
*/

function resizeWorkspace() {

    if (!workspace) {

        return;

    }

    if (!canvas) {

        return;

    }


    /*
    ======================================================
    GET REAL WORKSPACE SIZE
    ======================================================
    */

    const rect =
        workspace.getBoundingClientRect();


    const width =
        Math.max(
            1,
            Math.floor(
                rect.width
            )
        );


    const height =
        Math.max(
            1,
            Math.floor(
                rect.height
            )
        );


    /*
    ======================================================
    HIGH DPI / RETINA
    ======================================================
    */

    const dpr =
        window.devicePixelRatio ||
        1;


    canvas.width =
        Math.floor(
            width * dpr
        );

    canvas.height =
        Math.floor(
            height * dpr
        );


    /*
    ======================================================
    KEEP CSS SIZE
    ======================================================
    */

    canvas.style.width =
        width + "px";

    canvas.style.height =
        height + "px";


    /*
    ======================================================
    SCALE DRAWING CONTEXT
    ======================================================
    */

    const ctx =
        canvas.getContext(
            "2d"
        );


    if (ctx) {

        ctx.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );

    }


    console.log(
        "ANNOTATION V1: CANVAS RESIZED",
        width,
        height,
        "DPR:",
        dpr
    );

}

function createWorkspace() {

    /*
    ======================================================
    ANNOTATION WORKSPACE
    ======================================================
    */

    let existing =
        document.getElementById(
            "annotationWorkspaceV1"
        );

    /*
    ------------------------------------------------------
    IF ALREADY CREATED
    ------------------------------------------------------
    */

    if (existing) {

        workspace = existing;

        canvas =
            document.getElementById(
                "annotationCanvasV1"
            );

        resizeWorkspace();

        return;

    }


    /*
    ======================================================
    CREATE WORKSPACE
    ======================================================
    */

    workspace =
        document.createElement(
            "div"
        );

    workspace.id =
        "annotationWorkspaceV1";


    /*
    ======================================================
    WORKSPACE STYLE
    ======================================================
    */

    workspace.style.position =
        "fixed";

    workspace.style.left =
        "0";

    workspace.style.top =
        "60px";

    workspace.style.width =
        "100vw";

    workspace.style.height =
        "calc(100vh - 60px)";

    workspace.style.background =
        "#ffffff";

    workspace.style.display =
        "none";

    workspace.style.visibility =
        "visible";

    workspace.style.opacity =
        "1";

    workspace.style.zIndex =
        "5000";

    workspace.style.overflow =
        "hidden";


    /*
    ======================================================
    ANNOTATION CANVAS
    ======================================================
    */

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


    /*
    ======================================================
    ADD CANVAS
    ======================================================
    */

    workspace.appendChild(
        canvas
    );


    /*
    ======================================================
    ADD WORKSPACE TO PAGE
    ======================================================
    */

    document.body.appendChild(
        workspace
    );


    /*
    ======================================================
    RESIZE CANVAS
    ======================================================
    */

    resizeWorkspace();


    /*
    ======================================================
    INITIALIZE CANVAS ENGINE
    ======================================================
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


    /*
    ======================================================
    RESIZE LISTENER
    ======================================================
    */

    window.addEventListener(
        "resize",
        resizeWorkspace
    );


    console.log(
        "ANNOTATION V1: WORKSPACE CREATED"
    );

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

    workspace.style.visibility =
        "visible";

    workspace.style.opacity =
        "1";

}
/*
-------------------------------------------------------
MAKE ANNOTATION CANVAS THE ACTIVE PRESENTATION SURFACE
-------------------------------------------------------
*/

if (canvas) {

    canvas.style.display =
        "block";

    canvas.style.visibility =
        "visible";

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


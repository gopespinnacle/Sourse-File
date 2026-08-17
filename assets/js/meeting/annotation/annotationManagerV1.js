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

/*
===========================================================
RESIZE ANNOTATION CANVAS
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
    =======================================================
    GET ACTUAL PRESENTATION SIZE
    =======================================================
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
    =======================================================
    HIGH DPI
    =======================================================
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
    =======================================================
    CSS SIZE
    =======================================================
    */

    canvas.style.width =
        width + "px";


    canvas.style.height =
        height + "px";


    /*
    =======================================================
    SCALE CONTEXT
    =======================================================
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

/*
===========================================================
CREATE ANNOTATION PRESENTATION WORKSPACE
===========================================================
*/

function createWorkspace() {

    /*
    =======================================================
    FIND EXISTING PRESENTATION CONTAINER
    =======================================================
    */

    const presentationContainer =
        document.getElementById(
            "screenContainer"
        );


    if (!presentationContainer) {

        console.error(
            "ANNOTATION V1: screenContainer NOT FOUND"
        );

        return;

    }


    /*
    =======================================================
    CHECK IF ANNOTATION WORKSPACE ALREADY EXISTS
    =======================================================
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

        resizeWorkspace();

        return;

    }


    /*
    =======================================================
    CREATE ANNOTATION WORKSPACE
    =======================================================
    */

    workspace =
        document.createElement(
            "div"
        );


    workspace.id =
        "annotationWorkspaceV1";


    /*
    =======================================================
    IMPORTANT
    THIS WORKSPACE LIVES INSIDE THE EXISTING
    GOOGLE-MEET PRESENTATION CONTAINER.

    WE DO NOT TOUCH WEBRTC.
    =======================================================
    */

    workspace.style.position =
        "absolute";

    workspace.style.left =
        "0";

    workspace.style.top =
        "0";

    workspace.style.right =
        "0";

    workspace.style.bottom =
        "0";

    workspace.style.width =
        "100%";

    workspace.style.height =
        "100%";

    workspace.style.background =
        "#ffffff";

    workspace.style.display =
        "none";

    workspace.style.visibility =
        "visible";

    workspace.style.opacity =
        "1";

    workspace.style.zIndex =
        "10";

    workspace.style.overflow =
        "hidden";


    /*
    =======================================================
    CREATE CANVAS
    =======================================================
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
    =======================================================
    ADD CANVAS TO WORKSPACE
    =======================================================
    */

    workspace.appendChild(
        canvas
    );


    /*
    =======================================================
    ADD WORKSPACE INSIDE EXISTING PRESENTATION CONTAINER
    =======================================================
    */

    presentationContainer.appendChild(
        workspace
    );


    /*
    =======================================================
    RESIZE
    =======================================================
    */

    resizeWorkspace();


    /*
    =======================================================
    INITIALIZE CANVAS ENGINE
    =======================================================
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
    =======================================================
    RESIZE LISTENER
    =======================================================
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

    /*
    ===========================================================
    ACTIVATE EXISTING PRESENTATION CONTAINER
    ===========================================================
    */

    const presentationContainer =
        document.getElementById(
            "screenContainer"
        );

        const participantGrid =
    document.getElementById(
        "participantGrid"
    );


    if (presentationContainer) {

        presentationContainer.classList.add(
            "screen-sharing-active"
        );

        presentationContainer.style.display =
            "block";

        presentationContainer.style.opacity =
            "1";


            if (participantGrid) {

    participantGrid.classList.add(
        "annotation-active"
    );

}


        /*
        -------------------------------------------------------
        HIDE ACTUAL SCREEN SHARE VIDEO
        -------------------------------------------------------
        */

        const screenVideo =
            document.getElementById(
                "screenVideo"
            );


        if (screenVideo) {

            screenVideo.style.display =
                "none";

        }


        /*
        -------------------------------------------------------
        HIDE SCREEN DRAW LAYER
        -------------------------------------------------------
        */

        const screenDraw =
            document.getElementById(
                "screenDraw"
            );


        if (screenDraw) {

            screenDraw.style.display =
                "none";

        }

    }


    /*
    ===========================================================
    SHOW ANNOTATION WORKSPACE
    ===========================================================
    */

    workspace.style.display =
        "block";

    workspace.style.visibility =
        "visible";

    workspace.style.opacity =
        "1";

    workspace.style.zIndex =
        "10";


    /*
    ===========================================================
    RESIZE AFTER DISPLAY
    ===========================================================
    */

    requestAnimationFrame(
        () => {

            resizeWorkspace();

        }
    );

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
    HIDE ANNOTATION WORKSPACE
    ---------------------------------------------------
    */

    if (workspace) {

        workspace.style.display =
            "none";

    }



    /*
    ===================================================
    RESTORE PRESENTATION CONTAINER
    ===================================================
    */

    const presentationContainer =
        document.getElementById(
            "screenContainer"
        );

        const participantGrid =
    document.getElementById(
        "participantGrid"
    );


    if (presentationContainer) {

        /*
        ------------------------------------------------
        REMOVE ANNOTATION PRESENTATION STATE
        ------------------------------------------------
        */

        presentationContainer.classList.remove(
            "screen-sharing-active"
        );


        /*
        ------------------------------------------------
        DO NOT FORCE SCREEN CONTAINER VISIBLE
        ------------------------------------------------

        Normal meeting state will decide whether
        screen presentation should be visible.
        ------------------------------------------------
        */

    }


    /*
    ===================================================
    RESTORE SCREEN SHARE VIDEO
    ===================================================
    */

    const screenVideo =
        document.getElementById(
            "screenVideo"
        );


    if (screenVideo) {

        screenVideo.style.display =
            "";

    }


    /*
    ===================================================
    RESTORE SCREEN DRAW LAYER
    ===================================================
    */

    const screenDraw =
        document.getElementById(
            "screenDraw"
        );


    if (screenDraw) {

        screenDraw.style.display =
            "";

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


    console.log(
        "ANNOTATION MANAGER V1: CLOSED"
    );

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


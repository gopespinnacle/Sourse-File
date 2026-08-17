/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION TOOLBAR V1
===========================================================

RESPONSIBILITY:

- Create annotation toolbar
- Pen
- Eraser
- Color picker
- Stroke width
- Undo
- Redo
- Clear
- Save PDF button placeholder
- Close annotation

IMPORTANT:

This module controls UI only.

It does NOT handle:

- WebRTC
- Socket.IO
- MongoDB
- PDF generation
===========================================================
*/

window.AnnotationToolbarV1 = (() => {

    let toolbar = null;

    let initialized = false;


    /*
    =======================================================
    INITIALIZE
    =======================================================
    */

    function init() {

        if (initialized) {

            return;

        }


        createToolbar();

        initialized = true;


        console.log(
            "ANNOTATION TOOLBAR V1: INITIALIZED"
        );

    }


    /*
    =======================================================
    CREATE TOOLBAR
    =======================================================
    */

    function createToolbar() {

        if (
            document.getElementById(
                "annotationToolbarV1"
            )
        ) {

            toolbar =
                document.getElementById(
                    "annotationToolbarV1"
                );

            return;

        }


        toolbar =
            document.createElement(
                "div"
            );


        toolbar.id =
            "annotationToolbarV1";


        toolbar.innerHTML = `

            <div
                class="annotation-toolbar-inner"
            >

                <!-- PEN -->

                <button
                    type="button"
                    id="annotationPenV1"
                    class="annotation-tool-btn active"
                    title="Pen"
                >

                    ✏️

                </button>


                <!-- ERASER -->

                <button
                    type="button"
                    id="annotationEraserV1"
                    class="annotation-tool-btn"
                    title="Eraser"
                >

                    🧽

                </button>

                <!-- ERASER SIZE -->

<select
    id="annotationEraserWidthV1"
    class="annotation-width-select"
    title="Eraser Size"
>

    <option value="10">
        Eraser 10 px
    </option>

    <option value="20">
        Eraser 20 px
    </option>

    <option value="30" selected>
        Eraser 30 px
    </option>

    <option value="40">
        Eraser 40 px
    </option>

    <option value="60">
        Eraser 60 px
    </option>

    <option value="80">
        Eraser 80 px
    </option>

</select>


                <!-- COLOR -->

                <label
                    class="annotation-color-wrapper"
                    title="Color"
                >

                    <span>
                        🎨
                    </span>

                    <input
                        type="color"
                        id="annotationColorV1"
                        value="#000000"
                    >

                </label>


                <!-- WIDTH -->

                <select
                    id="annotationWidthV1"
                    class="annotation-width-select"
                    title="Stroke Width"
                >

                    <option value="2">
                        2 px
                    </option>

                    <option value="4" selected>
                        4 px
                    </option>

                    <option value="6">
                        6 px
                    </option>

                    <option value="10">
                        10 px
                    </option>

                    <option value="16">
                        16 px
                    </option>

                    <option value="24">
                        24 px
                    </option>

                </select>


                <!-- UNDO -->

                <button
                    type="button"
                    id="annotationUndoV1"
                    class="annotation-tool-btn"
                    title="Undo"
                >

                    ↶

                </button>


                <!-- REDO -->

                <button
                    type="button"
                    id="annotationRedoV1"
                    class="annotation-tool-btn"
                    title="Redo"
                >

                    ↷

                </button>


                <!-- CLEAR -->

                <button
                    type="button"
                    id="annotationClearV1"
                    class="annotation-tool-btn"
                    title="Clear"
                >

                    🗑️

                </button>


                                <!-- SAVE PDF -->

                <button
                    type="button"
                    id="annotationSavePdfV1"
                    class="annotation-tool-btn"
                    title="Save as PDF"
                >

                    📄

                </button>


                <!-- PAGE CONTROLS -->

                <button
                    type="button"
                    id="annotationPreviousPageV1"
                    class="annotation-tool-btn"
                    title="Previous Page"
                >

                    ◀

                </button>


                <span
                    id="annotationPageIndicatorV1"
                    class="annotation-page-indicator"
                    title="Current Page"
                >

                    Page 1 / 1

                </span>


                <button
                    type="button"
                    id="annotationNextPageV1"
                    class="annotation-tool-btn"
                    title="Next Page"
                >

                    ▶

                </button>


                <button
                    type="button"
                    id="annotationAddPageV1"
                    class="annotation-tool-btn"
                    title="Add New Page"
                >

                    ＋

                </button>


                <!-- CLOSE -->

                <button
                    type="button"
                    id="annotationCloseV1"
                    class="annotation-close-btn"
                    title="Close Annotation"
                >

                    ✕

                </button>

            </div>

        `;


        /*
        ---------------------------------------------------
        PLACE TOOLBAR INSIDE ANNOTATION WORKSPACE
        ---------------------------------------------------
        */

        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (workspace) {

    workspace.style.position = "relative";

    workspace.appendChild(
        toolbar
    );

    toolbar.style.position = "absolute";
    toolbar.style.left = "50%";
    toolbar.style.bottom = "20px";
    toolbar.style.transform = "translateX(-50%)";

    toolbar.style.zIndex = "10000";
    toolbar.style.display = "flex";
    toolbar.style.visibility = "visible";
    toolbar.style.opacity = "1";
    toolbar.style.pointerEvents = "auto";

}
        else {

            /*
            ------------------------------------------------
            FALLBACK
            If workspace is not created yet, keep toolbar
            attached to body.
            ------------------------------------------------
            */

            document.body.appendChild(
                toolbar
            );

        }


        bindEvents();

    }


    /*
    =======================================================
    BIND EVENTS
    =======================================================
    */

    function bindEvents() {


        /*
        ---------------------------------------------------
        PEN
        ---------------------------------------------------
        */

        const pen =
            document.getElementById(
                "annotationPenV1"
            );


        if (pen) {

            pen.addEventListener(
                "click",
                () => {

                    setActiveTool(
                        "pen"
                    );


                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.setTool(
                            "pen"
                        );

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        ERASER
        ---------------------------------------------------
        */

        const eraser =
            document.getElementById(
                "annotationEraserV1"
            );


        if (eraser) {

            eraser.addEventListener(
                "click",
                () => {

                    setActiveTool(
                        "eraser"
                    );


                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.setTool(
                            "eraser"
                        );

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        COLOR
        ---------------------------------------------------
        */

        const color =
            document.getElementById(
                "annotationColorV1"
            );


        if (color) {

            color.addEventListener(
                "input",
                event => {

                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.setColor(
                            event.target.value
                        );

                    }


                    /*
                    ---------------------------------------
                    Automatically return to PEN
                    ---------------------------------------
                    */

                    setActiveTool(
                        "pen"
                    );


                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.setTool(
                            "pen"
                        );

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        WIDTH
        ---------------------------------------------------
        */

        const width =
            document.getElementById(
                "annotationWidthV1"
            );


        if (width) {

            width.addEventListener(
                "change",
                event => {

                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.setWidth(
                            event.target.value
                        );

                    }

                }
            );

        }

        /*
---------------------------------------------------
ERASER WIDTH
---------------------------------------------------
*/

const eraserWidth =
    document.getElementById(
        "annotationEraserWidthV1"
    );


if (eraserWidth) {

    eraserWidth.addEventListener(
        "change",
        event => {

            if (
                window.AnnotationCanvasV1
            ) {

                AnnotationCanvasV1.setEraserWidth(
                    event.target.value
                );

            }

        }
    );

}


/*
---------------------------------------------------
PREVIOUS PAGE
---------------------------------------------------
*/

const previousPage =
    document.getElementById(
        "annotationPreviousPageV1"
    );


if (previousPage) {

    previousPage.addEventListener(
        "click",
        () => {

            if (
                window.AnnotationCanvasV1
            ) {

                AnnotationCanvasV1.previousPage();

                updatePageIndicator();

            }

        }
    );

}


/*
---------------------------------------------------
NEXT PAGE
---------------------------------------------------
*/

const nextPage =
    document.getElementById(
        "annotationNextPageV1"
    );


if (nextPage) {

    nextPage.addEventListener(
        "click",
        () => {

            if (
                window.AnnotationCanvasV1
            ) {

                AnnotationCanvasV1.nextPage();

                updatePageIndicator();

            }

        }
    );

}


/*
---------------------------------------------------
ADD NEW PAGE
---------------------------------------------------
*/

const addPage =
    document.getElementById(
        "annotationAddPageV1"
    );


if (addPage) {

    addPage.addEventListener(
        "click",
        () => {

            if (
                window.AnnotationCanvasV1
            ) {

                AnnotationCanvasV1.addPage();

                updatePageIndicator();

            }

        }
    );

}


        /*
        ---------------------------------------------------
        UNDO
        ---------------------------------------------------
        */

        const undo =
            document.getElementById(
                "annotationUndoV1"
            );


        if (undo) {

            undo.addEventListener(
                "click",
                () => {

                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.undo();

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        REDO
        ---------------------------------------------------
        */

        const redo =
            document.getElementById(
                "annotationRedoV1"
            );


        if (redo) {

            redo.addEventListener(
                "click",
                () => {

                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.redo();

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        CLEAR
        ---------------------------------------------------
        */

        const clear =
            document.getElementById(
                "annotationClearV1"
            );


        if (clear) {

            clear.addEventListener(
                "click",
                () => {

                    const confirmed =
                        window.confirm(
                            "Clear all annotations?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    if (
                        window.AnnotationCanvasV1
                    ) {

                        AnnotationCanvasV1.clear();

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        SAVE PDF
        ---------------------------------------------------
        */

        const savePdf =
            document.getElementById(
                "annotationSavePdfV1"
            );


        if (savePdf) {

            savePdf.addEventListener(
                "click",
                () => {

                    console.log(
                        "ANNOTATION TOOLBAR V1: SAVE PDF CLICKED"
                    );


                    if (
                        window.AnnotationPdfV1 &&
                        typeof
                        AnnotationPdfV1.save
                        ===
                        "function"
                    ) {

                        AnnotationPdfV1.save();

                    }
                    else {

                        console.warn(
                            "ANNOTATION PDF V1: NOT READY"
                        );

                    }

                }
            );

        }


        /*
        ---------------------------------------------------
        CLOSE
        ---------------------------------------------------
        */

        const close =
            document.getElementById(
                "annotationCloseV1"
            );


        if (close) {

            close.addEventListener(
                "click",
                () => {

                    if (
                        window.AnnotationManagerV1
                    ) {

                        AnnotationManagerV1.close();

                    }

                }
            );

        }

    }

    /*
=======================================================
PAGE INDICATOR
=======================================================
*/

function updatePageIndicator() {

    const indicator =
        document.getElementById(
            "annotationPageIndicatorV1"
        );


    if (!indicator) {

        return;

    }


    if (
        !window.AnnotationCanvasV1
    ) {

        return;

    }


    const pageInfo =
        AnnotationCanvasV1.getPageInfo();


    if (!pageInfo) {

        return;

    }


    indicator.textContent =
        "Page " +
        pageInfo.currentPage +
        " / " +
        pageInfo.totalPages;


    console.log(
        "ANNOTATION TOOLBAR V1: PAGE",
        pageInfo.currentPage,
        "/",
        pageInfo.totalPages
    );

}


    /*
    =======================================================
    ACTIVE TOOL
    =======================================================
    */

    function setActiveTool(
        tool
    ) {

        const pen =
            document.getElementById(
                "annotationPenV1"
            );


        const eraser =
            document.getElementById(
                "annotationEraserV1"
            );


        if (pen) {

            pen.classList.toggle(
                "active",
                tool === "pen"
            );

        }


        if (eraser) {

            eraser.classList.toggle(
                "active",
                tool === "eraser"
            );

        }

    }


    /*
    =======================================================
    SHOW
    =======================================================
    */

    function show() {

    if (!toolbar) {

        init();

    }


    /*
    ===================================================
    MAKE SURE TOOLBAR IS INSIDE ANNOTATION WORKSPACE
    ===================================================
    */

    const workspace =
        document.getElementById(
            "annotationWorkspaceV1"
        );


    if (workspace && toolbar) {

        workspace.style.position =
            "relative";


        /*
        -----------------------------------------------
        MOVE TOOLBAR INTO WORKSPACE
        -----------------------------------------------
        */

        if (
            toolbar.parentElement !== workspace
        ) {

            workspace.appendChild(
                toolbar
            );

        }


        /*
        -----------------------------------------------
        TOOLBAR POSITION
        -----------------------------------------------
        */

        toolbar.style.position =
            "absolute";


        toolbar.style.left =
            "50%";


        toolbar.style.bottom =
            "20px";


        toolbar.style.transform =
            "translateX(-50%)";


        toolbar.style.zIndex =
            "10000";


        toolbar.style.visibility =
            "visible";


        toolbar.style.opacity =
            "1";


        toolbar.style.pointerEvents =
            "auto";

    }


    /*
    ===================================================
    SHOW TOOLBAR
    ===================================================
    */

    toolbar.style.display =
        "flex";

        /*
===================================================
UPDATE PAGE INDICATOR
===================================================
*/

updatePageIndicator();

}


    /*
    =======================================================
    HIDE
    =======================================================
    */

    function hide() {

        if (!toolbar) return;


        toolbar.style.display =
            "none";

    }


    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

        init,

        show,

        hide,

        setActiveTool

    };

})();

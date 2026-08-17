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

            workspace.appendChild(
                toolbar
            );

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


        toolbar.style.display =
            "flex";

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

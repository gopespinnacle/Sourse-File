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
- Save Learning Material
- Page controls
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

            show();

            return;

        }


        createToolbar();

        initialized = true;


        console.log(
            "ANNOTATION TOOLBAR V1: INITIALIZED"
        );


        show();

    }


    /*
    =======================================================
    CREATE TOOLBAR
    =======================================================
    */

    function createToolbar() {

        /*
        ---------------------------------------------------
        FIND EXISTING HTML CONTAINER
        ---------------------------------------------------
        */

        toolbar =
            document.getElementById(
                "annotationToolbarV1"
            );


        /*
        ---------------------------------------------------
        IF HTML CONTAINER DOES NOT EXIST
        CREATE IT
        ---------------------------------------------------
        */

        if (!toolbar) {

            toolbar =
                document.createElement(
                    "div"
                );


            toolbar.id =
                "annotationToolbarV1";


            document.body.appendChild(
                toolbar
            );

        }


        /*
        ---------------------------------------------------
        CREATE TOOLBAR CONTENT
        ---------------------------------------------------
        */

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


                <!-- ERASER WIDTH -->

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


                <!-- STROKE WIDTH -->

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


                <!-- SAVE LEARNING MATERIAL -->

                <button
                    type="button"
                    id="annotationSavePdfV1"
                    class="annotation-tool-btn"
                    title="Save Learning Material"
                >
                    📄
                </button>


                <!-- PREVIOUS PAGE -->

                <button
                    type="button"
                    id="annotationPreviousPageV1"
                    class="annotation-tool-btn"
                    title="Previous Page"
                >
                    ◀
                </button>


                <!-- PAGE INDICATOR -->

                <span
                    id="annotationPageIndicatorV1"
                    class="annotation-page-indicator"
                >
                    Page 1 / 1
                </span>


                <!-- NEXT PAGE -->

                <button
                    type="button"
                    id="annotationNextPageV1"
                    class="annotation-tool-btn"
                    title="Next Page"
                >
                    ▶
                </button>


                <!-- ADD PAGE -->

                <button
                    type="button"
                    id="annotationAddPageV1"
                    class="annotation-tool-btn"
                    title="Add New Page"
                >
                    ＋
                </button>


                <!-- DELETE PAGE -->

                <button
                    type="button"
                    id="annotationDeletePageV1"
                    class="annotation-tool-btn"
                    title="Delete Current Page"
                >
                    🗑️
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
        ===================================================
        TOOLBAR CSS
        ===================================================
        */

        toolbar.style.position =
            "absolute";


        toolbar.style.left =
            "50%";


        toolbar.style.bottom =
            "12px";


        toolbar.style.transform =
            "translateX(-50%)";


        toolbar.style.zIndex =
            "99999";


        toolbar.style.display =
            "block";


        toolbar.style.visibility =
            "visible";


        toolbar.style.opacity =
            "1";


        toolbar.style.pointerEvents =
            "auto";


        toolbar.style.width =
            "auto";


        toolbar.style.height =
            "auto";


        /*
        ===================================================
        TOOLBAR INNER STYLE
        ===================================================
        */

        const inner =
            toolbar.querySelector(
                ".annotation-toolbar-inner"
            );


        if (inner) {

            inner.style.display =
                "flex";


            inner.style.alignItems =
                "center";


            inner.style.justifyContent =
                "center";


            inner.style.gap =
                "5px";


            inner.style.padding =
                "8px";


            inner.style.background =
                "#ffffff";


            inner.style.border =
                "1px solid #999999";


            inner.style.borderRadius =
                "8px";


            inner.style.boxShadow =
                "0 3px 12px rgba(0,0,0,.25)";


            inner.style.whiteSpace =
                "nowrap";

        }


        /*
        ===================================================
        BUTTON STYLE
        ===================================================
        */

        const buttons =
            toolbar.querySelectorAll(
                ".annotation-tool-btn"
            );


        buttons.forEach(
            button => {

                button.style.width =
                    "34px";


                button.style.height =
                    "32px";


                button.style.padding =
                    "0";


                button.style.border =
                    "1px solid #999999";


                button.style.borderRadius =
                    "4px";


                button.style.background =
                    "#f5f5f5";


                button.style.color =
                    "#111111";


                button.style.cursor =
                    "pointer";


                button.style.fontSize =
                    "16px";


                button.style.display =
                    "inline-flex";


                button.style.alignItems =
                    "center";


                button.style.justifyContent =
                    "center";

            }
        );


        /*
        ===================================================
        SELECT STYLE
        ===================================================
        */

        const selects =
            toolbar.querySelectorAll(
                ".annotation-width-select"
            );


        selects.forEach(
            select => {

                select.style.height =
                    "32px";


                select.style.border =
                    "1px solid #999999";


                select.style.borderRadius =
                    "4px";


                select.style.background =
                    "#ffffff";


                select.style.color =
                    "#111111";


                select.style.fontSize =
                    "12px";


                select.style.cursor =
                    "pointer";

            }
        );


        /*
        ===================================================
        COLOR WRAPPER
        ===================================================
        */

        const colorWrapper =
            toolbar.querySelector(
                ".annotation-color-wrapper"
            );


        if (colorWrapper) {

            colorWrapper.style.height =
                "32px";


            colorWrapper.style.display =
                "inline-flex";


            colorWrapper.style.alignItems =
                "center";


            colorWrapper.style.gap =
                "3px";


            colorWrapper.style.padding =
                "2px 5px";


            colorWrapper.style.border =
                "1px solid #999999";


            colorWrapper.style.borderRadius =
                "4px";


            colorWrapper.style.background =
                "#ffffff";


            colorWrapper.style.color =
                "#111111";


            colorWrapper.style.cursor =
                "pointer";

        }


        /*
        ===================================================
        COLOR INPUT
        ===================================================
        */

        const colorInput =
            document.getElementById(
                "annotationColorV1"
            );


        if (colorInput) {

            colorInput.style.width =
                "28px";


            colorInput.style.height =
                "25px";


            colorInput.style.padding =
                "0";


            colorInput.style.border =
                "none";


            colorInput.style.cursor =
                "pointer";

        }


        /*
        ===================================================
        PAGE INDICATOR
        ===================================================
        */

        const indicator =
            document.getElementById(
                "annotationPageIndicatorV1"
            );


        if (indicator) {

            indicator.style.display =
                "inline-flex";


            indicator.style.alignItems =
                "center";


            indicator.style.justifyContent =
                "center";


            indicator.style.minWidth =
                "80px";


            indicator.style.height =
                "32px";


            indicator.style.padding =
                "0 8px";


            indicator.style.color =
                "#111111";


            indicator.style.background =
                "#ffffff";


            indicator.style.border =
                "1px solid #999999";


            indicator.style.borderRadius =
                "4px";


            indicator.style.fontSize =
                "12px";


            indicator.style.fontWeight =
                "600";


            indicator.style.whiteSpace =
                "nowrap";

        }


        /*
        ===================================================
        CLOSE BUTTON
        ===================================================
        */

        const closeButton =
            document.getElementById(
                "annotationCloseV1"
            );


        if (closeButton) {

            closeButton.style.background =
                "#eeeeee";

        }


        /*
        ===================================================
        PLACE INSIDE WORKSPACE
        ===================================================
        */

        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (workspace) {

            workspace.style.position =
                "absolute";


            workspace.style.overflow =
                "hidden";


            /*
            -----------------------------------------------
            MOVE TOOLBAR INTO WORKSPACE
            -----------------------------------------------
            */

            if (
                toolbar.parentElement !==
                workspace
            ) {

                workspace.appendChild(
                    toolbar
                );

            }

        }


        /*
        ===================================================
        BIND EVENTS
        ===================================================
        */

        bindEvents();

    }


    /*
    =======================================================
    BIND EVENTS
    =======================================================
    */

    function bindEvents() {


        /*
        ===================================================
        PEN
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setTool
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setTool(
                            "pen"
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        ERASER
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setTool
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setTool(
                            "eraser"
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        COLOR
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setColor
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setColor(
                            event.target.value
                        );

                    }


                    setActiveTool(
                        "pen"
                    );


                    if (
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setTool
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setTool(
                            "pen"
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        STROKE WIDTH
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setWidth
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setWidth(
                            event.target.value
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        ERASER WIDTH
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.setEraserWidth
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.setEraserWidth(
                            event.target.value
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        UNDO
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.undo
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.undo();

                    }

                }
            );

        }


        /*
        ===================================================
        REDO
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.redo
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.redo();

                    }

                }
            );

        }


        /*
        ===================================================
        CLEAR
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.clear
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.clear();

                    }

                }
            );

        }


        /*
        ===================================================
        SAVE LEARNING MATERIAL
        ===================================================
        */

        const saveMaterial =
            document.getElementById(
                "annotationSavePdfV1"
            );


        if (saveMaterial) {

            saveMaterial.addEventListener(
                "click",
                () => {

                    console.log(
                        "ANNOTATION TOOLBAR V1: SAVE LEARNING MATERIAL CLICKED"
                    );


                    if (
                        window.AnnotationManagerV1 &&
                        typeof
                        AnnotationManagerV1.saveMaterial
                        ===
                        "function"
                    ) {

                        AnnotationManagerV1.saveMaterial();

                    }
                    else {

                        console.warn(
                            "ANNOTATION MATERIAL V1: MANAGER NOT READY"
                        );

                    }

                }
            );

        }


        /*
        ===================================================
        PREVIOUS PAGE
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.previousPage
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.previousPage();

                        updatePageIndicator();

                    }

                }
            );

        }


        /*
        ===================================================
        NEXT PAGE
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.nextPage
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.nextPage();

                        updatePageIndicator();

                    }

                }
            );

        }


        /*
        ===================================================
        ADD PAGE
        ===================================================
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
                        window.AnnotationCanvasV1 &&
                        typeof
                        AnnotationCanvasV1.addPage
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.addPage();

                        updatePageIndicator();

                    }

                }
            );

        }


        /*
        ===================================================
        DELETE CURRENT PAGE
        ===================================================
        */

        const deletePage =
            document.getElementById(
                "annotationDeletePageV1"
            );


        if (deletePage) {

            deletePage.addEventListener(
                "click",
                () => {

                    if (
                        !window.AnnotationCanvasV1
                    ) {

                        return;

                    }


                    if (
                        typeof
                        AnnotationCanvasV1.getPageInfo
                        !==
                        "function"
                    ) {

                        return;

                    }


                    const pageInfo =
                        AnnotationCanvasV1.getPageInfo();


                    if (
                        !pageInfo ||
                        pageInfo.totalPages <= 1
                    ) {

                        console.log(
                            "ANNOTATION TOOLBAR V1: CANNOT DELETE LAST PAGE"
                        );

                        return;

                    }


                    const confirmed =
                        window.confirm(
                            "Delete Page " +
                            pageInfo.currentPage +
                            "?"
                        );


                    if (!confirmed) {

                        return;

                    }


                    if (
                        typeof
                        AnnotationCanvasV1.deletePage
                        ===
                        "function"
                    ) {

                        AnnotationCanvasV1.deletePage();

                    }


                    updatePageIndicator();

                }
            );

        }


        /*
        ===================================================
        CLOSE
        ===================================================
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
                        window.AnnotationManagerV1 &&
                        typeof
                        AnnotationManagerV1.close
                        ===
                        "function"
                    ) {

                        AnnotationManagerV1.close();

                    }

                }
            );

        }

    }


    /*
    =======================================================
    UPDATE PAGE INDICATOR
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
            !window.AnnotationCanvasV1 ||
            typeof
            AnnotationCanvasV1.getPageInfo
            !==
            "function"
        ) {

            indicator.textContent =
                "Page 1 / 1";

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

            pen.style.background =
                tool === "pen"
                    ? "#dbeafe"
                    : "#f5f5f5";

        }


        if (eraser) {

            eraser.style.background =
                tool === "eraser"
                    ? "#dbeafe"
                    : "#f5f5f5";

        }

    }


    /*
    =======================================================
    SHOW
    =======================================================
    */

    function show() {

        if (!toolbar) {

            createToolbar();

        }


        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (
            workspace &&
            toolbar
        ) {

            workspace.style.position =
                "absolute";


            /*
            -----------------------------------------------
            MAKE SURE TOOLBAR IS INSIDE WORKSPACE
            -----------------------------------------------
            */

            if (
                toolbar.parentElement !==
                workspace
            ) {

                workspace.appendChild(
                    toolbar
                );

            }


            /*
            -----------------------------------------------
            POSITION
            -----------------------------------------------
            */

            toolbar.style.position =
                "absolute";


            toolbar.style.left =
                "50%";


            toolbar.style.bottom =
                "12px";


            toolbar.style.transform =
                "translateX(-50%)";


            toolbar.style.zIndex =
                "99999";

        }


        toolbar.style.display =
            "block";


        toolbar.style.visibility =
            "visible";


        toolbar.style.opacity =
            "1";


        toolbar.style.pointerEvents =
            "auto";


        updatePageIndicator();

    }


    /*
    =======================================================
    HIDE
    =======================================================
    */

    function hide() {

        if (!toolbar) {

            return;

        }


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
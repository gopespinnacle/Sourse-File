/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION TOOLBAR V1
===========================================================

RESPONSIBILITY:

- Professional annotation toolbar UI
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

Existing operations are preserved.
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
        ===================================================
        TOOLBAR HTML
        ===================================================
        */

        toolbar.innerHTML = `

            <div class="annotation-toolbar-inner">


                <!-- =====================================
                     DRAWING TOOLS
                     ===================================== -->

                <div class="annotation-toolbar-group">


                    <!-- PEN -->

                    <button
                        type="button"
                        id="annotationPenV1"
                        class="annotation-tool-btn active"
                        title="Pen"
                        aria-label="Pen"
                    >
                        <span class="toolbar-icon">✏</span>
                    </button>


                    <!-- ERASER -->

                    <button
                        type="button"
                        id="annotationEraserV1"
                        class="annotation-tool-btn"
                        title="Eraser"
                        aria-label="Eraser"
                    >
                        <span class="toolbar-icon">⌫</span>
                    </button>


                </div>


                <div class="toolbar-divider"></div>


                <!-- =====================================
                     ERASER SIZE
                     ===================================== -->

                <div
                    class="annotation-control"
                    title="Eraser Size"
                >

                    <span class="control-label">
                        Eraser
                    </span>

                    <select
                        id="annotationEraserWidthV1"
                        class="annotation-select"
                    >

                        <option value="10">
                            10 px
                        </option>

                        <option value="20">
                            20 px
                        </option>

                        <option
                            value="30"
                            selected
                        >
                            30 px
                        </option>

                        <option value="40">
                            40 px
                        </option>

                        <option value="60">
                            60 px
                        </option>

                        <option value="80">
                            80 px
                        </option>

                    </select>

                </div>


                <!-- =====================================
                     COLOR
                     ===================================== -->

                <label
                    class="annotation-color-control"
                    title="Pen Color"
                >

                    <span class="color-icon">
                        ●
                    </span>

                    <input
                        type="color"
                        id="annotationColorV1"
                        value="#000000"
                        aria-label="Pen Color"
                    >

                </label>


                <!-- =====================================
                     STROKE WIDTH
                     ===================================== -->

                <div
                    class="annotation-control"
                    title="Stroke Width"
                >

                    <span class="control-label">
                        Pen
                    </span>

                    <select
                        id="annotationWidthV1"
                        class="annotation-select"
                    >

                        <option value="2">
                            2 px
                        </option>

                        <option
                            value="4"
                            selected
                        >
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

                </div>


                <div class="toolbar-divider"></div>


                <!-- =====================================
                     HISTORY
                     ===================================== -->

                <button
                    type="button"
                    id="annotationUndoV1"
                    class="annotation-action-btn"
                    title="Undo"
                    aria-label="Undo"
                >
                    ↶
                </button>


                <button
                    type="button"
                    id="annotationRedoV1"
                    class="annotation-action-btn"
                    title="Redo"
                    aria-label="Redo"
                >
                    ↷
                </button>


                <!-- CLEAR -->

                <button
                    type="button"
                    id="annotationClearV1"
                    class="annotation-action-btn danger-soft"
                    title="Clear Page"
                    aria-label="Clear Page"
                >
                    🗑
                </button>


                <div class="toolbar-divider"></div>


                <!-- =====================================
                     SAVE
                     ===================================== -->

                <button
                    type="button"
                    id="annotationSavePdfV1"
                    class="annotation-save-btn"
                    title="Save Learning Material"
                    aria-label="Save Learning Material"
                >

                    <span class="save-icon">
                        ▣
                    </span>

                    <span class="save-text">
                        Save
                    </span>

                </button>


                <div class="toolbar-divider"></div>


                <!-- =====================================
                     PAGE CONTROLS
                     ===================================== -->

                <button
                    type="button"
                    id="annotationPreviousPageV1"
                    class="annotation-page-btn"
                    title="Previous Page"
                    aria-label="Previous Page"
                >
                    ‹
                </button>


                <span
                    id="annotationPageIndicatorV1"
                    class="annotation-page-indicator"
                >
                    Page 1 / 1
                </span>


                <button
                    type="button"
                    id="annotationNextPageV1"
                    class="annotation-page-btn"
                    title="Next Page"
                    aria-label="Next Page"
                >
                    ›
                </button>


                <!-- ADD PAGE -->

                <button
                    type="button"
                    id="annotationAddPageV1"
                    class="annotation-page-btn add-page-btn"
                    title="Add New Page"
                    aria-label="Add New Page"
                >
                    +
                </button>


                <!-- DELETE PAGE -->

                <button
                    type="button"
                    id="annotationDeletePageV1"
                    class="annotation-page-btn danger-soft"
                    title="Delete Current Page"
                    aria-label="Delete Current Page"
                >
                    🗑
                </button>


                <div class="toolbar-divider"></div>


                <!-- =====================================
                     CLOSE
                     ===================================== -->

                <button
                    type="button"
                    id="annotationCloseV1"
                    class="annotation-close-btn"
                    title="Close Annotation"
                    aria-label="Close Annotation"
                >
                    ×
                </button>


            </div>

        `;


        /*
        ===================================================
        TOOLBAR MAIN STYLE
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
        INJECT PROFESSIONAL CSS
        ===================================================
        */

        injectStyles();


        /*
        ===================================================
        MOVE TOOLBAR INTO WORKSPACE
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
    PROFESSIONAL CSS
    =======================================================
    */

    function injectStyles() {

        if (
            document.getElementById(
                "annotationToolbarV1Styles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "annotationToolbarV1Styles";


        style.textContent = `

            /*
            =============================================
            MAIN TOOLBAR
            =============================================
            */

            #annotationToolbarV1 {

                position: absolute !important;

                left: 50% !important;

                bottom: 12px !important;

                transform:
                    translateX(-50%) !important;

                z-index: 99999 !important;

                display: block !important;

                visibility: visible !important;

                opacity: 1 !important;

                pointer-events: auto !important;

                width: auto !important;

                height: auto !important;

            }


            /*
            =============================================
            TOOLBAR INNER
            =============================================
            */

            #annotationToolbarV1
            .annotation-toolbar-inner {

                display: flex;

                align-items: center;

                justify-content: center;

                gap: 6px;

                padding: 8px 10px;

                background:
                    rgba(255,255,255,.97);

                border:
                    1px solid #d1d5db;

                border-radius: 14px;

                box-shadow:
                    0 8px 30px
                    rgba(0,0,0,.20);

                white-space: nowrap;

                backdrop-filter:
                    blur(10px);

            }


            /*
            =============================================
            TOOL GROUP
            =============================================
            */

            #annotationToolbarV1
            .annotation-toolbar-group {

                display: flex;

                align-items: center;

                gap: 5px;

            }


            /*
            =============================================
            DIVIDER
            =============================================
            */

            #annotationToolbarV1
            .toolbar-divider {

                width: 1px;

                height: 28px;

                background:
                    #e5e7eb;

                margin:
                    0 3px;

            }


            /*
            =============================================
            TOOL BUTTONS
            =============================================
            */

            #annotationToolbarV1
            .annotation-tool-btn,

            #annotationToolbarV1
            .annotation-action-btn,

            #annotationToolbarV1
            .annotation-page-btn {

                width: 34px;

                height: 34px;

                padding: 0;

                border:
                    1px solid #d1d5db;

                border-radius: 8px;

                background:
                    #f9fafb;

                color:
                    #1f2937;

                cursor: pointer;

                display: inline-flex;

                align-items: center;

                justify-content: center;

                font-size: 17px;

                font-weight: 600;

                transition:
                    background .15s ease,
                    border-color .15s ease,
                    transform .15s ease,
                    box-shadow .15s ease;

            }


            /*
            =============================================
            HOVER
            =============================================
            */

            #annotationToolbarV1
            .annotation-tool-btn:hover,

            #annotationToolbarV1
            .annotation-action-btn:hover,

            #annotationToolbarV1
            .annotation-page-btn:hover {

                background:
                    #eef2ff;

                border-color:
                    #9ca3af;

                transform:
                    translateY(-1px);

            }


            /*
            =============================================
            ACTIVE TOOL
            =============================================
            */

            #annotationToolbarV1
            .annotation-tool-btn.active {

                background:
                    #dbeafe;

                border-color:
                    #60a5fa;

                box-shadow:
                    inset 0 0 0 1px
                    #93c5fd;

            }


            /*
            =============================================
            ICON
            =============================================
            */

            #annotationToolbarV1
            .toolbar-icon {

                line-height: 1;

                font-size: 17px;

            }


            /*
            =============================================
            CONTROL
            =============================================
            */

            #annotationToolbarV1
            .annotation-control {

                height: 34px;

                display: flex;

                align-items: center;

                gap: 4px;

                padding:
                    0 7px;

                border:
                    1px solid #d1d5db;

                border-radius: 8px;

                background:
                    #f9fafb;

            }


            /*
            =============================================
            LABEL
            =============================================
            */

            #annotationToolbarV1
            .control-label {

                font-size: 10px;

                font-weight: 700;

                color:
                    #6b7280;

                text-transform:
                    uppercase;

                letter-spacing:
                    .3px;

            }


            /*
            =============================================
            SELECT
            =============================================
            */

            #annotationToolbarV1
            .annotation-select {

                height: 27px;

                border:
                    none;

                outline:
                    none;

                background:
                    transparent;

                color:
                    #111827;

                font-size: 12px;

                font-weight: 600;

                cursor:
                    pointer;

            }


            /*
            =============================================
            COLOR
            =============================================
            */

            #annotationToolbarV1
            .annotation-color-control {

                width: 42px;

                height: 34px;

                display: flex;

                align-items: center;

                justify-content: center;

                gap: 2px;

                border:
                    1px solid #d1d5db;

                border-radius: 8px;

                background:
                    #f9fafb;

                cursor:
                    pointer;

            }


            #annotationToolbarV1
            .color-icon {

                font-size:
                    16px;

                line-height:
                    1;

                color:
                    #111111;

            }


            #annotationToolbarV1
            #annotationColorV1 {

                width:
                    21px;

                height:
                    21px;

                padding:
                    0;

                border:
                    none;

                background:
                    transparent;

                cursor:
                    pointer;

            }


            /*
            =============================================
            SAVE BUTTON
            =============================================
            */

            #annotationToolbarV1
            .annotation-save-btn {

                height:
                    34px;

                padding:
                    0 12px;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                gap:
                    6px;

                border:
                    1px solid #9ca3af;

                border-radius:
                    8px;

                background:
                    #111827;

                color:
                    #ffffff;

                cursor:
                    pointer;

                font-size:
                    12px;

                font-weight:
                    700;

                transition:
                    transform .15s ease,
                    background .15s ease;

            }


            #annotationToolbarV1
            .annotation-save-btn:hover {

                background:
                    #1f2937;

                transform:
                    translateY(-1px);

            }


            #annotationToolbarV1
            .save-icon {

                font-size:
                    15px;

            }


            /*
            =============================================
            PAGE INDICATOR
            =============================================
            */

            #annotationToolbarV1
            .annotation-page-indicator {

                min-width:
                    78px;

                height:
                    34px;

                padding:
                    0 9px;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                border:
                    1px solid #d1d5db;

                border-radius:
                    8px;

                background:
                    #f9fafb;

                color:
                    #374151;

                font-size:
                    12px;

                font-weight:
                    700;

                white-space:
                    nowrap;

            }


            /*
            =============================================
            ADD PAGE
            =============================================
            */

            #annotationToolbarV1
            .add-page-btn {

                font-size:
                    20px;

                font-weight:
                    500;

            }


            /*
            =============================================
            DANGER BUTTONS
            =============================================
            */

            #annotationToolbarV1
            .danger-soft {

                color:
                    #b91c1c;

            }


            #annotationToolbarV1
            .danger-soft:hover {

                background:
                    #fee2e2;

                border-color:
                    #fca5a5;

            }


            /*
            =============================================
            CLOSE
            =============================================
            */

            #annotationToolbarV1
            .annotation-close-btn {

                width:
                    34px;

                height:
                    34px;

                padding:
                    0;

                border:
                    1px solid #fecaca;

                border-radius:
                    8px;

                background:
                    #fff1f2;

                color:
                    #be123c;

                cursor:
                    pointer;

                display:
                    inline-flex;

                align-items:
                    center;

                justify-content:
                    center;

                font-size:
                    22px;

                line-height:
                    1;

                font-weight:
                    500;

                transition:
                    background .15s ease,
                    transform .15s ease;

            }


            #annotationToolbarV1
            .annotation-close-btn:hover {

                background:
                    #ffe4e6;

                transform:
                    translateY(-1px);

            }


            /*
            =============================================
            MOBILE
            =============================================
            */

            @media (max-width: 900px) {

                #annotationToolbarV1
                .annotation-toolbar-inner {

                    max-width:
                        calc(100vw - 20px);

                    overflow-x:
                        auto;

                    justify-content:
                        flex-start;

                    scrollbar-width:
                        thin;

                }

                #annotationToolbarV1
                .save-text {

                    display:
                        none;

                }

                #annotationToolbarV1
                .annotation-save-btn {

                    width:
                        34px;

                    padding:
                        0;

                }

            }


            @media (max-width: 600px) {

                #annotationToolbarV1 {

                    left:
                        50% !important;

                    bottom:
                        8px !important;

                    max-width:
                        calc(100% - 12px);

                }

                #annotationToolbarV1
                .annotation-toolbar-inner {

                    gap:
                        4px;

                    padding:
                        6px;

                    border-radius:
                        12px;

                }

                #annotationToolbarV1
                .annotation-control {

                    display:
                        none;

                }

                #annotationToolbarV1
                .annotation-color-control {

                    display:
                        inline-flex;

                }

                #annotationToolbarV1
                .toolbar-divider {

                    height:
                        24px;

                    margin:
                        0 1px;

                }

            }

        `;


        document.head.appendChild(
            style
        );

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
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.saveMaterial ===
        "function"
) {

    AnnotationPageV1.saveMaterial();

}
else if (
    window.AnnotationManagerV1 &&
    typeof
    AnnotationManagerV1.saveMaterial ===
        "function"
) {

    AnnotationManagerV1.saveMaterial();

}
else {

    console.warn(
        "ANNOTATION MATERIAL V1: SAVE MODULE NOT READY"
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
CLOSE ANNOTATION
===================================================
*/

const closeAnnotation =
    document.getElementById(
        "annotationCloseV1"
    );


if (closeAnnotation) {

    closeAnnotation.addEventListener(
        "click",
        async () => {

            console.log(
                "ANNOTATION TOOLBAR V1: CLOSE CLICKED"
            );


            /*
            ===================================================
            CHECK UNSAVED CHANGES
            ===================================================
            */

            let unsaved = false;


            /*
            ---------------------------------------------------
            FIRST CHECK
            ---------------------------------------------------
            */

            if (
                window.AnnotationPageV1 &&
                typeof
                AnnotationPageV1.hasChanges ===
                    "function"
            ) {

                try {

                    unsaved =
                        Boolean(
                            AnnotationPageV1.hasChanges()
                        );

                }
                catch (error) {

                    console.error(
                        "ANNOTATION CLOSE: hasChanges ERROR",
                        error
                    );

                }

            }


            console.log(
                "ANNOTATION CLOSE: UNSAVED =",
                unsaved
            );


            /*
            ===================================================
            IF UNSAVED
            ===================================================
            */

            if (unsaved) {

                showCloseConfirmation();

                return;

            }


            /*
            ===================================================
            NO UNSAVED CHANGES
            ===================================================
            */

            console.log(
                "ANNOTATION CLOSE: NO UNSAVED CHANGES"
            );


            closeAnnotationPage();

        }
    );

}


/*
===========================================================
CLOSE ANNOTATION PAGE
===========================================================
*/

function closeAnnotationPage() {

    console.log(
        "ANNOTATION TOOLBAR V1: CLOSING ANNOTATION"
    );


    /*
    -------------------------------------------------------
    CLOSE THIS TAB
    -------------------------------------------------------
    */

    if (
        window.opener &&
        !window.opener.closed
    ) {

        window.close();

    }
    else {

        /*
        ---------------------------------------------------
        FALLBACK
        ---------------------------------------------------

        Browser may prevent window.close()
        if this page was not opened by script.
        ---------------------------------------------------
        */

        window.history.back();

    }

}
    

/*
===========================================================
CLOSE CONFIRMATION
===========================================================
*/

function showCloseConfirmation() {

    /*
    -------------------------------------------------------
    REMOVE EXISTING POPUP
    -------------------------------------------------------
    */

    const existing =
        document.getElementById(
            "annotationCloseModalV1"
        );


    if (existing) {

        existing.remove();

    }


    /*
    -------------------------------------------------------
    CREATE MODAL
    -------------------------------------------------------
    */

    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "annotationCloseModalV1";


    modal.innerHTML = `

        <div
            class="annotationCloseOverlayV1"
        >

            <div
                class="annotationCloseDialogV1"
            >

                <div
                    class="annotationCloseIconV1"
                >
                    ⚠
                </div>


                <div
                    class="annotationCloseTitleV1"
                >
                    Unsaved Changes
                </div>


                <div
                    class="annotationCloseMessageV1"
                >
                    You have unsaved changes in this
                    learning material.
                    <br>
                    Do you want to save them before closing?
                </div>


                <div
                    class="annotationCloseActionsV1"
                >

                    <button
                        type="button"
                        id="annotationCloseSaveV1"
                        class="annotationCloseButtonV1 annotationCloseSaveButtonV1"
                    >
                        Save
                    </button>


                    <button
                        type="button"
                        id="annotationCloseDontSaveV1"
                        class="annotationCloseButtonV1 annotationCloseDontSaveButtonV1"
                    >
                        Don't Save
                    </button>


                    <button
                        type="button"
                        id="annotationCloseCancelV1"
                        class="annotationCloseButtonV1 annotationCloseCancelButtonV1"
                    >
                        Cancel
                    </button>

                </div>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    /*
    =======================================================
    SAVE
    =======================================================
    */

    const saveButton =
        document.getElementById(
            "annotationCloseSaveV1"
        );


    saveButton.addEventListener(
        "click",
        async () => {

            console.log(
                "ANNOTATION CLOSE: SAVE"
            );


            saveButton.disabled =
                true;


            saveButton.innerText =
                "Saving...";


            /*
            ------------------------------------------------
            CALL EXISTING SAVE SYSTEM
            ------------------------------------------------
            */

            if (
                window.AnnotationPageV1 &&
                typeof
                AnnotationPageV1.saveMaterial ===
                    "function"
            ) {

                await
                AnnotationPageV1.saveMaterial();

            }


            /*
            ------------------------------------------------
            CHECK WHETHER SAVE WAS SUCCESSFUL
            ------------------------------------------------
            */

            let stillUnsaved =
                true;


            if (
                window.AnnotationPageV1 &&
                typeof
                AnnotationPageV1.hasChanges ===
                    "function"
            ) {

                stillUnsaved =
                    AnnotationPageV1.hasChanges();

            }


            /*
            ------------------------------------------------
            CLOSE ONLY AFTER SUCCESSFUL SAVE
            ------------------------------------------------
            */

            if (!stillUnsaved) {

                modal.remove();

                closeAnnotationPage();

            }
            else {

                saveButton.disabled =
                    false;

                saveButton.innerText =
                    "Save";


                console.warn(
                    "ANNOTATION CLOSE: SAVE DID NOT COMPLETE"
                );

            }

        }
    );


    /*
    =======================================================
    DON'T SAVE
    =======================================================
    */

    const dontSaveButton =
        document.getElementById(
            "annotationCloseDontSaveV1"
        );


    dontSaveButton.addEventListener(
        "click",
        () => {

            console.log(
                "ANNOTATION CLOSE: DON'T SAVE"
            );


            modal.remove();


            closeAnnotationPage();

        }
    );


    /*
    =======================================================
    CANCEL
    =======================================================
    */

    const cancelButton =
        document.getElementById(
            "annotationCloseCancelV1"
        );


    cancelButton.addEventListener(
        "click",
        () => {

            console.log(
                "ANNOTATION CLOSE: CANCEL"
            );


            modal.remove();

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


            if (
                toolbar.parentElement !==
                workspace
            ) {

                workspace.appendChild(
                    toolbar
                );

            }


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
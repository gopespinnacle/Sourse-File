/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION CANVAS V1
===========================================================

RESPONSIBILITY:

- Create annotation canvas
- Smooth pointer drawing
- High DPI rendering
- Pen
- Eraser
- Color
- Stroke width
- Undo/Redo-ready history
- Export canvas data
- Import canvas data

IMPORTANT:

This module does NOT handle:

- Socket communication
- MongoDB
- PDF generation
- Meeting WebRTC
- Screen sharing

Those belong to separate modules.
===========================================================
*/

window.AnnotationCanvasV1 = (() => {

    /*
===========================================================
ANNOTATION PERSISTENCE V1
===========================================================
*/

let annotationSocket = null;

let annotationRoom = null;

/*
===========================================================
ANNOTATION SESSION KEY
===========================================================

Each time teacher presses Continue in the material popup,
a new unique key is created.

This key identifies ONE annotation session.

The classroom room remains separate and is still used
for teacher <-> student socket communication.
===========================================================
*/

let annotationSessionKey = null;

let annotationPersistenceReady = false;
let annotationLocalStorageKey = null;
let annotationLocalBackupRestored = false;
let annotationLocalBackupHasContent = false;
let annotationLocalLifecycleBound = false;

    /*
    =======================================================
    STATE
    =======================================================
    */

    let canvas = null;

    let context = null;

    let drawing = false;

    let currentTool = "pen";

    let currentColor = "#000000";

    let currentWidth = 4;

    let currentTextSize = 20;

    let eraserWidth = 30;

    let currentPoints = [];

    let history = [];

let historyIndex = -1;

let lastPoint = null;

let initialized = false;

// Image annotations are stored in the same history as strokes and text.
const imageCache = new Map();
let imageInteraction = null;
let selectedImageIndex = -1;



/*
===========================================================
MULTI PAGE ANNOTATION V1
===========================================================
*/

let annotationPages = [
    []
];

let currentPageIndex = 0;
let annotationPageBackgrounds = ["white"];
let annotationBackgroundLayer = null;


/*
===========================================================
ANNOTATION PERSISTENCE
===========================================================
*/

function buildAnnotationLocalStorageKey() {
    // If opened directly without ?room=... (as annotation.html),
    // keep a stable backup key based on this page's path.
    const pagePath = String(window.location.pathname || "/annotation.html").replace(/[^a-zA-Z0-9_-]/g, "_");
    const roomOrPage = annotationRoom || ("direct_" + pagePath);
    const safeRoom = String(roomOrPage).replace(/[^a-zA-Z0-9_-]/g, "_");
    const safeSession = String(annotationSessionKey || "default").replace(/[^a-zA-Z0-9_-]/g, "_");
    return "gpa_annotation_backup_v1:" + safeRoom + ":" + safeSession;
}

function annotationPagesHaveContent(pages, backgrounds) {
    const hasItems = Array.isArray(pages) && pages.some(page => Array.isArray(page) && page.length > 0);
    const hasPageStyle = Array.isArray(backgrounds) && backgrounds.some(style => style && style !== "white");
    return hasItems || hasPageStyle;
}

function saveLocalAnnotationBackup() {
    if (!annotationLocalStorageKey) return;
    try {
        if (Array.isArray(annotationPages) && annotationPages.length) {
            annotationPages[currentPageIndex] = getHistory();
        }
        const backup = {
            version: 1,
            pages: JSON.parse(JSON.stringify(annotationPages)),
            currentPage: currentPageIndex,
            pageBackgrounds: annotationPageBackgrounds.slice(),
            savedAt: Date.now()
        };
        localStorage.setItem(annotationLocalStorageKey, JSON.stringify(backup));
        annotationLocalBackupHasContent = annotationPagesHaveContent(backup.pages, backup.pageBackgrounds);
    } catch (error) {
        console.warn("ANNOTATION V1: LOCAL BACKUP COULD NOT BE SAVED (storage may be full)", error);
    }
}

function restoreLocalAnnotationBackup() {
    if (!annotationLocalStorageKey) return false;
    try {
        const raw = localStorage.getItem(annotationLocalStorageKey);
        if (!raw) return false;
        const backup = JSON.parse(raw);
        if (!backup || !Array.isArray(backup.pages)) return false;

        annotationPages = JSON.parse(JSON.stringify(backup.pages));
        if (!annotationPages.length) annotationPages = [[]];
        annotationPageBackgrounds = Array.isArray(backup.pageBackgrounds) ? backup.pageBackgrounds.slice() : [];
        while (annotationPageBackgrounds.length < annotationPages.length) annotationPageBackgrounds.push("white");
        annotationPageBackgrounds = annotationPageBackgrounds.slice(0, annotationPages.length);
        currentPageIndex = Number.isInteger(backup.currentPage) ? backup.currentPage : 0;
        if (currentPageIndex < 0 || currentPageIndex >= annotationPages.length) currentPageIndex = 0;
        history = JSON.parse(JSON.stringify(annotationPages[currentPageIndex] || []));
        historyIndex = history.length - 1;
        annotationLocalBackupRestored = true;
        annotationLocalBackupHasContent = annotationPagesHaveContent(annotationPages, annotationPageBackgrounds);
        redraw();
        console.log("ANNOTATION V1: LOCAL BACKUP RESTORED", currentPageIndex + 1, "/", annotationPages.length);
        return true;
    } catch (error) {
        console.warn("ANNOTATION V1: LOCAL BACKUP COULD NOT BE RESTORED", error);
        return false;
    }
}

function initPersistence() {
    // Establish local backup first. This must work even when the page is
    // opened directly without classroom URL parameters or a ready socket.
    const params = new URLSearchParams(window.location.search);
    annotationRoom = params.get("room");
    annotationSessionKey = params.get("key");
    annotationLocalStorageKey = buildAnnotationLocalStorageKey();
    restoreLocalAnnotationBackup();

    // Last-chance backup when the tab is refreshed, closed, or navigated away.
    if (!annotationLocalLifecycleBound) {
        const backupBeforeExit = () => {
            try { saveAnnotationState(); } catch (error) {
                console.warn("ANNOTATION V1: FINAL LOCAL BACKUP FAILED", error);
            }
        };
        window.addEventListener("pagehide", backupBeforeExit);
        window.addEventListener("beforeunload", backupBeforeExit);
        annotationLocalLifecycleBound = true;
    }

    // Server persistence is optional for direct-open mode, but remains
    // enabled for classroom URLs that provide a room and Socket.IO.
    if (typeof socket === "undefined" || !socket) {
        console.warn("ANNOTATION V1: SOCKET NOT READY; LOCAL BACKUP ENABLED");
        return;
    }

    annotationSocket = socket;
    console.log("ANNOTATION V1: SOCKET CONNECTED");
    console.log("ANNOTATION V1: ROOM", annotationRoom);
    console.log("ANNOTATION V1: SESSION KEY", annotationSessionKey);

    if (!annotationRoom) {
        console.warn("ANNOTATION V1: ROOM NOT FOUND; USING LOCAL BACKUP ONLY");
        return;
    }

    if (annotationPersistenceReady) return;
    annotationPersistenceReady = true;

    /*
    =======================================================
    LOAD SAVED ANNOTATION
    =======================================================
    */

    annotationSocket.on(
    "annotationLoaded",
    data => {

        if (
            !data ||
            data.room !== annotationRoom
        ) {

            return;

        }


        console.log(
            "ANNOTATION V1: SAVED DATA RECEIVED"
        );

        const serverPages = data.data && Array.isArray(data.data.pages)
            ? data.data.pages
            : (Array.isArray(data.data) ? [data.data] : []);
        const serverBackgrounds = data.data && Array.isArray(data.data.pageBackgrounds)
            ? data.data.pageBackgrounds
            : [];
        if (annotationLocalBackupRestored && annotationLocalBackupHasContent &&
            !annotationPagesHaveContent(serverPages, serverBackgrounds)) {
            console.warn("ANNOTATION V1: SERVER DATA EMPTY; KEEPING LOCAL BACKUP AND SYNCING IT");
            saveAnnotationState();
            return;
        }


        /*
    

                    <button type="button" id="annotationImageUploadV1" class="annotation-tool-btn" title="Insert Image" aria-label="Insert Image">
                        <span class="toolbar-icon">🖼</span>
                    </button>
                    <input type="file" id="annotationImageFileV1" accept="image/*" hidden>    ===================================================
        MULTI PAGE DATA
        ===================================================
        */

        if (
            data.data &&
            Array.isArray(
                data.data.pages
            )
        ) {

            annotationPages =
                JSON.parse(
                    JSON.stringify(
                        data.data.pages
                    )
                );

            annotationPageBackgrounds = Array.isArray(data.data.pageBackgrounds)
                ? data.data.pageBackgrounds.slice()
                : [];

            while (annotationPageBackgrounds.length < annotationPages.length) {
                annotationPageBackgrounds.push("white");
            }
            annotationPageBackgrounds = annotationPageBackgrounds.slice(0, annotationPages.length);


            if (
                annotationPages.length === 0
            ) {

                annotationPages = [
                    []
                ];

            }


            currentPageIndex =
                Number.isInteger(
                    data.data.currentPage
                )
                    ? data.data.currentPage
                    : 0;


            if (
                currentPageIndex < 0 ||
                currentPageIndex >=
                    annotationPages.length
            ) {

                currentPageIndex = 0;

            }


            history =
                JSON.parse(
                    JSON.stringify(
                        annotationPages[
                            currentPageIndex
                        ] || []
                    )
                );


            historyIndex =
                history.length - 1;


            ensurePageBackgroundLayer();
            applyPageBackground();
            redraw();


            console.log(
                "ANNOTATION V1: PAGE RESTORED",
                currentPageIndex + 1,
                "/",
                annotationPages.length
            );
            saveLocalAnnotationBackup();

            return;

        }


        /*
        ===================================================
        OLD SINGLE PAGE DATA
        ===================================================

        Keeps existing saved annotations compatible.
        ===================================================
        */

        if (
            Array.isArray(data.data)
        ) {

            annotationPages = [
                JSON.parse(
                    JSON.stringify(
                        data.data
                    )
                )
            ];
            annotationPageBackgrounds = ["white"];

            currentPageIndex = 0;


            loadHistory(
                data.data
            );

        }

    }
);


    /*
    =======================================================
    LIVE ANNOTATION UPDATE
    =======================================================
    */

    annotationSocket.on(
        "annotationUpdated",
        data => {

            if (
                !data ||
                data.room !== annotationRoom
            ) {

                return;

            }


            if (
    data.data &&
    Array.isArray(
        data.data.pages
    )
) {

    annotationPages =
        JSON.parse(
            JSON.stringify(
                data.data.pages
            )
        );

    annotationPageBackgrounds = Array.isArray(data.data.pageBackgrounds)
        ? data.data.pageBackgrounds.slice()
        : [];

    while (annotationPageBackgrounds.length < annotationPages.length) {
        annotationPageBackgrounds.push("white");
    }
    annotationPageBackgrounds = annotationPageBackgrounds.slice(0, annotationPages.length);


    currentPageIndex =
        Number.isInteger(
            data.data.currentPage
        )
            ? data.data.currentPage
            : 0;


    if (
        currentPageIndex < 0 ||
        currentPageIndex >=
            annotationPages.length
    ) {

        currentPageIndex = 0;

    }


    history =
        JSON.parse(
            JSON.stringify(
                annotationPages[
                    currentPageIndex
                ] || []
            )
        );


    historyIndex =
        history.length - 1;


    ensurePageBackgroundLayer();
    applyPageBackground();
    redraw();


    console.log(
        "ANNOTATION V1: LIVE PAGE UPDATED",
        currentPageIndex + 1
    );


    return;

}


/*
-----------------------------------------------------------
OLD SINGLE PAGE COMPATIBILITY
-----------------------------------------------------------
*/

if (
    Array.isArray(data.data)
) {

    loadHistory(
        data.data
    );

}

        }
    );


    /*
    =======================================================
    CLEAR FROM OTHER USER
    =======================================================
    */

    annotationSocket.on(
        "annotationCleared",
        () => {

            clearLocalAnnotation();

        }
    );


    /*
    =======================================================
    REQUEST SAVED DATA
    =======================================================
    */

  annotationSocket.emit(
    "annotationLoad",
    {
        room:
            annotationRoom,

        annotationKey:
            annotationSessionKey
    }
);

    console.log(
        "ANNOTATION V1: PERSISTENCE READY",
        annotationRoom
    );

}


/*
===========================================================
SAVE ANNOTATION STATE
===========================================================
*/

function saveAnnotationState() {

    saveLocalAnnotationBackup();

    if (
        !annotationSocket ||
        !annotationRoom
    ) {

        return;

    }


    /*
    -------------------------------------------------------
    SAVE CURRENT PAGE INTO PAGE ARRAY
    -------------------------------------------------------
    */

    saveCurrentPage();


    /*
    -------------------------------------------------------
    SAVE ALL PAGES
    -------------------------------------------------------
    */

    annotationSocket.emit(
    "annotationSave",
    {

        /*
        ---------------------------------------------------
        CLASSROOM ROOM
        ---------------------------------------------------
        Used only for live teacher/student synchronization.
        ---------------------------------------------------
        */

        room:
            annotationRoom,


        /*
        ---------------------------------------------------
        UNIQUE ANNOTATION SESSION
        ---------------------------------------------------
        Used for MongoDB persistence.
        ---------------------------------------------------
        */

        annotationKey:
            annotationSessionKey,


        /*
        ---------------------------------------------------
        ANNOTATION DATA
        ---------------------------------------------------
        */

        data: {

            pages:
                JSON.parse(
                    JSON.stringify(
                        annotationPages
                    )
                ),

            currentPage:
                currentPageIndex,

            pageBackgrounds:
                annotationPageBackgrounds.slice()

        }

    }
);

}

/*
===========================================================
MULTI PAGE MANAGEMENT
===========================================================
*/

/*
-----------------------------------------------------------
SAVE CURRENT PAGE
-----------------------------------------------------------
*/

function saveCurrentPage() {

    annotationPages[
        currentPageIndex
    ] = getHistory();

}


/*
-----------------------------------------------------------
LOAD PAGE
-----------------------------------------------------------
*/

function loadPage(pageIndex) {

    if (
        pageIndex < 0 ||
        pageIndex >= annotationPages.length
    ) {

        return;

    }


    /*
    -------------------------------------------------------
    SAVE CURRENT PAGE BEFORE SWITCHING
    -------------------------------------------------------
    */

    saveCurrentPage();


    /*
    -------------------------------------------------------
    CHANGE ACTIVE PAGE
    -------------------------------------------------------
    */

    currentPageIndex =
        pageIndex;

    applyPageBackground();


    /*
    -------------------------------------------------------
    LOAD PAGE HISTORY
    -------------------------------------------------------
    */

    history =
        JSON.parse(
            JSON.stringify(
                annotationPages[
                    currentPageIndex
                ] || []
            )
        );


    historyIndex =
        history.length - 1;

    selectedImageIndex = -1;
    applyPageBackground();


    /*
    -------------------------------------------------------
    REDRAW
    -------------------------------------------------------
    */

    redraw();


    console.log(
        "ANNOTATION V1: PAGE LOADED",
        currentPageIndex + 1
    );

}


/*
-----------------------------------------------------------
ADD NEW PAGE
-----------------------------------------------------------
*/

function addPage() {

    /*
    -------------------------------------------------------
    SAVE CURRENT PAGE
    -------------------------------------------------------
    */

    saveCurrentPage();


    /*
    -------------------------------------------------------
    CREATE NEW EMPTY PAGE
    -------------------------------------------------------
    */

    annotationPages.push([]);
    annotationPageBackgrounds.push("white");


    /*
    -------------------------------------------------------
    MOVE TO NEW PAGE
    -------------------------------------------------------
    */

    currentPageIndex =
        annotationPages.length - 1;


    history = [];

    historyIndex = -1;
    selectedImageIndex = -1;
    applyPageBackground();


    /*
    -------------------------------------------------------
    CLEAR CANVAS
    -------------------------------------------------------
    */

    if (canvas) {

        const rect =
            canvas.getBoundingClientRect();


        context.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );

    }


    console.log(
        "ANNOTATION V1: NEW PAGE",
        currentPageIndex + 1
    );


    /*
    -------------------------------------------------------
    SAVE ALL PAGES
    -------------------------------------------------------
    */

    saveAnnotationState();


/*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}

}


/*
-----------------------------------------------------------
NEXT PAGE
-----------------------------------------------------------
*/

function nextPage() {

    if (
        currentPageIndex <
        annotationPages.length - 1
    ) {

        loadPage(
            currentPageIndex + 1
        );

        saveAnnotationState();

    }

}


/*
-----------------------------------------------------------
PREVIOUS PAGE
-----------------------------------------------------------
*/

function previousPage() {

    if (
        currentPageIndex > 0
    ) {

        loadPage(
            currentPageIndex - 1
        );

        saveAnnotationState();

    }

}

/*
-----------------------------------------------------------
DELETE CURRENT PAGE
-----------------------------------------------------------
*/

function deletePage() {

    /*
    -------------------------------------------------------
    DO NOT ALLOW DELETING THE LAST PAGE
    -------------------------------------------------------
    */

    if (
        annotationPages.length <= 1
    ) {

        console.log(
            "ANNOTATION V1: CANNOT DELETE LAST PAGE"
        );

        return;

    }


    /*
    -------------------------------------------------------
    SAVE CURRENT PAGE BEFORE DELETE
    -------------------------------------------------------
    */

    saveCurrentPage();


    /*
    -------------------------------------------------------
    DELETE CURRENT PAGE
    -------------------------------------------------------
    */

    annotationPages.splice(
        currentPageIndex,
        1
    );
    annotationPageBackgrounds.splice(currentPageIndex, 1);


    /*
    -------------------------------------------------------
    ADJUST CURRENT PAGE
    -------------------------------------------------------
    */

    if (
        currentPageIndex >=
        annotationPages.length
    ) {

        currentPageIndex =
            annotationPages.length - 1;

    }


    /*
    -------------------------------------------------------
    LOAD NEW CURRENT PAGE
    -------------------------------------------------------
    */

    history =
        JSON.parse(
            JSON.stringify(
                annotationPages[
                    currentPageIndex
                ] || []
            )
        );


    historyIndex =
        history.length - 1;


    /*
    -------------------------------------------------------
    REDRAW
    -------------------------------------------------------
    */

    redraw();


    console.log(
        "ANNOTATION V1: PAGE DELETED",
        currentPageIndex + 1,
        "/",
        annotationPages.length
    );


    /*
    -------------------------------------------------------
    SAVE ALL PAGES
    -------------------------------------------------------
    */

    saveAnnotationState();


/*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}

}


/*
-----------------------------------------------------------
GET PAGE INFORMATION
-----------------------------------------------------------
*/

function getPageInfo() {

    return {

        currentPage:
            currentPageIndex + 1,

        totalPages:
            annotationPages.length

    };

}

/*
-----------------------------------------------------------
GET ALL ANNOTATION PAGES
-----------------------------------------------------------
*/

function getAllPages() {

    /*
    -------------------------------------------------------
    SAVE CURRENT PAGE FIRST
    -------------------------------------------------------
    */

    saveCurrentPage();


    /*
    -------------------------------------------------------
    RETURN COPY OF ALL PAGES
    -------------------------------------------------------
    */

    return JSON.parse(
        JSON.stringify(
            annotationPages
        )
    );

}


/*
===========================================================
CLEAR LOCAL ANNOTATION
===========================================================
*/

function clearLocalAnnotation() {

    if (!canvas) {

        return;

    }


    const rect =
        canvas.getBoundingClientRect();


    context.clearRect(
        0,
        0,
        rect.width,
        rect.height
    );


    history = [];

    historyIndex = -1;

}


/*
=======================================================
INITIALIZE
=======================================================
*/

function init(canvasElement) {

        if (!canvasElement) {

            console.error(
                "ANNOTATION CANVAS V1: CANVAS NOT FOUND"
            );

            return false;

        }


        canvas =
            canvasElement;

        ensurePageBackgroundLayer();

        context =
            canvas.getContext(
                "2d",
                {
                    alpha: true
                }
            );


        if (!context) {

            console.error(
                "ANNOTATION CANVAS V1: CONTEXT NOT AVAILABLE"
            );

            return false;

        }


        setupCanvas();

bindPointerEvents();
bindImagePasteEvents();
bindImageDeleteEvents();


initialized = true;


/*
=======================================================
START ANNOTATION PERSISTENCE
=======================================================
*/

initPersistence();


console.log(
    "ANNOTATION CANVAS V1: INITIALIZED"
);


        return true;

    }


    /*
    =======================================================
    CANVAS SIZE
    =======================================================
    */


    /*
    =======================================================
    NOTEBOOK PAGE BACKGROUNDS
    Backgrounds live on a separate layer, never in the
    annotation canvas history, so the eraser cannot remove them.
    =======================================================
    */

    function ensurePageBackgroundLayer() {
        const workspace = document.getElementById("annotationWorkspaceV1");
        if (!workspace || !canvas) return;

        annotationBackgroundLayer = document.getElementById("annotationPageBackgroundV1");
        if (!annotationBackgroundLayer) {
            annotationBackgroundLayer = document.createElement("div");
            annotationBackgroundLayer.id = "annotationPageBackgroundV1";
            annotationBackgroundLayer.setAttribute("aria-hidden", "true");
            workspace.insertBefore(annotationBackgroundLayer, canvas);
        }

        // Always re-apply the layer styles. The toolbar/workspace may have
        // been moved or restyled before the canvas module initializes.
        Object.assign(annotationBackgroundLayer.style, {
            position: "absolute",
            top: "0",
            right: "0",
            bottom: "0",
            left: "0",
            display: "block",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            zIndex: "0",
            pointerEvents: "none",
            backgroundColor: "#ffffff"
        });
        canvas.style.position = "relative";
        canvas.style.zIndex = "1";
        canvas.style.backgroundColor = "transparent";
        canvas.style.background = "transparent";
        applyPageBackground();
    }

    function getCurrentPageBackground() {
        return annotationPageBackgrounds[currentPageIndex] || "white";
    }

    function applyPageBackground() {
        if (!annotationBackgroundLayer) {
            annotationBackgroundLayer = document.getElementById("annotationPageBackgroundV1");
        }
        if (!annotationBackgroundLayer) return;

        const type = getCurrentPageBackground();
        annotationBackgroundLayer.style.backgroundColor = "#ffffff";
        annotationBackgroundLayer.style.backgroundImage = "none";
        annotationBackgroundLayer.style.backgroundSize = "auto";

        if (type === "ruled") {
            annotationBackgroundLayer.style.backgroundImage =
                "repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, #b9d5f5 27px, #b9d5f5 28px)";
            annotationBackgroundLayer.style.backgroundSize = "100% 28px";
        } else if (type === "four-line") {
            // Handwriting guide: one red baseline, exactly two blue guides,
            // then the next red baseline. Wider 60px spacing for writing.
            annotationBackgroundLayer.style.backgroundImage =
                "repeating-linear-gradient(to bottom, #d66f6f 0px, #d66f6f 2px, transparent 2px, transparent 20px, #8fb8ec 20px, #8fb8ec 22px, transparent 22px, transparent 40px, #8fb8ec 40px, #8fb8ec 42px, transparent 42px, transparent 60px)";
            annotationBackgroundLayer.style.backgroundSize = "100% 60px";
        } else if (type === "grid") {
            annotationBackgroundLayer.style.backgroundImage =
                "linear-gradient(#d6e2f0 1px, transparent 1px), linear-gradient(90deg, #d6e2f0 1px, transparent 1px)";
            annotationBackgroundLayer.style.backgroundSize = "24px 24px";
        } else if (type === "dots") {
            annotationBackgroundLayer.style.backgroundImage =
                "radial-gradient(#b9cde2 1px, transparent 1.2px)";
            annotationBackgroundLayer.style.backgroundSize = "18px 18px";
        }
    }

    function setPageBackground(type) {
        const allowed = ["white", "ruled", "four-line", "grid", "dots"];
        if (!allowed.includes(type)) return;
        while (annotationPageBackgrounds.length < annotationPages.length) {
            annotationPageBackgrounds.push("white");
        }
        annotationPageBackgrounds[currentPageIndex] = type;
        applyPageBackground();
        const pageStyleControl = document.getElementById("annotationPageStyleV1");
        if (pageStyleControl) pageStyleControl.value = type;
        saveAnnotationState();
        if (window.AnnotationPageV1 && typeof AnnotationPageV1.markUnsaved === "function") {
            AnnotationPageV1.markUnsaved();
        }
    }

    function getPageBackground() {
        return getCurrentPageBackground();
    }

    function setupCanvas() {

        if (!canvas) return;


        const rect =
            canvas.getBoundingClientRect();


        const ratio =
            window.devicePixelRatio ||
            1;


        canvas.width =
            Math.round(
                rect.width * ratio
            );


        canvas.height =
            Math.round(
                rect.height * ratio
            );


        context.setTransform(
            ratio,
            0,
            0,
            ratio,
            0,
            0
        );


        context.lineCap =
            "round";

        context.lineJoin =
            "round";

    }


    /*
    =======================================================
    RESIZE
    =======================================================
    */

    /*
=======================================================
RESIZE
=======================================================
*/

function resize() {

    if (!canvas) return;


    /*
    ---------------------------------------------------
    RESIZE CANVAS TO CURRENT PRESENTATION SIZE
    ---------------------------------------------------
    */

    setupCanvas();


    /*
    ---------------------------------------------------
    IMPORTANT
    DO NOT RESTORE USING toDataURL()

    The permanent annotation data is stored
    inside history.

    Redraw the stored annotation history after
    every canvas resize.
    ---------------------------------------------------
    */

    redraw();


    console.log(
        "ANNOTATION V1: CANVAS RESIZED AND HISTORY REDRAWN"
    );

}


    /*
    =======================================================
    POINTER EVENTS
    =======================================================
    */

    function bindPointerEvents() {

        canvas.addEventListener(
            "pointerdown",
            pointerDown
        );


        canvas.addEventListener(
            "pointermove",
            pointerMove
        );


        canvas.addEventListener(
            "pointerup",
            pointerUp
        );


        canvas.addEventListener(
            "pointercancel",
            pointerUp
        );


        canvas.addEventListener(
            "pointerleave",
            pointerUp
        );

    }


    /*
    =======================================================
    POINTER DOWN
    =======================================================
    */

    function pointerDown(event) {

        if (!initialized) return;


        /*
        ---------------------------------------------------
        ONLY LEFT / PRIMARY POINTER
        ---------------------------------------------------
        */

        if (
            event.pointerType === "mouse" &&
            event.button !== 0
        ) {

            return;

        }


        event.preventDefault();


        const point = getPoint(event);

// If an existing image is clicked, drag it or resize from its bottom-right handle.
const imageIndex = findImageAtPoint(point);
if (imageIndex >= 0) {
    event.preventDefault();
    const imageItem = history[imageIndex];
    const nearResizeHandle = point.x >= imageItem.x + imageItem.width - 18 &&
        point.y >= imageItem.y + imageItem.height - 18;
    imageInteraction = {
        index: imageIndex,
        mode: nearResizeHandle ? "resize" : "move",
        startX: point.x,
        startY: point.y,
        originalX: imageItem.x,
        originalY: imageItem.y,
        originalWidth: imageItem.width,
        originalHeight: imageItem.height
    };
    selectedImageIndex = imageIndex;
    canvas.setPointerCapture(event.pointerId);
    drawing = false;
    redraw();
    return;
}

const rect = canvas.getBoundingClientRect();

const logicalWidth =
    canvas.clientWidth || rect.width;

const logicalHeight =
    canvas.clientHeight || rect.height;

const marginLeft = logicalWidth * (15 / 210);
const marginRight = logicalWidth * (15 / 210);
const marginTop = logicalHeight * (18 / 297);
const marginBottom = logicalHeight * (18 / 297);

// Keep writing at least 0.50 mm inside the margin line.
const writingGapX = logicalWidth * (0.5 / 210);
const writingGapY = logicalHeight * (0.5 / 297);

const writingLeft = marginLeft + writingGapX;
const writingRight = logicalWidth - marginRight - writingGapX;
const writingTop = marginTop + writingGapY;
const writingBottom = logicalHeight - marginBottom - writingGapY;


if (
    point.x < writingLeft ||
    point.x > writingRight ||
    point.y < writingTop ||
    point.y > writingBottom
) {
    drawing = false;
    return;
}

/* TEXT TOOL: click existing text to edit it, or click blank space to add text. */
if (currentTool === "text") {
    drawing = false;
    const existingTextIndex = findTextAnnotationAtPoint(point);
    if (existingTextIndex >= 0) {
        createTextEditor(point, existingTextIndex);
    } else {
        createTextEditor(point, -1);
    }
    return;
}

canvas.setPointerCapture(event.pointerId);
drawing = true;

currentPoints = [point];


        lastPoint =
            point;


        /*
        ---------------------------------------------------
        START STROKE
        ---------------------------------------------------
        */

        if (
            currentTool ===
            "eraser"
        ) {

            context.globalCompositeOperation =
                "destination-out";

        }
        else {

            context.globalCompositeOperation =
                "source-over";

        }


        // Restrict this stroke to the four-sided page margin.
context.save();

context.beginPath();
context.rect(
    marginLeft,
    marginTop,
    logicalWidth - marginLeft - marginRight,
    logicalHeight - marginTop - marginBottom
);
context.clip();

context.beginPath();
context.moveTo(point.x, point.y);

    }


    /*
    =======================================================
    POINTER MOVE
    =======================================================
    */

    function pointerMove(event) {

        if (imageInteraction) {
            event.preventDefault();
            const point = getPoint(event);
            const item = history[imageInteraction.index];
            if (!item || item.type !== "image") return;
            const dx = point.x - imageInteraction.startX;
            const dy = point.y - imageInteraction.startY;
            if (imageInteraction.mode === "move") {
                item.x = Math.max(0, imageInteraction.originalX + dx);
                item.y = Math.max(0, imageInteraction.originalY + dy);
            } else {
                const ratio = imageInteraction.originalHeight / Math.max(1, imageInteraction.originalWidth);
                item.width = Math.max(40, imageInteraction.originalWidth + dx);
                item.height = Math.max(40, item.width * ratio);
            }
            redraw();
            return;
        }

        if (!drawing) return;


        event.preventDefault();


        /*
        ---------------------------------------------------
        GET COALESCED EVENTS WHEN AVAILABLE
        ---------------------------------------------------
        */

        const events =
            event.getCoalescedEvents
                ? event.getCoalescedEvents()
                : [event];


        events.forEach(
            moveEvent => {

                const point =
                    getPoint(
                        moveEvent
                    );


                currentPoints.push(
                    point
                );


                drawSmoothPoint(
                    point
                );


                lastPoint =
                    point;

            }
        );

    }


    /*
    =======================================================
    POINTER UP
    =======================================================
    */

    function pointerUp(event) {

        if (imageInteraction) {
            event.preventDefault();
            imageInteraction = null;
            try { canvas.releasePointerCapture(event.pointerId); } catch (error) {}
            redraw();
            saveAnnotationState();
            if (window.AnnotationPageV1 && typeof AnnotationPageV1.markUnsaved === "function") AnnotationPageV1.markUnsaved();
            return;
        }

        if (!drawing) return;


        event.preventDefault();


        drawing = false;


        try {

            canvas.releasePointerCapture(
                event.pointerId
            );

        }
        catch(error) {

            // Pointer capture may already be released.

        }


        context.closePath();

        context.restore();




        /*
        ---------------------------------------------------
        SAVE STROKE
        ---------------------------------------------------
        */

        if (
            currentPoints.length > 0
        ) {

            saveStroke(
                currentPoints
            );

        }

        saveAnnotationState();


/*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}


currentPoints = [];

lastPoint = null;


        context.globalCompositeOperation =
            "source-over";

    }


    /*
    =======================================================
    TEXT TOOL
    =======================================================
    */

    function findTextAnnotationAtPoint(point) {
        if (!point || !Array.isArray(history)) return -1;

        // Search newest-first so overlapping text selects the topmost annotation.
        for (let i = Math.min(historyIndex, history.length - 1); i >= 0; i--) {
            const item = history[i];
            if (!item || item.type !== "text" || typeof item.text !== "string" || !item.text.trim()) continue;

            const fontSize = Number(item.fontSize) || 20;
            const maxWidth = Math.max(90, Number(item.maxWidth) || 180);
            context.save();
            context.font = fontSize + "px " + (item.fontFamily || "Arial, sans-serif");
            const lineHeight = fontSize * 1.35;
            let lineCount = 0;
            let widestLine = 0;

            item.text.split("\n").forEach(paragraph => {
                const words = paragraph.split(/\s+/);
                let line = "";
                if (!words.length || (words.length === 1 && words[0] === "")) {
                    lineCount++;
                    return;
                }
                words.forEach(word => {
                    const candidate = line ? line + " " + word : word;
                    if (line && context.measureText(candidate).width > maxWidth) {
                        widestLine = Math.max(widestLine, context.measureText(line).width);
                        lineCount++;
                        line = word;
                    } else {
                        line = candidate;
                    }
                });
                widestLine = Math.max(widestLine, context.measureText(line).width);
                lineCount++;
            });
            context.restore();

            const left = Number(item.x) || 0;
            const top = Number(item.y) || 0;
            const hitWidth = Math.max(12, Math.min(maxWidth, widestLine + 8));
            const hitHeight = Math.max(lineHeight, lineCount * lineHeight);
            if (point.x >= left - 4 && point.x <= left + hitWidth &&
                point.y >= top - 4 && point.y <= top + hitHeight + 4) {
                return i;
            }
        }
        return -1;
    }

    function createTextEditor(point, editIndex) {
        if (!canvas) return;

        // Finish any existing editor before creating another.
        const existingEditor = document.getElementById("annotationTextEditorV1");
        if (existingEditor) {
            existingEditor.blur();
            if (document.getElementById("annotationTextEditorV1")) return;
        }

        const workspace = document.getElementById("annotationWorkspaceV1");
        if (!workspace) return;

        const editingItem = editIndex >= 0 ? history[editIndex] : null;
        const editor = document.createElement("textarea");
        editor.id = "annotationTextEditorV1";
        editor.setAttribute("aria-label", editingItem ? "Edit annotation text" : "Type annotation text");
        editor.setAttribute("placeholder", "Type here…");
        editor.rows = 1;
        editor.value = editingItem && typeof editingItem.text === "string" ? editingItem.text : "";
        editor.style.cssText = [
            "position:absolute",
            "z-index:20",
            "box-sizing:border-box",
            "min-width:90px",
            "width:180px",
            "min-height:34px",
            "padding:4px 6px",
            "margin:0",
            "border:1px dashed #2563eb",
            "border-radius:3px",
            "outline:2px solid rgba(37,99,235,.15)",
            "background:rgba(255,255,255,.96)",
            "color:" + (editingItem && editingItem.color ? editingItem.color : currentColor),
            "font:" + (editingItem && Number(editingItem.fontSize) ? Number(editingItem.fontSize) : currentTextSize) + "px " + (editingItem && editingItem.fontFamily ? editingItem.fontFamily : "Arial,sans-serif"),
            "line-height:1.35",
            "resize:both",
            "overflow:auto",
            "white-space:pre-wrap",
            "overflow-wrap:break-word",
            "touch-action:manipulation"
        ].join(";");

        editor.style.left = Math.max(0, editingItem ? Number(editingItem.x) || 0 : point.x) + "px";
        editor.style.top = Math.max(0, editingItem ? Number(editingItem.y) || 0 : point.y) + "px";
        if (editingItem && Number(editingItem.maxWidth)) {
            editor.style.width = Math.max(90, Number(editingItem.maxWidth)) + "px";
        }

        let finished = false;

        function finishText(save) {
            if (finished) return;
            finished = true;

            const text = editor.value.trimEnd();
            const x = parseFloat(editor.style.left) || 0;
            const y = parseFloat(editor.style.top) || 0;

            if (editor.parentNode) editor.parentNode.removeChild(editor);

            if (save && text.trim()) {
                const updatedText = {
                    type: "text",
                    text: text,
                    x: x,
                    y: y,
                    color: editor.style.color || currentColor,
                    fontSize: editingItem && Number(editingItem.fontSize) ? Number(editingItem.fontSize) : currentTextSize,
                    fontFamily: editingItem && editingItem.fontFamily ? editingItem.fontFamily : "Arial, sans-serif",
                    maxWidth: Math.max(90, editor.offsetWidth || (editingItem && Number(editingItem.maxWidth)) || 180)
                };

                if (editingItem && editIndex >= 0 && history[editIndex] === editingItem) {
                    // Replace the existing history item in place so it remains one undoable annotation.
                    history[editIndex] = updatedText;
                } else {
                    history = history.slice(0, historyIndex + 1);
                    history.push(updatedText);
                    historyIndex = history.length - 1;
                }

                redraw();
                saveAnnotationState();
                if (window.AnnotationPageV1 &&
                    typeof AnnotationPageV1.markUnsaved === "function") {
                    AnnotationPageV1.markUnsaved();
                }
            }
        }

        editor.addEventListener("input", () => {
            editor.style.height = "auto";
            editor.style.height = Math.max(34, editor.scrollHeight) + "px";
        });
        // Expand immediately when reopening an existing multi-line annotation.
        editor.style.height = "auto";
        editor.style.height = Math.max(34, editor.scrollHeight) + "px";

        editor.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                event.preventDefault();
                finishText(false);
            } else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
                event.preventDefault();
                finishText(true);
            }
        });

        editor.addEventListener("blur", () => finishText(true));
        workspace.appendChild(editor);
        editor.focus();
    }

    function drawTextAnnotation(item) {
        if (!item || typeof item.text !== "string") return;

        context.save();
        context.globalCompositeOperation = "source-over";
        context.fillStyle = item.color || "#000000";
        const fontSize = Number(item.fontSize) || 20;
        context.font = fontSize + "px " + (item.fontFamily || "Arial, sans-serif");
        context.textBaseline = "top";

        const words = item.text.split("\n");
        const lineHeight = fontSize * 1.35;
        const maxWidth = Math.max(90, Number(item.maxWidth) || 180);
        let y = Number(item.y) || 0;

        words.forEach(paragraph => {
            const parts = paragraph.split(/\s+/);
            let line = "";
            parts.forEach(word => {
                const testLine = line ? line + " " + word : word;
                if (line && context.measureText(testLine).width > maxWidth) {
                    context.fillText(line, Number(item.x) || 0, y);
                    y += lineHeight;
                    line = word;
                } else {
                    line = testLine;
                }
            });
            context.fillText(line, Number(item.x) || 0, y);
            y += lineHeight;
        });

        context.restore();
    }

    /*
    =======================================================
    SMOOTH DRAWING
    =======================================================
    */

    function drawSmoothPoint(point) {

        if (!lastPoint) {

            lastPoint =
                point;

            return;

        }


        /*
        ---------------------------------------------------
        QUADRATIC INTERPOLATION
        ---------------------------------------------------
        */

        const midX =
            (
                lastPoint.x +
                point.x
            ) / 2;


        const midY =
            (
                lastPoint.y +
                point.y
            ) / 2;


        context.strokeStyle =
            currentColor;


        context.lineWidth =
    currentTool === "eraser"
        ? eraserWidth
        : currentWidth;


        if (
            currentTool ===
            "eraser"
        ) {

            context.globalCompositeOperation =
                "destination-out";

        }
        else {

            context.globalCompositeOperation =
                "source-over";

        }


        context.quadraticCurveTo(
            lastPoint.x,
            lastPoint.y,
            midX,
            midY
        );


        context.stroke();


        context.beginPath();


        context.moveTo(
            midX,
            midY
        );

    }


    /*
    =======================================================
    SAVE STROKE
    =======================================================
    */

    function saveStroke(points) {

        if (
            !points ||
            !points.length
        ) {

            return;

        }


        /*
        ---------------------------------------------------
        REMOVE REDO HISTORY
        ---------------------------------------------------
        */

        history =
            history.slice(
                0,
                historyIndex + 1
            );


        history.push({

            type:
                currentTool,

            color:
                currentColor,

            width:
    currentTool === "eraser"
        ? eraserWidth
        : currentWidth,

            points:
                points.map(
                    point => ({
                        x: point.x,
                        y: point.y,
                        pressure:
                            point.pressure || 0
                    })
                )

        });


        historyIndex =
            history.length - 1;

    }


    /*
    =======================================================
    GET POINT
    =======================================================
    */

    function getPoint(event) {

    const rect =
        canvas.getBoundingClientRect();


    

    const logicalWidth =
        parseFloat(
            canvas.style.width
        ) ||
        canvas.clientWidth ||
        rect.width;


    const logicalHeight =
        parseFloat(
            canvas.style.height
        ) ||
        canvas.clientHeight ||
        rect.height;


    const visualWidth =
        rect.width ||
        1;


    const visualHeight =
        rect.height ||
        1;


    /*
    -------------------------------------------------------
    VISUAL → LOGICAL SCALE
    -------------------------------------------------------
    */

    const scaleX =
        logicalWidth /
        visualWidth;


    const scaleY =
        logicalHeight /
        visualHeight;


    /*
    -------------------------------------------------------
    POINTER POSITION INSIDE VISIBLE CANVAS
    -------------------------------------------------------
    */

    const visualX =
        event.clientX -
        rect.left;


    const visualY =
        event.clientY -
        rect.top;


    /*
    -------------------------------------------------------
    CONVERT TO LOGICAL CANVAS POSITION
    -------------------------------------------------------
    */

    const x =
        visualX *
        scaleX;


    const y =
        visualY *
        scaleY;


    return {

        x:
            x,

        y:
            y,

        pressure:
            event.pressure || 0

    };

}


    /*
    =======================================================
    TOOL
    =======================================================
    */

    function setTool(tool) {

        if (
            tool !== "pen" &&
            tool !== "eraser" &&
            tool !== "text"
        ) {

            return;

        }


        currentTool =
            tool;

    }


    /*
    =======================================================
    COLOR
    =======================================================
    */

    function setColor(color) {

        if (!color) return;


        currentColor =
            color;

    }


    /*
    =======================================================
    WIDTH
    =======================================================
    */

    function setWidth(width) {

        const value =
            Number(width);


        if (
            !Number.isFinite(value) ||
            value <= 0
        ) {

            return;

        }


        currentWidth =
            value;

    }

    /*
=======================================================
ERASER WIDTH
=======================================================
*/

function setEraserWidth(width) {

    const value =
        Number(width);


    if (
        !Number.isFinite(value) ||
        value <= 0
    ) {

        return;

    }


    eraserWidth =
        value;


    console.log(
        "ANNOTATION V1: ERASER WIDTH",
        eraserWidth
    );

}


    /*
    =======================================================
    CLEAR
    =======================================================
    */

    function clear() {

        if (!canvas) return;


        const rect =
            canvas.getBoundingClientRect();


        context.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );


        history = [];

        historyIndex = -1;

        /*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}

        if (
    annotationSocket &&
    annotationRoom
) {

    annotationSocket.emit(
        "annotationClear",
        annotationRoom
    );

}

    }


    /*
    =======================================================
    REDRAW HISTORY
    =======================================================
    */

    function bindImagePasteEvents() {
        if (document.documentElement.dataset.annotationImagePasteBound === "true") return;
        document.documentElement.dataset.annotationImagePasteBound = "true";
        document.addEventListener("paste", event => {
            const items = event.clipboardData && event.clipboardData.items;
            if (!items) return;
            for (const item of items) {
                if (item.type && item.type.startsWith("image/")) {
                    const file = item.getAsFile();
                    if (file) {
                        event.preventDefault();
                        addImageFile(file);
                        return;
                    }
                }
            }
        });
    }

    function addImageFile(file) {
        if (!file || !file.type || !file.type.startsWith("image/")) {
            alert("Please choose a valid image file.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            alert("Please use an image smaller than 5 MB so it can be saved reliably.");
            return;
        }
        const reader = new FileReader();
        reader.onload = () => {
            const dataUrl = String(reader.result || "");
            const image = new Image();
            image.onload = () => {
                if (!canvas) return;
                const maxWidth = Math.max(100, (canvas.clientWidth || canvas.width) * 0.65);
                const scale = Math.min(1, maxWidth / image.naturalWidth, 360 / image.naturalHeight);
                const width = Math.max(40, image.naturalWidth * scale);
                const height = Math.max(40, image.naturalHeight * scale);
                const item = {
                    type: "image", dataUrl, x: Math.max(12, ((canvas.clientWidth || canvas.width) - width) / 2),
                    y: Math.max(12, ((canvas.clientHeight || canvas.height) - height) / 2), width, height
                };
                history = history.slice(0, historyIndex + 1);
                history.push(item);
                historyIndex = history.length - 1;
                imageCache.set(dataUrl, image);
                redraw();
                saveAnnotationState();
                if (window.AnnotationPageV1 && typeof AnnotationPageV1.markUnsaved === "function") AnnotationPageV1.markUnsaved();
            };
            image.onerror = () => alert("This image could not be loaded. Please try another image.");
            image.src = dataUrl;
        };
        reader.onerror = () => alert("Could not read this image file.");
        reader.readAsDataURL(file);
    }

    // Delete the currently selected image with Delete or Backspace.
    function bindImageDeleteEvents() {
        if (document.documentElement.dataset.annotationImageDeleteBound === "true") return;
        document.documentElement.dataset.annotationImageDeleteBound = "true";

        document.addEventListener("keydown", function (event) {
            if (selectedImageIndex < 0) return;
            if (event.key !== "Delete" && event.key !== "Backspace") return;

            const active = document.activeElement;
            if (active && (active.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName))) return;

            const imageItem = history[selectedImageIndex];
            if (!imageItem || imageItem.type !== "image" || selectedImageIndex > historyIndex) {
                selectedImageIndex = -1;
                return;
            }

            event.preventDefault();
            history.splice(selectedImageIndex, 1);
            historyIndex--;
            selectedImageIndex = -1;
            imageInteraction = null;
            redraw();
            saveAnnotationState();
            if (window.AnnotationPageV1 && typeof AnnotationPageV1.markUnsaved === "function") {
                AnnotationPageV1.markUnsaved();
            }
        });
    }

    function findImageAtPoint(point) {
        for (let i = Math.min(historyIndex, history.length - 1); i >= 0; i--) {
            const item = history[i];
            if (item && item.type === "image" && point.x >= item.x && point.x <= item.x + item.width &&
                point.y >= item.y && point.y <= item.y + item.height) return i;
        }
        return -1;
    }

    function redraw() {

        if (!canvas) return;

        applyPageBackground();

        const rect =
            canvas.getBoundingClientRect();


        context.clearRect(
            0,
            0,
            rect.width,
            rect.height
        );


        for (
            let i = 0;
            i <= historyIndex;
            i++
        ) {

            drawStroke(
                history[i]
            );

        }

    }


    /*
    =======================================================
    DRAW SAVED STROKE
    =======================================================
    */

    function drawStroke(stroke) {

        if (!stroke) return;

        if (stroke.type === "image") {
            let image = imageCache.get(stroke.dataUrl);
            if (!image) {
                image = new Image();
                imageCache.set(stroke.dataUrl, image);
                image.onload = () => redraw();
                image.src = stroke.dataUrl;
            }
            if (image.complete && image.naturalWidth) {
                context.save();
                context.globalCompositeOperation = "source-over";
                context.drawImage(image, Number(stroke.x) || 0, Number(stroke.y) || 0,
                    Math.max(1, Number(stroke.width) || image.naturalWidth),
                    Math.max(1, Number(stroke.height) || image.naturalHeight));
                if (history[selectedImageIndex] === stroke) {
                    context.strokeStyle = "#2563eb";
                    context.lineWidth = 1.5;
                    context.setLineDash([5, 4]);
                    context.strokeRect(stroke.x, stroke.y, stroke.width, stroke.height);
                    context.setLineDash([]);
                    context.fillStyle = "#2563eb";
                    context.fillRect(stroke.x + stroke.width - 10, stroke.y + stroke.height - 10, 10, 10);
                }
                context.restore();
            }
            return;
        }

        if (stroke.type === "text") {
            drawTextAnnotation(stroke);
            return;
        }

        if (
            !stroke.points ||
            !stroke.points.length
        ) {
            return;
        }


        const previousTool =
            currentTool;

        const previousColor =
            currentColor;

        const previousWidth =
            currentWidth;


        currentTool =
            stroke.type || "pen";

        currentColor =
            stroke.color || "#000000";

        currentWidth =
            stroke.width || 4;


        context.beginPath();


        const first =
            stroke.points[0];


        context.moveTo(
            first.x,
            first.y
        );


        for (
            let i = 1;
            i < stroke.points.length;
            i++
        ) {

            const point =
                stroke.points[i];


            context.lineTo(
                point.x,
                point.y
            );

        }


        if (
            currentTool ===
            "eraser"
        ) {

            context.globalCompositeOperation =
                "destination-out";

        }
        else {

            context.globalCompositeOperation =
                "source-over";

        }


        context.strokeStyle =
            currentColor;


        context.lineWidth =
            currentWidth;


        context.lineCap =
            "round";

        context.lineJoin =
            "round";


        context.stroke();

        context.closePath();


        context.globalCompositeOperation =
            "source-over";


        currentTool =
            previousTool;

        currentColor =
            previousColor;

        currentWidth =
            previousWidth;

    }


    /*
    =======================================================
    EXPORT HISTORY
    =======================================================
    */

    function getHistory() {

        return JSON.parse(
            JSON.stringify(
                history
            )
        );

    }


    /*
    =======================================================
    LOAD HISTORY
    =======================================================
    */

    function loadHistory(data) {

        if (!Array.isArray(data)) {

            return;

        }


        history =
            JSON.parse(
                JSON.stringify(
                    data
                )
            );


        historyIndex =
            history.length - 1;


        redraw();

    }


    /*
    =======================================================
    UNDO
    =======================================================
    */

    function undo() {

        if (
            historyIndex < 0
        ) {

            return null;

        }


        const stroke =
            history[
                historyIndex
            ];


        historyIndex--;

redraw();




/*
=======================================================
SAVE AFTER UNDO
=======================================================
*/

saveAnnotationState();

/*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}


return stroke;

    }


    /*
    =======================================================
    REDO
    =======================================================
    */

    function redo() {

        if (
            historyIndex >=
            history.length - 1
        ) {

            return null;

        }


        historyIndex++;

redraw();




/*
=======================================================
SAVE AFTER REDO
=======================================================
*/

saveAnnotationState();

/*
=======================================================
MARK ANNOTATION AS UNSAVED
=======================================================
*/

if (
    window.AnnotationPageV1 &&
    typeof
    AnnotationPageV1.markUnsaved ===
        "function"
) {

    AnnotationPageV1.markUnsaved();

}


return history[
    historyIndex
];

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
    GET STATE
    =======================================================
    */

    function getState() {

        return {

            tool:
                currentTool,

            color:
                currentColor,

            width:
                currentWidth,

            history:
                getHistory()

        };

    }


    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

    init,

    resize,

    setTool,

    addImageFile,

    setColor,

    setWidth,

    setEraserWidth,

    clear,

    redraw,

    undo,

    redo,

    getHistory,

    loadHistory,

    getCanvas,

    getState,

    initPersistence,

    saveAnnotationState,


    /*
=======================================================
MULTI PAGE API
=======================================================
*/

addPage,

nextPage,

previousPage,

deletePage,

loadPage,

getPageInfo,

getAllPages,

setPageBackground,

getPageBackground

};

})();

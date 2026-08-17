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

let annotationPersistenceReady = false;

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

    let eraserWidth = 30;

    let currentPoints = [];

    let history = [];

    let historyIndex = -1;

    let lastPoint = null;

    let initialized = false;


/*
===========================================================
ANNOTATION PERSISTENCE
===========================================================
*/

function initPersistence() {

    if (
        typeof socket === "undefined" ||
        !socket
    ) {

        console.warn(
            "ANNOTATION V1: SOCKET NOT READY"
        );

        return;

    }


    annotationSocket =
        socket;

        console.log(
    "ANNOTATION V1: SOCKET CONNECTED"
);


    const params =
        new URLSearchParams(
            window.location.search
        );


    annotationRoom =
        params.get("room");

        console.log(
    "ANNOTATION V1: ROOM",
    annotationRoom
);


    if (!annotationRoom) {

        console.warn(
            "ANNOTATION V1: ROOM NOT FOUND"
        );

        return;

    }


    if (
        annotationPersistenceReady
    ) {

        return;

    }


    annotationPersistenceReady =
        true;


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
        annotationRoom
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

    if (
        !annotationSocket ||
        !annotationRoom
    ) {

        return;

    }


    annotationSocket.emit(
        "annotationSave",
        {
            room:
                annotationRoom,

            data:
                getHistory()
        }
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


        canvas.setPointerCapture(
            event.pointerId
        );


        drawing = true;


        const point =
            getPoint(event);


        currentPoints = [
            point
        ];


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


        context.beginPath();

        context.moveTo(
            point.x,
            point.y
        );

    }


    /*
    =======================================================
    POINTER MOVE
    =======================================================
    */

    function pointerMove(event) {

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


        currentPoints = [];

        lastPoint = null;


        context.globalCompositeOperation =
            "source-over";

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
                currentWidth,

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


        return {

            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top,

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
            tool !== "eraser"
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

    function redraw() {

        if (!canvas) return;


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

        if (
            !stroke ||
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

    saveAnnotationState

};

})();

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

    let restoreAnnotationAfterRefresh = false;

    let annotationSocket = null;

let annotationRoom = null;

let annotationSyncReady = false;

    let workspace = null;

    let canvas = null;

    let annotateButton = null;

    /*
===========================================================
LEARNING MATERIAL DETAILS
===========================================================
*/

let materialDetails = {

    materialDate: "",

    subject: "",

    chapterNo: "",

    chapterName: "",

    topic: "",

    description: "",

    className: "",

    room: "",

    periodId: ""

};

let materialPopup = null;


    /*
===========================================================
ANNOTATION SESSION SYNC
TEACHER → STUDENTS
===========================================================
*/

function initAnnotationSync() {

    /*
    -------------------------------------------------------
    GET EXISTING SOCKET
    -------------------------------------------------------
    */

    if (
        typeof socket === "undefined" ||
        !socket
    ) {

        console.warn(
            "ANNOTATION MANAGER V1: SOCKET NOT READY"
        );

        return;

    }


    annotationSocket =
        socket;


    /*
    -------------------------------------------------------
    GET ROOM
    -------------------------------------------------------
    */

    const params =
        new URLSearchParams(
            window.location.search
        );


    annotationRoom =
        params.get("room");


    if (!annotationRoom) {

        console.warn(
            "ANNOTATION MANAGER V1: ROOM NOT FOUND"
        );

        return;

    }


    /*
    -------------------------------------------------------
    PREVENT DUPLICATE LISTENERS
    -------------------------------------------------------
    */

    if (
        annotationSyncReady
    ) {

        return;

    }


    annotationSyncReady =
        true;


    /*
    =======================================================
    STUDENT / OTHER USER:
    TEACHER OPENED ANNOTATION
    =======================================================
    */

    annotationSocket.on(
    "annotationStarted",
    data => {

        console.log(
            "ANNOTATION MANAGER V1: RECEIVED annotationStarted",
            data
        );


        if (
            !data ||
            data.room !== annotationRoom
        ) {

            return;

        }


        console.log(
            "ANNOTATION MANAGER V1: REMOTE START"
        );


            /*
            ------------------------------------------------
            OPEN LOCALLY

            IMPORTANT:
            true = remote open

            This prevents sending annotationStart
            back to the server again.
            ------------------------------------------------
            */

            openAnnotation(
                true
            );

        }
    );


    /*
    =======================================================
    STUDENT / OTHER USER:
    TEACHER CLOSED ANNOTATION
    =======================================================
    */

    annotationSocket.on(
        "annotationStopped",
        data => {

            if (
                !data ||
                data.room !== annotationRoom
            ) {

                return;

            }


            console.log(
                "ANNOTATION MANAGER V1: REMOTE STOP"
            );


            /*
            ------------------------------------------------
            CLOSE LOCALLY

            true = remote close

            This prevents sending annotationStop
            back to the server.
            ------------------------------------------------
            */

            close(
                true
            );

        }
    );


    /*
    =======================================================
    NEW USER:
    ASK CURRENT ANNOTATION STATE
    =======================================================
    */

    annotationSocket.on(
        "annotationStatus",
        data => {

            if (
                !data ||
                data.room !== annotationRoom
            ) {

                return;

            }


            console.log(
                "ANNOTATION MANAGER V1: STATUS",
                data.active
            );


            if (
                data.active === true
            ) {

                openAnnotation(
                    true
                );

            }

        }
    );


    /*
    =======================================================
    REQUEST CURRENT STATE
    =======================================================
    */

    annotationSocket.emit(
        "annotationStatus",
        annotationRoom
    );


    console.log(
        "ANNOTATION MANAGER V1: SYNC READY",
        annotationRoom
    );

}



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

createMaterialDetailsPopup();

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

        /*
===================================================
START ANNOTATION SESSION SYNC
===================================================
*/

initAnnotationSync();


        initialized = true;


        console.log(
            "ANNOTATION MANAGER V1: INITIALIZED"
        );

        /*
===================================================
RESTORE ANNOTATION AFTER PAGE REFRESH
===================================================
*/

if (
    localStorage.getItem(
        "gopesAnnotationOpen"
    ) === "true"
) {

    console.log(
        "ANNOTATION MANAGER V1: RESTORING AFTER REFRESH"
    );

    setTimeout(
        () => {

            openAnnotation();

        },
        300
    );

}

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
===========================================================
CREATE LEARNING MATERIAL DETAILS POPUP
===========================================================
*/

function createMaterialDetailsPopup() {

    /*
    -------------------------------------------------------
    ALREADY CREATED
    -------------------------------------------------------
    */

    if (
        document.getElementById(
            "annotationMaterialPopupV1"
        )
    ) {

        materialPopup =
            document.getElementById(
                "annotationMaterialPopupV1"
            );

        return;

    }


    /*
    -------------------------------------------------------
    CREATE POPUP
    -------------------------------------------------------
    */

    materialPopup =
        document.createElement(
            "div"
        );


    materialPopup.id =
        "annotationMaterialPopupV1";


    materialPopup.style.position =
        "fixed";

    materialPopup.style.left =
        "0";

    materialPopup.style.top =
        "0";

    materialPopup.style.right =
        "0";

    materialPopup.style.bottom =
        "0";

    materialPopup.style.width =
        "100%";

    materialPopup.style.height =
        "100%";

    materialPopup.style.display =
        "none";

    materialPopup.style.alignItems =
        "center";

    materialPopup.style.justifyContent =
        "center";

    materialPopup.style.background =
        "rgba(0, 0, 0, 0.65)";

    materialPopup.style.zIndex =
        "99999";


    /*
    -------------------------------------------------------
    POPUP HTML
    -------------------------------------------------------
    */

    materialPopup.innerHTML = `

        <div
            id="annotationMaterialDialogV1"
            style="
                width:min(560px,92vw);
                max-height:90vh;
                overflow-y:auto;
                background:#ffffff;
                border-radius:14px;
                box-shadow:0 20px 60px rgba(0,0,0,.35);
                padding:28px;
                box-sizing:border-box;
                font-family:Arial,sans-serif;
            "
        >

            <div
                style="
                    text-align:center;
                    margin-bottom:22px;
                "
            >

                <div
                    style="
                        font-size:12px;
                        font-weight:700;
                        letter-spacing:2px;
                        color:#777;
                        margin-bottom:7px;
                    "
                >
                    GOPES PINNACLE ACADEMY
                </div>


                <div
                    style="
                        font-size:24px;
                        font-weight:700;
                        color:#111;
                    "
                >
                    Create Learning Material
                </div>

            </div>


            <!-- DATE -->

            <div style="margin-bottom:16px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Date
                </label>

                <input
                    type="text"
                    id="annotationMaterialDateV1"
                    readonly
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #d0d0d0;
                        border-radius:8px;
                        background:#f5f5f5;
                        color:#555;
                    "
                >

            </div>


            <!-- SUBJECT -->

            <div style="margin-bottom:16px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Subject
                </label>

                <input
                    type="text"
                    id="annotationMaterialSubjectV1"
                    readonly
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #d0d0d0;
                        border-radius:8px;
                        background:#f5f5f5;
                        color:#555;
                    "
                >

            </div>


            <!-- CHAPTER NUMBER -->

            <div style="margin-bottom:16px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Chapter No.
                </label>

                <input
                    type="text"
                    id="annotationMaterialChapterNoV1"
                    placeholder="Chapter No : Example ( 4 )"
                    autocomplete="off"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #cfcfcf;
                        border-radius:8px;
                        outline:none;
                    "
                >

            </div>


            <!-- CHAPTER NAME -->

            <div style="margin-bottom:16px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Chapter Name
                </label>

                <input
                    type="text"
                    id="annotationMaterialChapterNameV1"
                    placeholder="Enter chapter name"
                    autocomplete="off"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #cfcfcf;
                        border-radius:8px;
                        outline:none;
                    "
                >

            </div>


            <!-- TOPIC -->

            <div style="margin-bottom:16px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Topic
                </label>

                <input
                    type="text"
                    id="annotationMaterialTopicV1"
                    placeholder="Enter topic"
                    autocomplete="off"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #cfcfcf;
                        border-radius:8px;
                        outline:none;
                    "
                >

            </div>


            <!-- DESCRIPTION -->

            <div style="margin-bottom:22px;">

                <label
                    style="
                        display:block;
                        font-size:13px;
                        font-weight:600;
                        margin-bottom:6px;
                    "
                >
                    Description
                    <span
                        style="
                            font-weight:400;
                            color:#888;
                        "
                    >
                        (Optional)
                    </span>
                </label>

                <textarea
                    id="annotationMaterialDescriptionV1"
                    placeholder="Enter a short description of this topic"
                    rows="4"
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:11px 12px;
                        border:1px solid #cfcfcf;
                        border-radius:8px;
                        outline:none;
                        resize:vertical;
                        font-family:Arial,sans-serif;
                    "
                ></textarea>

            </div>


            <!-- BUTTONS -->

            <div
                style="
                    display:flex;
                    justify-content:flex-end;
                    gap:10px;
                "
            >

                <button
                    type="button"
                    id="annotationMaterialCancelV1"
                    style="
                        padding:11px 20px;
                        border:1px solid #ccc;
                        border-radius:8px;
                        background:#fff;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Cancel
                </button>


                <button
                    type="button"
                    id="annotationMaterialContinueV1"
                    style="
                        padding:11px 24px;
                        border:none;
                        border-radius:8px;
                        background:#111;
                        color:#fff;
                        cursor:pointer;
                        font-weight:600;
                    "
                >
                    Continue
                </button>

            </div>

        </div>

    `;


    /*
    -------------------------------------------------------
    ADD TO DOCUMENT
    -------------------------------------------------------
    */

    document.body.appendChild(
        materialPopup
    );


    /*
    -------------------------------------------------------
    CANCEL
    -------------------------------------------------------
    */

    const cancelButton =
        document.getElementById(
            "annotationMaterialCancelV1"
        );


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            () => {

                hideMaterialDetailsPopup();

            }
        );

    }

    /*
-------------------------------------------------------
CONTINUE
-------------------------------------------------------
*/

const continueButton =
    document.getElementById(
        "annotationMaterialContinueV1"
    );


if (continueButton) {

    continueButton.addEventListener(
        "click",
        () => {

            /*
            -----------------------------------------------
            GET FORM VALUES
            -----------------------------------------------
            */

            const chapterNo =
                document.getElementById(
                    "annotationMaterialChapterNoV1"
                );

            const chapterName =
                document.getElementById(
                    "annotationMaterialChapterNameV1"
                );

            const topic =
                document.getElementById(
                    "annotationMaterialTopicV1"
                );

            const description =
                document.getElementById(
                    "annotationMaterialDescriptionV1"
                );


            /*
            -----------------------------------------------
            VALIDATE REQUIRED FIELDS
            -----------------------------------------------
            */

            if (
                !chapterNo ||
                !chapterNo.value.trim()
            ) {

                alert(
                    "Please enter Chapter No."
                );

                chapterNo?.focus();

                return;

            }


            if (
                !chapterName ||
                !chapterName.value.trim()
            ) {

                alert(
                    "Please enter Chapter Name."
                );

                chapterName?.focus();

                return;

            }


            if (
                !topic ||
                !topic.value.trim()
            ) {

                alert(
                    "Please enter Topic."
                );

                topic?.focus();

                return;

            }


            /*
            -----------------------------------------------
            GET CURRENT MEETING DETAILS
            -----------------------------------------------
            */

            const params =
                new URLSearchParams(
                    window.location.search
                );


            const subject =
                params.get("subject") ||
                params.get("language") ||
                params.get("eca") ||
                "General";


            const className =
                params.get("className") ||
                "";


            const room =
                params.get("room") ||
                annotationRoom ||
                "";


            const periodId =
                params.get("periodId") ||
                "";


            /*
            -----------------------------------------------
            SAVE MATERIAL DETAILS
            -----------------------------------------------
            */

            materialDetails = {

                materialDate:
                    new Date().toISOString(),

                subject:
                    subject,

                chapterNo:
                    chapterNo.value.trim(),

                chapterName:
                    chapterName.value.trim(),

                topic:
                    topic.value.trim(),

                description:
                    description
                        ? description.value.trim()
                        : "",

                className:
                    className,

                room:
                    room,

                periodId:
                    periodId

            };


            /*
            -----------------------------------------------
            KEEP DETAILS AVAILABLE FOR NEXT BLOCK
            -----------------------------------------------
            */

            sessionStorage.setItem(
                "gopesAnnotationMaterialDetails",
                JSON.stringify(
                    materialDetails
                )
            );


            console.log(
                "ANNOTATION MATERIAL V1: DETAILS READY",
                materialDetails
            );


            /*
            -----------------------------------------------
            CLOSE POPUP
            -----------------------------------------------
            */

            hideMaterialDetailsPopup();


            /*
-------------------------------------------------------
OPEN NEW ANNOTATION PAGE
-------------------------------------------------------
*/

const annotationKey =
    "gopesAnnotation_" +
    Date.now();


/*
-------------------------------------------------------
STORE MATERIAL DETAILS FOR NEW ANNOTATION PAGE
-------------------------------------------------------
*/

localStorage.setItem(
    annotationKey,
    JSON.stringify(
        materialDetails
    )
);


/*
-------------------------------------------------------
BUILD NEW ANNOTATION PAGE URL
-------------------------------------------------------
*/

const annotationUrl =
    "annotation.html?key=" +
    encodeURIComponent(
        annotationKey
    );


/*
-------------------------------------------------------
OPEN ANNOTATION IN NEW TAB
-------------------------------------------------------
*/

const annotationWindow =
    window.open(
        annotationUrl,
        "_blank"
    );


/*
-------------------------------------------------------
CHECK POPUP BLOCKER
-------------------------------------------------------
*/

if (!annotationWindow) {

    alert(
        "Please allow pop-ups for Gopes Pinnacle Academy to open Annotation."
    );

    localStorage.removeItem(
        annotationKey
    );

    return;

}


console.log(
    "ANNOTATION: NEW TAB OPENED",
    annotationUrl
);

        }

    );

}


    console.log(
        "ANNOTATION MATERIAL V1: POPUP CREATED"
    );

}


/*
===========================================================
SHOW MATERIAL DETAILS POPUP
===========================================================
*/

function showMaterialDetailsPopup() {

    if (!materialPopup) {

        createMaterialDetailsPopup();

    }


    /*
    -------------------------------------------------------
    DATE
    -------------------------------------------------------
    */

    const dateInput =
        document.getElementById(
            "annotationMaterialDateV1"
        );


    if (dateInput) {

        const today =
            new Date();


        dateInput.value =
            today.toLocaleDateString(
                "en-IN",
                {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );

    }


    /*
    -------------------------------------------------------
    SUBJECT
    -------------------------------------------------------

    IMPORTANT:

    For this first step we leave the subject
    ready to receive the existing timetable
    subject.

    We will connect the actual timetable
    subject in the next step.
    -------------------------------------------------------
    */

    const subjectInput =
    document.getElementById(
        "annotationMaterialSubjectV1"
    );


if (subjectInput) {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const subject =
        params.get("subject") ||
        params.get("language") ||
        params.get("eca") ||
        "General";


    subjectInput.value =
        subject;

}


    /*
    -------------------------------------------------------
    CLEAR TEACHER ENTRY FIELDS
    -------------------------------------------------------
    */

    const chapterNo =
        document.getElementById(
            "annotationMaterialChapterNoV1"
        );

    const chapterName =
        document.getElementById(
            "annotationMaterialChapterNameV1"
        );

    const topic =
        document.getElementById(
            "annotationMaterialTopicV1"
        );

    const description =
        document.getElementById(
            "annotationMaterialDescriptionV1"
        );


    if (chapterNo) {

        chapterNo.value = "";

    }


    if (chapterName) {

        chapterName.value = "";

    }


    if (topic) {

        topic.value = "";

    }


    if (description) {

        description.value = "";

    }


    /*
    -------------------------------------------------------
    SHOW
    -------------------------------------------------------
    */

    materialPopup.style.display =
        "flex";


    /*
    -------------------------------------------------------
    FOCUS CHAPTER NUMBER
    -------------------------------------------------------
    */

    setTimeout(
        () => {

            if (chapterNo) {

                chapterNo.focus();

            }

        },
        100
    );


    console.log(
        "ANNOTATION MATERIAL V1: POPUP OPEN"
    );

}


/*
===========================================================
HIDE MATERIAL DETAILS POPUP
===========================================================
*/

function hideMaterialDetailsPopup() {

    if (!materialPopup) {

        return;

    }


    materialPopup.style.display =
        "none";


    console.log(
        "ANNOTATION MATERIAL V1: POPUP CLOSED"
    );

}

/*
===========================================================
SAVE LEARNING MATERIAL
===========================================================
*/

async function saveMaterial() {

    try {

        console.log(
            "ANNOTATION MATERIAL V1: SAVE STARTED"
        );


        /*
        ---------------------------------------------------
        CHECK MATERIAL DETAILS
        ---------------------------------------------------
        */

        if (
            !materialDetails ||
            !materialDetails.chapterNo ||
            !materialDetails.chapterName ||
            !materialDetails.topic
        ) {

            alert(
                "Learning material details are missing."
            );

            return;

        }


        /*
        ---------------------------------------------------
        GET TEACHER INFORMATION
        ---------------------------------------------------
        */

        const teacherId =
            sessionStorage.getItem(
                "teacherId"
            ) ||
            localStorage.getItem(
                "teacherId"
            ) ||
            "";


        const teacherName =
            sessionStorage.getItem(
                "teacherName"
            ) ||
            localStorage.getItem(
                "teacherName"
            ) ||
            "";


        if (!teacherId) {

            alert(
                "Teacher information not found. Please login again."
            );

            return;

        }


        /*
        ---------------------------------------------------
        GET ALL ANNOTATION PAGES
        ---------------------------------------------------
        */

        if (
            !window.AnnotationCanvasV1 ||
            typeof AnnotationCanvasV1.getAllPages !==
                "function"
        ) {

            alert(
                "Annotation pages are not ready."
            );

            return;

        }


        const pages =
            AnnotationCanvasV1.getAllPages();


        /*
        ---------------------------------------------------
        GET CURRENT MEETING INFORMATION
        ---------------------------------------------------
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const className =
            materialDetails.className ||
            params.get("className") ||
            "";


        const room =
            materialDetails.room ||
            annotationRoom ||
            params.get("room") ||
            "";


        const subject =
            materialDetails.subject ||
            params.get("subject") ||
            "General";


        /*
        ---------------------------------------------------
        BUILD REQUEST
        ---------------------------------------------------
        */

        const payload = {

            teacher:
                teacherId,

            teacherName:
                teacherName,

            className:
                className,

            subject:
                subject,

            chapterNo:
                materialDetails.chapterNo,

            chapterName:
                materialDetails.chapterName,

            topic:
                materialDetails.topic,

            description:
                materialDetails.description || "",

            materialDate:
                materialDetails.materialDate ||
                new Date().toISOString(),

            room:
                room,

            pages:
                pages

        };


        console.log(
            "ANNOTATION MATERIAL V1: SAVING",
            payload
        );


        /*
        ---------------------------------------------------
        SEND TO BACKEND
        ---------------------------------------------------
        */

        const token =
            sessionStorage.getItem(
                "token"
            ) ||
            localStorage.getItem(
                "token"
            );


        const response =
            await fetch(
                "https://academy-backend-eatl.onrender.com/api/annotation-materials",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        ...(token
                            ? {
                                "Authorization":
                                    "Bearer " +
                                    token
                            }
                            : {})

                    },

                    body:
                        JSON.stringify(
                            payload
                        )

                }
            );


        const result =
            await response.json();


        /*
        ---------------------------------------------------
        BACKEND ERROR
        ---------------------------------------------------
        */

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "ANNOTATION MATERIAL V1: SAVE ERROR",
                result
            );


            alert(
                result.message ||
                "Failed to save learning material."
            );


            return;

        }


        /*
        ---------------------------------------------------
        SUCCESS
        ---------------------------------------------------
        */

        console.log(
            "ANNOTATION MATERIAL V1: SAVED",
            result.material
        );


        /*
        ---------------------------------------------------
        STORE MATERIAL ID
        ---------------------------------------------------
        */

        if (
            result.material &&
            result.material._id
        ) {

            sessionStorage.setItem(
                "gopesAnnotationMaterialId",
                result.material._id
            );

        }


        alert(
            "Learning Material saved successfully."
        );


    }
    catch (error) {

        console.error(
            "ANNOTATION MATERIAL V1: SAVE ERROR",
            error
        );


        alert(
            "Unable to save learning material. Please try again."
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

        /*
        ---------------------------------------------------
        IF ANNOTATION IS ALREADY OPEN
        ---------------------------------------------------
        */

        if (open) {

            close();

            return;

        }


        /*
        ---------------------------------------------------
        OPEN MATERIAL DETAILS FIRST
        ---------------------------------------------------
        */

        showMaterialDetailsPopup();

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

    function openAnnotation(isRemote = false) {

        /*
===================================================
REMEMBER ANNOTATION MODE
===================================================
*/

localStorage.setItem(
    "gopesAnnotationOpen",
    "true"
);

        if (!initialized) {

            init();

        }


        console.log(
            "ANNOTATION MANAGER V1: OPEN"
        );


        open = true;

        /*
===================================================
SYNC ANNOTATION OPEN TO OTHER USERS
===================================================
*/

if (
    !isRemote &&
    annotationSocket &&
    annotationRoom
) {

    annotationSocket.emit(
        "annotationStart",
        {
            room:
                annotationRoom
        }
    );

}


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

    /*
===================================================
REMOVE ANNOTATION ACTIVE STATE
===================================================
*/

if (participantGrid) {

    participantGrid.classList.remove(
        "annotation-active"
    );

}

    /*
===================================================
REMOVE ANNOTATION STATE FROM PARTICIPANT GRID
===================================================
*/

if (participantGrid) {

    participantGrid.classList.remove(
        "annotation-active"
    );

}


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

function close(isRemote = false) {

    console.log(
        "ANNOTATION MANAGER V1: CLOSE"
    );


    open = false;

    /*
===================================================
SYNC ANNOTATION CLOSE TO OTHER USERS
===================================================
*/

if (
    !isRemote &&
    annotationSocket &&
    annotationRoom
) {

    annotationSocket.emit(
        "annotationStop",
        {
            room:
                annotationRoom
        }
    );

}


    localStorage.removeItem(
        "gopesAnnotationOpen"
    );


    /*
    ===================================================
    HIDE ANNOTATION WORKSPACE
    ===================================================
    */

    if (workspace) {

        workspace.style.display =
            "none";

    }


    /*
    ===================================================
    RESTORE NORMAL MEETING LAYOUT
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


    /*
    ---------------------------------------------------
    HIDE PRESENTATION / ANNOTATION LAYER
    ---------------------------------------------------
    */

    if (presentationContainer) {

        presentationContainer.classList.remove(
            "screen-sharing-active"
        );


        presentationContainer.style.display =
            "none";


        presentationContainer.style.visibility =
            "hidden";


        presentationContainer.style.opacity =
            "0";

    }


    /*
    ---------------------------------------------------
    SHOW NORMAL PARTICIPANT GRID
    ---------------------------------------------------
    */

    if (participantGrid) {

    /*
    ===================================================
    RESTORE NORMAL MEETING GRID
    ===================================================
    */

    participantGrid.classList.remove(
        "annotation-active"
    );

    participantGrid.style.display =
        "grid";

    participantGrid.style.visibility =
        "visible";

    participantGrid.style.opacity =
        "1";

    /*
    ---------------------------------------------------
    FORCE NORMAL TWO-COLUMN MEETING LAYOUT
    ---------------------------------------------------
    */

    participantGrid.style.gridTemplateColumns =
        "repeat(2, minmax(0, 1fr))";

    participantGrid.style.gridTemplateRows =
        "1fr";

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
    ===================================================
    HIDE ANNOTATION TOOLBAR
    ===================================================
    */

    if (
        window.AnnotationToolbarV1
    ) {

        AnnotationToolbarV1.hide();

    }


    /*
    ===================================================
    RESET ANNOTATE BUTTON
    ===================================================
    */

    if (annotateButton) {

        annotateButton.classList.remove(
            "active"
        );

    }


    /*
    ===================================================
    FINAL NORMAL MEETING STATE
    ===================================================
    */

    console.log(
        "ANNOTATION MANAGER V1: NORMAL MEETING RESTORED"
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

    getCanvas,

    saveMaterial

};

})();


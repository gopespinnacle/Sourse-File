/*
===========================================================
GOPES PINNACLE ACADEMY
ANNOTATION PAGE V1
===========================================================

RESPONSIBILITIES:

- Initialize annotation canvas
- Initialize annotation toolbar
- Read learning material details
- Display material information
- Resize annotation canvas
===========================================================
*/

window.AnnotationPageV1 = (() => {

    let initialized = false;

    let canvas = null;


    /*
    =======================================================
    LOAD MATERIAL DETAILS
    =======================================================
    */

    function loadMaterialDetails() {

        console.log(
            "ANNOTATION PAGE V1: LOADING MATERIAL DETAILS"
        );


        /*
        ---------------------------------------------------
        GET KEY FROM URL
        ---------------------------------------------------
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const annotationKey =
            params.get("key");


        if (!annotationKey) {

            console.warn(
                "ANNOTATION PAGE V1: ANNOTATION KEY NOT FOUND"
            );

            return null;

        }


        console.log(
            "ANNOTATION PAGE V1: KEY",
            annotationKey
        );


        /*
        ---------------------------------------------------
        GET SAVED MATERIAL DETAILS
        ---------------------------------------------------
        */

        const savedDetails =
            localStorage.getItem(
                annotationKey
            );


        if (!savedDetails) {

            console.warn(
                "ANNOTATION PAGE V1: MATERIAL DETAILS NOT FOUND"
            );

            return null;

        }


        try {

            const details =
                JSON.parse(
                    savedDetails
                );


            console.log(
                "ANNOTATION PAGE V1: MATERIAL DETAILS LOADED",
                details
            );


            return details;

        }
        catch (error) {

            console.error(
                "ANNOTATION PAGE V1: INVALID MATERIAL DETAILS",
                error
            );


            return null;

        }

    }


    /*
    =======================================================
    DISPLAY MATERIAL DETAILS
    =======================================================
    */

    function displayMaterialDetails() {

        const details =
            loadMaterialDetails();


        /*
        ---------------------------------------------------
        IF DETAILS NOT AVAILABLE
        ---------------------------------------------------
        */

        if (!details) {

            console.warn(
                "ANNOTATION PAGE V1: USING DEFAULT MATERIAL DISPLAY"
            );

            return;

        }


        /*
        ---------------------------------------------------
        SUBJECT
        ---------------------------------------------------
        */

        const subjectElement =
            document.getElementById(
                "materialSubject"
            );


        if (subjectElement) {

            subjectElement.textContent =
                details.subject ||
                "Subject";

        }


        /*
        ---------------------------------------------------
        TOPIC
        ---------------------------------------------------
        */

        const topicElement =
            document.getElementById(
                "materialTopic"
            );


        if (topicElement) {

            /*
            -----------------------------------------------
            SHOW:

            Chapter No. | Chapter Name
            Topic

            -----------------------------------------------
            */

            const chapterNo =
                details.chapterNo ||
                "";


            const chapterName =
                details.chapterName ||
                "";


            const topic =
                details.topic ||
                "Topic";


            let chapterText = "";


            if (
                chapterNo &&
                chapterName
            ) {

                chapterText =
                    "Chapter " +
                    chapterNo +
                    " - " +
                    chapterName;

            }
            else if (
                chapterName
            ) {

                chapterText =
                    chapterName;

            }
            else if (
                chapterNo
            ) {

                chapterText =
                    "Chapter " +
                    chapterNo;

            }


            if (chapterText) {

                topicElement.innerHTML =
                    chapterText +
                    "<br>" +
                    "<span style='opacity:.85;'>" +
                    topic +
                    "</span>";

            }
            else {

                topicElement.textContent =
                    topic;

            }

        }


        /*
        ---------------------------------------------------
        STORE DETAILS FOR OTHER V1 MODULES
        ---------------------------------------------------
        */

        window.AnnotationMaterialDetailsV1 =
            details;


        console.log(
            "ANNOTATION PAGE V1: MATERIAL DISPLAY READY"
        );

    }


    /*
    =======================================================
    INITIALIZE CANVAS
    =======================================================
    */

    function initializeCanvas() {

        const workspace =
            document.getElementById(
                "annotationWorkspaceV1"
            );


        if (!workspace) {

            console.error(
                "ANNOTATION PAGE V1: annotationWorkspaceV1 NOT FOUND"
            );

            return false;

        }


        /*
        ---------------------------------------------------
        GET EXISTING CANVAS
        ---------------------------------------------------
        */

        canvas =
            document.getElementById(
                "annotationCanvasV1"
            );


        /*
        ---------------------------------------------------
        CREATE CANVAS IF NOT PRESENT
        ---------------------------------------------------
        */

        if (!canvas) {

            canvas =
                document.createElement(
                    "canvas"
                );


            canvas.id =
                "annotationCanvasV1";


            workspace.appendChild(
                canvas
            );

        }


        /*
        ===================================================
        SET REAL PIXEL SIZE
        ===================================================
        */

        const workspaceRect =
            workspace.getBoundingClientRect();


        canvas.style.position =
            "absolute";


        canvas.style.left =
            "0px";


        canvas.style.top =
            "0px";


        canvas.style.width =
            Math.floor(
                workspaceRect.width
            ) + "px";


        canvas.style.height =
            Math.floor(
                workspaceRect.height
            ) + "px";


        canvas.style.display =
            "block";


        canvas.style.background =
            "#ffffff";


        canvas.style.touchAction =
            "none";


        /*
        ===================================================
        CONNECT TO EXISTING CANVAS ENGINE
        ===================================================
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
        else {

            console.error(
                "ANNOTATION PAGE V1: AnnotationCanvasV1 NOT FOUND"
            );

            return false;

        }


        console.log(
            "ANNOTATION PAGE V1: CANVAS READY"
        );


        return true;

    }


    /*
    =======================================================
    INITIALIZE TOOLBAR
    =======================================================
    */

    function initializeToolbar() {

        if (
            !window.AnnotationToolbarV1
        ) {

            console.error(
                "ANNOTATION PAGE V1: AnnotationToolbarV1 NOT FOUND"
            );

            return false;

        }


        if (
            typeof AnnotationToolbarV1.init !==
                "function"
        ) {

            console.error(
                "ANNOTATION PAGE V1: Toolbar init() NOT FOUND"
            );

            return false;

        }


        AnnotationToolbarV1.init();


        console.log(
            "ANNOTATION PAGE V1: TOOLBAR READY"
        );


        return true;

    }


    /*
    =======================================================
    RESIZE
    =======================================================
    */

    function resizeCanvas() {

        if (
            window.AnnotationCanvasV1 &&
            typeof AnnotationCanvasV1.resize ===
                "function"
        ) {

            AnnotationCanvasV1.resize();

        }

    }


    /*
    =======================================================
    INITIALIZE PAGE
    =======================================================
    */

    function init() {

        if (initialized) {

            return;

        }


        console.log(
            "ANNOTATION PAGE V1: START"
        );


        /*
        ===================================================
        MATERIAL INFORMATION
        ===================================================
        */

        displayMaterialDetails();


        /*
        ===================================================
        CANVAS
        ===================================================
        */

        if (
            !initializeCanvas()
        ) {

            return;

        }


        /*
        ===================================================
        TOOLBAR
        ===================================================
        */

        if (
            !initializeToolbar()
        ) {

            return;

        }


        /*
        ===================================================
        WINDOW RESIZE
        ===================================================
        */

        window.addEventListener(
            "resize",
            () => {

                requestAnimationFrame(
                    () => {

                        resizeCanvas();

                    }
                );

            }
        );


        /*
        ===================================================
        FIRST RESIZE
        ===================================================
        */

        requestAnimationFrame(
            () => {

                resizeCanvas();

            }
        );


        initialized = true;


        console.log(
            "ANNOTATION PAGE V1: READY"
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
            "ANNOTATION PAGE V1: SAVE LEARNING MATERIAL STARTED"
        );


        /*
===================================================
CHECK MATERIAL INFORMATION
===================================================
*/

const materialDetails =
    loadMaterialDetails();


if (!materialDetails) {

    alert(
        "Learning material information is missing."
    );

    return;

}


        /*
        ===================================================
        REQUIRED MATERIAL DETAILS
        ===================================================
        */

        if (
            !materialDetails.chapterNo ||
            !materialDetails.chapterName ||
            !materialDetails.topic
        ) {

            alert(
                "Chapter Number, Chapter Name and Topic are required."
            );

            return;

        }


        /*
        ===================================================
        GET TEACHER INFORMATION
        ===================================================
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
        ===================================================
        GET ALL ANNOTATION PAGES
        ===================================================
        */

        if (
            !window.AnnotationCanvasV1 ||
            typeof
            AnnotationCanvasV1.getAllPages !==
                "function"
        ) {

            alert(
                "Annotation pages are not ready."
            );

            return;

        }


        const pages =
            AnnotationCanvasV1.getAllPages();


        if (
            !Array.isArray(pages) ||
            pages.length === 0
        ) {

            alert(
                "No annotation pages found."
            );

            return;

        }


        /*
        ===================================================
        GET URL PARAMETERS
        ===================================================
        */

        const params =
            new URLSearchParams(
                window.location.search
            );


        /*
        ===================================================
        CLASS
        ===================================================
        */

        const className =
            materialDetails.className ||
            params.get("className") ||
            "";


        /*
        ===================================================
        SUBJECT
        ===================================================
        */

        const subject =
            materialDetails.subject ||
            params.get("subject") ||
            "General";


        /*
        ===================================================
        ROOM
        ===================================================
        */

        const room =
            materialDetails.room ||
            params.get("room") ||
            "";


        /*
        ===================================================
        ROOM IS REQUIRED BY BACKEND
        ===================================================
        */

        if (!room) {

            alert(
                "Annotation room information is missing."
            );

            console.error(
                "ANNOTATION PAGE V1: ROOM NOT FOUND"
            );

            return;

        }


        /*
        ===================================================
        BUILD MATERIAL PAYLOAD
        ===================================================
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
                materialDetails.description ||
                "",

            materialDate:
                materialDetails.materialDate ||
                new Date().toISOString(),

            room:
                room,

            pages:
                pages

        };


        /*
        ===================================================
        DEBUG
        ===================================================
        */

        console.log(
            "ANNOTATION PAGE V1: SAVING MATERIAL",
            payload
        );


        /*
        ===================================================
        GET TOKEN
        ===================================================
        */

        const token =
            sessionStorage.getItem(
                "token"
            ) ||
            localStorage.getItem(
                "token"
            );


        /*
        ===================================================
        SEND TO BACKEND
        ===================================================
        */

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


        /*
        ===================================================
        READ RESPONSE
        ===================================================
        */

        const result =
            await response.json();


        /*
        ===================================================
        BACKEND ERROR
        ===================================================
        */

        if (
            !response.ok ||
            !result.success
        ) {

            console.error(
                "ANNOTATION PAGE V1: SAVE ERROR",
                result
            );


            alert(
                result.message ||
                "Failed to save learning material."
            );


            return;

        }


        /*
        ===================================================
        SUCCESS
        ===================================================
        */

        console.log(
            "ANNOTATION PAGE V1: MATERIAL SAVED",
            result.material
        );


        /*
        ===================================================
        STORE MATERIAL ID
        ===================================================
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


        /*
        ===================================================
        SUCCESS MESSAGE
        ===================================================
        */

        alert(
            "Learning Material saved successfully."
        );


        console.log(
            "ANNOTATION PAGE V1: SAVE COMPLETE"
        );

    }
    catch (error) {

        console.error(
            "ANNOTATION PAGE V1: SAVE ERROR",
            error
        );


        alert(
            "Unable to save learning material. Please try again."
        );

    }

}
    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

    init,

    resize:
        resizeCanvas,

    getMaterialDetails:
        loadMaterialDetails,

    saveMaterial

};

})();


/*
===========================================================
START
===========================================================
*/

window.addEventListener(
    "DOMContentLoaded",
    () => {

        AnnotationPageV1.init();

    }
);
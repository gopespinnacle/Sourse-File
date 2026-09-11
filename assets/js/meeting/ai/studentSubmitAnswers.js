const API =
"https://academy-backend-eatl.onrender.com/api/ai-assessment";


const token =
localStorage.getItem("token");


const assignmentId =
sessionStorage.getItem(
    "studentAssessmentAssignmentId"
);


if (!token) {

    window.location.href =
        "student-login.html";

}


if (!assignmentId) {

    alert(
        "Assessment assignment not found."
    );

    window.location.href =
        "student-assessment.html";

}


let selectedFiles = [];


const fileInput =
document.getElementById(
    "answerFiles"
);


const fileList =
document.getElementById(
    "fileList"
);


fileInput.addEventListener(
    "change",
    handleFileSelection
);


loadAssessment();


/*
====================================================
LOAD ASSESSMENT
====================================================
*/

async function loadAssessment() {

    try {

        const response =
            await fetch(

                API +
                "/student/assignment/" +
                assignmentId,

                {

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load assessment."
            );

        }


        const assignment =
            result.assignment;


        document.getElementById(
            "assessmentInfo"
        ).innerHTML = `

            <h2>
                ${escapeHtml(
                    assignment.subject ||
                    "Assessment"
                )}
            </h2>

            <div class="infoRow">

                <strong>
                    Chapter:
                </strong>

                ${escapeHtml(
                    assignment.chapter || "-"
                )}

            </div>

            <div class="infoRow">

                <strong>
                    Class:
                </strong>

                ${escapeHtml(
                    assignment.className || "-"
                )}

            </div>

            <div class="infoRow">

                <strong>
                    Student:
                </strong>

                ${escapeHtml(
                    assignment.studentName || "-"
                )}

            </div>

        `;


    }
    catch (error) {

        console.error(error);


        document.getElementById(
            "assessmentInfo"
        ).innerHTML = `

            <div class="message error"
                 style="display:block">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}


/*
====================================================
FILE SELECTION
====================================================
*/

function handleFileSelection(event) {

    const newFiles =
        Array.from(
            event.target.files
        );


    selectedFiles =
        [
            ...selectedFiles,
            ...newFiles
        ];


    /*
    Remove duplicate file
    names + sizes
    */

    selectedFiles =
        selectedFiles.filter(
            (file, index, array) =>

                index ===
                array.findIndex(
                    other =>
                        other.name ===
                        file.name &&
                        other.size ===
                        file.size
                )

        );


    renderFileList();


    fileInput.value = "";

}


/*
====================================================
RENDER FILE LIST
====================================================
*/

function renderFileList() {

    fileList.innerHTML = "";


    if (
        selectedFiles.length === 0
    ) {

        return;

    }


    selectedFiles.forEach(
        (file, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "fileItem";


            item.innerHTML = `

                <div class="fileName">

                    📄
                    ${escapeHtml(
                        file.name
                    )}

                </div>

                <button
                    class="removeBtn"
                    onclick="removeFile(
                        ${index}
                    )">

                    Remove

                </button>

            `;


            fileList.appendChild(
                item
            );

        }
    );

}


/*
====================================================
REMOVE FILE
====================================================
*/

function removeFile(index) {

    selectedFiles.splice(
        index,
        1
    );


    renderFileList();

}


/*
====================================================
UPLOAD ANSWERS
====================================================
*/

async function uploadAnswers() {

    if (
        selectedFiles.length === 0
    ) {

        showMessage(
            "Please select at least one answer file.",
            "error"
        );

        return;

    }


    const uploadBtn =
        document.getElementById(
            "uploadBtn"
        );


    uploadBtn.disabled = true;

    uploadBtn.innerHTML =
        "⏳ Uploading...";


    try {

        const formData =
            new FormData();


        selectedFiles.forEach(
            file => {

                formData.append(
                    "answerFiles",
                    file
                );

            }
        );


        const response =
            await fetch(

                API +
                "/student/assignment/" +
                assignmentId +
                "/submit",

                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    },

                    body: formData

                }

            );


        const result =
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Answer upload failed."
            );

        }


        showMessage(
            result.message ||
            "Answers submitted successfully.",
            "success"
        );


        selectedFiles = [];

        renderFileList();


        uploadBtn.innerHTML =
            "✅ Submitted";


        /*
        Return to Assessment Sheet
        */

        setTimeout(
            () => {

                window.location.href =
                    "student-assessment.html";

            },
            1500
        );


    }
    catch (error) {

        console.error(error);


        showMessage(
            error.message,
            "error"
        );


        uploadBtn.disabled =
            false;


        uploadBtn.innerHTML =
            "📤 Upload Answers";

    }

}


/*
====================================================
MESSAGE
====================================================
*/

function showMessage(
    text,
    type
) {

    const message =
        document.getElementById(
            "message"
        );


    message.className =
        "message " + type;


    message.textContent =
        text;


    message.style.display =
        "block";

}


/*
====================================================
BACK
====================================================
*/

function goBack() {

    window.location.href =
        "student-assessment.html";

}


/*
====================================================
HTML ESCAPE
====================================================
*/

function escapeHtml(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}
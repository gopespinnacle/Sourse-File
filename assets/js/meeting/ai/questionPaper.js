const API =
    "https://academy-backend-eatl.onrender.com/api/ai-assessment";


/*
====================================================
AUTHENTICATION
====================================================
*/

const token =
    localStorage.getItem("token");


if (!token) {

    window.location.href =
        "student-login.html";

}


/*
====================================================
GET ASSIGNMENT ID
====================================================
*/

const assignmentId =
    sessionStorage.getItem(
        "studentAssessmentAssignmentId"
    );


if (!assignmentId) {

    document.getElementById(
        "paperBody"
    ).innerHTML = `

        <div style="
            padding:40px;
            text-align:center;
        ">

            <h2>
                Question Paper Not Found
            </h2>

            <p>
                Assessment assignment information
                is missing.
            </p>

            <button
                onclick="
                    window.location.href =
                    'student-assessment.html'
                "
                style="
                    padding:10px 20px;
                    background:#2563eb;
                    color:white;
                    border:none;
                    border-radius:6px;
                    cursor:pointer;
                "
            >
                ← Back to Assessments
            </button>

        </div>

    `;

    throw new Error(
        "studentAssessmentAssignmentId not found."
    );

}


/*
====================================================
LOAD ASSIGNED QUESTION PAPER
====================================================
*/

loadAssignedQuestionPaper();


async function loadAssignedQuestionPaper() {

    try {

        console.log(
            "Loading student assessment:",
            assignmentId
        );


        const response =
            await fetch(

                API +
                "/student/assignment/" +
                assignmentId,

                {

                    method: "GET",

                    headers: {

                        "Authorization":
                            "Bearer " + token

                    }

                }

            );


        const result =
            await response.json();


        console.log(
            "Student assessment response:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load question paper."
            );

        }


        if (
            !result.success ||
            !result.assignment
        ) {

            throw new Error(
                "Assessment assignment was not found."
            );

        }


        const assignment =
            result.assignment;


        /*
        ====================================================
        GET QUESTION PAPER
        ====================================================
        */

        let paper =
            assignment.questionPaper;


        /*
        If questionPaper is only an ID,
        fetch it separately.
        */

        if (
            typeof paper === "string"
        ) {

            const paperResponse =
                await fetch(

                    API +
                    "/question-paper/" +
                    paper,

                    {

                        method: "GET",

                        headers: {

                            "Authorization":
                                "Bearer " + token

                        }

                    }

                );


            const paperResult =
                await paperResponse.json();


            if (
                !paperResponse.ok
            ) {

                throw new Error(
                    paperResult.message ||
                    "Unable to load question paper."
                );

            }


            paper =
                paperResult.paper ||
                paperResult.questionPaper;

        }


        /*
        ====================================================
        VALIDATE PAPER
        ====================================================
        */

        if (
            !paper ||
            !Array.isArray(
                paper.questions
            )
        ) {

            console.error(
                "Invalid question paper:",
                paper
            );

            throw new Error(
                "Question paper data was not found."
            );

        }


        /*
        ====================================================
        RENDER PAPER
        ====================================================
        */

        renderPaper(
            paper,
            assignment
        );


    }
    catch (error) {

        console.error(
            "Question paper loading error:",
            error
        );


        document.getElementById(
            "paperBody"
        ).innerHTML = `

            <div style="
                padding:40px;
                text-align:center;
            ">

                <h2>
                    Unable to Load Question Paper
                </h2>

                <p style="
                    color:#c62828;
                ">
                    ${escapeHtml(
                        error.message
                    )}
                </p>

                <button
                    onclick="
                        window.location.href =
                        'student-assessment.html'
                    "
                    style="
                        padding:10px 20px;
                        background:#2563eb;
                        color:white;
                        border:none;
                        border-radius:6px;
                        cursor:pointer;
                    "
                >
                    ← Back to Assessments
                </button>

            </div>

        `;

    }

}


/*
====================================================
RENDER QUESTION PAPER
====================================================
*/

function renderPaper(
    paper,
    assignment
) {

    const paperInfo =
        document.getElementById(
            "paperInfo"
        );


    let totalMarks = 0;


    paper.questions.forEach(
        q => {

            totalMarks +=
                Number(
                    q.marks || 0
                );

        }
    );


    const assignedDate =
        assignment.assignedAt
            ? new Date(
                assignment.assignedAt
              ).toLocaleDateString(
                "en-GB"
              )
            : new Date()
                .toLocaleDateString(
                    "en-GB"
                );


    /*
    ====================================================
    PAPER INFORMATION
    ====================================================
    */

    paperInfo.innerHTML = `

        <div class="paperInfoGrid">

            <div class="infoRow">

                <span class="label">
                    Student Name
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.studentName ||
                        "-"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Student ID
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.studentId ||
                        "-"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Date
                </span>

                <span class="value">
                    :
                    ${assignedDate}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Class
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.className ||
                        paper.className ||
                        "-"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Subject
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.subject ||
                        paper.subject ||
                        "-"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Teacher
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.teacherName ||
                        "Teacher"
                    )}
                </span>

            </div>


            <div class="infoRow fullWidth">

                <span class="label">
                    Chapter
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        assignment.chapter ||
                        paper.chapter ||
                        "-"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Duration
                </span>

                <span class="value">
                    :
                    ${escapeHtml(
                        paper.duration ||
                        "40 Minutes"
                    )}
                </span>

            </div>


            <div class="infoRow">

                <span class="label">
                    Total Marks
                </span>

                <span class="value">
                    :
                    ${totalMarks}
                </span>

            </div>

        </div>

    `;


    /*
    ====================================================
    QUESTION BODY
    ====================================================
    */

    const body =
        document.getElementById(
            "paperBody"
        );


    body.innerHTML = "";


    paper.questions.forEach(
        (q, index) => {

            const question =
                document.createElement(
                    "div"
                );


            question.className =
                "paperQuestion";


            question.innerHTML = `

                <div class="questionNo">

                    Q${index + 1}

                    <span
                        class="questionMarks"
                    >

                        (${Number(
                            q.marks || 0
                        )} Marks)

                    </span>

                </div>


                <div class="questionText">

                    ${escapeHtml(
                        q.question || ""
                    )}

                </div>


                ${
                    q.type === "MCQ" &&
                    Array.isArray(q.options) &&
                    q.options.length > 0

                    ?

                    `

                    <div class="mcqOptions">

                        ${q.options.map(
                            (
                                option,
                                optionIndex
                            ) => `

                            <div
                                class="mcqOption"
                            >

                                ${String.fromCharCode(
                                    65 +
                                    optionIndex
                                )}.

                                ${escapeHtml(
                                    option
                                )}

                            </div>

                        `).join("")}

                    </div>

                    `

                    :

                    ""

                }

            `;


            body.appendChild(
                question
            );

        }
    );

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
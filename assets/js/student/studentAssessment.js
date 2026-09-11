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
LOAD ASSESSMENTS
====================================================
*/

loadAssessments();


async function loadAssessments() {

    const container =
        document.getElementById(
            "assessmentList"
        );


    try {

        const response =
            await fetch(

                API +
                "/student/assignments",

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
            "Student assessments:",
            result
        );


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Unable to load assessments."
            );

        }


        if (
            !result.success ||
            !Array.isArray(result.data)
        ) {

            throw new Error(
                result.message ||
                "No assessment data received."
            );

        }


        /*
        ================================================
        NO ASSESSMENTS
        ================================================
        */

        if (result.data.length === 0) {

            container.innerHTML = `

                <div class="noAssessment">

                    <h3>
                        No Assessments Yet
                    </h3>

                    <p>
                        No question paper has been
                        assigned to you yet.
                    </p>

                </div>

            `;

            return;

        }


        /*
        ================================================
        RENDER CARDS
        ================================================
        */

        container.innerHTML = "";


        result.data.forEach(
            assessment => {

                container.appendChild(
                    createAssessmentCard(
                        assessment
                    )
                );

            }
        );


    }
    catch (error) {

        console.error(
            "Assessment loading error:",
            error
        );


        container.innerHTML = `

            <div class="noAssessment">

                <h3>
                    Unable to load assessments
                </h3>

                <p>
                    ${error.message}
                </p>

            </div>

        `;

    }

}


/*
====================================================
CREATE ASSESSMENT CARD
====================================================
*/

function createAssessmentCard(
    assessment
) {

    const card =
        document.createElement("div");


    card.className =
        "assessmentCard";


    /*
    -----------------------------------------------
    STATUS
    -----------------------------------------------
    */

    let statusText =
        "Not Submitted";

    let statusClass =
        "notSubmitted";


    if (
        assessment.answerStatus ===
        "Submitted"
    ) {

        statusText =
            "Submitted";

        statusClass =
            "submitted";

    }


    if (
        assessment.answerStatus ===
        "Corrected"
    ) {

        statusText =
            "Corrected";

        statusClass =
            "corrected";

    }


    /*
    -----------------------------------------------
    DATE
    -----------------------------------------------
    */

    const date =
        assessment.assignedAt
            ? new Date(
                assessment.assignedAt
              ).toLocaleDateString(
                "en-GB"
              )
            : "-";


    /*
    -----------------------------------------------
    CARD
    -----------------------------------------------
    */

    card.innerHTML = `

        <div class="assessmentHeader">

            <h3>
                📝 ${escapeHtml(
                    assessment.subject ||
                    "Assessment"
                )}
            </h3>

            <span
                class="status ${statusClass}">

                ${statusText}

            </span>

        </div>


        <div class="info">

            <strong>
                Chapter:
            </strong>

            ${escapeHtml(
                assessment.chapter || "-"
            )}

        </div>


        <div class="info">

            <strong>
                Subject:
            </strong>

            ${escapeHtml(
                assessment.subject || "-"
            )}

        </div>


        <div class="info">

            <strong>
                Teacher:
            </strong>

            ${escapeHtml(
                assessment.teacherName ||
                "Teacher"
            )}

        </div>


        <div class="info">

            <strong>
                Date:
            </strong>

            ${date}

        </div>


        <div class="actions">

            <button
                class="actionBtn viewBtn"
                onclick="viewQuestionPaper(
                    '${assessment._id}'
                )">

                👁 View Question

            </button>


            ${
                assessment.answerStatus !==
                "Corrected"

                ?

                `
                <button
                    class="actionBtn submitBtn"
                    onclick="submitAnswers(
                        '${assessment._id}'
                    )">

                    📤 Submit Answers

                </button>
                `

                :

                ""
            }

        </div>

    `;


    return card;

}


/*
====================================================
VIEW QUESTION PAPER
====================================================
*/

function viewQuestionPaper(
    assignmentId
) {

    sessionStorage.setItem(
        "studentAssessmentAssignmentId",
        assignmentId
    );


    window.location.href =
        "student-question-paper.html";

}


/*
====================================================
SUBMIT ANSWERS
====================================================
*/

function submitAnswers(
    assignmentId
) {

    sessionStorage.setItem(
        "studentAssessmentAssignmentId",
        assignmentId
    );


    window.location.href =
        "student-submit-answers.html";

}


/*
====================================================
BACK
====================================================
*/

function goBack() {

    window.location.href =
        "student-dashboard.html";

}


/*
====================================================
HTML ESCAPE
====================================================
*/

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}
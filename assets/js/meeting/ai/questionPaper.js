const API =
"https://academy-backend-eatl.onrender.com/api/ai-assessment";

const paper =
JSON.parse(
    sessionStorage.getItem("generatedQuestionPaper")
);

if(!paper){

    document.getElementById("paperBody").innerHTML =
    "<h2>No Question Paper Found.</h2>";

    throw new Error("No Question Paper.");

}

renderPaper();

function renderPaper(){

    const paperInfo =
document.getElementById("paperInfo");

let totalMarks = 0;

paper.questions.forEach(q => {

    totalMarks += Number(q.marks || 0);

});

const today = new Date();

const formattedDate =
today.toLocaleDateString("en-GB");

const teacherName =
sessionStorage.getItem("teacherName") || "";

paperInfo.innerHTML = `

<div class="paperInfoGrid">

    <div class="infoRow">

        <span class="label">Student Name</span>

        <span class="value">: ____________________</span>

    </div>

    <div class="infoRow">

        <span class="label">Date</span>

        <span class="value">: ${formattedDate}</span>

    </div>

    <div class="infoRow">

        <span class="label">Class</span>

        <span class="value">: ${paper.className}</span>

    </div>

    <div class="infoRow">

        <span class="label">Subject</span>

        <span class="value">: ${paper.subject}</span>

    </div>

    <div class="infoRow fullWidth">

        <span class="label">Chapter</span>

        <span class="value">: ${paper.chapter}</span>

    </div>

    <div class="infoRow">

        <span class="label">Duration</span>

        <span class="value">: ${paper.duration || "40 Minutes"}</span>

    </div>

    <div class="infoRow">

        <span class="label">Total Marks</span>

        <span class="value">: ${totalMarks}</span>

        
    </div>

</div>

`;

    const body =
    document.getElementById("paperBody");

    body.innerHTML = "";

    paper.questions.forEach((q,index)=>{

        body.innerHTML += `

<div class="paperQuestion">

    <div class="questionNo">

        Q${index + 1}

        <span class="questionMarks">

            (${q.marks} Marks)

        </span>

    </div>

    <div class="questionText">

        ${q.question}

    </div>

    ${
        q.type === "MCQ" &&
        Array.isArray(q.options) &&
        q.options.length > 0
        ?
        `
        <div class="mcqOptions">

            ${q.options.map((option, optionIndex) => `

                <div class="mcqOption">

                    ${String.fromCharCode(65 + optionIndex)}. ${option}

                </div>

            `).join("")}

        </div>
        `
        :
        ""
    }

</div>

`;

    });
    

}
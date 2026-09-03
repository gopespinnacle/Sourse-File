const API =
"https://academy-backend-eatl.onrender.com/api/ai-assessment";

const className =
sessionStorage.getItem("currentClass");

const subject =
sessionStorage.getItem("currentSubject");

const chapter =
sessionStorage.getItem("currentChapter");

console.log("className:", className);
console.log("subject:", subject);
console.log("chapter:", chapter);

loadQuestionBank();

async function loadQuestionBank(){

    try{

        const url =
API +
"/question-bank?" +
new URLSearchParams({
    className,
    subject,
    chapter
});

console.log("Loading URL:", url);

const response =
await fetch(url);

        const result =
        await response.json();

        if(!result.success){

            alert(result.message);
            return;

        }

        window.currentQuestionBank = result.questionBank;

renderQuestions(
    result.questionBank
);

    }
    catch(err){

    console.error(err);

    if(saveBtn){

        saveBtn.disabled = false;

        saveBtn.innerHTML =
        "💾 Save All";

    }

    alert(err.message);

}

}

function renderQuestions(questionBank){

    const container =
    document.getElementById("questionContainer");

    container.innerHTML = "";

    questionBank.questions.forEach((q,index)=>{

        container.appendChild(
            createQuestionCard(q,index)
        );

    });

    const generateBtn = document.createElement("button");

generateBtn.innerHTML = "📝 Generate Question Paper";

generateBtn.style.marginTop = "20px";
generateBtn.style.padding = "12px 20px";
generateBtn.style.background = "#28a745";
generateBtn.style.color = "white";
generateBtn.style.border = "none";
generateBtn.style.borderRadius = "6px";
generateBtn.style.cursor = "pointer";

generateBtn.onclick = generateQuestionPaper;

container.appendChild(generateBtn);

}

function createQuestionCard(q,index){

    const card =
    document.createElement("div");

    card.style.background="white";
    card.style.padding="20px";
    card.style.borderRadius="10px";
    card.style.boxShadow="0 2px 8px rgba(0,0,0,.1)";
    card.style.marginBottom="20px";

    card.innerHTML = `

<h3>Question ${index + 1}</h3>

<label>Question</label>

<textarea
class="questionText"
style="width:100%;height:90px;">${q.question || ""}</textarea>

<br><br>

<label>Answer</label>

<textarea
class="answerText"
style="width:100%;height:90px;">${q.answer || ""}</textarea>

<br><br>

<div style="display:flex;gap:15px;flex-wrap:wrap;">

<div>

<label>Question Type</label><br>

<select class="questionType">

<option value="MCQ" ${q.type==="MCQ"?"selected":""}>MCQ</option>

<option value="Fill in the Blanks" ${q.type==="Fill in the Blanks"?"selected":""}>Fill in the Blanks</option>

<option value="True / False" ${q.type==="True / False"?"selected":""}>True / False</option>

<option value="Match the Following" ${q.type==="Match the Following"?"selected":""}>Match the Following</option>

<option value="One Word Answer" ${q.type==="One Word Answer"?"selected":""}>One Word Answer</option>

<option value="Very Short Answer" ${q.type==="Very Short Answer"?"selected":""}>Very Short Answer</option>

<option value="Short Answer" ${q.type==="Short Answer"?"selected":""}>Short Answer</option>

<option value="Long Answer" ${q.type==="Long Answer"?"selected":""}>Long Answer</option>

<option value="Problem Solving" ${q.type==="Problem Solving"?"selected":""}>Problem Solving</option>

<option value="Word Problems" ${q.type==="Word Problems"?"selected":""}>Word Problems</option>

<option value="Case Study" ${q.type==="Case Study"?"selected":""}>Case Study</option>

<option value="Competency-Based" ${q.type==="Competency-Based"?"selected":""}>Competency-Based</option>

<option value="Assertion & Reason" ${q.type==="Assertion & Reason"?"selected":""}>Assertion & Reason</option>

<option value="Statement-Based" ${q.type==="Statement-Based"?"selected":""}>Statement-Based</option>

<option value="Reasoning / Logical Thinking" ${q.type==="Reasoning / Logical Thinking"?"selected":""}>Reasoning / Logical Thinking</option>

<option value="Odd One Out" ${q.type==="Odd One Out"?"selected":""}>Odd One Out</option>

<option value="Pattern-Based" ${q.type==="Pattern-Based"?"selected":""}>Pattern-Based</option>

<option value="Sequence Questions" ${q.type==="Sequence Questions"?"selected":""}>Sequence Questions</option>

<option value="Data Interpretation" ${q.type==="Data Interpretation"?"selected":""}>Data Interpretation</option>

<option value="Diagram-Based" ${q.type==="Diagram-Based"?"selected":""}>Diagram-Based</option>

<option value="Source-Based" ${q.type==="Source-Based"?"selected":""}>Source-Based</option>

<option value="Error Identification" ${q.type==="Error Identification"?"selected":""}>Error Identification</option>

<option value="Correct the Solution" ${q.type==="Correct the Solution"?"selected":""}>Correct the Solution</option>

<option value="Compare & Explain" ${q.type==="Compare & Explain"?"selected":""}>Compare & Explain</option>

<option value="Justify Your Answer" ${q.type==="Justify Your Answer"?"selected":""}>Justify Your Answer</option>

<option value="Prove / Show That" ${q.type==="Prove / Show That"?"selected":""}>Prove / Show That</option>

<option value="Construction-Based" ${q.type==="Construction-Based"?"selected":""}>Construction-Based</option>

<option value="Practical / Application-Based" ${q.type==="Practical / Application-Based"?"selected":""}>Practical / Application-Based</option>

<option value="Open-Ended" ${q.type==="Open-Ended"?"selected":""}>Open-Ended</option>

<option value="HOTS" ${q.type==="HOTS"?"selected":""}>Higher-Order Thinking (HOTS)</option>

</select>

</div>

<div>

<label>Marks</label><br>

<input
type="number"
class="marks"
value="${q.marks || 1}"
style="width:80px;">

</div>

<div>

<label>Difficulty</label><br>

<select class="difficulty">

<option value="Easy" ${q.difficulty==="Easy"?"selected":""}>Easy</option>

<option value="Medium" ${q.difficulty==="Medium"?"selected":""}>Medium</option>

<option value="Hard" ${q.difficulty==="Hard"?"selected":""}>Hard</option>

</select>

</div>

</div>

`;

    return card;

}

async function saveAllQuestions(){

    const saveBtn = document.querySelector(
    'button[onclick="saveAllQuestions()"]'
);

if(saveBtn){

    saveBtn.disabled = true;

    saveBtn.innerHTML =
    "💾 Saving...";

}

    if(!window.currentQuestionBank){

        alert("Question Bank not loaded.");
        return;

    }

    const cards =
    document.querySelectorAll("#questionContainer > div");

    const questions=[];

    cards.forEach(card=>{

        const questionIndex =
    Array.from(cards).indexOf(card);

const originalQuestion =
    window.currentQuestionBank.questions[questionIndex];

questions.push({

    ...originalQuestion,

    question:
    card.querySelector(".questionText").value,

    answer:
    card.querySelector(".answerText").value,

    type:
    card.querySelector(".questionType").value,

    marks:
    Number(
        card.querySelector(".marks").value
    ),

    difficulty:
    card.querySelector(".difficulty").value

});

    });

    try{

        const response = await fetch(

            API +

            "/question-bank/" +

            window.currentQuestionBank._id,

            {

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    questions

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

    if(saveBtn){

        saveBtn.disabled = false;

        saveBtn.innerHTML =
        "💾 Save All";

    }

    alert(
        "Question Bank Saved Successfully."
    );

}

        else{

            alert(result.message);

        }

    }
    catch(err){

        console.error(err);

        alert(err.message);

    }

}

function addQuestion(){

    if(!window.currentQuestionBank){

        alert("Question Bank not loaded.");
        return;

    }

    const newQuestion={

    question:"",

    answer:"",

    type:"MCQ",

    options:[],

    marks:1,

    difficulty:"Easy"

};

    window.currentQuestionBank.questions.push(
        newQuestion
    );

    renderQuestions(
        window.currentQuestionBank
    );

    
}

async function generateQuestionPaper(){

    if(!window.currentQuestionBank){

        alert("Question Bank not loaded.");

        return;

    }

    try{

        const response = await fetch(

            API + "/generate-paper",

            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json"

                },

                body:JSON.stringify({

                    questionBankId:
                    window.currentQuestionBank._id

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

    console.log(result);

    sessionStorage.setItem(

        "generatedQuestionPaper",

        JSON.stringify(result.paper)

    );

    window.location.href =
    "teacher-question-paper.html";

}

        else{

            alert(result.message);

        }

    }
    catch(err){

        console.error(err);

        alert(err.message);

    }

}


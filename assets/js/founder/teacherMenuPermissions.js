const API =
"https://academy-backend-eatl.onrender.com/api/founder";

const teacherId =
new URLSearchParams(window.location.search).get("id");

const menus = [

"dashboard",

"myClasses",

"attendance",

"homework",

"calendar",

"marksEntry",

"aiAssessment"

];

loadTeacher();

async function loadTeacher(){

    try{

        const response = await fetch(

            API + "/teachers"

        );

        const data = await response.json();

        const teacher =
        data.teachers.find(t=>t._id===teacherId);

        if(!teacher){

            alert("Teacher not found.");

            return;

        }

        document.getElementById("teacherName").innerHTML=

        "Teacher : <b>" + teacher.name + "</b>";

        document.getElementById("teacherName").innerHTML=

"Teacher : <b>" + teacher.name + "</b>";

    }

    catch(error){

        console.error(error);

        alert("Unable to load teacher.");

    }

}

function renderPermissions(teacher){

const container =

document.getElementById("permissionList");

container.innerHTML="";

menus.forEach(menu=>{

const checked =

teacher.menuPermissions?.[menu]

? "checked"

: "";

container.innerHTML += `

<div class="permission-row">

<div>

${menu}

</div>

<label>

<input

type="checkbox"

id="${menu}"

${checked}

>

</label>

</div>

`;

});

}
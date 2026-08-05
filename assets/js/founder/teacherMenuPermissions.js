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

        document.getElementById("teacherName").innerHTML =

"Teacher : <b>" + teacher.name + "</b>";

renderPermissions(teacher);

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

async function savePermissions(){

    const menuPermissions = {};

    menus.forEach(menu=>{

        menuPermissions[menu] =

        document.getElementById(menu).checked;

    });

    try{

        const response = await fetch(

            API + "/teacher/" + teacherId + "/menu-permissions",

            {

                method:"PUT",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    menuPermissions

                })

            }

        );

        const result =
        await response.json();

        if(result.success){

            alert("Permissions Saved Successfully.");

        }

        else{

            alert(result.message);

        }

    }

    catch(error){

        console.error(error);

        alert("Unable to save permissions.");

    }

}
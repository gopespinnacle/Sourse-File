const API =
"https://academy-backend-eatl.onrender.com/api/founder";

let teachers = [];

loadTeachers();

async function loadTeachers(){

    try{

        const response = await fetch(

            API + "/teachers"

        );

        const data = await response.json();

        teachers = data.teachers;

        renderTeachers();

    }

    catch(err){

        console.error(err);

        alert("Unable to load teachers.");

    }

}

function renderTeachers(){

    const tbody =
    document.querySelector("#teacherTable tbody");

    tbody.innerHTML = "";

    teachers.forEach(t=>{

        tbody.innerHTML += `

<tr>

<td>${t.name}</td>

<td>${t.email}</td>

<td>${t.subject ? t.subject.join(", ") : "-"}</td>

<td>

<button
class="manage-btn"
onclick="managePermissions('${t._id}')">

Manage Permissions

</button>

</td>

</tr>

`;

    });

}

function managePermissions(id){

    window.location.href =

    "founder-teacher-menu-permissions.html?id=" + id;

}
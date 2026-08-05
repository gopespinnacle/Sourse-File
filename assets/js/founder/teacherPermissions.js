const API =
"https://academy-backend-eatl.onrender.com/api/founder";

const teacherId =
new URLSearchParams(window.location.search).get("id");

let teacher = null;

loadTeacher();

async function loadTeacher(){

    try{

        const response = await fetch(

            API + "/teachers"

        );

        const data =
        await response.json();

        teacher =
        data.teachers.find(t => t._id === teacherId);

        if(!teacher){

            alert("Teacher not found.");

            return;

        }

        document.getElementById("teacherName").innerHTML =

        "Permissions : " + teacher.name;

        renderPermissions();

    }

    catch(err){

        console.log(err);

        alert(err.message);

    }

}

function renderPermissions(){

    const container =
    document.getElementById("permissionList");

    container.innerHTML = "";

    const permissions = [

        "dashboard",

        "myClasses",

        "attendance",

        "aiAssessment",

        "homework",

        "calendar",

        "marksEntry"

    ];

    permissions.forEach(permission => {

        container.innerHTML += `

        <div class="permission-row">

            <span>

                ${permission}

            </span>

            <input
                type="checkbox"
                id="${permission}"

                ${teacher.menuPermissions &&
                  teacher.menuPermissions[permission]
                  ? "checked"
                  : ""}

            >

        </div>

        `;

    });

}
const API =
"https://academy-backend-eatl.onrender.com/api/founder";

const teacherId =
new URLSearchParams(window.location.search).get("id");

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

    }

    catch(error){

        console.error(error);

        alert("Unable to load teacher.");

    }

}
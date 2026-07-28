const MeetingManager = {

    sessionId: null,

    async startTeacherSession(data){

        try{

            const response = await fetch(

                "https://academy-backend-eatl.onrender.com/api/teacher-session/start",

                {

                    method:"POST",

                    headers:{
                        "Content-Type":"application/json"
                    },

                    body:JSON.stringify(data)

                }

            );

            const result = await response.json();

            if(result.success){

                this.sessionId = result.session._id;

                sessionStorage.setItem(
                    "teacherSessionId",
                    this.sessionId
                );

                console.log(
                    "Teacher Session Created:",
                    this.sessionId
                );

            }

            else{

                console.log(result);

            }

        }

        catch(err){

            console.log(err);

        }

    }

};
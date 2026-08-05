/*
===========================================================
Gopes Pinnacle Academy
Developer Debug Mode
===========================================================
*/

window.DEBUG_MODE = true;

window.DebugMeeting = {

    scenario(id,title){

        if(!DEBUG_MODE) return;

        console.group(
            `%c🟢 SCENARIO ${id} : ${title}`,
            "color:#00c853;font-size:15px;font-weight:bold"
        );

    },

    step(message){

        if(!DEBUG_MODE) return;

        console.log(
            "%c➡ " + message,
            "color:#2196f3;font-size:13px"
        );

    },

    socket(event,data=""){

        if(!DEBUG_MODE) return;

        console.log(
            "%c📡 SOCKET : " + event,
            "color:#8e24aa",
            data
        );

    },

    log(title,data=""){

    if(!DEBUG_MODE) return;

    console.log(

        "%c📋 " + title,

        "color:#03a9f4;font-weight:bold",

        data

    );

},

    rtc(message){

        if(!DEBUG_MODE) return;

        console.log(
            "%c🎥 WEBRTC : " + message,
            "color:#ff9800"
        );

    },

    success(message){

        if(!DEBUG_MODE) return;

        console.log(
            "%c✅ " + message,
            "color:#00c853;font-size:13px;font-weight:bold"
        );

    },

    warning(message){

        if(!DEBUG_MODE) return;

        console.warn(
            "⚠ " + message
        );

    },

    failed(message){

        if(!DEBUG_MODE) return;

        console.error(
            "❌ " + message
        );

    },

    end(){

        if(!DEBUG_MODE) return;

        console.groupEnd();

    }

};
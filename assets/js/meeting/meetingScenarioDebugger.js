/*
====================================================
Gopes Pinnacle Academy
Scenario Debugger
====================================================
*/

window.ScenarioDebugger = {

    scenario: "Unknown",

    start(name){

        this.scenario = name;

        console.clear();

        console.log("");

        console.log("====================================");
        console.log("SCENARIO :", name);
        console.log("====================================");

    },

    step(name,data=""){

        console.log(
            "➡",
            name,
            data
        );

    },

    success(name,data=""){

        console.log(
            "✅",
            name,
            data
        );

    },

    fail(name,data=""){

        console.error(
            "❌",
            name,
            data
        );

    },

    socket(event,data=""){

        console.log(
            "📡",
            event,
            data
        );

    },

    rtc(event,data=""){

        console.log(
            "🎥",
            event,
            data
        );

    },

    screen(event,data=""){

        console.log(
            "🖥",
            event,
            data
        );

    },

    finish(){

        console.log("");

        console.log("====================================");
        console.log("END OF SCENARIO");
        console.log("====================================");

    }

};
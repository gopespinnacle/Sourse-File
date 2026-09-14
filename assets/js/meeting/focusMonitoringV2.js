/*
===========================================================
GOPES PINNACLE ACADEMY
FOCUS MONITORING V2
===========================================================

LEVEL 1
- Split screen / small viewport
- Classroom tab hidden
- Browser/app background
- Connection status

LEVEL 2
- Student focus status
- Active / Away / Split Screen / Disconnected

LEVEL 3
- Battery
- Network
- Camera
- Microphone
- Device
- Orientation

This module is isolated from the existing
WebRTC / Meeting / Media flow.
===========================================================
*/

window.FocusMonitoringV2 = (() => {

    /*
    =======================================================
    STATE
    =======================================================
    */

    let initialized = false;

    let role = null;

    let studentId = null;

    let studentName = null;

    let meetingRoom = null;

    let lastFocusState = "active";

    let lastViewportState = "normal";

    let lastVisibilityState = "visible";

    let lastAlertTime = {};

    let battery = null;


    /*
    =======================================================
    CONFIGURATION
    =======================================================
    */

    const CONFIG = {

        /*
        ---------------------------------------------------
        Split-screen detection
        ---------------------------------------------------

        We don't claim to know exactly which app is open.

        We detect a significantly reduced viewport.
        ---------------------------------------------------
        */

        splitWidthRatio: 0.65,

        splitHeightRatio: 0.65,


        /*
        ---------------------------------------------------
        Duplicate alert protection
        ---------------------------------------------------
        */

        alertCooldown: 3000,


        /*
        ---------------------------------------------------
        Battery warning levels
        ---------------------------------------------------
        */

        batteryWarningLevel: 20,

        batteryCriticalLevel: 10

    };


    /*
    =======================================================
    INIT
    =======================================================
    */

    function init(options = {}) {

        if (initialized) {

            console.log(
                "FOCUS MONITORING V2 ALREADY INITIALIZED"
            );

            return;

        }


        initialized = true;


        role =
            options.role ||
            (
                window.MeetingConfig &&
                MeetingConfig.role
            ) ||
            null;


        studentId =
            options.studentId ||
            null;


        studentName =
    options.studentName ||
    null;


meetingRoom =
    options.room ||
    null;


        console.log(
            "=========================================="
        );

        console.log(
            "FOCUS MONITORING V2 INITIALIZED"
        );

        console.log(
            "ROLE:",
            role
        );

        console.log(
            "=========================================="
        );


        /*
        ---------------------------------------------------
        LEVEL 1
        ---------------------------------------------------
        */

       setupVisibilityMonitoring();

setupWindowFocusMonitoring();

setupViewportMonitoring();

setupConnectionMonitoring();


        /*
        ---------------------------------------------------
        LEVEL 3
        ---------------------------------------------------
        */

        setupBatteryMonitoring();

        setupOrientationMonitoring();

        setupFocusSocketListener();


        /*
        ---------------------------------------------------
        INITIAL STATUS
        ---------------------------------------------------
        */

        updateFocusState(
            "active"
        );

        updateViewportState();


    }


   


       


    

    /*
    =======================================================
    CONNECTION MONITORING
    =======================================================
    */

    function setupConnectionMonitoring() {

        window.addEventListener(
            "online",
            () => {

                sendFocusEvent(
                    "student_online"
                );

            }
        );


        window.addEventListener(
            "offline",
            () => {

                sendFocusEvent(
                    "student_offline"
                );

            }
        );

    }


    /*
    =======================================================
    FOCUS STATE
    =======================================================
    */

    function updateFocusState(
        state
    ) {

        if (
            lastFocusState ===
            state
        ) {

            return;

        }


        lastFocusState =
            state;


        window.dispatchEvent(
            new CustomEvent(
                "focusMonitoring:state",
                {

                    detail: {

                        state,

                        role,

                        studentId,

                        studentName,

                        timestamp:
                            new Date()
                                .toISOString()

                    }

                }
            )
        );

    }


    /*
    =======================================================
    SOCKET EVENT
    =======================================================
    */

    function sendFocusEvent(
        type
    ) {

        if (
            !window.MeetingSocket
        ) {

            console.warn(
                "MeetingSocket unavailable"
            );

            return;

        }


            MeetingSocket.emit(
    "focusMonitoringEvent",
    {

        type,

        role,

        room:
            meetingRoom,

        studentId,

        studentName,

        timestamp:
            new Date()
                .toISOString(),

                visibility:
                    document.visibilityState,

                viewport: {

                    width:
                        window.innerWidth,

                    height:
                        window.innerHeight

                },

                orientation:
                    getOrientation(),

                online:
    navigator.onLine,
    

battery: battery
    ? {
        level:
            Math.round(
                battery.level * 100
            ),

        charging:
            battery.charging
    }
    : null

            }
        );

    }


    /*
    =======================================================
    LOCAL ALERT HOOK
    =======================================================
    */

    


    /*
    =======================================================
    LEVEL 3
    BATTERY
    =======================================================
    */

    function setupBatteryMonitoring() {

        if (
            !navigator.getBattery
        ) {

            console.log(
                "Battery API unavailable"
            );

            return;

        }


        navigator
            .getBattery()
            .then(
                batteryManager => {

                    battery =
                        batteryManager;


                    updateBattery();


                    battery.addEventListener(
                        "levelchange",
                        updateBattery
                    );


                    battery.addEventListener(
                        "chargingchange",
                        updateBattery
                    );

                }
            )
            .catch(
                error => {

                    console.warn(
                        "Battery API error:",
                        error
                    );

                }
            );

    }


    function updateBattery() {

    if (!battery) return;


    const level =
        Math.round(
            battery.level * 100
        );


    const charging =
        battery.charging;


    /*
    -------------------------------------------------------
    LOCAL BATTERY STATUS
    -------------------------------------------------------
    */

    window.dispatchEvent(
        new CustomEvent(
            "focusMonitoring:battery",
            {

                detail: {

                    level,

                    charging,

                    warning:
                        level <=
                        CONFIG.batteryWarningLevel,

                    critical:
                        level <=
                        CONFIG.batteryCriticalLevel

                }

            }
        )
    );


    /*
    -------------------------------------------------------
    SEND BATTERY STATUS TO SERVER
    -------------------------------------------------------
    */

    sendFocusEvent(
        "battery_status"
    );


    /*
    -------------------------------------------------------
    LOW BATTERY ALERT
    -------------------------------------------------------
    */

    if (
        level <=
        CONFIG.batteryCriticalLevel
    ) {

        showLocalAlert(
            "battery_critical"
        );

    }

    else if (
        level <=
        CONFIG.batteryWarningLevel
    ) {

        showLocalAlert(
            "battery_low"
        );

    }

}


    /*
    =======================================================
    ORIENTATION
    =======================================================
    */

    function setupOrientationMonitoring() {

        updateOrientation();

    }


    function updateOrientation() {

        const orientation =
            getOrientation();


        window.dispatchEvent(
            new CustomEvent(
                "focusMonitoring:orientation",
                {

                    detail: {

                        orientation

                    }

                }
            )
        );


        sendFocusEvent(
            "orientation_changed"
        );

    }


    function getOrientation() {

        if (
            window.screen &&
            window.screen.orientation &&
            window.screen.orientation.type
        ) {

            return window.screen
                .orientation
                .type;

        }


        return window.innerWidth >=
            window.innerHeight
                ? "landscape"
                : "portrait";

    }


    /*
    =======================================================
    PUBLIC API
    =======================================================
    */

    return {

        init,

        updateViewportState,

        updateOrientation,

        getOrientation,

        getFocusState() {

            return lastFocusState;

        },

        getViewportState() {

            return lastViewportState;

        }

    };


    /*
===========================================================
FOCUS MONITORING V2
CENTER SCREEN ALERT
===========================================================
*/





function setupFocusSocketListener() {

    /*
    -------------------------------------------------------
    DO NOT DISPLAY CLASSROOM ALERTS
    -------------------------------------------------------
    */

    console.log(
        "FOCUS MONITORING: CLASSROOM ALERT POPUPS DISABLED"
    );

}

})();
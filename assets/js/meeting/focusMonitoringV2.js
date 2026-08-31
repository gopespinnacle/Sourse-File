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
    LEVEL 1
    PAGE VISIBILITY
    =======================================================
    */

    function setupVisibilityMonitoring() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.visibilityState ===
                    "hidden"
                ) {

                    lastVisibilityState =
                        "hidden";


                    updateFocusState(
                        "away"
                    );


                    sendFocusEvent(
                        "classroom_hidden"
                    );


                    showLocalAlert(
                        "classroom_hidden"
                    );

                } else {

                    lastVisibilityState =
                        "visible";


                    updateFocusState(
                        "active"
                    );


                    sendFocusEvent(
                        "classroom_visible"
                    );

                }

            }
        );

    }


    /*
    =======================================================
    VIEWPORT / SPLIT SCREEN
    =======================================================
    */

    function setupViewportMonitoring() {

        window.addEventListener(
            "resize",
            () => {

                updateViewportState();

            }
        );


        window.addEventListener(
            "orientationchange",
            () => {

                setTimeout(
                    () => {

                        updateViewportState();

                        updateOrientation();

                    },
                    300
                );

            }
        );

    }


    function updateViewportState() {

        console.log(
    "FOCUS VIEWPORT CHECK:",
    {
        width: window.innerWidth,
        height: window.innerHeight,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
    }
);

        const width =
            window.innerWidth;


        const height =
            window.innerHeight;


        const screenWidth =
            window.screen &&
            window.screen.width
                ? window.screen.width
                : width;


        const screenHeight =
            window.screen &&
            window.screen.height
                ? window.screen.height
                : height;


        const widthRatio =
            width /
            screenWidth;


        const heightRatio =
            height /
            screenHeight;


        let newState =
            "normal";


        /*
        ---------------------------------------------------
        Detect significantly reduced viewport
        ---------------------------------------------------
        */

        if (
            widthRatio <=
                CONFIG.splitWidthRatio ||

            heightRatio <=
                CONFIG.splitHeightRatio
        ) {

            newState =
                "split";

        }


        if (
            newState ===
            lastViewportState
        ) {

            return;

        }


        lastViewportState =
            newState;


        if (
            newState ===
            "split"
        ) {

            updateFocusState(
                "split"
            );


            sendFocusEvent(
                "split_screen"
            );


            showLocalAlert(
                "split_screen"
            );

        } else {

            updateFocusState(
                "active"
            );


            sendFocusEvent(
                "split_screen_closed"
            );

        }

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
                    navigator.onLine

            }
        );

    }


    /*
    =======================================================
    LOCAL ALERT HOOK
    =======================================================
    */

    function showLocalAlert(
        type
    ) {

        const now =
            Date.now();


        const lastTime =
            lastAlertTime[type] ||
            0;


        if (
            now -
            lastTime <
            CONFIG.alertCooldown
        ) {

            return;

        }


        lastAlertTime[type] =
            now;


        window.dispatchEvent(
            new CustomEvent(
                "focusMonitoring:alert",
                {

                    detail: {

                        type,

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
                battery.level *
                100
            );


        window.dispatchEvent(
            new CustomEvent(
                "focusMonitoring:battery",
                {

                    detail: {

                        level,

                        charging:
                            battery.charging,

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

function showCenterAlert(
    message,
    type = "warning"
) {

    /*
    -------------------------------------------------------
    REMOVE EXISTING ALERT
    -------------------------------------------------------
    */

    const existing =
        document.getElementById(
            "focus-monitoring-alert"
        );


    if (existing) {

        existing.remove();

    }


    /*
    -------------------------------------------------------
    CREATE ALERT
    -------------------------------------------------------
    */

    const alert =
        document.createElement(
            "div"
        );


    alert.id =
        "focus-monitoring-alert";


    alert.className =
        "focus-monitoring-alert";


    /*
    -------------------------------------------------------
    CONTENT
    -------------------------------------------------------
    */

    alert.innerHTML = `

        <div class="focus-monitoring-alert-icon">
            ⚠️
        </div>

        <div class="focus-monitoring-alert-title">
            CLASSROOM ALERT
        </div>

        <div class="focus-monitoring-alert-message">
            ${message}
        </div>

    `;


    /*
    -------------------------------------------------------
    ADD TO PAGE
    -------------------------------------------------------
    */

    document.body.appendChild(
        alert
    );


    /*
    -------------------------------------------------------
    AUTO REMOVE
    -------------------------------------------------------
    */

    setTimeout(
        () => {

            if (alert) {

                alert.remove();

            }

        },
        5000
    );

}

/*
===========================================================
FOCUS MONITORING V2
RECEIVE CLASSROOM ALERT
===========================================================
*/

function setupFocusSocketListener() {

    if (
        !window.MeetingSocket
    ) {

        console.warn(
            "FOCUS MONITORING: MeetingSocket unavailable"
        );

        return;

    }


    MeetingSocket.on(
        "focusMonitoringUpdate",
        data => {

            if (!data) return;


            console.log(
                "FOCUS MONITORING UPDATE:",
                data
            );


            let message =
                "";


            switch (
                data.type
            ) {

                case "split_screen":

                    message =
                        data.studentName +
                        " is using split screen.";

                    break;


                case "classroom_hidden":

                    message =
                        data.studentName +
                        " has left the classroom view.";

                    break;


                case "classroom_visible":

                    message =
                        data.studentName +
                        " has returned to the classroom.";

                    break;


                case "student_offline":

                    message =
                        data.studentName +
                        " has gone offline.";

                    break;


                case "student_online":

                    message =
                        data.studentName +
                        " is back online.";

                    break;


                case "split_screen_closed":

                    message =
                        data.studentName +
                        " returned to normal screen.";

                    break;


                default:

                    message =
                        "A classroom focus event was detected.";

            }


            showCenterAlert(
                message
            );

        }
    );

}

})();
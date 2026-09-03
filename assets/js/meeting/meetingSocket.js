/*
===========================================================
Gopes Pinnacle Academy
Virtual Classroom V2
Meeting Socket Manager
===========================================================
*/

window.MeetingSocket = (() => {

    let socket = null;

    let connected = false;

    function connect(serverUrl) {

        if (socket) return socket;

        socket = window.io(serverUrl, {

            transports: ["polling"],

            reconnection: true,

            reconnectionAttempts: Infinity,

            reconnectionDelay: 1000,

            reconnectionDelayMax: 5000,

            timeout: 20000

        });

        socket.on("connect", () => {

    connected = true;

    DebugMeeting.scenario(
        1,
        "Teacher Opens Classroom"
    );

    DebugMeeting.step(
        "Socket Connected"
    );

    DebugMeeting.socket(
        "connect",
        socket.id
    );

    MeetingUtils.success(
        "Socket Connected",
        socket.id
    );

});

        socket.on("disconnect", reason => {

            connected = false;

            MeetingUtils.warning(

                "Socket Disconnected",

                reason

            );

        });

        socket.on("reconnect", attempt => {

            connected = true;

            MeetingUtils.success(

                "Socket Reconnected",

                attempt

            );

        });

        socket.on("connect_error", err => {

            MeetingUtils.error(

                "Socket Error",

                err.message

            );

        });


        window.teacherSharing = false;

socket.on("screenShareStarted", () => {

    console.log("Teacher started screen share");

    window.teacherSharing = true;

});

socket.on("screenShareStopped", () => {

    console.log("Teacher stopped screen share");

    window.teacherSharing = false;

    if (window.ScreenLayout) {

        ScreenLayout.hide();

    }

});

/*
===========================================================
RAISE HAND LIST
Receive current raised-hand users from server
===========================================================
*/

socket.on(
    "handList",
    raisedHands => {

        console.log(
            "RAISE HAND LIST RECEIVED:",
            raisedHands
        );


        /*
        ---------------------------------------------------
        STORE CURRENT RAISED HANDS GLOBALLY
        ---------------------------------------------------
        */

        window.raisedHands =
            raisedHands || [];


        /*
        ---------------------------------------------------
        NOTIFY MEETING UI
        ---------------------------------------------------
        */

        window.dispatchEvent(
            new CustomEvent(
                "meeting:handList",
                {
                    detail:
                        window.raisedHands
                }
            )
        );

    }
);

/*
===========================================================
EMOJI REACTION
Receive emoji reactions from classroom
===========================================================
*/

socket.on(
    "emojiReaction",
    data => {

        console.log(
            "EMOJI REACTION RECEIVED:",
            data
        );

        /*
        ---------------------------------------------------
        SEND TO EMOJI REACTION MODULE
        ---------------------------------------------------
        */

        window.dispatchEvent(
            new CustomEvent(
                "meeting:emojiReaction",
                {
                    detail:
                        data
                }
            )
        );

    }
);

        return socket;

    }

    function getSocket() {

        return socket;

    }

    function getId() {

        if (!socket) return null;

        return socket.id;

    }

    function isConnected() {

        return connected;

    }

    function emit(event, data = {}) {

        if (!socket) return;

        socket.emit(event, data);

    }

    function on(event, callback) {

        if (!socket) return;

        socket.on(event, callback);

    }

    function once(event, callback) {

        if (!socket) return;

        socket.once(event, callback);

    }

    function off(event) {

        if (!socket) return;

        socket.off(event);

    }

    function disconnect() {

        if (!socket) return;

        socket.disconnect();

    }

    
    return {

        connect,

        emit,

        on,

        once,

        off,

        disconnect,

        getSocket,

        getId,

        isConnected

    };

})();
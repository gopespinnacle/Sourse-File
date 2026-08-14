/*
===========================================================
GOPES PINNACLE ACADEMY
Virtual Classroom V2

SCREEN SHARE V3
Google Meet Style Presentation Engine

IMPORTANT ARCHITECTURE

Camera  -> normal MeetingWebRTC peer
Mic     -> normal MeetingWebRTC peer
Screen  -> separate screen peer

The camera connection is NEVER replaced by screen sharing.
===========================================================
*/

window.ScreenShare = (() => {


    /*
    =======================================================
    STATE
    =======================================================
    */

    let initialized = false;

    let socket = null;

    let room = "";

    let role = "";

    let localScreenStream = null;

    let screenPeers = {};

    let screenIceQueue = {};

    let sharing = false;

    let teacherSocketId = null;


    /*
    =======================================================
    INITIALIZE
    =======================================================
    */

    function init(options = {}) {

        socket =
            options.socket || null;

        room =
            options.room || "";

        role =
            options.role || "";

        initialized = true;


        console.log(
            "=========================================="
        );

        console.log(
            "SCREEN SHARE V3 INITIALIZED"
        );

        console.log(
            "Room:",
            room
        );

        console.log(
            "Role:",
            role
        );

        console.log(
            "=========================================="
        );


        if(!socket){

            console.error(
                "SCREEN SHARE V3: SOCKET MISSING"
            );

            return;

        }


        registerSocketEvents();

    }


    /*
    =======================================================
    SOCKET EVENT REGISTRATION
    =======================================================
    */

    function registerSocketEvents(){


        /*
        ---------------------------------------------------
        TEACHER STARTED SCREEN SHARE
        ---------------------------------------------------
        */

        socket.on(
            "screen-start",
            data => {

                console.log(
                    "SCREEN V3: SCREEN START RECEIVED",
                    data
                );


                teacherSocketId =
                    data.teacherSocketId;


                if(role === "student"){

                    requestScreen();

                }

            }
        );


        /*
        ---------------------------------------------------
        SCREEN ALREADY ACTIVE WHEN STUDENT JOINS
        ---------------------------------------------------
        */

        socket.on(
            "screenAlreadySharing",
            data => {

                console.log(
                    "SCREEN V3: SCREEN ALREADY SHARING",
                    data
                );


                teacherSocketId =
                    data.teacherSocketId;


                if(role === "student"){

                    requestScreen();

                }

            }
        );


        /*
        ---------------------------------------------------
        TEACHER RECEIVES STUDENT SCREEN REQUEST
        ---------------------------------------------------
        */

        socket.on(
            "screen-request",
            async data => {

                console.log(
                    "SCREEN V3: SCREEN REQUEST",
                    data
                );


                if(role !== "teacher"){

                    return;

                }


                if(!localScreenStream){

                    console.warn(
                        "SCREEN V3: NO LOCAL SCREEN STREAM"
                    );

                    return;

                }


                await createTeacherScreenPeer(
                    data.studentSocketId
                );

            }
        );


        /*
        ---------------------------------------------------
        STUDENT RECEIVES SCREEN OFFER
        ---------------------------------------------------
        */

        socket.on(
            "screen-offer",
            async data => {

                console.log(
                    "SCREEN V3: SCREEN OFFER RECEIVED",
                    data
                );


                if(role !== "student"){

                    return;

                }


                teacherSocketId =
                    data.teacherSocketId;


                await receiveScreenOffer(
                    data.teacherSocketId,
                    data.offer
                );

            }
        );


        /*
        ---------------------------------------------------
        TEACHER RECEIVES SCREEN ANSWER
        ---------------------------------------------------
        */

        socket.on(
            "screen-answer",
            async data => {

                console.log(
                    "SCREEN V3: SCREEN ANSWER RECEIVED",
                    data
                );


                if(role !== "teacher"){

                    return;

                }


                await receiveScreenAnswer(
                    data.studentSocketId,
                    data.answer
                );

            }
        );


        /*
        ---------------------------------------------------
        SCREEN ICE
        ---------------------------------------------------
        */

        socket.on(
            "screen-ice",
            async data => {

                await receiveScreenIce(
                    data.senderSocketId,
                    data.candidate
                );

            }
        );


        /*
        ---------------------------------------------------
        SCREEN STOP
        ---------------------------------------------------
        */

        socket.on(
            "screen-stop",
            () => {

                console.log(
                    "SCREEN V3: SCREEN STOP RECEIVED"
                );


                closeAllScreenPeers();

                hideRemoteScreen();

            }
        );


        /*
        ---------------------------------------------------
        PARTICIPANT RECONNECTED

        If student reconnects while teacher is sharing,
        request the screen again.
        ---------------------------------------------------
        */

        socket.on(
            "participantReconnected",
            data => {

                if(
                    role === "student" &&
                    data &&
                    data.participant &&
                    data.participant.role === "teacher"
                ){

                    teacherSocketId =
                        data.participant.socketId;


                    requestScreen();

                }


                if(
                    role === "teacher" &&
                    data &&
                    data.participant &&
                    data.participant.role === "student"
                ){

                    if(localScreenStream){

                        createTeacherScreenPeer(
                            data.participant.socketId
                        );

                    }

                }

            }
        );
        


        /*
        ---------------------------------------------------
        PARTICIPANT LEFT
        ---------------------------------------------------
        */

        socket.on(
            "participantLeft",
            data => {

                if(!data) return;

                removeScreenPeer(
                    data.socketId
                );

            }
        );


        /*
        ---------------------------------------------------
        TEMPORARY DISCONNECT
        ---------------------------------------------------
        */

        socket.on(
            "participantReconnecting",
            data => {

                if(!data) return;

                removeScreenPeer(
                    data.socketId
                );

            }
        );

    }


    /*
    =======================================================
    START SHARING
    =======================================================
    */

    async function start(){

        if(role !== "teacher"){

            console.warn(
                "SCREEN V3: ONLY TEACHER CAN START"
            );

            return;

        }


        if(sharing){

            console.log(
                "SCREEN V3: ALREADY SHARING"
            );

            return;

        }


        try{

            localScreenStream =
                await MeetingWebRTC.startScreenShare();


            if(!localScreenStream){

                throw new Error(
                    "Screen stream was not created."
                );

            }


            sharing = true;

            window.teacherSharing = true;


            /*
            ------------------------------------------------
            INFORM SERVER
            ------------------------------------------------
            */

            socket.emit(
                "screen-start",
                {

                    room:
                        room

                }
            );


            /*
            ------------------------------------------------
            DISPLAY TEACHER'S OWN SCREEN
            ------------------------------------------------
            */

            showLocalScreen(
                localScreenStream
            );


            console.log(
                "SCREEN V3: TEACHER SCREEN SHARE STARTED"
            );


        }
        catch(error){

            console.error(
                "SCREEN V3 START ERROR:",
                error
            );


            sharing = false;

            localScreenStream = null;

        }

    }


    /*
    =======================================================
    STOP SHARING
    =======================================================
    */

    async function stop(){

        if(!sharing){

            return;

        }


        console.log(
            "SCREEN V3: STOPPING SCREEN SHARE"
        );


        sharing = false;

        window.teacherSharing = false;


        /*
        ---------------------------------------------------
        INFORM SERVER FIRST
        ---------------------------------------------------
        */

        socket.emit(
            "screen-stop",
            {

                room:
                    room

            }
        );


        /*
        ---------------------------------------------------
        CLOSE SCREEN PEERS
        ---------------------------------------------------
        */

        closeAllScreenPeers();


        /*
        ---------------------------------------------------
        STOP LOCAL SCREEN CAPTURE
        ---------------------------------------------------
        */

        await MeetingWebRTC.stopScreenShare();


        localScreenStream = null;


        /*
        ---------------------------------------------------
        HIDE PRESENTATION
        ---------------------------------------------------
        */

        hideRemoteScreen();

        hideLocalScreen();


        console.log(
            "SCREEN V3: SCREEN SHARE STOPPED"
        );

    }


    /*
    =======================================================
    TEACHER CREATE SCREEN PEER
    =======================================================
    */

    async function createTeacherScreenPeer(
        studentSocketId
    ){

        if(!studentSocketId){

            return;

        }


        if(!localScreenStream){

            console.warn(
                "SCREEN V3: LOCAL SCREEN STREAM NOT READY"
            );

            return;

        }


        /*
        ---------------------------------------------------
        CLOSE OLD SCREEN PEER
        ---------------------------------------------------
        */

        removeScreenPeer(
            studentSocketId
        );


        const peer =
            new RTCPeerConnection(
                MeetingWebRTC.rtcConfig
            );


        screenPeers[
            studentSocketId
        ] = peer;


        /*
        ---------------------------------------------------
        ADD SCREEN TRACKS
        ---------------------------------------------------
        */

        localScreenStream
            .getTracks()
            .forEach(
                track => {

                    peer.addTrack(
                        track,
                        localScreenStream
                    );

                }
            );


        /*
        ---------------------------------------------------
        ICE
        ---------------------------------------------------
        */

        peer.onicecandidate =
            event => {

                if(!event.candidate){

                    return;

                }


                socket.emit(
                    "screen-ice",
                    {

                        targetSocketId:
                            studentSocketId,

                        candidate:
                            event.candidate

                    }
                );

            };


        /*
        ---------------------------------------------------
        CONNECTION STATE
        ---------------------------------------------------
        */

        peer.onconnectionstatechange =
            () => {

                console.log(
                    "SCREEN V3 TEACHER CONNECTION:",
                    studentSocketId,
                    peer.connectionState
                );


                if(
                    peer.connectionState ===
                    "failed"
                ){

                    peer.restartIce();

                }

            };


        /*
        ---------------------------------------------------
        CREATE OFFER
        ---------------------------------------------------
        */

        const offer =
            await peer.createOffer();


        await peer.setLocalDescription(
            offer
        );


        socket.emit(
            "screen-offer",
            {

                studentSocketId:
                    studentSocketId,

                offer:
                    peer.localDescription

            }
        );


        console.log(
            "SCREEN V3: SCREEN OFFER SENT:",
            studentSocketId
        );

    }


    /*
    =======================================================
    STUDENT REQUEST SCREEN
    =======================================================
    */

    function requestScreen(){

        if(role !== "student"){

            return;

        }


        if(!teacherSocketId){

            console.warn(
                "SCREEN V3: TEACHER SOCKET UNKNOWN"
            );

            return;

        }


        socket.emit(
            "screen-request",
            {

                teacherSocketId:
                    teacherSocketId

            }
        );


        console.log(
            "SCREEN V3: SCREEN REQUEST SENT"
        );

    }


    /*
    =======================================================
    STUDENT RECEIVE SCREEN OFFER
    =======================================================
    */

    async function receiveScreenOffer(
        teacherSocketId,
        offer
    ){

        removeScreenPeer(
            teacherSocketId
        );


        const peer =
            new RTCPeerConnection(
                MeetingWebRTC.rtcConfig
            );


        screenPeers[
            teacherSocketId
        ] = peer;


        /*
        ---------------------------------------------------
        REMOTE SCREEN TRACK
        ---------------------------------------------------
        */

        peer.ontrack =
            event => {

                console.log(
                    "SCREEN V3: REMOTE SCREEN TRACK RECEIVED"
                );


                const stream =
                    event.streams &&
                    event.streams[0];


                if(!stream){

                    return;

                }


                showRemoteScreen(
                    stream
                );

            };


        /*
        ---------------------------------------------------
        ICE
        ---------------------------------------------------
        */

        peer.onicecandidate =
            event => {

                if(!event.candidate){

                    return;

                }


                socket.emit(
                    "screen-ice",
                    {

                        targetSocketId:
                            teacherSocketId,

                        candidate:
                            event.candidate

                    }
                );

            };


        peer.onconnectionstatechange =
            () => {

                console.log(
                    "SCREEN V3 STUDENT CONNECTION:",
                    peer.connectionState
                );


                if(
                    peer.connectionState ===
                    "failed"
                ){

                    peer.restartIce();

                }

            };


        /*
        ---------------------------------------------------
        SET OFFER
        ---------------------------------------------------
        */

        await peer.setRemoteDescription(

            new RTCSessionDescription(
                offer
            )

        );


        /*
        ---------------------------------------------------
        QUEUED ICE
        ---------------------------------------------------
        */

        await processQueuedScreenIce(
            teacherSocketId,
            peer
        );


        /*
        ---------------------------------------------------
        CREATE ANSWER
        ---------------------------------------------------
        */

        const answer =
            await peer.createAnswer();


        await peer.setLocalDescription(
            answer
        );


        socket.emit(
            "screen-answer",
            {

                teacherSocketId:
                    teacherSocketId,

                answer:
                    peer.localDescription

            }
        );


        console.log(
            "SCREEN V3: SCREEN ANSWER SENT"
        );

    }


    /*
    =======================================================
    TEACHER RECEIVE SCREEN ANSWER
    =======================================================
    */

    async function receiveScreenAnswer(
        studentSocketId,
        answer
    ){

        const peer =
            screenPeers[
                studentSocketId
            ];


        if(!peer){

            console.warn(
                "SCREEN V3: SCREEN PEER NOT FOUND:",
                studentSocketId
            );

            return;

        }


        try{

            await peer.setRemoteDescription(

                new RTCSessionDescription(
                    answer
                )

            );


            await processQueuedScreenIce(
                studentSocketId,
                peer
            );


        }
        catch(error){

            console.error(
                "SCREEN V3 ANSWER ERROR:",
                error
            );

        }

    }


    /*
    =======================================================
    RECEIVE SCREEN ICE
    =======================================================
    */

    async function receiveScreenIce(
        remoteSocketId,
        candidate
    ){

        if(
            !remoteSocketId ||
            !candidate
        ){

            return;

        }


        const peer =
            screenPeers[
                remoteSocketId
            ];


        if(
            !peer ||
            !peer.remoteDescription ||
            !peer.remoteDescription.type
        ){

            if(
                !screenIceQueue[
                    remoteSocketId
                ]
            ){

                screenIceQueue[
                    remoteSocketId
                ] = [];

            }


            screenIceQueue[
                remoteSocketId
            ].push(
                candidate
            );


            return;

        }


        try{

            await peer.addIceCandidate(

                new RTCIceCandidate(
                    candidate
                )

            );

        }
        catch(error){

            console.error(
                "SCREEN V3 ICE ERROR:",
                error
            );

        }

    }


    /*
    =======================================================
    PROCESS QUEUED SCREEN ICE
    =======================================================
    */

    async function processQueuedScreenIce(
        remoteSocketId,
        peer
    ){

        const queue =
            screenIceQueue[
                remoteSocketId
            ];


        if(!queue){

            return;

        }


        for(
            const candidate of queue
        ){

            try{

                await peer.addIceCandidate(

                    new RTCIceCandidate(
                        candidate
                    )

                );

            }
            catch(error){

                console.error(
                    "SCREEN V3 QUEUED ICE ERROR:",
                    error
                );

            }

        }


        delete screenIceQueue[
            remoteSocketId
        ];

    }


    /*
    =======================================================
    REMOVE SCREEN PEER
    =======================================================
    */

    function removeScreenPeer(
        socketId
    ){

        const peer =
            screenPeers[
                socketId
            ];


        if(peer){

            try{

                peer.close();

            }
            catch(error){

                console.warn(
                    "SCREEN V3 PEER CLOSE ERROR:",
                    error
                );

            }

        }


        delete screenPeers[
            socketId
        ];


        delete screenIceQueue[
            socketId
        ];

    }


    /*
    =======================================================
    CLOSE ALL SCREEN PEERS
    =======================================================
    */

    function closeAllScreenPeers(){

        Object.keys(
            screenPeers
        )
        .forEach(
            removeScreenPeer
        );

    }


    /*
    =======================================================
    LOCAL SCREEN DISPLAY
    =======================================================
    */

    function showLocalScreen(stream){

    const screenContainer =
        document.getElementById(
            "screenContainer"
        );

    const screenVideo =
        document.getElementById(
            "screenVideo"
        );


    if(
        !screenContainer ||
        !screenVideo
    ){

        console.error(
            "SCREEN V3: screenContainer or screenVideo not found."
        );

        return;

    }


    /*
    =======================================================
    ATTACH LOCAL SCREEN
    =======================================================
    */

    screenVideo.srcObject =
        stream;


    screenVideo.autoplay =
        true;

    screenVideo.playsInline =
        true;

    screenVideo.muted =
        true;


    /*
    =======================================================
    ACTIVATE PRESENTATION MODE
    =======================================================
    */

    screenContainer.classList.add(
        "screen-sharing-active"
    );


    screenContainer.style.display =
        "block";


    /*
    =======================================================
    PLAY SCREEN
    =======================================================
    */

    screenVideo.play()
        .catch(
            error => {

                console.warn(
                    "SCREEN V3 LOCAL SCREEN PLAY ERROR:",
                    error
                );

            }
        );


    console.log(
        "SCREEN V3: LOCAL PRESENTATION ACTIVE"
    );

}


    /*
    =======================================================
    REMOTE SCREEN DISPLAY
    =======================================================
    */

    function showRemoteScreen(stream){

    const screenContainer =
        document.getElementById(
            "screenContainer"
        );

    const screenVideo =
        document.getElementById(
            "screenVideo"
        );


    if(
        !screenContainer ||
        !screenVideo
    ){

        console.error(
            "SCREEN V3: screenContainer or screenVideo not found."
        );

        return;

    }


    /*
    =======================================================
    ATTACH REMOTE SCREEN
    =======================================================
    */

    screenVideo.srcObject =
        stream;


    screenVideo.autoplay =
        true;

    screenVideo.playsInline =
        true;

    screenVideo.muted =
        true;


    /*
    =======================================================
    PRESENTATION MODE
    =======================================================
    */

    screenContainer.classList.add(
        "screen-sharing-active"
    );


    screenContainer.style.display =
        "block";


    window.teacherSharing =
        true;


    /*
    =======================================================
    PLAY REMOTE SCREEN
    =======================================================
    */

    screenVideo.play()
        .then(
            () => {

                console.log(
                    "SCREEN V3: REMOTE PRESENTATION PLAYING"
                );

            }
        )
        .catch(
            error => {

                console.warn(
                    "SCREEN V3 REMOTE SCREEN PLAY ERROR:",
                    error
                );

            }
        );


    console.log(
        "SCREEN V3: REMOTE PRESENTATION ACTIVE"
    );

}


    /*
    =======================================================
    HIDE REMOTE SCREEN
    =======================================================
    */

    function hideRemoteScreen(){

    const screenContainer =
        document.getElementById(
            "screenContainer"
        );

    const screenVideo =
        document.getElementById(
            "screenVideo"
        );


    window.teacherSharing =
        false;


    /*
    =======================================================
    STOP VIDEO
    =======================================================
    */

    if(screenVideo){

        screenVideo.pause();

        screenVideo.srcObject =
            null;

    }


    /*
    =======================================================
    REMOVE PRESENTATION MODE
    =======================================================
    */

    if(screenContainer){

        screenContainer.classList.remove(
            "screen-sharing-active"
        );


        screenContainer.style.opacity =
            "0";


        setTimeout(
            () => {

                if(
                    !screenContainer.classList.contains(
                        "screen-sharing-active"
                    )
                ){

                    screenContainer.style.display =
                        "none";

                    screenContainer.style.opacity =
                        "";

                }

            },
            200
        );

    }


    console.log(
        "SCREEN V3: REMOTE PRESENTATION HIDDEN"
    );

}


    /*
    =======================================================
    HIDE LOCAL SCREEN
    =======================================================
    */

    function hideLocalScreen(){

    const screenContainer =
        document.getElementById(
            "screenContainer"
        );

    const screenVideo =
        document.getElementById(
            "screenVideo"
        );


    if(screenVideo){

        screenVideo.pause();

        screenVideo.srcObject =
            null;

    }


    if(screenContainer){

        screenContainer.classList.remove(
            "screen-sharing-active"
        );


        screenContainer.style.opacity =
            "0";


        setTimeout(
            () => {

                if(
                    !screenContainer.classList.contains(
                        "screen-sharing-active"
                    )
                ){

                    screenContainer.style.display =
                        "none";

                    screenContainer.style.opacity =
                        "";

                }

            },
            200
        );

    }


    console.log(
        "SCREEN V3: LOCAL PRESENTATION HIDDEN"
    );

}


    /*
    =======================================================
    GET STATUS
    =======================================================
    */

    function isSharing(){

        return sharing;

    }


    function getLocalScreenStream(){

        return localScreenStream;

    }


    /*
    =======================================================
    EXPORT
    =======================================================
    */

    return {

        init,

        start,

        stop,

        requestScreen,

        isSharing,

        getLocalScreenStream,

        closeAllScreenPeers

    };

})();
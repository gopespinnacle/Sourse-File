/*
===========================================================
GOPES PINNACLE ACADEMY
DESKTOP SCREEN SHARE PIP V2

STEP 2

Responsible ONLY for:

1. Desktop PIP window
2. Teacher video
3. Student videos
4. Participant updates
5. Active speaker preparation

DO NOT TOUCH:
- WebRTC signaling
- Screen Share WebRTC
- Mobile layout
- Annotation PIP
===========================================================
*/

window.DesktopScreenSharePip = {

    pipWindow: null,

    root: null,

    participants: {},

    speakerTimer: null,

    prepared: false,


    /*
    =======================================================
    DESKTOP CHECK
    =======================================================
    */

    isDesktop() {

        return (
            window.innerWidth > 768 &&
            window.innerWidth > window.innerHeight
        );

    },


    /*
    =======================================================
    DOCUMENT PIP SUPPORT
    =======================================================
    */

    isSupported() {

        return (
            "documentPictureInPicture" in window &&
            typeof documentPictureInPicture.requestWindow ===
                "function"
        );

    },


    /*
    =======================================================
    PREPARE PIP WINDOW
    =======================================================
    */

    async prepare() {

        if (!this.isDesktop()) {

            console.log(
                "DESKTOP PIP V2: MOBILE/TABLET SKIPPED"
            );

            return false;

        }


        if (!this.isSupported()) {

            console.warn(
                "DESKTOP PIP V2: DOCUMENT PIP NOT SUPPORTED"
            );

            return false;

        }


        if (
            this.pipWindow &&
            !this.pipWindow.closed
        ) {

            return true;

        }


        try {

            console.log(
                "DESKTOP PIP V2: OPENING PIP"
            );


            this.pipWindow =
                await documentPictureInPicture.requestWindow({

                    width: 420,

                    height: 300

                });


            const doc =
                this.pipWindow.document;


            /*
            ------------------------------------------------
            BASIC DOCUMENT STYLE
            ------------------------------------------------
            */

            doc.documentElement.style.margin =
                "0";

            doc.documentElement.style.padding =
                "0";

            doc.documentElement.style.width =
                "100%";

            doc.documentElement.style.height =
                "100%";


            doc.body.style.margin =
                "0";

            doc.body.style.padding =
                "0";

            doc.body.style.width =
                "100%";

            doc.body.style.height =
                "100%";

            doc.body.style.background =
                "#202124";

            doc.body.style.overflow =
                "hidden";


            /*
            ------------------------------------------------
            PIP ROOT
            ------------------------------------------------
            */

            this.root =
                doc.createElement("div");


            this.root.id =
                "desktopScreenSharePip";


            this.root.style.position =
                "relative";

            this.root.style.width =
                "100%";

            this.root.style.height =
                "100%";

            this.root.style.background =
                "#202124";

            this.root.style.overflow =
                "hidden";

            this.root.style.borderRadius =
                "12px";

            this.root.style.fontFamily =
                "Arial, sans-serif";


            doc.body.appendChild(
                this.root
            );


            /*
            ------------------------------------------------
            PARTICIPANT GRID
            ------------------------------------------------
            */

            const grid =
                doc.createElement("div");


            grid.id =
                "desktopPipParticipantGrid";


            grid.style.position =
                "absolute";

            grid.style.left =
                "8px";

            grid.style.right =
                "8px";

            grid.style.top =
                "8px";

            grid.style.bottom =
                "55px";

            grid.style.display =
                "grid";

            grid.style.gridTemplateColumns =
                "repeat(2, minmax(0, 1fr))";

            grid.style.gridAutoRows =
                "minmax(0, 1fr)";

            grid.style.gap =
                "6px";

            grid.style.overflow =
                "hidden";


            this.root.appendChild(
                grid
            );


            /*
            ------------------------------------------------
            EMPTY STATUS
            ------------------------------------------------
            */

            const status =
                doc.createElement("div");


            status.id =
                "desktopPipStatus";


            status.textContent =
                "Waiting for participants…";


            status.style.position =
                "absolute";

            status.style.left =
                "50%";

            status.style.top =
                "50%";

            status.style.transform =
                "translate(-50%, -50%)";

            status.style.color =
                "#ffffff";

            status.style.fontSize =
                "13px";

            status.style.opacity =
                "0.75";


            grid.appendChild(
                status
            );


            /*
            ------------------------------------------------
            CLOSE EVENT
            ------------------------------------------------
            */

            this.pipWindow.addEventListener(
                "pagehide",
                () => {

                    console.log(
                        "DESKTOP PIP V2: WINDOW CLOSED"
                    );


                    this.stopSpeakerDetection();


                    this.pipWindow =
                        null;

                    this.root =
                        null;

                    this.participants =
                        {};

                    this.prepared =
                        false;

                }
            );


            /*
            ------------------------------------------------
            LISTEN FOR NEW REMOTE PARTICIPANT
            ------------------------------------------------
            */

            document.addEventListener(
                "meeting:remoteStream",
                this._remoteStreamHandler
            );


            /*
            ------------------------------------------------
            LISTEN FOR PARTICIPANT LEAVE
            ------------------------------------------------
            */

            document.addEventListener(
                "meeting:participantLeft",
                this._participantLeftHandler
            );


            /*
            ------------------------------------------------
            INITIAL PARTICIPANTS
            ------------------------------------------------
            */

            this.refreshParticipants();


         /*
------------------------------------------------
START ACTIVE SPEAKER DETECTION
------------------------------------------------
*/

this.startSpeakerDetection();


/*
------------------------------------------------
CREATE GOOGLE MEET STYLE PIP MENU
------------------------------------------------
*/

this.createPipMenu();


this.prepared =
    true;


            console.log(
                "DESKTOP PIP V2: READY"
            );


            return true;

        }

        catch(error) {

            console.error(
                "DESKTOP PIP V2: OPEN ERROR:",
                error
            );


            this.pipWindow =
                null;

            this.root =
                null;

            this.prepared =
                false;


            return false;

        }

    },


    /*
    =======================================================
    REMOTE STREAM EVENT
    =======================================================
    */

    _remoteStreamHandler(event) {

        if (
            !window.DesktopScreenSharePip
        ) {

            return;

        }


        const detail =
            event.detail;


        if (!detail) {

            return;

        }


        window.DesktopScreenSharePip.addParticipant(
            detail.socketId,
            detail.stream
        );

    },


    /*
    =======================================================
    PARTICIPANT LEFT EVENT
    =======================================================
    */

    _participantLeftHandler(event) {

        if (
            !window.DesktopScreenSharePip
        ) {

            return;

        }


        const detail =
            event.detail;


        if (!detail) {

            return;

        }


        window.DesktopScreenSharePip.removeParticipant(
            detail.socketId
        );

    },


    /*
    =======================================================
    GET PARTICIPANT NAME
    =======================================================
    */

    getParticipantName(socketId) {

        if (!socketId) {

            return "Participant";

        }


        const card =
            document.querySelector(
                `.meeting-participant[data-socket-id="${socketId}"]`
            );


        if (!card) {

            return "Participant";

        }


        /*
        ------------------------------------------------
        TRY USER NAME DATA
        ------------------------------------------------
        */

        const name =
            card.dataset.userName ||
            card.dataset.name;


        if (name) {

            return name;

        }


        /*
        ------------------------------------------------
        FALLBACK TEXT
        ------------------------------------------------
        */

        const text =
            card.innerText
                ?.trim()
                ?.split("\n")[0];


        return (
            text ||
            "Participant"
        );

    },


    /*
    =======================================================
    ADD PARTICIPANT
    =======================================================
    */

    addParticipant(
        socketId,
        stream
    ) {

        if (
            !this.pipWindow ||
            this.pipWindow.closed
        ) {

            return;

        }


        if (!socketId || !stream) {

            return;

        }


        const doc =
            this.pipWindow.document;


        const grid =
            doc.getElementById(
                "desktopPipParticipantGrid"
            );


        if (!grid) {

            return;

        }


        /*
        ------------------------------------------------
        REMOVE WAITING MESSAGE
        ------------------------------------------------
        */

        const status =
            doc.getElementById(
                "desktopPipStatus"
            );


        if (status) {

            status.remove();

        }


        /*
        ------------------------------------------------
        EXISTING PARTICIPANT
        ------------------------------------------------
        */

        if (
            this.participants[socketId]
        ) {

            const participant =
                this.participants[socketId];


            participant.stream =
                stream;


            participant.video.srcObject =
                stream;


            return;

        }


        /*
        ------------------------------------------------
        CREATE PARTICIPANT TILE
        ------------------------------------------------
        */

        const tile =
            doc.createElement("div");


        tile.className =
            "desktop-pip-participant";


        tile.dataset.socketId =
            socketId;


        tile.style.position =
            "relative";

        tile.style.width =
            "100%";

        tile.style.height =
            "100%";

        tile.style.minWidth =
            "0";

        tile.style.minHeight =
            "0";

        tile.style.background =
            "#000";

        tile.style.borderRadius =
            "9px";

        tile.style.overflow =
            "hidden";

        tile.style.border =
            "1px solid rgba(255,255,255,.12)";


        /*
        ------------------------------------------------
        VIDEO
        ------------------------------------------------
        */

        const video =
            doc.createElement("video");


        video.autoplay =
            true;

        video.playsInline =
            true;

        video.muted =
            true;


        video.srcObject =
            stream;


        video.style.width =
            "100%";

        video.style.height =
            "100%";

        video.style.objectFit =
            "cover";

        video.style.display =
            "block";


        tile.appendChild(
            video
        );


        /*
        ------------------------------------------------
        NAME LABEL
        ------------------------------------------------
        */

        const label =
            doc.createElement("div");


        label.className =
            "desktop-pip-name";


        label.textContent =
            this.getParticipantName(
                socketId
            );


        label.style.position =
            "absolute";

        label.style.left =
            "7px";

        label.style.bottom =
            "6px";

        label.style.padding =
            "3px 6px";

        label.style.borderRadius =
            "5px";

        label.style.background =
            "rgba(0,0,0,.65)";

        label.style.color =
            "#ffffff";

        label.style.fontSize =
            "10px";

        label.style.zIndex =
            "5";


        tile.appendChild(
            label
        );


        /*
        ------------------------------------------------
        SAVE PARTICIPANT
        ------------------------------------------------
        */

        this.participants[
            socketId
        ] = {

            socketId,

            stream,

            tile,

            video,

            label

        };


        grid.appendChild(
            tile
        );


        video.play()
            .catch(
                () => {}
            );


        console.log(
            "DESKTOP PIP V2: PARTICIPANT ADDED:",
            socketId
        );

    },


    /*
    =======================================================
    REMOVE PARTICIPANT
    =======================================================
    */

    removeParticipant(socketId) {

        const participant =
            this.participants[
                socketId
            ];


        if (!participant) {

            return;

        }


        if (
            participant.tile &&
            participant.tile.parentNode
        ) {

            participant.tile.remove();

        }


        delete this.participants[
            socketId
        ];


        console.log(
            "DESKTOP PIP V2: PARTICIPANT REMOVED:",
            socketId
        );

    },


    /*
    =======================================================
    REFRESH PARTICIPANTS
    =======================================================
    */

    refreshParticipants() {

        if (
            !window.MeetingWebRTC
        ) {

            return;

        }


        /*
        ------------------------------------------------
        LOCAL TEACHER
        ------------------------------------------------
        */

        const localStream =
            MeetingWebRTC.getLocalStream();


        const config =
            window.MeetingConfig;


        if (
            localStream &&
            config &&
            config.socketId
        ) {

            this.addParticipant(
                config.socketId,
                localStream
            );

        }


        /*
        ------------------------------------------------
        REMOTE STUDENTS
        ------------------------------------------------
        */

        const remoteStreams =
            MeetingWebRTC.getRemoteStreams();


        if (!remoteStreams) {

            return;

        }


        Object.entries(
            remoteStreams
        ).forEach(
            ([socketId, stream]) => {

                this.addParticipant(
                    socketId,
                    stream
                );

            }
        );

    },


    /*
    =======================================================
    ACTIVE SPEAKER
    =======================================================
    */

    getAudioLevel(
        stream
    ) {

        if (!stream) {

            return 0;

        }


        const audioTracks =
            stream.getAudioTracks();


        if (
            !audioTracks.length
        ) {

            return 0;

        }


        try {

            /*
            ------------------------------------------------
            CREATE AUDIO ANALYSER
            ------------------------------------------------
            */

            if (
                !stream._desktopPipAudioContext
            ) {

                const AudioContext =
                    window.AudioContext ||
                    window.webkitAudioContext;


                if (!AudioContext) {

                    return 0;

                }


                const audioContext =
                    new AudioContext();


                const source =
                    audioContext.createMediaStreamSource(
                        stream
                    );


                const analyser =
                    audioContext.createAnalyser();


                analyser.fftSize =
                    256;


                source.connect(
                    analyser
                );


                stream._desktopPipAudioContext =
                    audioContext;


                stream._desktopPipAnalyser =
                    analyser;

            }


            const analyser =
                stream._desktopPipAnalyser;


            const data =
                new Uint8Array(
                    analyser.frequencyBinCount
                );


            analyser.getByteFrequencyData(
                data
            );


            let total =
                0;


            for (
                let i = 0;
                i < data.length;
                i++
            ) {

                total +=
                    data[i];

            }


            return data.length
                ? total / data.length
                : 0;

        }

        catch(error) {

            console.warn(
                "DESKTOP PIP SPEAKER ERROR:",
                error
            );


            return 0;

        }

    },


    /*
    =======================================================
    UPDATE ACTIVE SPEAKER
    =======================================================
    */

    updateActiveSpeaker() {

        const participants =
            Object.values(
                this.participants
            );


        if (
            !participants.length
        ) {

            return;

        }


        let loudest =
            null;


        let loudestLevel =
            0;


        participants.forEach(
            participant => {

                const level =
                    this.getAudioLevel(
                        participant.stream
                    );


                if (
                    level >
                    loudestLevel
                ) {

                    loudestLevel =
                        level;

                    loudest =
                        participant;

                }

            }
        );


        /*
        ------------------------------------------------
        NO CLEAR SPEAKER
        ------------------------------------------------
        */

        if (
            !loudest ||
            loudestLevel < 8
        ) {

            return;

        }


        /*
        ------------------------------------------------
        APPLY SPEAKER STATE
        ------------------------------------------------
        */

        participants.forEach(
            participant => {

                participant.tile.style.transition =
                    "all .2s ease";


                if (
                    participant === loudest
                ) {

                    participant.tile.style.gridColumn =
                        "span 2";

                    participant.tile.style.gridRow =
                        "span 2";

                    participant.tile.style.zIndex =
                        "10";


                    participant.tile.style.border =
                        "2px solid rgba(255,255,255,.9)";

                }

                else {

                    participant.tile.style.gridColumn =
                        "span 1";

                    participant.tile.style.gridRow =
                        "span 1";

                    participant.tile.style.zIndex =
                        "1";


                    participant.tile.style.border =
                        "1px solid rgba(255,255,255,.12)";

                }

            }
        );

    },


    /*
    =======================================================
    START SPEAKER DETECTION
    =======================================================
    */

    startSpeakerDetection() {

        if (
            this.speakerTimer
        ) {

            return;

        }


        this.speakerTimer =
            setInterval(
                () => {

                    this.updateActiveSpeaker();

                },
                250
            );


        console.log(
            "DESKTOP PIP V2: SPEAKER DETECTION STARTED"
        );

    },


    /*
    =======================================================
    STOP SPEAKER DETECTION
    =======================================================
    */

    stopSpeakerDetection() {

        if (
            this.speakerTimer
        ) {

            clearInterval(
                this.speakerTimer
            );

            this.speakerTimer =
                null;

        }

    },


    /*
    =======================================================
    SHOW SCREEN
    =======================================================

    Kept for compatibility with screenShareV3.js.

    STEP 2 no longer places the shared screen
    inside the PIP.

    The PIP is now for participant videos.
    =======================================================
    */

    showScreen(stream) {

        console.log(
            "DESKTOP PIP V2: SCREEN STREAM RECEIVED"
        );


        /*
        ------------------------------------------------
        REFRESH PARTICIPANTS
        ------------------------------------------------
        */

        this.refreshParticipants();

    },

    


    /*
=======================================================
GOOGLE MEET STYLE PIP MENU
=======================================================
*/

createPipMenu() {

    if (
        !this.pipWindow ||
        this.pipWindow.closed ||
        !this.root
    ) {

        return;

    }


    const doc =
        this.pipWindow.document;


    /*
    ---------------------------------------------------
    MENU BAR
    ---------------------------------------------------
    */

    const menu =
        doc.createElement("div");


    menu.id =
        "desktopPipMenu";


    menu.style.position =
        "absolute";

    menu.style.left =
        "0";

    menu.style.right =
        "0";

    menu.style.bottom =
        "0";

    menu.style.height =
        "58px";

    menu.style.display =
        "flex";

    menu.style.alignItems =
        "center";

    menu.style.justifyContent =
        "center";

    menu.style.gap =
        "8px";

    menu.style.background =
        "rgba(32,33,36,.96)";

    menu.style.zIndex =
        "999999";


    /*
    ---------------------------------------------------
    BUTTON CREATOR
    ---------------------------------------------------
    */

    const createButton =
        (
            originalId,
            icon,
            title
        ) => {

            const button =
                doc.createElement("button");


            button.type =
                "button";


            button.innerHTML =
                icon;


            button.title =
                title;


            button.style.width =
                "38px";

            button.style.height =
                "38px";

            button.style.minWidth =
                "38px";

            button.style.border =
                "0";

            button.style.borderRadius =
                "50%";

            button.style.background =
                "#3c4043";

            button.style.color =
                "#ffffff";

            button.style.cursor =
                "pointer";

            button.style.display =
                "flex";

            button.style.alignItems =
                "center";

            button.style.justifyContent =
                "center";

            button.style.fontSize =
                "17px";

            button.style.padding =
                "0";


            /*
            -------------------------------------------
            CONNECT TO EXISTING MAIN CONTROL
            -------------------------------------------
            */

            button.addEventListener(
                "click",
                () => {

                    const originalButton =
    window.opener &&
    !window.opener.closed
        ? window.opener.document.getElementById(
            originalId
        )
        : null;


                    if (
                        originalButton
                    ) {

                        console.log(
                            "DESKTOP PIP:",
                            title
                        );


                        originalButton.click();

                    }
                    else {

                        console.warn(
                            "DESKTOP PIP: BUTTON NOT FOUND:",
                            originalId
                        );

                    }

                }
            );


            /*
            -------------------------------------------
            HOVER
            -------------------------------------------
            */

            button.addEventListener(
                "mouseenter",
                () => {

                    button.style.background =
                        "#5f6368";

                }
            );


            button.addEventListener(
                "mouseleave",
                () => {

                    button.style.background =
                        "#3c4043";

                }
            );


            menu.appendChild(
                button
            );

        };


    /*
    ===================================================
    MICROPHONE
    ===================================================
    */

    createButton(
        "micButton",
        "🎤",
        "Microphone"
    );


    /*
    ===================================================
    CAMERA
    ===================================================
    */

    createButton(
        "cameraButton",
        "📹",
        "Camera"
    );


    /*
    ===================================================
    RAISE HAND
    ===================================================
    */

    createButton(
        "raiseHandButton",
        "✋",
        "Raise hand"
    );


    /*
    ===================================================
    SCREEN SHARE
    ===================================================
    */

    createButton(
        "screenShareButton",
        "🖥️",
        "Screen share"
    );


    /*
    ===================================================
    PARTICIPANTS
    ===================================================
    */

    createButton(
        "peopleButton",
        "👥",
        "Participants"
    );


    /*
    ===================================================
    CHAT
    ===================================================
    */

    createButton(
        "chatButton",
        "💬",
        "Chat"
    );


    /*
    ===================================================
    MORE
    ===================================================
    */

    const moreButton =
        doc.createElement("button");


    moreButton.type =
        "button";


    moreButton.innerHTML =
        "⋮";


    moreButton.title =
        "More options";


    moreButton.style.width =
        "38px";

    moreButton.style.height =
        "38px";

    moreButton.style.border =
        "0";

    moreButton.style.borderRadius =
        "50%";

    moreButton.style.background =
        "#3c4043";

    moreButton.style.color =
        "#ffffff";

    moreButton.style.cursor =
        "pointer";

    moreButton.style.fontSize =
        "22px";


    moreButton.addEventListener(
    "click",
    () => {

        console.log(
            "DESKTOP PIP: MORE OPTIONS"
        );


        const originalMoreButton =
            window.opener &&
            !window.opener.closed
                ? window.opener.document.getElementById(
                    "moreButton"
                )
                : null;


        if (
            originalMoreButton
        ) {

            originalMoreButton.click();

        }
        else {

            console.warn(
                "DESKTOP PIP: moreButton NOT FOUND"
            );

        }

    }
);


    menu.appendChild(
        moreButton
    );


    /*
    ===================================================
    LEAVE
    ===================================================
    */

    const leaveButton =
        doc.createElement("button");


    leaveButton.type =
        "button";


    leaveButton.innerHTML =
        "☎";


    leaveButton.title =
        "Leave meeting";


    leaveButton.style.width =
        "42px";

    leaveButton.style.height =
        "38px";

    leaveButton.style.border =
        "0";

    leaveButton.style.borderRadius =
        "20px";

    leaveButton.style.background =
        "#ea4335";

    leaveButton.style.color =
        "#ffffff";

    leaveButton.style.cursor =
        "pointer";

    leaveButton.style.fontSize =
        "17px";


    leaveButton.addEventListener(
        "click",
        () => {

            console.log(
                "DESKTOP PIP: LEAVE CLICKED"
            );


            this.close();

        }
    );


    menu.appendChild(
        leaveButton
    );


    /*
    ===================================================
    ADD MENU TO PIP
    ===================================================
    */

    this.root.appendChild(
        menu
    );


    console.log(
        "DESKTOP PIP: GOOGLE MEET MENU CREATED"
    );

},


/*
=======================================================
CLOSE
=======================================================
*/

close() {

        this.stopSpeakerDetection();


        document.removeEventListener(
            "meeting:remoteStream",
            this._remoteStreamHandler
        );


        document.removeEventListener(
            "meeting:participantLeft",
            this._participantLeftHandler
        );


        if (
            this.pipWindow &&
            !this.pipWindow.closed
        ) {

            this.pipWindow.close();

        }


        this.pipWindow =
            null;

        this.root =
            null;

        this.participants =
            {};

        this.prepared =
            false;


        console.log(
            "DESKTOP PIP V2: CLOSED"
        );

    }

};
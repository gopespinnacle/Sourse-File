/*
=============================================================
 GOPES PINNACLE ACADEMY
 LIVEKIT MANAGER
 PHASE 2
 LIVEKIT CAMERA + MICROPHONE + PARTICIPANTS
=============================================================
*/

(function () {

    "use strict";


    /*
    =========================================================
    GLOBAL CHECK
    =========================================================
    */

    if (!window.LivekitClient) {

        console.error(
            "LIVEKIT: LivekitClient SDK not found."
        );

        return;

    }


    const {
        Room,
        RoomEvent
    } = window.LivekitClient;


    /*
    =========================================================
    PRIVATE VARIABLES
    =========================================================
    */

    let room = null;

    let config = {

        liveKitUrl: "",
        roomName: "",
        role: "",
        userId: "",
        userName: ""

    };


    let connected = false;


    /*
    =========================================================
    INIT
    =========================================================
    */

    function init(options = {}) {

        config = {

            liveKitUrl:
                options.liveKitUrl || "",

            roomName:
                options.roomName || "",

            role:
                options.role || "",

            userId:
                options.userId || "",

            userName:
                options.userName || ""

        };


        console.log(
            "=========================================="
        );

        console.log(
            "LIVEKIT MANAGER INITIALIZED"
        );

        console.log(
            "Room:",
            config.roomName
        );

        console.log(
            "Role:",
            config.role
        );

        console.log(
            "User:",
            config.userName
        );

        console.log(
            "=========================================="
        );

    }


    /*
    =========================================================
    CREATE LIVEKIT CONTAINER
    =========================================================
    */

    function getContainer() {

        let container =
            document.getElementById(
                "livekitParticipantGrid"
            );


        if (container) {

            return container;

        }


        const parent =
            document.getElementById(
                "participantGrid"
            );


        if (!parent) {

            console.error(
                "LIVEKIT: participantGrid not found."
            );

            return null;

        }


        container =
            document.createElement(
                "div"
            );


        container.id =
            "livekitParticipantGrid";


        container.style.position =
            "absolute";

        container.style.inset =
            "0";

        container.style.width =
            "100%";

        container.style.height =
            "100%";

        container.style.display =
            "grid";

        container.style.gridTemplateColumns =
            "repeat(auto-fit, minmax(280px, 1fr))";

        container.style.gridAutoRows =
            "minmax(180px, 1fr)";

        container.style.gap =
            "8px";

        container.style.padding =
            "8px";

        container.style.boxSizing =
            "border-box";

        container.style.background =
            "#111";

        container.style.zIndex =
            "50";

        container.style.overflow =
            "hidden";


        /*
        -----------------------------------------------------
        MAKE SURE PARENT CAN CONTAIN ABSOLUTE CHILD
        -----------------------------------------------------
        */

        const computed =
            window.getComputedStyle(
                parent
            );


        if (
            computed.position ===
            "static"
        ) {

            parent.style.position =
                "relative";

        }


        parent.appendChild(
            container
        );


        return container;

    }


    /*
    =========================================================
    CREATE PARTICIPANT CARD
    =========================================================
    */

    function createParticipantCard(
        participant,
        isLocal
    ) {

        const container =
            getContainer();


        if (!container) {

            return null;

        }


        const identity =
            participant.identity;


        let card =
            document.querySelector(
                `[data-livekit-identity="${CSS.escape(identity)}"]`
            );


        if (card) {

            return card;

        }


        card =
            document.createElement(
                "div"
            );


        card.className =
            "livekit-participant";


        card.dataset.livekitIdentity =
            identity;


        card.style.position =
            "relative";

        card.style.width =
            "100%";

        card.style.height =
            "100%";

        card.style.minHeight =
            "180px";

        card.style.background =
            "#222";

        card.style.borderRadius =
            "10px";

        card.style.overflow =
            "hidden";

        card.style.display =
            "flex";

        card.style.alignItems =
            "center";

        card.style.justifyContent =
            "center";


        /*
        -----------------------------------------------------
        NAME LABEL
        -----------------------------------------------------
        */

        const name =
            document.createElement(
                "div"
            );


        name.className =
            "livekit-participant-name";


        name.textContent =
            participant.name ||
            identity;


        name.style.position =
            "absolute";

        name.style.left =
            "10px";

        name.style.bottom =
            "10px";

        name.style.zIndex =
            "10";

        name.style.padding =
            "5px 9px";

        name.style.borderRadius =
            "6px";

        name.style.background =
            "rgba(0,0,0,.65)";

        name.style.color =
            "#fff";

        name.style.fontSize =
            "13px";


        if (isLocal) {

            name.textContent =
                "You - " +
                (
                    participant.name ||
                    identity
                );

        }


        card.appendChild(
            name
        );


        container.appendChild(
            card
        );


        return card;

    }


    /*
    =========================================================
    ATTACH TRACK
    =========================================================
    */

    function attachTrack(
        track,
        participant
    ) {

        if (!track) {

            return;

        }


        const isLocal =
            participant.isLocal;


        const card =
            createParticipantCard(
                participant,
                isLocal
            );


        if (!card) {

            return;

        }


        /*
        -----------------------------------------------------
        AUDIO
        -----------------------------------------------------
        */

        if (
            track.kind ===
            "audio"
        ) {

            const audio =
                track.attach();


            audio.autoplay =
                true;


            audio.style.display =
                "none";


            audio.dataset.livekitTrack =
                track.sid || "";


            card.appendChild(
                audio
            );


            console.log(
                "LIVEKIT: AUDIO ATTACHED",
                participant.identity
            );


            return;

        }


        /*
        -----------------------------------------------------
        VIDEO
        -----------------------------------------------------
        */

        if (
            track.kind ===
            "video"
        ) {

            const video =
                track.attach();


            video.autoplay =
                true;


            video.playsInline =
                true;


            video.muted =
                isLocal;


            video.style.width =
                "100%";

            video.style.height =
                "100%";

            video.style.objectFit =
                "cover";


            video.dataset.livekitTrack =
                track.sid || "";


            card.insertBefore(
                video,
                card.firstChild
            );


            console.log(
                "LIVEKIT: VIDEO ATTACHED",
                participant.identity
            );

        }

    }


    /*
    =========================================================
    REMOVE PARTICIPANT
    =========================================================
    */

    function removeParticipant(
        participant
    ) {

        if (!participant) {

            return;

        }


        const identity =
            participant.identity;


        const card =
            document.querySelector(
                `[data-livekit-identity="${CSS.escape(identity)}"]`
            );


        if (card) {

            card.remove();

        }


        console.log(
            "LIVEKIT: PARTICIPANT REMOVED",
            identity
        );

    }


    /*
    =========================================================
    CONNECT
    =========================================================
    */

    async function connect(
        token
    ) {

        if (!config.liveKitUrl) {

            throw new Error(
                "LiveKit URL is missing."
            );

        }


        if (!config.roomName) {

            throw new Error(
                "LiveKit room name is missing."
            );

        }


        if (!token) {

            throw new Error(
                "LiveKit token is missing."
            );

        }


        /*
        -----------------------------------------------------
        CREATE ROOM
        -----------------------------------------------------
        */

        room =
            new Room({

                adaptiveStream:
                    true,

                dynacast:
                    true

            });


        /*
        =====================================================
        ROOM EVENTS
        =====================================================
        */

        room.on(
            RoomEvent.Connected,
            () => {

                connected =
                    true;


                console.log(
                    "=========================================="
                );

                console.log(
                    "LIVEKIT CONNECTED"
                );

                console.log(
                    "Room:",
                    room.name
                );

                console.log(
                    "Local identity:",
                    room.localParticipant.identity
                );

                console.log(
                    "=========================================="
                );


                /*
                ------------------------------------------------
                EXISTING REMOTE PARTICIPANTS
                ------------------------------------------------
                */

                room.remoteParticipants.forEach(
                    participant => {

                        createParticipantCard(
                            participant,
                            false
                        );

                        participant.trackPublications.forEach(
                            publication => {

                                if (
                                    publication.track
                                ) {

                                    attachTrack(
                                        publication.track,
                                        participant
                                    );

                                }

                            }
                        );

                    }
                );

            }
        );


        /*
        =====================================================
        PARTICIPANT CONNECTED
        =====================================================
        */

        room.on(
            RoomEvent.ParticipantConnected,
            participant => {

                console.log(
                    "LIVEKIT: PARTICIPANT CONNECTED",
                    participant.identity,
                    participant.name
                );


                createParticipantCard(
                    participant,
                    false
                );

            }
        );


        /*
        =====================================================
        PARTICIPANT DISCONNECTED
        =====================================================
        */

        room.on(
            RoomEvent.ParticipantDisconnected,
            participant => {

                console.log(
                    "LIVEKIT: PARTICIPANT DISCONNECTED",
                    participant.identity
                );


                removeParticipant(
                    participant
                );

            }
        );


        /*
        =====================================================
        TRACK SUBSCRIBED
        =====================================================
        */

        room.on(
            RoomEvent.TrackSubscribed,
            (
                track,
                publication,
                participant
            ) => {

                console.log(
                    "LIVEKIT: TRACK SUBSCRIBED",
                    track.kind,
                    participant.identity
                );


                attachTrack(
                    track,
                    participant
                );

            }
        );


        /*
        =====================================================
        TRACK UNSUBSCRIBED
        =====================================================
        */

        room.on(
            RoomEvent.TrackUnsubscribed,
            (
                track,
                publication,
                participant
            ) => {

                console.log(
                    "LIVEKIT: TRACK UNSUBSCRIBED",
                    track.kind,
                    participant.identity
                );


                track.detach();

            }
        );


        /*
        =====================================================
        LOCAL TRACK PUBLISHED
        =====================================================
        */

        room.on(
            RoomEvent.LocalTrackPublished,
            (
                publication,
                participant
            ) => {

                console.log(
                    "LIVEKIT: LOCAL TRACK PUBLISHED",
                    publication.kind,
                    publication.source
                );


                if (
                    publication.track
                ) {

                    attachTrack(
                        publication.track,
                        participant
                    );

                }

            }
        );


        /*
        =====================================================
        LOCAL TRACK UNPUBLISHED
        =====================================================
        */

        room.on(
            RoomEvent.LocalTrackUnpublished,
            (
                publication,
                participant
            ) => {

                console.log(
                    "LIVEKIT: LOCAL TRACK UNPUBLISHED",
                    publication.kind
                );

            }
        );


        /*
        =====================================================
        DISCONNECTED
        =====================================================
        */

        room.on(
            RoomEvent.Disconnected,
            () => {

                connected =
                    false;


                console.log(
                    "LIVEKIT: DISCONNECTED"
                );

            }
        );


        /*
        =====================================================
        CONNECT TO LIVEKIT CLOUD
        =====================================================
        */

        console.log(
            "LIVEKIT: CONNECTING..."
        );


        await room.connect(
            config.liveKitUrl,
            token
        );


        /*
        =====================================================
        ENABLE CAMERA + MICROPHONE
        =====================================================
        */

        console.log(
            "LIVEKIT: ENABLING CAMERA + MICROPHONE..."
        );


        await room.localParticipant
            .enableCameraAndMicrophone();


        /*
        =====================================================
        LOCAL PARTICIPANT CARD
        =====================================================
        */

        createParticipantCard(
            room.localParticipant,
            true
        );


        /*
        -----------------------------------------------------
        ATTACH ALREADY-PUBLISHED LOCAL TRACKS
        -----------------------------------------------------
        */

        room.localParticipant
            .trackPublications
            .forEach(
                publication => {

                    if (
                        publication.track
                    ) {

                        attachTrack(
                            publication.track,
                            room.localParticipant
                        );

                    }

                }
            );


        console.log(
            "=========================================="
        );

        console.log(
            "LIVEKIT CAMERA + MICROPHONE READY"
        );

        console.log(
            "=========================================="
        );


        return room;

    }


    /*
    =========================================================
    CAMERA
    =========================================================
    */

    async function setCameraEnabled(
        enabled
    ) {

        if (!room) {

            return;

        }


        await room.localParticipant
            .setCameraEnabled(
                enabled
            );

    }


    /*
    =========================================================
    MICROPHONE
    =========================================================
    */

    async function setMicrophoneEnabled(
        enabled
    ) {

        if (!room) {

            return;

        }


        await room.localParticipant
            .setMicrophoneEnabled(
                enabled
            );

    }


    /*
    =========================================================
    SCREEN SHARE
    =========================================================
    */

    async function setScreenShareEnabled(
        enabled
    ) {

        if (!room) {

            return;

        }


        await room.localParticipant
            .setScreenShareEnabled(
                enabled
            );

    }


    /*
    =========================================================
    GET ROOM
    =========================================================
    */

    function getRoom() {

        return room;

    }


    /*
    =========================================================
    IS CONNECTED
    =========================================================
    */

    function isConnected() {

        return connected;

    }


    /*
    =========================================================
    LEAVE
    =========================================================
    */

    async function leave() {

        if (!room) {

            return;

        }


        console.log(
            "LIVEKIT: LEAVING ROOM"
        );


        await room.disconnect();


        room =
            null;


        connected =
            false;


        const container =
            document.getElementById(
                "livekitParticipantGrid"
            );


        if (container) {

            container.innerHTML =
                "";

            container.remove();

        }


        console.log(
            "LIVEKIT: LEFT ROOM"
        );

    }


    /*
    =========================================================
    EXPORT
    =========================================================
    */

    window.LiveKitManager = {

        init,

        connect,

        leave,

        setCameraEnabled,

        setMicrophoneEnabled,

        setScreenShareEnabled,

        getRoom,

        isConnected

    };


    console.log(
        "=========================================="
    );

    console.log(
        "LIVEKIT MANAGER LOADED"
    );

    console.log(
        "=========================================="
    );

})();
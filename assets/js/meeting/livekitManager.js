/*
============================================================
 GOPES PINNACLE ACADEMY
 LIVEKIT MEETING MANAGER
============================================================

 PURPOSE:

 This module replaces the OLD custom WebRTC video layer.

 RESPONSIBILITIES:

 1. Connect to LiveKit
 2. Disconnect from LiveKit
 3. Publish camera
 4. Publish microphone
 5. Receive remote participants
 6. Render participant videos
 7. Render participant audio
 8. Toggle microphone
 9. Toggle camera
10. Screen sharing
11. Reconnection handling
12. Connection quality
13. Participant join/leave handling
14. Clean LEAVE operation

 IMPORTANT:

 This module is deliberately independent of:

 - Whiteboard
 - PDF
 - Annotation
 - MongoDB
 - Socket.IO signaling
 - Academy timetable

 Those systems will be connected later.

============================================================
*/


(function () {

    "use strict";


    /*
    ========================================================
    GLOBAL OBJECT
    ========================================================
    */

    window.LiveKitManager = {


        /*
        ====================================================
        STATE
        ====================================================
        */

        room: null,

        connected: false,

        localCameraTrack: null,

        localMicrophoneTrack: null,

        localScreenTrack: null,

        localParticipant: null,

        roomName: null,

        role: null,

        userId: null,

        userName: null,

        liveKitUrl: null,


        /*
        ====================================================
        INITIALIZE
        ====================================================
        */

        init: function (config) {

            console.log(
                "================================================"
            );

            console.log(
                "GOPES PINNACLE ACADEMY"
            );

            console.log(
                "LIVEKIT MANAGER INITIALIZING"
            );

            console.log(
                "================================================"
            );


            config =
                config || {};


            this.roomName =
                config.roomName || "";


            this.role =
                config.role || "";


            this.userId =
                config.userId || "";


            this.userName =
                config.userName || "";


            /*
            ------------------------------------------------
            LIVEKIT URL
            ------------------------------------------------

            IMPORTANT:

            We will eventually move this into backend
            configuration / environment configuration.

            For now it is intentionally a placeholder.
            ------------------------------------------------
            */

            this.liveKitUrl =
                config.liveKitUrl || "";


            console.log(
                "LiveKit configuration:",
                {
                    roomName: this.roomName,
                    role: this.role,
                    userId: this.userId,
                    userName: this.userName,
                    liveKitUrl: this.liveKitUrl
                }
            );

        },


        /*
        ====================================================
        CONNECT
        ====================================================
        */

        connect: async function (token) {

            console.log(
                "LIVEKIT: CONNECT REQUEST"
            );


            if (!window.LiveKitClient) {

                console.error(
                    "LIVEKIT SDK NOT LOADED"
                );

                throw new Error(
                    "LiveKit SDK is not loaded."
                );

            }


            if (!this.liveKitUrl) {

                console.error(
                    "LIVEKIT URL IS EMPTY"
                );

                throw new Error(
                    "LiveKit URL is not configured."
                );

            }


            if (!token) {

                console.error(
                    "LIVEKIT TOKEN IS EMPTY"
                );

                throw new Error(
                    "LiveKit access token is required."
                );

            }


            /*
            ------------------------------------------------
            CREATE ROOM
            ------------------------------------------------
            */

            this.room =
                new LiveKitClient.Room({

                    /*
                    ------------------------------------------------
                    ADAPTIVE STREAM
                    ------------------------------------------------
                    */

                    adaptiveStream: true,


                    /*
                    ------------------------------------------------
                    DYNACAST
                    ------------------------------------------------
                    */

                    dynacast: true

                });


            /*
            ------------------------------------------------
            ROOM EVENTS
            ------------------------------------------------
            */

            this.registerRoomEvents();


            /*
            ------------------------------------------------
            CONNECT
            ------------------------------------------------
            */

            await this.room.connect(
                this.liveKitUrl,
                token
            );


            /*
            ------------------------------------------------
            STATE
            ------------------------------------------------
            */

            this.connected =
                true;


            this.localParticipant =
                this.room.localParticipant;


            console.log(
                "LIVEKIT: CONNECTED"
            );


            console.log(
                "LIVEKIT LOCAL PARTICIPANT:",
                this.localParticipant
            );


            this.updateConnectionStatus(
                "connected"
            );


            return this.room;

        },


        /*
        ====================================================
        ROOM EVENTS
        ====================================================
        */

        registerRoomEvents: function () {

            if (!this.room) {

                return;

            }


            /*
            ------------------------------------------------
            PARTICIPANT CONNECTED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.ParticipantConnected,
                (participant) => {

                    console.log(
                        "LIVEKIT PARTICIPANT CONNECTED:",
                        participant.identity
                    );


                    this.renderParticipant(
                        participant
                    );

                }
            );


            /*
            ------------------------------------------------
            PARTICIPANT DISCONNECTED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.ParticipantDisconnected,
                (participant) => {

                    console.log(
                        "LIVEKIT PARTICIPANT DISCONNECTED:",
                        participant.identity
                    );


                    this.removeParticipant(
                        participant
                    );

                }
            );


            /*
            ------------------------------------------------
            TRACK SUBSCRIBED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.TrackSubscribed,
                (
                    track,
                    publication,
                    participant
                ) => {

                    console.log(
                        "LIVEKIT TRACK SUBSCRIBED:",
                        {
                            kind: track.kind,
                            participant:
                                participant.identity
                        }
                    );


                    this.attachTrack(
                        track,
                        participant
                    );

                }
            );


            /*
            ------------------------------------------------
            TRACK UNSUBSCRIBED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.TrackUnsubscribed,
                (
                    track,
                    publication,
                    participant
                ) => {

                    console.log(
                        "LIVEKIT TRACK UNSUBSCRIBED:",
                        {
                            kind: track.kind,
                            participant:
                                participant.identity
                        }
                    );


                    this.detachTrack(
                        track,
                        participant
                    );

                }
            );


            /*
            ------------------------------------------------
            CONNECTION STATE
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.ConnectionStateChanged,
                (state) => {

                    console.log(
                        "LIVEKIT CONNECTION STATE:",
                        state
                    );


                    if (
                        state ===
                        "connected"
                    ) {

                        this.connected =
                            true;


                        this.updateConnectionStatus(
                            "connected"
                        );

                    }


                    else if (
                        state ===
                        "reconnecting"
                    ) {

                        this.updateConnectionStatus(
                            "reconnecting"
                        );

                    }


                    else if (
                        state ===
                        "disconnected"
                    ) {

                        this.connected =
                            false;


                        this.updateConnectionStatus(
                            "disconnected"
                        );

                    }

                }
            );


            /*
            ------------------------------------------------
            LOCAL TRACK PUBLISHED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.LocalTrackPublished,
                (
                    publication,
                    participant
                ) => {

                    console.log(
                        "LIVEKIT LOCAL TRACK PUBLISHED:",
                        publication.kind
                    );

                }
            );


            /*
            ------------------------------------------------
            PARTICIPANT TRACK MUTED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.TrackMuted,
                (
                    publication,
                    participant
                ) => {

                    console.log(
                        "LIVEKIT TRACK MUTED:",
                        participant.identity,
                        publication.kind
                    );

                }
            );


            /*
            ------------------------------------------------
            PARTICIPANT TRACK UNMUTED
            ------------------------------------------------
            */

            this.room.on(
                LiveKitClient.RoomEvent.TrackUnmuted,
                (
                    publication,
                    participant
                ) => {

                    console.log(
                        "LIVEKIT TRACK UNMUTED:",
                        participant.identity,
                        publication.kind
                    );

                }
            );

        },


        /*
        ====================================================
        CAMERA
        ====================================================
        */

        enableCamera: async function () {

            if (!this.room) {

                throw new Error(
                    "Not connected to LiveKit."
                );

            }


            console.log(
                "LIVEKIT: ENABLING CAMERA"
            );


            await this.room.localParticipant
                .setCameraEnabled(true);


            console.log(
                "LIVEKIT: CAMERA ENABLED"
            );

        },


        /*
        ====================================================
        DISABLE CAMERA
        ====================================================
        */

        disableCamera: async function () {

            if (!this.room) {

                return;

            }


            console.log(
                "LIVEKIT: DISABLING CAMERA"
            );


            await this.room.localParticipant
                .setCameraEnabled(false);


            console.log(
                "LIVEKIT: CAMERA DISABLED"
            );

        },


        /*
        ====================================================
        TOGGLE CAMERA
        ====================================================
        */

        toggleCamera: async function () {

            if (!this.room) {

                return;

            }


            const participant =
                this.room.localParticipant;


            const enabled =
                participant.isCameraEnabled;


            if (enabled) {

                await this.disableCamera();

            }

            else {

                await this.enableCamera();

            }

        },


        /*
        ====================================================
        MICROPHONE
        ====================================================
        */

        enableMicrophone: async function () {

            if (!this.room) {

                throw new Error(
                    "Not connected to LiveKit."
                );

            }


            console.log(
                "LIVEKIT: ENABLING MICROPHONE"
            );


            await this.room.localParticipant
                .setMicrophoneEnabled(true);


            console.log(
                "LIVEKIT: MICROPHONE ENABLED"
            );

        },


        /*
        ====================================================
        DISABLE MICROPHONE
        ====================================================
        */

        disableMicrophone: async function () {

            if (!this.room) {

                return;

            }


            console.log(
                "LIVEKIT: DISABLING MICROPHONE"
            );


            await this.room.localParticipant
                .setMicrophoneEnabled(false);


            console.log(
                "LIVEKIT: MICROPHONE DISABLED"
            );

        },


        /*
        ====================================================
        TOGGLE MICROPHONE
        ====================================================
        */

        toggleMicrophone: async function () {

            if (!this.room) {

                return;

            }


            const participant =
                this.room.localParticipant;


            const enabled =
                participant.isMicrophoneEnabled;


            if (enabled) {

                await this.disableMicrophone();

            }

            else {

                await this.enableMicrophone();

            }

        },


        /*
        ====================================================
        SCREEN SHARE
        ====================================================
        */

        enableScreenShare: async function () {

            if (!this.room) {

                throw new Error(
                    "Not connected to LiveKit."
                );

            }


            console.log(
                "LIVEKIT: STARTING SCREEN SHARE"
            );


            await this.room.localParticipant
                .setScreenShareEnabled(true);


            console.log(
                "LIVEKIT: SCREEN SHARE STARTED"
            );

        },


        /*
        ====================================================
        STOP SCREEN SHARE
        ====================================================
        */

        disableScreenShare: async function () {

            if (!this.room) {

                return;

            }


            console.log(
                "LIVEKIT: STOPPING SCREEN SHARE"
            );


            await this.room.localParticipant
                .setScreenShareEnabled(false);


            console.log(
                "LIVEKIT: SCREEN SHARE STOPPED"
            );

        },


        /*
        ====================================================
        TOGGLE SCREEN SHARE
        ====================================================
        */

        toggleScreenShare: async function () {

            if (!this.room) {

                return;

            }


            const participant =
                this.room.localParticipant;


            /*
            ------------------------------------------------
            CHECK SCREEN SHARE PUBLICATIONS
            ------------------------------------------------
            */

            let sharing =
                false;


            participant.trackPublications
                .forEach(
                    publication => {

                        if (
                            publication.source ===
                            LiveKitClient.Track.Source.ScreenShare
                        ) {

                            sharing =
                                true;

                        }

                    }
                );


            if (sharing) {

                await this.disableScreenShare();

            }

            else {

                await this.enableScreenShare();

            }

        },


        /*
        ====================================================
        RENDER PARTICIPANT
        ====================================================
        */

        renderParticipant: function (
            participant
        ) {

            if (!participant) {

                return;

            }


            console.log(
                "LIVEKIT: RENDER PARTICIPANT:",
                participant.identity
            );


            /*
            ------------------------------------------------
            CREATE CARD
            ------------------------------------------------
            */

            let card =
                document.querySelector(
                    `[data-livekit-identity="${CSS.escape(participant.identity)}"]`
                );


            if (!card) {

                card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "meeting-participant";


                card.dataset.livekitIdentity =
                    participant.identity;


                card.innerHTML = `

                    <div class="participant-video-container">

                        <div class="participant-placeholder">

                            <div class="participant-avatar">
                                👤
                            </div>

                            <div class="participant-name">
                                ${this.escapeHtml(
                                    participant.name ||
                                    participant.identity
                                )}
                            </div>

                        </div>

                    </div>

                    <div class="participant-name-label">

                        ${this.escapeHtml(
                            participant.name ||
                            participant.identity
                        )}

                    </div>

                `;


                const grid =
                    document.getElementById(
                        "participantGrid"
                    );


                if (grid) {

                    grid.appendChild(
                        card
                    );

                }

            }


            /*
            ------------------------------------------------
            ATTACH EXISTING TRACKS
            ------------------------------------------------
            */

            participant.trackPublications
                .forEach(
                    publication => {

                        if (
                            publication.isSubscribed &&
                            publication.track
                        ) {

                            this.attachTrack(
                                publication.track,
                                participant
                            );

                        }

                    }
                );

        },


        /*
        ====================================================
        ATTACH TRACK
        ====================================================
        */

        attachTrack: function (
            track,
            participant
        ) {

            if (!track) {

                return;

            }


            console.log(
                "LIVEKIT: ATTACH TRACK:",
                track.kind,
                participant.identity
            );


            /*
            ------------------------------------------------
            FIND / CREATE CARD
            ------------------------------------------------
            */

            this.renderParticipant(
                participant
            );


            const card =
                document.querySelector(
                    `[data-livekit-identity="${CSS.escape(participant.identity)}"]`
                );


            if (!card) {

                return;

            }


            const container =
                card.querySelector(
                    ".participant-video-container"
                );


            if (!container) {

                return;

            }


            /*
            ------------------------------------------------
            ATTACH LIVEKIT TRACK
            ------------------------------------------------
            */

            const element =
                track.attach();


            element.autoplay =
                true;


            element.playsInline =
                true;


            if (
                track.kind ===
                "video"
            ) {

                element.className =
                    "participant-livekit-video";

            }


            if (
                track.kind ===
                "audio"
            ) {

                element.className =
                    "participant-livekit-audio";

            }


            /*
            ------------------------------------------------
            REMOVE PLACEHOLDER FOR VIDEO
            ------------------------------------------------
            */

            if (
                track.kind ===
                "video"
            ) {

                const placeholder =
                    container.querySelector(
                        ".participant-placeholder"
                    );


                if (placeholder) {

                    placeholder.remove();

                }

            }


            container.appendChild(
                element
            );

        },


        /*
        ====================================================
        DETACH TRACK
        ====================================================
        */

        detachTrack: function (
            track,
            participant
        ) {

            if (!track) {

                return;

            }


            try {

                const elements =
                    track.detach();


                elements.forEach(
                    element => {

                        element.remove();

                    }
                );

            }

            catch (error) {

                console.warn(
                    "LIVEKIT DETACH ERROR:",
                    error
                );

            }

        },


        /*
        ====================================================
        REMOVE PARTICIPANT
        ====================================================
        */

        removeParticipant: function (
            participant
        ) {

            if (!participant) {

                return;

            }


            const card =
                document.querySelector(
                    `[data-livekit-identity="${CSS.escape(participant.identity)}"]`
                );


            if (card) {

                card.remove();

            }


            this.checkEmptyRoom();

        },


        /*
        ====================================================
        EMPTY ROOM
        ====================================================
        */

        checkEmptyRoom: function () {

            const grid =
                document.getElementById(
                    "participantGrid"
                );


            if (!grid) {

                return;

            }


            const participants =
                grid.querySelectorAll(
                    ".meeting-participant"
                );


            const emptyRoom =
                document.getElementById(
                    "emptyRoom"
                );


            if (emptyRoom) {

                emptyRoom.style.display =
                    participants.length
                        ? "none"
                        : "flex";

            }

        },


        /*
        ====================================================
        CONNECTION STATUS
        ====================================================
        */

        updateConnectionStatus: function (
            status
        ) {

            const dot =
                document.getElementById(
                    "connectionDot"
                );


            const text =
                document.getElementById(
                    "connectionText"
                );


            const systemStatus =
                document.getElementById(
                    "systemStatus"
                );


            if (
                status ===
                "connected"
            ) {

                if (dot) {

                    dot.style.background =
                        "#22c55e";

                }


                if (text) {

                    text.textContent =
                        "Connected";

                }


                if (systemStatus) {

                    systemStatus.textContent =
                        "Connected to classroom";

                }

            }


            else if (
                status ===
                "reconnecting"
            ) {

                if (dot) {

                    dot.style.background =
                        "#f59e0b";

                }


                if (text) {

                    text.textContent =
                        "Reconnecting...";

                }


                if (systemStatus) {

                    systemStatus.textContent =
                        "Reconnecting to classroom...";

                }

            }


            else {

                if (dot) {

                    dot.style.background =
                        "#ef4444";

                }


                if (text) {

                    text.textContent =
                        "Disconnected";

                }


                if (systemStatus) {

                    systemStatus.textContent =
                        "Disconnected from classroom";

                }

            }

        },


        /*
        ====================================================
        LEAVE
        ====================================================
        */

        leave: async function () {

            console.log(
                "================================================"
            );

            console.log(
                "LIVEKIT: LEAVING CLASSROOM"
            );

            console.log(
                "================================================"
            );


            /*
            ------------------------------------------------
            DO NOT END THE ROOM
            ------------------------------------------------

            This is extremely important.

            LEAVE means:

            "This participant leaves."

            It does NOT mean:

            "Destroy the class for everyone."
            ------------------------------------------------
            */


            if (this.room) {

                try {

                    await this.room.disconnect();

                }

                catch (error) {

                    console.warn(
                        "LIVEKIT DISCONNECT ERROR:",
                        error
                    );

                }

            }


            this.connected =
                false;


            this.room =
                null;


            this.localParticipant =
                null;


            this.localCameraTrack =
                null;


            this.localMicrophoneTrack =
                null;


            this.localScreenTrack =
                null;


            this.updateConnectionStatus(
                "disconnected"
            );


            console.log(
                "LIVEKIT: PARTICIPANT LEFT"
            );

        },


        /*
        ====================================================
        ESCAPE HTML
        ====================================================
        */

        escapeHtml: function (
            value
        ) {

            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                value || "";


            return div.innerHTML;

        }

    };


    console.log(
        "================================================"
    );

    console.log(
        "LiveKitManager loaded."
    );

    console.log(
        "================================================"
    );


})();
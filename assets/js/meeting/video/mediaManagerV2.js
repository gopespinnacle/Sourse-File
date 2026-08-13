/*
==========================================================
GOPES PINNACLE ACADEMY
MEDIA MANAGER V2
==========================================================

STEP 5A

Responsible ONLY for:

1. Camera
2. Microphone
3. Local MediaStream
4. Camera ON/OFF
5. Microphone ON/OFF
6. Releasing media

WebRTC peer connection is NOT handled here yet.

==========================================================
*/

const MediaManagerV2 = {

    localStream: null,

    cameraEnabled: false,

    microphoneEnabled: false,


    /*
    ======================================================
    START CAMERA + MICROPHONE
    ======================================================
    */

    async startMedia() {

        try {

            console.log(
                "=========================================="
            );

            console.log(
                "MEDIA V2"
            );

            console.log(
                "Requesting camera and microphone..."
            );

            console.log(
                "=========================================="
            );


            /*
            ----------------------------------------------
            REQUEST CAMERA + MICROPHONE
            ----------------------------------------------
            */

            const stream =
                await navigator.mediaDevices.getUserMedia({

                    video: {
                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        },

                        frameRate: {
                            ideal: 30,
                            max: 30
                        }
                    },

                    audio: {

                        echoCancellation: true,

                        noiseSuppression: true,

                        autoGainControl: true

                    }

                });


            /*
            ----------------------------------------------
            SAVE STREAM
            ----------------------------------------------
            */

            this.localStream =
                stream;


            /*
            ----------------------------------------------
            CAMERA STATUS
            ----------------------------------------------
            */

            const videoTracks =
                stream.getVideoTracks();


            this.cameraEnabled =
                videoTracks.length > 0;


            /*
            ----------------------------------------------
            MICROPHONE STATUS
            ----------------------------------------------
            */

            const audioTracks =
                stream.getAudioTracks();


            this.microphoneEnabled =
                audioTracks.length > 0;


            console.log(
                "CAMERA TRACKS:",
                videoTracks
            );

            console.log(
                "MICROPHONE TRACKS:",
                audioTracks
            );


            /*
            ----------------------------------------------
            ATTACH LOCAL VIDEO
            ----------------------------------------------
            */

            this.attachLocalVideoWhenReady();


            /*
            ----------------------------------------------
            STATUS
            ----------------------------------------------
            */

            if (
                window.MeetingUI &&
                typeof MeetingUI.setStatus === "function"
            ) {

                MeetingUI.setStatus(
                    "Camera and microphone are ready."
                );

            }


            console.log(
                "MEDIA V2 READY"
            );


            return stream;

        }

        catch (error) {

            console.error(
                "MEDIA V2 ERROR:",
                error
            );


            /*
            ----------------------------------------------
            USER DENIED PERMISSION
            ----------------------------------------------
            */

            if (
                error.name ===
                "NotAllowedError"
            ) {

                this.showMediaError(
                    "Camera or microphone permission was denied."
                );

            }


            /*
            ----------------------------------------------
            NO DEVICE
            ----------------------------------------------
            */

            else if (
                error.name ===
                "NotFoundError"
            ) {

                this.showMediaError(
                    "Camera or microphone was not found."
                );

            }


            /*
            ----------------------------------------------
            OTHER ERROR
            ----------------------------------------------
            */

            else {

                this.showMediaError(
                    "Unable to start camera and microphone."
                );

            }


            return null;

        }

    },


    /*
    ======================================================
    ATTACH LOCAL VIDEO
    ======================================================
    */

    attachLocalVideo() {

    if (!this.localStream) {

        console.warn(
            "No local stream available."
        );

        return;

    }


    /*
    ======================================================
    FIND CURRENT USER
    ======================================================
    */

    const participants =
        window.MeetingParticipants;

    const config =
        window.MeetingConfig;


    if (
        !participants ||
        !config ||
        !config.userId
    ) {

        console.warn(
            "Meeting participant system not ready."
        );

        return;

    }


    /*
    ======================================================
    FIND CURRENT PARTICIPANT
    ======================================================
    */

    const currentUser =
        participants.get(
            config.userId
        );


    if (!currentUser) {

        console.warn(
            "Current participant not found."
        );

        return;

    }


    /*
    ======================================================
    FIND PARTICIPANT CARD
    ======================================================
    */

    const card =
        currentUser.card;


    if (!card) {

        console.warn(
            "Current participant card not found."
        );

        return;

    }


    /*
    ======================================================
    FIND / CREATE VIDEO
    ======================================================
    */

    let video =
        card.querySelector(
            "video"
        );


    if (!video) {

        video =
            document.createElement(
                "video"
            );


        video.autoplay =
            true;

        video.muted =
            true;

        video.playsInline =
            true;

        video.className =
            "participant-video";


        card.appendChild(
            video
        );

    }


    /*
    ======================================================
    ATTACH CAMERA STREAM
    ======================================================
    */

    video.srcObject =
        this.localStream;


    video.autoplay =
        true;

    video.muted =
        true;

    video.playsInline =
        true;


    /*
    ======================================================
    START VIDEO
    ======================================================
    */

    video.play()
        .catch(
            error => {

                console.log(
                    "Local video play waiting:",
                    error
                );

            }
        );


    /*
    ======================================================
    MARK AS LOCAL VIDEO
    ======================================================
    */

    video.dataset.local =
        "true";


    console.log(
        "LOCAL CAMERA ATTACHED"
    );

},

attachLocalVideoWhenReady() {

    let attempts = 0;

    const maxAttempts = 30;


    const attach = () => {

        attempts++;


        const participants =
            window.MeetingParticipants;

        const config =
            window.MeetingConfig;


        if (
            participants &&
            config &&
            config.userId
        ) {

            const currentUser =
                participants.get(
                    config.userId
                );


            if (
                currentUser &&
                currentUser.card
            ) {

                this.attachLocalVideo();

                return;

            }

        }


        if (
            attempts >= maxAttempts
        ) {

            console.warn(
                "Unable to find local participant card."
            );

            return;

        }


        setTimeout(
            attach,
            100
        );

    };


    attach();

},


    /*
    ======================================================
    CAMERA ON / OFF
    ======================================================
    */

    setCameraEnabled(enabled) {

        if (!this.localStream) {

            return;

        }


        const tracks =
            this.localStream.getVideoTracks();


        tracks.forEach(
            track => {

                track.enabled =
                    enabled;

            }
        );


        this.cameraEnabled =
            enabled;


        console.log(
            "CAMERA:",
            enabled
                ? "ON"
                : "OFF"
        );

    },


    /*
    ======================================================
    MICROPHONE ON / OFF
    ======================================================
    */

    setMicrophoneEnabled(enabled) {

        if (!this.localStream) {

            return;

        }


        const tracks =
            this.localStream.getAudioTracks();


        tracks.forEach(
            track => {

                track.enabled =
                    enabled;

            }
        );


        this.microphoneEnabled =
            enabled;


        console.log(
            "MICROPHONE:",
            enabled
                ? "ON"
                : "OFF"
        );

    },


    /*
    ======================================================
    TOGGLE CAMERA
    ======================================================
    */

    toggleCamera() {

        if (!this.localStream) {

            return;

        }


        this.setCameraEnabled(
            !this.cameraEnabled
        );

    },


    /*
    ======================================================
    TOGGLE MICROPHONE
    ======================================================
    */

    toggleMicrophone() {

        if (!this.localStream) {

            return;

        }


        this.setMicrophoneEnabled(
            !this.microphoneEnabled
        );

    },


    /*
    ======================================================
    GET LOCAL STREAM
    ======================================================
    */

    getLocalStream() {

        return this.localStream;

    },


    /*
    ======================================================
    STOP EVERYTHING
    ======================================================
    */

    stopMedia() {

        if (!this.localStream) {

            return;

        }


        this.localStream
            .getTracks()
            .forEach(
                track => {

                    track.stop();

                }
            );


        this.localStream =
            null;


        this.cameraEnabled =
            false;


        this.microphoneEnabled =
            false;


        const video =
            document.getElementById(
                "localMeetingVideo"
            );


        if (video) {

            video.srcObject =
                null;

        }


        console.log(
            "MEDIA V2 STOPPED"
        );

    },


    /*
    ======================================================
    ERROR MESSAGE
    ======================================================
    */

    showMediaError(message) {

        console.error(
            message
        );


        if (
            window.MeetingUI &&
            typeof MeetingUI.setStatus === "function"
        ) {

            MeetingUI.setStatus(
                message
            );

        }

    }

};


/*
==========================================================
GLOBAL EXPORT
==========================================================
*/

window.MediaManagerV2 =
    MediaManagerV2;
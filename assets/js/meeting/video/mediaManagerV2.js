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

            /*
------------------------------------------------------
REQUEST CAMERA + MICROPHONE
------------------------------------------------------
*/

let stream = null;

try {

    /*
    FIRST ATTEMPT
    Normal classroom camera + microphone
    */

    stream =
        await navigator.mediaDevices.getUserMedia({

            video: true,

            audio: true

        });

}
catch (firstError) {

    console.warn(
        "FIRST MEDIA REQUEST FAILED:",
        firstError.name,
        firstError.message
    );


    /*
    SECOND ATTEMPT
    Ask for camera + microphone with
    very simple constraints.
    */

    try {

        stream =
            await navigator.mediaDevices.getUserMedia({

                video: {
                    facingMode: "user"
                },

                audio: true

            });

    }
    catch (secondError) {

        console.error(
            "SECOND MEDIA REQUEST FAILED:",
            secondError.name,
            secondError.message
        );


        /*
        --------------------------------------------------
        CAMERA + MICROPHONE FAILED
        TRY CAMERA ONLY
        --------------------------------------------------
        */

        try {

            stream =
                await navigator.mediaDevices.getUserMedia({

                    video: true

                });

            console.warn(
                "CAMERA STARTED WITHOUT MICROPHONE"
            );

        }
        catch (cameraError) {

            console.error(
                "CAMERA START FAILED:",
                cameraError.name,
                cameraError.message
            );


            /*
            ------------------------------------------------
            TRY MICROPHONE ONLY
            ------------------------------------------------
            */

            try {

                stream =
                    await navigator.mediaDevices.getUserMedia({

                        audio: true

                    });

                console.warn(
                    "MICROPHONE STARTED WITHOUT CAMERA"
                );

            }
            catch (audioError) {

                console.error(
                    "CAMERA AND MICROPHONE BOTH FAILED:",
                    audioError.name,
                    audioError.message
                );


                this.showMediaError(
                    "Unable to access camera or microphone."
                );

                return null;

            }

        }

    }

}


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

    if (
        error.name ===
        "NotAllowedError"
    ) {

        this.showMediaError(
            "Camera or microphone permission was denied."
        );

    }

    else if (
        error.name ===
        "NotFoundError"
    ) {

        this.showMediaError(
            "Camera or microphone was not found."
        );

    }

    else if (
        error.name ===
        "NotReadableError"
    ) {

        this.showMediaError(
            "Camera is currently unavailable. Please close other apps using the camera."
        );

    }

    else {

        this.showMediaError(
            "Unable to access camera or microphone."
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

    console.log(
        "=========================================="
    );

    console.log(
        "ATTACHING LOCAL CAMERA"
    );

    console.log(
        "=========================================="
    );


    /*
    ==================================================
    CHECK LOCAL MEDIA
    ==================================================
    */

    if (!this.localStream) {

        console.warn(
            "LOCAL STREAM NOT AVAILABLE"
        );

        return;

    }


    /*
    ==================================================
    GET MEETING CONFIG
    ==================================================
    */

    const config =
        window.MeetingConfig;


    if (!config) {

        console.warn(
            "MEETING CONFIG NOT AVAILABLE"
        );

        return;

    }


    /*
    ==================================================
    SOCKET ID
    ==================================================
    */

    const socketId =
        config.socketId;


    console.log(
        "LOCAL SOCKET ID:",
        socketId
    );


    if (!socketId) {

        console.warn(
            "LOCAL SOCKET ID NOT AVAILABLE"
        );

        return;

    }


    /*
    ==================================================
    FIND PARTICIPANT CARD
    ==================================================
    */

    const card =
        document.querySelector(
            `.meeting-participant[data-socket-id="${socketId}"]`
        );


    if (!card) {

        console.warn(
            "LOCAL PARTICIPANT CARD NOT FOUND:",
            socketId
        );

        return;

    }


    console.log(
        "LOCAL PARTICIPANT CARD FOUND:",
        card
    );


    /*
    ==================================================
    FIND VIDEO ELEMENT
    ==================================================
    */

    let video =
        card.querySelector("video");


    /*
    ==================================================
    CREATE VIDEO IF NOT PRESENT
    ==================================================
    */

    if (!video) {

        video =
            document.createElement("video");


        video.className =
            "participant-video";


        video.autoplay =
            true;


        video.playsInline =
            true;


        video.muted =
            true;


        card.appendChild(
            video
        );


        console.log(
            "LOCAL VIDEO ELEMENT CREATED"
        );

    }


    /*
    ==================================================
    ATTACH MEDIA STREAM
    ==================================================
    */

    video.srcObject =
        this.localStream;


    /*
    ==================================================
    VIDEO SETTINGS
    ==================================================
    */

    video.autoplay =
        true;

    video.playsInline =
        true;

    video.muted =
        true;


    /*
    ==================================================
    START VIDEO
    ==================================================
    */

    video.play()
        .then(
            () => {

                console.log(
                    "LOCAL CAMERA ATTACHED"
                );

            }
        )
        .catch(
            error => {

                console.warn(
                    "LOCAL VIDEO PLAY FAILED:",
                    error
                );

            }
        );

},

attachLocalVideoWhenReady() {

    let attempts = 0;

    const maxAttempts = 30;


    const attach = () => {

        attempts++;


        const config =
            window.MeetingConfig;


        /*
        ==================================================
        CHECK MEETING CONFIG
        ==================================================
        */

        if (
            !config ||
            !config.socketId
        ) {

            if (
                attempts >= maxAttempts
            ) {

                console.warn(
                    "Unable to get local socket ID."
                );

                return;

            }


            setTimeout(
                attach,
                100
            );

            return;

        }


        /*
        ==================================================
        FIND ACTUAL DOM PARTICIPANT CARD
        ==================================================
        */

        const card =
            document.querySelector(
                `.meeting-participant[data-socket-id="${config.socketId}"]`
            );


        /*
        ==================================================
        CARD FOUND
        ==================================================
        */

        if (card) {

            console.log(
                "LOCAL PARTICIPANT CARD FOUND:",
                card
            );


            this.attachLocalVideo();

            return;

        }


        /*
        ==================================================
        CARD NOT READY YET
        ==================================================
        */

        if (
            attempts >= maxAttempts
        ) {

            console.warn(
                "Unable to find local participant card.",
                config.socketId
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
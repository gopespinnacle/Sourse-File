/*
==========================================================
GOPES PINNACLE ACADEMY
AI SPEECH CAPTURE

Responsible ONLY for:

1. Reading the existing teacher MediaStream
2. Recording teacher audio
3. Creating audio chunks
4. Providing audio data to the AI system

IMPORTANT:
- Does NOT call getUserMedia()
- Does NOT control microphone ON/OFF
- Does NOT modify WebRTC
- Does NOT modify Jitsi
- Does NOT modify MediaManagerV2

It uses the existing MediaManagerV2 stream.
==========================================================
*/

const AISpeechCapture = {

    recorder: null,

    chunks: [],

    recording: false,

    startTime: null,

    /*
    ======================================================
    START CAPTURE
    ======================================================
    */

    start() {

        try {

            /*
            ------------------------------------------------
            GET EXISTING TEACHER MEDIA STREAM
            ------------------------------------------------
            */

            if (
                !window.MediaManagerV2 ||
                typeof MediaManagerV2.getLocalStream !== "function"
            ) {

                console.error(
                    "AI SPEECH: MediaManagerV2 not available."
                );

                return false;

            }


            const stream =
                MediaManagerV2.getLocalStream();


            if (!stream) {

                console.error(
                    "AI SPEECH: Teacher media stream not available."
                );

                return false;

            }


            /*
            ------------------------------------------------
            GET AUDIO TRACKS
            ------------------------------------------------
            */

            const audioTracks =
                stream.getAudioTracks();


            if (!audioTracks.length) {

                console.error(
                    "AI SPEECH: No microphone track found."
                );

                return false;

            }


            /*
            ------------------------------------------------
            CREATE AUDIO-ONLY STREAM
            ------------------------------------------------
            */

            const audioStream =
                new MediaStream(
                    audioTracks
                );


            /*
            ------------------------------------------------
            CHECK MEDIA RECORDER
            ------------------------------------------------
            */

            if (
                typeof MediaRecorder === "undefined"
            ) {

                console.error(
                    "AI SPEECH: MediaRecorder is not supported."
                );

                return false;

            }


            /*
            ------------------------------------------------
            SELECT AUDIO FORMAT
            ------------------------------------------------
            */

            let mimeType = "";

            if (
                MediaRecorder.isTypeSupported(
                    "audio/webm;codecs=opus"
                )
            ) {

                mimeType =
                    "audio/webm;codecs=opus";

            }

            else if (
                MediaRecorder.isTypeSupported(
                    "audio/webm"
                )
            ) {

                mimeType =
                    "audio/webm";

            }

            else if (
                MediaRecorder.isTypeSupported(
                    "audio/mp4"
                )
            ) {

                mimeType =
                    "audio/mp4";

            }


            /*
            ------------------------------------------------
            CREATE RECORDER
            ------------------------------------------------
            */

            this.recorder =
                mimeType
                    ?
                    new MediaRecorder(
                        audioStream,
                        {
                            mimeType
                        }
                    )
                    :
                    new MediaRecorder(
                        audioStream
                    );


            /*
            ------------------------------------------------
            CLEAR OLD CHUNKS
            ------------------------------------------------
            */

            this.chunks = [];


            /*
            ------------------------------------------------
            WHEN AUDIO DATA ARRIVES
            ------------------------------------------------
            */

            this.recorder.ondataavailable =
                event => {

                    if (
                        event.data &&
                        event.data.size > 0
                    ) {

                        this.chunks.push(
                            event.data
                        );

                    }

                };


            /*
            ------------------------------------------------
            RECORDER STARTED
            ------------------------------------------------
            */

            this.recorder.onstart =
                () => {

                    this.recording =
                        true;

                    this.startTime =
                        new Date();

                    console.log(
                        "AI SPEECH CAPTURE STARTED"
                    );

                };


            /*
            ------------------------------------------------
            RECORDER STOPPED
            ------------------------------------------------
            */

            this.recorder.onstop =
                () => {

                    this.recording =
                        false;

                    console.log(
                        "AI SPEECH CAPTURE STOPPED"
                    );

                };


            /*
            ------------------------------------------------
            RECORDER ERROR
            ------------------------------------------------
            */

            this.recorder.onerror =
                event => {

                    console.error(
                        "AI SPEECH RECORDER ERROR:",
                        event.error
                    );

                };


            /*
            ------------------------------------------------
            START RECORDING
            ------------------------------------------------
            */

            this.recorder.start(
                1000
            );


            return true;

        }

        catch (error) {

            console.error(
                "AI SPEECH START ERROR:",
                error
            );

            return false;

        }

    },


    /*
    ======================================================
    STOP CAPTURE
    ======================================================
    */

    async stop() {

        return new Promise(
            resolve => {

                if (
                    !this.recorder ||
                    this.recorder.state === "inactive"
                ) {

                    resolve(null);

                    return;

                }


                this.recorder.onstop =
                    () => {

                        this.recording =
                            false;


                        const blob =
                            this.getBlob();


                        console.log(
                            "AI SPEECH CAPTURE STOPPED"
                        );


                        resolve(blob);

                    };


                this.recorder.stop();

            }
        );

    },


    /*
    ======================================================
    GET CURRENT AUDIO BLOB
    ======================================================
    */

    getBlob() {

        if (
            !this.chunks.length
        ) {

            return null;

        }


        let mimeType =
            "audio/webm";


        if (
            this.recorder &&
            this.recorder.mimeType
        ) {

            mimeType =
                this.recorder.mimeType;

        }


        return new Blob(
            this.chunks,
            {
                type: mimeType
            }
        );

    },

    /*
==========================================================
GET CURRENT AUDIO SEGMENT AND CLEAR BUFFER
==========================================================
*/

getAndClearBlob() {

    if (
        !this.chunks.length
    ) {

        return null;

    }

    let mimeType =
        "audio/webm";


    if (
        this.recorder &&
        this.recorder.mimeType
    ) {

        mimeType =
            this.recorder.mimeType;

    }


    const blob =
        new Blob(
            this.chunks,
            {
                type: mimeType
            }
        );


    /*
    ------------------------------------------------------
    CLEAR ONLY THE OLD AUDIO CHUNKS
    ------------------------------------------------------
    */

    this.chunks = [];


    console.log(
        "AI SPEECH AUDIO SEGMENT CREATED:",
        blob.size
    );


    return blob;

},


    /*
    ======================================================
    GET CURRENT AUDIO SIZE
    ======================================================
    */

    getSize() {

        if (
            !this.chunks.length
        ) {

            return 0;

        }


        return this.chunks.reduce(
            (total, chunk) => {

                return total + chunk.size;

            },
            0
        );

    },


    /*
    ======================================================
    CLEAR AUDIO
    ======================================================
    */

    clear() {

        this.chunks = [];

        console.log(
            "AI SPEECH AUDIO BUFFER CLEARED"
        );

    },


    /*
    ======================================================
    STATUS
    ======================================================
    */

    isRecording() {

        return this.recording;

    }

};


/*
==========================================================
GLOBAL EXPORT
==========================================================
*/

window.AISpeechCapture =
    AISpeechCapture;

    console.log(
    "AI SPEECH MODULE LOADED"
);
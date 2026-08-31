/*
==========================================================
GOPES PINNACLE ACADEMY
AI CLASSROOM MANAGER

Responsible ONLY for:

1. Reading Founder AI Classroom settings
2. Starting periodic AI classroom cycles
3. Getting teacher speech
4. Sending audio for transcription
5. Sending transcript for question generation
6. Returning generated questions

DOES NOT CONTROL:

- WebRTC
- Jitsi
- Camera
- Microphone ON/OFF
- Whiteboard
- MediaManagerV2
==========================================================
*/

const AIClassroomManager = {

    running: false,

    timer: null,

    intervalMinutes: 10,

    questionCount: 3,

    teacherId: null,

    periodId: null,

    previousQuestions: [],


    /*
    ======================================================
    START AI CLASSROOM
    ======================================================
    */

    async start({
        teacherId,
        periodId
    }) {

        try {

            if (this.running) {

                console.log(
                    "AI CLASSROOM: Already running."
                );

                return;

            }


            if (!teacherId) {

                console.error(
                    "AI CLASSROOM: Teacher ID missing."
                );

                return;

            }


            if (!periodId) {

                console.error(
                    "AI CLASSROOM: Period ID missing."
                );

                return;

            }


            this.teacherId =
                teacherId;

            this.periodId =
                periodId;


            /*
            ------------------------------------------------
            LOAD FOUNDER SETTINGS
            ------------------------------------------------
            */

            const settingsResponse =
                await fetch(
                    "https://academy-backend-eatl.onrender.com/api/ai/settings"
                );


            const settingsResult =
                await settingsResponse.json();


            console.log(
                "AI CLASSROOM SETTINGS:",
                settingsResult
            );


            if (
                !settingsResult.success ||
                !settingsResult.data
            ) {

                console.error(
                    "AI CLASSROOM: Unable to load settings."
                );

                return;

            }


            const settings =
                settingsResult.data;


            /*
            ------------------------------------------------
            CHECK ENABLED
            ------------------------------------------------
            */

            if (!settings.enabled) {

                console.log(
                    "AI CLASSROOM: Disabled by Founder."
                );

                return;

            }


            this.intervalMinutes =
                Number(
                    settings.intervalMinutes
                );


            this.questionCount =
                Number(
                    settings.questionCount
                );


            /*
            ------------------------------------------------
            START
            ------------------------------------------------
            */

            this.running =
                true;


            console.log(
                "AI CLASSROOM STARTED"
            );


            console.log(
                "AI INTERVAL:",
                this.intervalMinutes,
                "minutes"
            );


            console.log(
                "AI QUESTION COUNT:",
                this.questionCount
            );


            /*
            ------------------------------------------------
            FIRST CYCLE
            ------------------------------------------------
            
            We do NOT immediately generate a question.

            The teacher gets the configured interval
            of classroom teaching first.
            */

            this.scheduleNextCycle();


        }

        catch (error) {

            console.error(
                "AI CLASSROOM START ERROR:",
                error
            );

        }

    },


    /*
    ======================================================
    SCHEDULE NEXT AI CYCLE
    ======================================================
    */

    scheduleNextCycle() {

        if (!this.running) {

            return;

        }


        const milliseconds =
            this.intervalMinutes *
            60 *
            1000;


        console.log(
            "AI CLASSROOM: Next cycle in",
            this.intervalMinutes,
            "minutes."
        );


        this.timer =
            setTimeout(
                () => {

                    this.runCycle();

                },
                milliseconds
            );

    },


    /*
    ======================================================
    RUN AI CYCLE
    ======================================================
    */

    async runCycle() {

        if (!this.running) {

            return;

        }


        try {

            console.log(
                "=========================================="
            );

            console.log(
                "AI CLASSROOM: CYCLE STARTED"
            );

            console.log(
                "=========================================="
            );


            /*
            ------------------------------------------------
            STOP CURRENT SPEECH CAPTURE
            ------------------------------------------------
            */

            if (
                !window.AISpeechCapture
            ) {

                console.error(
                    "AI CLASSROOM: AISpeechCapture unavailable."
                );

                this.scheduleNextCycle();

                return;

            }


            const audioBlob =
                await AISpeechCapture.stop();


            /*
            ------------------------------------------------
            CHECK AUDIO
            ------------------------------------------------
            */

            if (
                !audioBlob ||
                audioBlob.size === 0
            ) {

                console.warn(
                    "AI CLASSROOM: No teacher audio captured."
                );


                /*
                Start recording again
                */

                AISpeechCapture.start();


                this.scheduleNextCycle();

                return;

            }


            console.log(
                "AI CLASSROOM: Audio captured:",
                audioBlob.size,
                "bytes"
            );


            /*
            ------------------------------------------------
            TRANSCRIBE
            ------------------------------------------------
            */

            const transcript =
                await this.transcribeAudio(
                    audioBlob
                );


            if (
                !transcript ||
                !transcript.trim()
            ) {

                console.warn(
                    "AI CLASSROOM: Empty transcript."
                );


                AISpeechCapture.start();

                this.scheduleNextCycle();

                return;

            }


            console.log(
                "AI CLASSROOM TRANSCRIPT:",
                transcript
            );


            /*
            ------------------------------------------------
            GENERATE QUESTIONS
            ------------------------------------------------
            */

            const result =
                await this.generateQuestions(
                    transcript
                );


            if (
                !result ||
                !result.success
            ) {

                console.warn(
                    "AI CLASSROOM: Question generation failed.",
                    result
                );


                AISpeechCapture.start();

                this.scheduleNextCycle();

                return;

            }


            console.log(
                "AI CLASSROOM QUESTIONS:",
                result.questions
            );


            /*
            ------------------------------------------------
            STORE PREVIOUS QUESTIONS
            ------------------------------------------------
            */

            if (
                Array.isArray(
                    result.questions
                )
            ) {

                result.questions.forEach(
                    question => {

                        if (
                            question &&
                            question.question
                        ) {

                            this.previousQuestions.push(
                                question.question
                            );

                        }

                    }
                );

            }


            /*
            ------------------------------------------------
            QUESTIONS READY
            ------------------------------------------------
            */

            this.onQuestionsGenerated(
                result
            );


            /*
            ------------------------------------------------
            START NEXT RECORDING
            ------------------------------------------------
            */

            AISpeechCapture.start();


            /*
            ------------------------------------------------
            SCHEDULE NEXT CYCLE
            ------------------------------------------------
            */

            this.scheduleNextCycle();


        }

        catch (error) {

            console.error(
                "AI CLASSROOM CYCLE ERROR:",
                error
            );


            /*
            Always restart capture after an error
            */

            try {

                AISpeechCapture.start();

            }

            catch (restartError) {

                console.error(
                    "AI CLASSROOM: Failed to restart speech capture.",
                    restartError
                );

            }


            this.scheduleNextCycle();

        }

    },


    /*
    ======================================================
    TRANSCRIBE AUDIO
    ======================================================
    */

    async transcribeAudio(
        audioBlob
    ) {

        const formData =
            new FormData();


        formData.append(
            "audio",
            audioBlob,
            "teacher-audio.webm"
        );


        const response =
            await fetch(
                "https://academy-backend-eatl.onrender.com/api/ai/transcribe-teacher-audio",
                {
                    method: "POST",
                    body: formData
                }
            );


        const result =
            await response.json();


        console.log(
            "AI TRANSCRIPTION RESULT:",
            result
        );


        if (
            !result.success
        ) {

            throw new Error(
                result.message ||
                "Teacher audio transcription failed."
            );

        }


        return result.transcript;

    },


    /*
    ======================================================
    GENERATE QUESTIONS
    ======================================================
    */

    async generateQuestions(
        transcript
    ) {

        const response =
            await fetch(
                "https://academy-backend-eatl.onrender.com/api/ai/classroom/generate-period-questions",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({

                            teacherId:
                                this.teacherId,

                            periodId:
                                this.periodId,

                            transcript:
                                transcript,

                            previousQuestions:
                                this.previousQuestions

                        })

                }
            );


        const result =
            await response.json();


        console.log(
            "AI QUESTION GENERATION RESULT:",
            result
        );


        return result;

    },


    /*
    ======================================================
    QUESTIONS GENERATED
    ======================================================
    */

    onQuestionsGenerated(
        result
    ) {

        console.log(
            "AI CLASSROOM: QUESTIONS READY FOR DELIVERY"
        );


        console.log(
            result.questions
        );


        /*
        ------------------------------------------------
        EVENT FOR WHITEBOARD / STUDENT DELIVERY
        ------------------------------------------------

        We will connect this event to Socket.IO
        in the next step.

        Existing classroom functionality remains untouched.
        */

        window.dispatchEvent(
            new CustomEvent(
                "aiClassroomQuestionsGenerated",
                {
                    detail: result
                }
            )
        );

    },


    /*
    ======================================================
    STOP AI CLASSROOM
    ======================================================
    */

    stop() {

        this.running =
            false;


        if (this.timer) {

            clearTimeout(
                this.timer
            );

            this.timer =
                null;

        }


        console.log(
            "AI CLASSROOM STOPPED"
        );

    },


    /*
    ======================================================
    STATUS
    ======================================================
    */

    isRunning() {

        return this.running;

    }

};


/*
==========================================================
GLOBAL EXPORT
==========================================================
*/

window.AIClassroomManager =
    AIClassroomManager;


console.log(
    "AI CLASSROOM MANAGER LOADED"
);
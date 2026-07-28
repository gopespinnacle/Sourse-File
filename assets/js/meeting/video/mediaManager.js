/*
=========================================
Media Manager
=========================================
*/

const MediaManager = {

    localStream: null,

    async initialize() {

        try {

            console.log("Requesting Camera & Microphone...");

            this.localStream = await navigator.mediaDevices.getUserMedia({

                video: true,

                audio: true

            });

            console.log("Camera & Microphone Ready");

            return this.localStream;

        }

        catch (error) {

            console.error("Unable to access Camera/Microphone", error);

            alert("Please allow Camera & Microphone permission.");

            return null;

        }

    },

    stop() {

        if (!this.localStream) return;

        this.localStream.getTracks().forEach(track => track.stop());

        this.localStream = null;

        console.log("Camera & Microphone Stopped");

    }

};
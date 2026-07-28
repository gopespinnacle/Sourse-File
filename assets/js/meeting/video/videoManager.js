/*
=========================================================
Video Manager
=========================================================
*/

const VideoManager = {

    async startLocalPreview(){

        console.log("Starting Local Preview...");

        const stream = await MediaManager.initialize();

        StreamManager.setLocal(stream);

        if(!stream){

            return;

        }

        const video = VideoUI.createVideo(

            "local",

            "You"

        );

        video.muted = true;

        video.srcObject = stream;

        console.log("Local Preview Started");

    }

};
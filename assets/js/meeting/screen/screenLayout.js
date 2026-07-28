/*
==========================================================
Gopes Pinnacle Academy
Screen Layout Manager
==========================================================
*/

const ScreenLayout = {

    attachRemoteTrack(track) {

        const screenVideo = document.getElementById("screenVideo");

        if (!screenVideo) return;

        if (!screenVideo.srcObject) {

            screenVideo.srcObject = new MediaStream();

        }

        const stream = screenVideo.srcObject;

        stream.getVideoTracks().forEach(t => {

            stream.removeTrack(t);

        });

        stream.addTrack(track);

        screenVideo.play().catch(console.error);

        document.getElementById("screenContainer").style.display = "block";

        document.getElementById("mainBoard").style.display = "none";

        document.getElementById("drawLayer").style.display = "none";

    },

    hide() {

        const screenVideo = document.getElementById("screenVideo");

        if (screenVideo) {

            screenVideo.pause();

            screenVideo.srcObject = null;

        }

        document.getElementById("screenContainer").style.display = "none";

        document.getElementById("mainBoard").style.display = "block";

        document.getElementById("drawLayer").style.display = "block";

    }

};

window.ScreenLayout = ScreenLayout;
/*
==========================================================
Gopes Pinnacle Academy
Participant Layout Manager
==========================================================
*/

const ParticipantLayout = {

    participants: {},

    add(socketId, participant) {

        this.participants[socketId] = participant;

    },

    get(socketId) {

        return this.participants[socketId];

    },

    getAll() {

        return this.participants;

    },

    remove(socketId) {

        if (!this.participants[socketId]) return;

        delete this.participants[socketId];

this.updateLayout();

    },

    clear() {

        this.participants = {};

    }

};

ParticipantLayout.createVideoCard = function(socketId, isLocal = false){

    const strip = document.getElementById("participantStrip");

    if(!strip) return null;

    const card = document.createElement("div");

    card.className = "participant-card";

    card.id = "participant_" + socketId;


    /* =====================================================
       CREATE VIDEO
       ===================================================== */

    const video = document.createElement("video");

    video.id = "remote_" + socketId;

    video.autoplay = true;

    video.playsInline = true;

    video.style.width = "100%";
    video.style.height = "100%";
    video.style.objectFit = "cover";
    video.style.display = "block";


    if(isLocal){

        video.muted = true;

    }


    card.appendChild(video);

    strip.appendChild(card);


    /* =====================================================
       SAVE PARTICIPANT
       ===================================================== */

    this.participants[socketId] = {

        card,

        video

    };


    /* =====================================================
       IF SCREEN SHARING IS ACTIVE
       FORCE SMALL VIDEO
       ===================================================== */

    if(
        strip.classList.contains("screen-sharing")
    ){

        card.style.setProperty(
            "width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "min-width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "max-width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "min-height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "max-height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "flex",
            "0 0 70px",
            "important"
        );

        card.style.setProperty(
            "display",
            "block",
            "important"
        );

        card.style.setProperty(
            "overflow",
            "hidden",
            "important"
        );


        video.style.setProperty(
            "width",
            "100%",
            "important"
        );

        video.style.setProperty(
            "height",
            "100%",
            "important"
        );

        video.style.setProperty(
            "object-fit",
            "cover",
            "important"
        );

    }


    console.log(
        "CARD CREATED:",
        socketId,
        "SCREEN MODE:",
        strip.classList.contains("screen-sharing")
    );


    /* =====================================================
       MEETING LAYOUT
       ===================================================== */

    if(
        window.MeetingLayout &&
        typeof MeetingLayout.update === "function"
    ){

        MeetingLayout.update();

    }


    /* =====================================================
       AFTER MEETING LAYOUT UPDATE
       FORCE SMALL SIZE AGAIN
       ===================================================== */

    if(
        strip.classList.contains("screen-sharing")
    ){

        requestAnimationFrame(() => {

            card.style.setProperty(
                "width",
                "70px",
                "important"
            );

            card.style.setProperty(
                "height",
                "120px",
                "important"
            );

            card.style.setProperty(
                "min-width",
                "70px",
                "important"
            );

            card.style.setProperty(
                "max-width",
                "70px",
                "important"
            );

            card.style.setProperty(
                "min-height",
                "120px",
                "important"
            );

            card.style.setProperty(
                "max-height",
                "120px",
                "important"
            );

            card.style.setProperty(
                "flex",
                "0 0 70px",
                "important"
            );

        });

    }


    return video;

};

ParticipantLayout.removeVideoCard = function(socketId){

    const participant = this.participants[socketId];

    if(!participant) return;

    participant.card.remove();

    delete this.participants[socketId];

};

ParticipantLayout.getVideo = function(socketId){

    const participant = this.participants[socketId];

    if(!participant) return null;

    return participant.video;

};

ParticipantLayout.attachTrack = function(socketId, track){

    let video = this.getVideo(socketId);

    if(!video){

        video = this.createVideoCard(socketId);

    }

    if(!video.srcObject){

        video.srcObject = new MediaStream();

    }

    video.srcObject.addTrack(track);

    console.log(
    "TRACK ATTACHED:",
    socketId,
    video.srcObject.getTracks().length
);

    video.play().catch(console.error);

};

ParticipantLayout.removeParticipant = function(socketId){

    const participant = this.participants[socketId];

    if(!participant) return;

    if(participant.video){

        if(participant.video.srcObject){

            participant.video.srcObject.getTracks().forEach(track=>track.stop());

            participant.video.srcObject = null;

        }

    }

    if(participant.card){

        participant.card.remove();

    }

    delete this.participants[socketId];

    if (
    window.MeetingLayout &&
    typeof MeetingLayout.update === "function"
) {
    MeetingLayout.update();
}

};







ParticipantLayout.showScreenShare = function(){

    console.log("SCREEN SHARING MODE ON");

    const screenContainer =
        document.getElementById("screenContainer");

    const mainBoard =
        document.getElementById("mainBoard");

    const drawLayer =
        document.getElementById("drawLayer");

    const strip =
        document.getElementById("participantStrip");


    /* =====================================================
       SHOW SCREEN SHARE
       ===================================================== */

    if(screenContainer){

        screenContainer.style.display = "block";

    }

    if(mainBoard){

        mainBoard.style.display = "none";

    }

    if(drawLayer){

        drawLayer.style.display = "none";

    }


    /* =====================================================
       ENABLE SCREEN SHARING MODE
       ===================================================== */

    if(strip){

        strip.classList.add("screen-sharing");

    }


    /* =====================================================
       FORCE SMALL PARTICIPANT VIDEOS
       ===================================================== */

    if(strip){

        strip.style.display = "flex";
        strip.style.flexDirection = "column";
        strip.style.width = "70px";
        strip.style.minWidth = "70px";
        strip.style.maxWidth = "70px";
        strip.style.height = "auto";
        strip.style.gap = "6px";
        strip.style.overflow = "visible";

    }


    /* =====================================================
       FORCE EVERY PARTICIPANT CARD SMALL
       ===================================================== */

    Object.values(
        ParticipantLayout.participants
    ).forEach(participant => {

        if(!participant) return;


        const card =
            participant.card;

        const video =
            participant.video;


        if(card){

            card.style.width = "70px";
            card.style.minWidth = "70px";
            card.style.maxWidth = "70px";

            card.style.height = "120px";
            card.style.minHeight = "120px";
            card.style.maxHeight = "120px";

            card.style.flex = "0 0 70px";

            card.style.display = "block";

            card.style.position = "relative";

            card.style.margin = "0";

            card.style.padding = "0";

            card.style.overflow = "hidden";

        }


        if(video){

            video.style.width = "100%";
            video.style.height = "100%";

            video.style.minWidth = "100%";
            video.style.minHeight = "100%";

            video.style.maxWidth = "100%";
            video.style.maxHeight = "100%";

            video.style.objectFit = "cover";

            video.style.display = "block";

        }

    });


    /* =====================================================
       DO NOT ALLOW LAYOUT MANAGER TO ENLARGE THEM
       ===================================================== */

    if(
        window.MeetingLayout &&
        typeof MeetingLayout.update === "function"
    ){

        MeetingLayout.update();

    }


    /*
    IMPORTANT:
    MeetingLayout.update() may change the participant
    sizes, so force the small size AGAIN after update.
    */

    if(strip){

        strip.style.display = "flex";
        strip.style.flexDirection = "column";
        strip.style.width = "70px";
        strip.style.minWidth = "70px";
        strip.style.maxWidth = "70px";

    }


    Object.values(
        ParticipantLayout.participants
    ).forEach(participant => {

        if(!participant || !participant.card) return;

        const card = participant.card;

        card.style.setProperty(
            "width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "min-width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "max-width",
            "70px",
            "important"
        );

        card.style.setProperty(
            "min-height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "max-height",
            "120px",
            "important"
        );

        card.style.setProperty(
            "flex",
            "0 0 70px",
            "important"
        );

    });


    /* =====================================================
       LOCAL VIDEO LAYOUT
       ===================================================== */

    if(
        window.LocalVideoLayout &&
        typeof LocalVideoLayout.updateLayout === "function"
    ){

        LocalVideoLayout.updateLayout();

    }


    console.log(
        "SCREEN SHARE ACTIVE - PARTICIPANTS FORCED TO 70x120"
    );

};

ParticipantLayout.hideScreenShare = function(){

    document.getElementById("screenContainer").style.display="none";

    document.getElementById("mainBoard").style.display="block";

    document.getElementById("drawLayer").style.display="block";

    document
    .getElementById("participantStrip")
    ?.classList.remove("screen-sharing");

    const strip = document.getElementById("participantStrip");

strip.removeAttribute("style");

if (
    window.MeetingLayout &&
    typeof MeetingLayout.update === "function"
) {
    MeetingLayout.update();
}

if(window.LocalVideoLayout){
    LocalVideoLayout.updateLayout();
}

};

window.ParticipantLayout = ParticipantLayout;



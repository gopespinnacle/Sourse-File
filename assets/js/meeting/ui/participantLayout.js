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

    if(document.getElementById("participantStrip")?.classList.contains("screen-sharing")){
    card.style.width = "70px";
    card.style.height = "120px";
    card.style.flex = "none";
}

    card.id = "participant_" + socketId;

    const video = document.createElement("video");

    video.id = "remote_" + socketId;

    video.autoplay = true;

    video.playsInline = true;

    if(isLocal){

        video.muted = true;

    }

    card.appendChild(video);

    strip.appendChild(card);

    this.participants[socketId] = {

        card,

        video

    };
    if (
    window.MeetingLayout &&
    typeof MeetingLayout.update === "function"
) {
    MeetingLayout.update();
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

    document.getElementById("screenContainer").style.display="block";

    document.getElementById("mainBoard").style.display="none";

    document.getElementById("drawLayer").style.display="none";

    document
    .getElementById("participantStrip")
    ?.classList.add("screen-sharing");

    
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



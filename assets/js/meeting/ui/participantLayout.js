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
    this.updateLayout();

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

    this.updateLayout();

};

ParticipantLayout.updateLayout = function(){

    const strip = document.getElementById("participantStrip");

    if(!strip) return;

    const count = Object.keys(this.participants).length;

    // Leave space for teacher preview
    strip.style.position = "fixed";
    strip.style.top = "50px";
    strip.style.left = "0";
    strip.style.right = "0";
    strip.style.bottom = "0";

    if(strip.classList.contains("screen-sharing")){

    strip.style.display = "flex";

}else{

    strip.style.display = "grid";

}
    strip.style.padding = "8px";
    strip.style.gap = "8px";

    // Google Meet Layout
    if(count <= 1){

        strip.style.gridTemplateColumns = "1fr";
        strip.style.gridTemplateRows = "1fr";

    }
    else if(count === 2){

        strip.style.gridTemplateColumns = "1fr 1fr";
        strip.style.gridTemplateRows = "1fr";

    }
    else if(count <= 4){

        strip.style.gridTemplateColumns = "repeat(2,1fr)";
        strip.style.gridTemplateRows = "repeat(2,1fr)";

    }
    else if(count <= 9){

        strip.style.gridTemplateColumns = "repeat(3,1fr)";
        strip.style.gridTemplateRows = "repeat(3,1fr)";

    }
    else{

        strip.style.gridTemplateColumns = "repeat(4,1fr)";
        strip.style.gridTemplateRows = "repeat(4,1fr)";

    }

};

ParticipantLayout.showScreenShare = function(){

    document.getElementById("screenContainer").style.display="block";

    document.getElementById("mainBoard").style.display="none";

    document.getElementById("drawLayer").style.display="none";

    document
    .getElementById("participantStrip")
    ?.classList.add("screen-sharing");

    const strip = document.getElementById("participantStrip");

strip.style.position = "fixed";
strip.style.right = "10px";
strip.style.left = "auto";
strip.style.top = "auto";
strip.style.bottom = "10px";

strip.style.width = "90px";
strip.style.height = "auto";

strip.style.display = "flex";
strip.style.flexDirection = "column";
strip.style.alignItems = "flex-end";
strip.style.gap = "8px";

strip.style.zIndex = "999999";

this.updateLayout();

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

this.updateLayout();

};

window.ParticipantLayout = ParticipantLayout;
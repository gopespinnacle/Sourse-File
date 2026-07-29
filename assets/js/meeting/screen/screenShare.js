/*
==========================================================
Gopes Pinnacle Academy
Screen Share Manager
==========================================================
*/

const ScreenShare = {

    socket:null,

    room:null,

    peers:null,

    role:null,

    screenCanvas:null,

    stream:null,

    init(config){

        this.socket = config.socket;

        this.room = config.room;

        this.peers = config.peers;

        this.role = config.role;

        this.screenCanvas = config.screenCanvas;

    },

    async start(){

        alert(
            "AndroidBridge = " +
            typeof window.AndroidBridge
        );

        if(window.AndroidBridge){

            AndroidBridge.startScreenShare();

            return;

        }

        alert("Share Screen Clicked");

        if(this.role !== "teacher") return;

        try{

            alert("Screen Selected");

            alert(
                typeof navigator.mediaDevices.getDisplayMedia
            );

            this.stream =
await navigator.mediaDevices.getDisplayMedia({

    video:true,

    audio:true

});

const screenTrack =
this.stream.getVideoTracks()[0];

// Dedicated screen stream
const screenStream = new MediaStream();

screenStream.addTrack(screenTrack);

window.currentScreenStream = screenStream;

const screenVideo =
document.getElementById("screenVideo");

screenVideo.srcObject =
new MediaStream([screenTrack]);

screenVideo.style.display =
"block";

ParticipantLayout.showScreenShare();

const toolbar = document.getElementById("annotationToolbar");

if(toolbar){

    toolbar.style.display = "flex";

}

this.socket.emit("screenShareStarted", {

    room: this.room,

     teacher: this.socket.id

});


// Dedicated Screen Share Offer
Object.keys(this.peers).forEach((socketId)=>{

    this.socket.emit("startScreenPeer",{

        room: this.room,

        targetSocketId: socketId

    });

});

// Replace audio track also
const audioTrack = this.stream.getAudioTracks()[0];

if(audioTrack){

    Object.values(this.peers).forEach(peer=>{

        const sender = peer.getSenders().find(s=>

            s.track &&
            s.track.kind==="audio"

        );

        if(sender){

            sender.replaceTrack(audioTrack);

        }

    });

}

window.currentScreenTrack = screenTrack;

screenTrack.onended = () => {

    this.stop();

};

return this.stream;

                }catch(err){

            console.error("Screen Share Error:", err);

        }

    },

    async createScreenPeer(teacherSocketId){

    console.log("Creating Screen Peer:", teacherSocketId);

    const pc = new RTCPeerConnection({
    iceServers: [
        {
            urls: "stun:stun.l.google.com:19302"
        }
    ]
});

    screenPeers[teacherSocketId] = pc;

    pc.onicecandidate = (event)=>{

        if(event.candidate){

            socket.emit("ice-candidate",{

                targetSocketId: teacherSocketId,

                candidate: event.candidate

            });

        }

    };

    pc.ontrack = (event)=>{

        console.log("Screen Track Received");

    };

},

    async stop(){

        if(!this.stream) return;

        this.stream.getTracks().forEach(track=>track.stop());

        this.stream = null;

        this.socket.emit("screenShareStopped",{

            room:this.room

        });

        ParticipantLayout.hideScreenShare();

        const toolbar = document.getElementById("annotationToolbar");

if(toolbar){

    toolbar.style.display = "none";

}

        const screenVideo = document.getElementById("screenVideo");

if(screenVideo){

    screenVideo.pause();

    screenVideo.srcObject = null;

    screenVideo.style.display = "none";

}

screenCtx.clearRect(

    0,

    0,

    screenCanvas.width,

    screenCanvas.height

);

document.getElementById("participantStrip").style.display = "flex";

document.getElementById("localVideoBox").style.display = "block";

console.log("ScreenShare peers =", this.peers);
console.log("Peer count =", Object.keys(this.peers).length);

        Object.entries(this.peers).forEach(async ([socketId, peer])=>{

    const sender = peer.getSenders().find(s=>

        s.track &&
        s.track.kind==="video"

    );

    if(sender && window.localStream){

        const cameraTrack =
            window.localStream.getVideoTracks()[0];

        if(cameraTrack){

            await sender.replaceTrack(cameraTrack);

        }

    }

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    this.socket.emit({

    });

    this.socket.emit("offer",{

        targetSocketId: socketId,

        offer

    });

});

    }

};

window.ScreenShare = ScreenShare;
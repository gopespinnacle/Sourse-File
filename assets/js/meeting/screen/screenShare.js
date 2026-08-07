/*
==========================================================
Gopes Pinnacle Academy
Dedicated Screen Share Manager
==========================================================
*/

const ScreenShare = {

    socket: null,

    room: null,

    peers: null,

    role: null,

    screenPeers: {},

    pendingIce: {},

    stream: null,

    init(config){

        this.socket = config.socket;
        this.room = config.room;
        this.peers = config.peers;
        this.role = config.role;

    },

    async start(){

        if(this.role !== "teacher"){
            return;
        }

        try{

            this.stream =
            await navigator.mediaDevices.getDisplayMedia({

    video:{

        width:{ ideal:1920 },

        height:{ ideal:1080 },

        frameRate:{ ideal:30 }

    },

    audio:true

});

            window.currentScreenStream = this.stream;

DebugMeeting.success(
    "Teacher Screen Capture Granted"
);

DebugMeeting.log(
    "Screen Tracks",
    this.stream.getTracks().map(track => ({
        kind: track.kind,
        id: track.id,
        readyState: track.readyState
    }))
);

const screenVideo =
document.getElementById("screenVideo");

console.log("SCREEN VIDEO =", screenVideo);

if(!screenVideo){

    console.error("screenVideo NOT FOUND");

    return;

}

            screenVideo.srcObject = this.stream;

            await screenVideo.play();

            ParticipantLayout.showScreenShare();

DebugMeeting.step(
    "Broadcasting Screen Share Started"
);

this.socket.emit("screenShareStarted",{

    room:this.room

});

DebugMeeting.success(
    "Broadcast Sent"
);

            console.log("Current peers:", Object.keys(this.peers));

// Existing students will request screen automatically.
// Do nothing here.

            this.stream
                .getVideoTracks()[0]
                .onended = ()=>{

                    this.stop();

                };

        }catch(err){

            console.error(
                "Screen Share Error",
                err
            );

        }

    },

    async createTeacherPeer(studentSocketId){

        if (this.screenPeers[studentSocketId]) {

    console.log("Screen peer already exists:", studentSocketId);

    return;

}

        const pc = new RTCPeerConnection({

            iceServers:[
                {
                    urls:"stun:stun.l.google.com:19302"
                }
            ]

        });

        DebugMeeting.step(
    "Creating Screen Peer",
    studentSocketId
);

DebugMeeting.log(
    "Current Screen Peers",
    Object.keys(this.screenPeers)
);

        this.screenPeers[studentSocketId] = pc;

// Reuse the current screen stream when a student rejoins
if (this.stream) {

    this.stream.getTracks().forEach(track => {

        DebugMeeting.log(
            "Adding Track",
            {
                kind: track.kind,
                id: track.id
            }
        );

        pc.addTrack(track, this.stream);

    });

} else {

    console.log("No active screen stream");
    return;

}

        pc.onicecandidate=(event)=>{

            if(event.candidate){

                this.socket.emit("screen-ice-candidate",{

                    targetSocketId:studentSocketId,

                    candidate:event.candidate

                });

            }

        };

        DebugMeeting.step(
    "Creating WebRTC Offer",
    studentSocketId
);

        const offer =
        await pc.createOffer();

        await pc.setLocalDescription(offer);

        DebugMeeting.success(
    "Offer Created",
    studentSocketId
);

this.socket.emit("screen-offer",{

    targetSocketId:studentSocketId,

    offer

});

DebugMeeting.success(
    "Offer Sent",
    studentSocketId
);

    },

    async createStudentPeer(teacherSocketId){

        const pc = new RTCPeerConnection({

            iceServers:[
                {
                    urls:"stun:stun.l.google.com:19302"
                }
            ]

        });

        this.screenPeers[teacherSocketId] = pc;

        this.pendingIce[teacherSocketId] = [];

        pc.onicecandidate = (event)=>{

            if(event.candidate){

                this.socket.emit("screen-ice-candidate",{

                    targetSocketId:teacherSocketId,

                    candidate:event.candidate

                });

            }

        };

        pc.ontrack = (event)=>{

            console.log("Screen stream received");

            const screenVideo =
            document.getElementById("screenVideo");

            screenVideo.srcObject = event.streams[0];

screenVideo.autoplay = true;
screenVideo.playsInline = true;
screenVideo.muted = false;

screenVideo.onloadedmetadata = async () => {

    try{

        await screenVideo.play();

        console.log("✅ Screen video playing");

    }catch(err){

        console.error("Screen play failed:", err);

    }

    const container =
    document.getElementById("screenContainer");

    const ratio =
    screenVideo.videoWidth /
    screenVideo.videoHeight;

    if(ratio < 1.45){

        container.style.left="40px";
        container.style.right="140px";

    }else{

        container.style.left="0";
        container.style.right="140px";

    }

};

            if(window.ParticipantLayout &&
               typeof ParticipantLayout.showScreenShare==="function"){

                ParticipantLayout.showScreenShare();

            }

        };

        ScenarioDebugger.step(
    "Student Ready For Screen",
    teacherSocketId
);

this.socket.emit("screenPeerReady",{

    teacherSocketId

});

ScenarioDebugger.success(
    "screenPeerReady Sent",
    teacherSocketId
);

    },

    

    async handleOffer(data){

        ScenarioDebugger.socket(
    "screen-offer",
    data
);

ScenarioDebugger.step(
    "Processing Screen Offer"
);

        let pc = this.screenPeers[data.teacherSocketId];

        // Ignore duplicate offers
if (
    pc &&
    pc.signalingState === "stable" &&
    pc.remoteDescription
){

    ScenarioDebugger.warning(
        "Duplicate Screen Offer Ignored",
        data.teacherSocketId
    );

    return;

}

        if(!pc){

            await this.createStudentPeer(data.teacherSocketId);

            pc = this.screenPeers[data.teacherSocketId];

        }

        await pc.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );

        // Force playback after a student refreshes
const screenVideo = document.getElementById("screenVideo");

if (screenVideo) {

    screenVideo.autoplay = true;
    screenVideo.playsInline = true;
    screenVideo.muted = false;

    setTimeout(() => {

        screenVideo.play().catch(console.error);

    }, 300);

}

        ScenarioDebugger.success(
    "Remote Offer Applied"
);

        if(this.pendingIce[data.teacherSocketId]){

            for(const candidate of this.pendingIce[data.teacherSocketId]){

                await pc.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );

            }

            delete this.pendingIce[data.teacherSocketId];

        }

        ScenarioDebugger.step(
    "Creating Screen Answer"
);

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        ScenarioDebugger.success(
    "Screen Answer Created"
);

        this.socket.emit("screen-answer",{

            teacherSocketId:data.teacherSocketId,

            answer

        });

        ScenarioDebugger.success(
    "Screen Answer Sent"
);

    },

    async handleAnswer(data){

        ScenarioDebugger.socket(
    "screen-answer",
    data
);

ScenarioDebugger.step(
    "Teacher Received Screen Answer",
    data.studentSocketId
);

        const pc =
        this.screenPeers[data.studentSocketId];

        if(!pc){

    console.error(
    "Teacher Screen Peer Missing",
    data.studentSocketId
);

    return;

}

        if(!pc) return;

        try{

    await pc.setRemoteDescription(

        new RTCSessionDescription(data.answer)

    );

    ScenarioDebugger.success(
        "Teacher Applied Screen Answer",
        data.studentSocketId
    );

}catch(err){

    console.error(
    "Teacher Failed Applying Answer",
    err
);

    console.error(err);

}

    },

    async handleIceCandidate(data){

        ScenarioDebugger.socket(
    "screen-ice-candidate",
    data
);

        const pc =
        this.screenPeers[data.senderSocketId];

        if(!pc){

            if(!this.pendingIce[data.senderSocketId]){

                this.pendingIce[data.senderSocketId] = [];

            }

            this.pendingIce[data.senderSocketId].push(
                data.candidate
            );

            return;

        }

        if(pc.remoteDescription){

            await pc.addIceCandidate(

                

                new RTCIceCandidate(data.candidate)

            );
            ScenarioDebugger.success(
    "ICE Candidate Added",
    data.senderSocketId
);

        }else{

            if(!this.pendingIce[data.senderSocketId]){

                this.pendingIce[data.senderSocketId] = [];

            }

            this.pendingIce[data.senderSocketId].push(
                data.candidate
            );

        }

    },

    stop(){

        if(this.stream){

            this.stream.getTracks().forEach(track=>track.stop());

            this.stream = null;

        }

        Object.values(this.screenPeers).forEach(pc=>{

            try{

                pc.close();

            }catch(e){}

        });

        this.screenPeers = {};

        this.pendingIce = {};

        const screenVideo =
        document.getElementById("screenVideo");

        if(screenVideo){

            screenVideo.srcObject = null;

        }

        if(window.ParticipantLayout &&
           typeof ParticipantLayout.hideScreenShare==="function"){

            ParticipantLayout.hideScreenShare();

        }

        this.socket.emit("screenShareStopped",{

            room:this.room

        });

    }

};

window.ScreenShare = ScreenShare;
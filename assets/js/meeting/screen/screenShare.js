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

        this.stream = await navigator.mediaDevices.getDisplayMedia({

            video:true,
            audio:true

        });

        window.currentScreenStream = this.stream;

        const screenVideo =
        document.getElementById("screenVideo");

        if(screenVideo){

            screenVideo.srcObject = this.stream;

            await screenVideo.play();

        }

        if(window.ParticipantLayout){

            ParticipantLayout.showScreenShare();

        }

        this.socket.emit("screen-start",{

            room:this.room

        });

        console.log("Screen sharing started");

        this.stream.getVideoTracks()[0].onended = ()=>{

            this.stop();

        };

    }catch(err){

        console.error("Screen Share Error",err);

    }

},

    async createTeacherPeer(studentSocketId){

    console.log("Creating screen peer for:", studentSocketId);

    const pc = new RTCPeerConnection({

        iceServers:[
            {
                urls:"stun:stun.l.google.com:19302"
            }
        ]

    });

    this.screenPeers[studentSocketId] = pc;

    this.stream.getTracks().forEach(track=>{

        pc.addTrack(track,this.stream);

    });

    pc.onicecandidate = (event)=>{

        if(event.candidate){

            this.socket.emit("screen-ice",{

                targetSocketId:studentSocketId,

                candidate:event.candidate

            });

        }

    };

   const offer = await pc.createOffer();

console.log("Offer created");

await pc.setLocalDescription(offer);

console.log("Local description set");

console.log("Sending offer to:", studentSocketId);

this.socket.emit("screen-offer",{

    studentSocketId,

    offer

});

console.log("Offer emitted");

},

   async createStudentPeer(teacherSocketId){

    console.log("Creating student screen peer");

    const pc = new RTCPeerConnection({

        iceServers:[
            {
                urls:"stun:stun.l.google.com:19302"
            }
        ]

    });

    this.screenPeers[teacherSocketId] = pc;

    pc.onicecandidate = (event)=>{

        if(event.candidate){

            this.socket.emit("screen-ice",{

                targetSocketId:teacherSocketId,

                candidate:event.candidate

            });

        }

    };

    pc.ontrack = (event)=>{

    console.log("===== SCREEN TRACK RECEIVED =====");

    console.log(event);

    const screenVideo = document.getElementById("screenVideo");

    const screenContainer = document.getElementById("screenContainer");

    if(!screenVideo){

        console.error("screenVideo NOT FOUND");

        return;

    }

    if(!screenContainer){

        console.error("screenContainer NOT FOUND");

        return;

    }

    screenContainer.style.display = "block";

    screenContainer.style.visibility = "visible";

    screenContainer.style.opacity = "1";

    screenContainer.style.zIndex = "99999";

    screenVideo.srcObject = event.streams[0];

    console.log("SRC OBJECT =", screenVideo.srcObject);

setTimeout(()=>{

    console.log("VIDEO WIDTH =", screenVideo.videoWidth);

    console.log("VIDEO HEIGHT =", screenVideo.videoHeight);

    console.log("READY STATE =", screenVideo.readyState);

},2000);

    screenVideo.onloadedmetadata = async ()=>{

        console.log("VIDEO SIZE :",screenVideo.videoWidth,screenVideo.videoHeight);

        try{

            await screenVideo.play();

            console.log("SCREEN VIDEO PLAYING");

        }catch(err){

            console.error(err);

        }

    };

    if(window.ParticipantLayout){

        ParticipantLayout.showScreenShare();

    }

};

    this.socket.emit("screen-request",{

        teacherSocketId

    });

},

    async handleOffer(data){

    console.log("SCREEN OFFER RECEIVED");

    const pc = this.screenPeers[data.teacherSocketId];

    if(!pc){

        console.error("No screen peer");

        return;

    }

    await pc.setRemoteDescription(
        new RTCSessionDescription(data.offer)
    );

    console.log("REMOTE DESCRIPTION SET");

    if(this.pendingIce[data.teacherSocketId]){

    for(const candidate of this.pendingIce[data.teacherSocketId]){

        try{

            await pc.addIceCandidate(
                new RTCIceCandidate(candidate)
            );

        }catch(e){

            console.error(e);

        }

    }

    delete this.pendingIce[data.teacherSocketId];

}

    const answer =
    await pc.createAnswer();

    await pc.setLocalDescription(answer);
    console.log("LOCAL ANSWER SET");

    this.socket.emit("screen-answer",{

        targetSocketId:data.teacherSocketId,

        answer

    });

    console.log("SCREEN ANSWER SENT");

},

    async handleAnswer(data){

    console.log("SCREEN ANSWER RECEIVED");

    const pc = this.screenPeers[data.studentSocketId];

    if(!pc){

        console.error("No teacher screen peer");

        return;

    }

    if(pc.signalingState !== "have-local-offer"){

        console.warn(
            "Ignoring answer. State =",
            pc.signalingState
        );

        return;

    }

    await pc.setRemoteDescription(
        new RTCSessionDescription(data.answer)
    );

    if(this.pendingIce[data.studentSocketId]){

    for(const candidate of this.pendingIce[data.studentSocketId]){

        try{

            await pc.addIceCandidate(
                new RTCIceCandidate(candidate)
            );

        }catch(e){

            console.error(e);

        }

    }

    delete this.pendingIce[data.studentSocketId];

}

    console.log("SCREEN CONNECTED");

},

    async handleIceCandidate(data){

    const pc = this.screenPeers[data.senderSocketId];

    if(!pc){

        console.warn("Peer not ready");

        return;

    }

    if(!pc.remoteDescription){

        if(!this.pendingIce[data.senderSocketId]){

            this.pendingIce[data.senderSocketId] = [];

        }

        this.pendingIce[data.senderSocketId].push(
            data.candidate
        );

        console.log("ICE Queued");

        return;

    }

    try{

        await pc.addIceCandidate(

            new RTCIceCandidate(data.candidate)

        );

        console.log("ICE Added");

    }catch(err){

        console.error(err);

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

        this.socket.emit("screen-stop",{

    room:this.room

});

    }

};

window.ScreenShare = ScreenShare;
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

    await pc.setLocalDescription(offer);

    this.socket.emit("screen-offer",{

        studentSocketId,

        offer

    });

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

    pc.ontrack = async (event)=>{

        console.log("Screen track received");

        const screenVideo =
        document.getElementById("screenVideo");

        if(!screenVideo){

            console.error("screenVideo not found");

            return;

        }

        screenVideo.srcObject = event.streams[0];

        screenVideo.autoplay = true;
        screenVideo.playsInline = true;

        try{

            await screenVideo.play();

        }catch(err){

            console.error(err);

        }

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

    const answer =
    await pc.createAnswer();

    await pc.setLocalDescription(answer);

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

    console.log("SCREEN CONNECTED");

},

    async handleIceCandidate(data){

    const pc = this.screenPeers[data.senderSocketId];

    if(!pc){

        console.warn(
            "ICE received before peer exists"
        );

        return;

    }

    try{

        await pc.addIceCandidate(

            new RTCIceCandidate(data.candidate)

        );

    }catch(err){

        console.error(

            "ICE Error",

            err

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

        this.socket.emit("screen-stop",{

    room:this.room

});

    }

};

window.ScreenShare = ScreenShare;
/*
==========================================================
Gopes Pinnacle Academy
Screen Share Manager V3
==========================================================
*/

const ScreenShare = {

    socket:null,

    room:null,

    role:null,

    stream:null,

    screenPeers:{},

    pendingIce:{},

    init(config){

        this.socket = config.socket;

        this.room = config.room;

        this.role = config.role;

    },

    async start(){

        if(this.role !== "teacher") return;

        try{

            console.log("Starting Screen Share...");

            this.stream =
            await navigator.mediaDevices.getDisplayMedia({

                video:{
                    cursor:"always"
                },

                audio:true

            });

            const video =
            document.getElementById("screenVideo");

            if(video){

                video.srcObject = this.stream;

                video.muted = true;

                video.autoplay = true;

                video.playsInline = true;

                await video.play();

            }

            ParticipantLayout.showScreenShare();

            this.socket.emit("screen-start",{

                room:this.room

            });

            this.stream
            .getVideoTracks()[0]
            .onended = ()=>{

                this.stop();

            };

        }catch(err){

            console.error(err);

        }

    },

    async createTeacherPeer(studentSocketId){

        if(this.screenPeers[studentSocketId]){

            try{

                this.screenPeers[studentSocketId].close();

            }catch(e){}

            delete this.screenPeers[studentSocketId];

        }

        console.log(
            "Teacher Peer ->",
            studentSocketId
        );

        const pc =
        new RTCPeerConnection({

            iceServers:[
                {
                    urls:"stun:stun.l.google.com:19302"
                }
            ]

        });

        this.screenPeers[studentSocketId]=pc;

        this.stream.getTracks().forEach(track=>{

            pc.addTrack(track,this.stream);

        });

        pc.onicecandidate=(event)=>{

            if(event.candidate){

                this.socket.emit("screen-ice",{

                    targetSocketId:studentSocketId,

                    candidate:event.candidate

                });

            }

        };

        const offer =
        await pc.createOffer();

        await pc.setLocalDescription(offer);

        this.socket.emit("screen-offer",{

            studentSocketId,

            offer

        });

    },

        async createStudentPeer(teacherSocketId){

        if(this.screenPeers[teacherSocketId]){

            try{

                this.screenPeers[teacherSocketId].close();

            }catch(e){}

            delete this.screenPeers[teacherSocketId];

        }

        console.log(
            "Student Peer ->",
            teacherSocketId
        );

        const pc =
        new RTCPeerConnection({

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

        pc.ontrack = async(event)=>{

            console.log("SCREEN TRACK RECEIVED");

            const video =
            document.getElementById("screenVideo");

            if(!video){

                console.error("screenVideo missing");

                return;

            }

            video.srcObject = event.streams[0];

            video.autoplay = true;

            video.playsInline = true;

            try{

                await video.play();

            }catch(err){

                console.error(
                    "Screen video play error:",
                    err
                );

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

        const pc =
        this.screenPeers[data.teacherSocketId];

        if(!pc){

            console.error(
                "Student screen peer missing"
            );

            return;

        }

        await pc.setRemoteDescription(

            new RTCSessionDescription(
                data.offer
            )

        );

        console.log(
            "Student remote description set"
        );

        if(this.pendingIce[data.teacherSocketId]){

            for(
                const candidate
                of this.pendingIce[data.teacherSocketId]
            ){

                try{

                    await pc.addIceCandidate(

                        new RTCIceCandidate(
                            candidate
                        )

                    );

                }catch(err){

                    console.error(
                        "Queued ICE error:",
                        err
                    );

                }

            }

            delete this.pendingIce[
                data.teacherSocketId
            ];

        }

        const answer =
        await pc.createAnswer();

        await pc.setLocalDescription(answer);

        this.socket.emit("screen-answer",{

            targetSocketId:
                data.teacherSocketId,

            answer

        });

        console.log(
            "SCREEN ANSWER SENT"
        );

    },

    async handleAnswer(data){

        console.log("SCREEN ANSWER RECEIVED");

        const pc =
        this.screenPeers[data.studentSocketId];

        if(!pc){

            console.error(
                "Teacher screen peer missing"
            );

            return;

        }

        await pc.setRemoteDescription(

            new RTCSessionDescription(
                data.answer
            )

        );

        console.log(
            "TEACHER SCREEN CONNECTION READY"
        );

    },

    async handleIceCandidate(data){

        const socketId =
            data.senderSocketId ||
            data.teacherSocketId ||
            data.studentSocketId;

        if(!socketId){

            console.warn(
                "Screen ICE has no sender socket ID"
            );

            return;

        }

        const pc =
        this.screenPeers[socketId];

        if(!pc){

            if(!this.pendingIce[socketId]){

                this.pendingIce[socketId] = [];

            }

            this.pendingIce[socketId].push(
                data.candidate
            );

            console.log(
                "ICE queued - peer not ready"
            );

            return;

        }

        if(!pc.remoteDescription){

            if(!this.pendingIce[socketId]){

                this.pendingIce[socketId] = [];

            }

            this.pendingIce[socketId].push(
                data.candidate
            );

            console.log(
                "ICE queued - remote description not ready"
            );

            return;

        }

        try{

            await pc.addIceCandidate(

                new RTCIceCandidate(
                    data.candidate
                )

            );

            console.log(
                "SCREEN ICE ADDED"
            );

        }catch(err){

            console.error(
                "SCREEN ICE ERROR:",
                err
            );

        }

    },

        stop(notifyServer = true){

        console.log("Stopping Screen Share");

        if(this.stream){

            this.stream
                .getTracks()
                .forEach(track=>{

                    try{

                        track.stop();

                    }catch(e){}

                });

            this.stream = null;

        }

        Object.values(this.screenPeers)
            .forEach(pc=>{

                try{

                    pc.close();

                }catch(e){}

            });

        this.screenPeers = {};

        this.pendingIce = {};

        const video =
        document.getElementById("screenVideo");

        if(video){

            try{

                video.pause();

            }catch(e){}

            video.srcObject = null;

        }

        if(
            window.ParticipantLayout &&
            typeof ParticipantLayout.hideScreenShare ===
            "function"
        ){

            ParticipantLayout.hideScreenShare();

        }

        if(notifyServer && this.socket){

    this.socket.emit("screen-stop",{

        room:this.room

    });

}

        console.log(
            "SCREEN SHARE STOPPED"
        );

    }

};

window.ScreenShare = ScreenShare;
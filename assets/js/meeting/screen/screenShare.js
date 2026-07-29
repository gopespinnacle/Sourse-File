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

                video:true,
                audio:true

            });

            window.currentScreenStream = this.stream;

            const screenVideo =
            document.getElementById("screenVideo");

            screenVideo.srcObject = this.stream;

            await screenVideo.play();

            ParticipantLayout.showScreenShare();

            this.socket.emit("screenShareStarted",{

                room:this.room

            });

            Object.keys(this.peers).forEach((socketId)=>{

                this.socket.emit("startScreenPeer",{

                    room:this.room,

                    targetSocketId:socketId,

                    teacherSocketId:this.socket.id

                });

            });

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

        pc.onicecandidate=(event)=>{

            if(event.candidate){

                this.socket.emit("screen-ice-candidate",{

                    targetSocketId:studentSocketId,

                    candidate:event.candidate

                });

            }

        };

        const offer =
        await pc.createOffer();

        await pc.setLocalDescription(offer);

        this.socket.emit("screen-offer",{

            targetSocketId:studentSocketId,

            offer

        });

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

            screenVideo.play();

            if(window.ParticipantLayout &&
               typeof ParticipantLayout.showScreenShare==="function"){

                ParticipantLayout.showScreenShare();

            }

        };

        this.socket.emit("screenPeerReady",{

            teacherSocketId

        });

    },

    async handleOffer(data){

        let pc = this.screenPeers[data.teacherSocketId];

        if(!pc){

            await this.createStudentPeer(data.teacherSocketId);

            pc = this.screenPeers[data.teacherSocketId];

        }

        await pc.setRemoteDescription(
            new RTCSessionDescription(data.offer)
        );

        if(this.pendingIce[data.teacherSocketId]){

            for(const candidate of this.pendingIce[data.teacherSocketId]){

                await pc.addIceCandidate(
                    new RTCIceCandidate(candidate)
                );

            }

            delete this.pendingIce[data.teacherSocketId];

        }

        const answer = await pc.createAnswer();

        await pc.setLocalDescription(answer);

        this.socket.emit("screen-answer",{

            teacherSocketId:data.teacherSocketId,

            answer

        });

    },

    async handleAnswer(data){

        const pc =
        this.screenPeers[data.studentSocketId];

        if(!pc) return;

        await pc.setRemoteDescription(

            new RTCSessionDescription(data.answer)

        );

    },

    async handleIceCandidate(data){

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
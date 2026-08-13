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


    /* =====================================================
       STUDENT RECEIVES TEACHER SCREEN
       ===================================================== */

    pc.ontrack = async (event) => {

        console.log(
            "================================="
        );

        console.log(
            "SCREEN TRACK RECEIVED"
        );

        console.log(
            "SCREEN STREAM:",
            event.streams[0]
        );

        console.log(
            "SCREEN TRACK:",
            event.track
        );

        console.log(
            "================================="
        );


        const track = event.track;

        if(!track){

            console.error(
                "SCREEN TRACK MISSING"
            );

            return;

        }


        const video =
        document.getElementById("screenVideo");


        if(!video){

            console.error(
                "screenVideo element NOT FOUND"
            );

            return;

        }


        /*
        =====================================================
        USE THE ACTUAL REMOTE STREAM
        =====================================================
        */

        let remoteStream =
            event.streams && event.streams[0];


        /*
        =====================================================
        FALLBACK
        =====================================================
        */

        if(!remoteStream){

            remoteStream =
            new MediaStream();

            remoteStream.addTrack(track);

        }


        console.log(
            "ATTACHING REMOTE SCREEN STREAM"
        );


        video.srcObject =
        remoteStream;

        video.autoplay = true;

        video.playsInline = true;

        video.muted = true;


        /*
        =====================================================
        SHOW SCREEN CONTAINER
        =====================================================
        */

        const container =
        document.getElementById(
            "screenContainer"
        );


        if(container){

            container.style.display =
            "block";

        }


        /*
        =====================================================
        HIDE WHITEBOARD
        =====================================================
        */

        const mainBoard =
        document.getElementById(
            "mainBoard"
        );

        const drawLayer =
        document.getElementById(
            "drawLayer"
        );


        if(mainBoard){

            mainBoard.style.display =
            "none";

        }


        if(drawLayer){

            drawLayer.style.display =
            "none";

        }


        /*
        =====================================================
        PLAY SCREEN
        =====================================================
        */

        try{

            await video.play();

            console.log(
                "STUDENT SCREEN VIDEO PLAYING"
            );

        }catch(err){

            console.error(
                "STUDENT SCREEN VIDEO PLAY ERROR:",
                err
            );

        }


        /*
        =====================================================
        SCREEN LAYOUT
        =====================================================
        */

        if(
            window.ScreenLayout &&
            typeof ScreenLayout.attachRemoteTrack ===
            "function"
        ){

            try{

                ScreenLayout.attachRemoteTrack(
                    track
                );

                console.log(
                    "SCREEN ATTACHED THROUGH ScreenLayout"
                );

            }catch(err){

                console.error(
                    "ScreenLayout attach error:",
                    err
                );

            }

        }


        /*
        =====================================================
        PARTICIPANT LAYOUT
        =====================================================
        */

        /*
=========================================================
FORCE SCREEN SHARE TO FRONT
=========================================================
*/

const screenContainer =
    document.getElementById("screenContainer");

const screenVideo =
    document.getElementById("screenVideo");

if(screenContainer){

    screenContainer.style.setProperty(
        "display",
        "block",
        "important"
    );

    screenContainer.style.setProperty(
        "visibility",
        "visible",
        "important"
    );

    screenContainer.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    screenContainer.style.setProperty(
        "z-index",
        "9999999",
        "important"
    );

}

if(screenVideo){

    screenVideo.style.setProperty(
        "display",
        "block",
        "important"
    );

    screenVideo.style.setProperty(
        "visibility",
        "visible",
        "important"
    );

    screenVideo.style.setProperty(
        "opacity",
        "1",
        "important"
    );

    screenVideo.style.setProperty(
        "z-index",
        "99999999",
        "important"
    );

    screenVideo.style.setProperty(
        "width",
        "100%",
        "important"
    );

    screenVideo.style.setProperty(
        "height",
        "100%",
        "important"
    );

    screenVideo.style.setProperty(
        "object-fit",
        "contain",
        "important"
    );

}

console.log(
    "SCREEN SHARE FORCED TO FRONT"
);

    };


    /*
    =========================================================
    ICE CANDIDATES
    =========================================================
    */

    pc.onicecandidate = (event)=>{

        if(event.candidate){

            this.socket.emit(
                "screen-ice",
                {

                    targetSocketId:
                        teacherSocketId,

                    candidate:
                        event.candidate

                }
            );

        }

    };


    /*
    =========================================================
    IMPORTANT:
    ASK TEACHER FOR CURRENT SCREEN
    =========================================================
    */

    console.log(
        "REQUESTING TEACHER SCREEN"
    );


    this.socket.emit(
        "screen-request",
        {

            teacherSocketId:
                teacherSocketId

        }
    );

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
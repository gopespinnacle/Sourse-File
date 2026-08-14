/*
===========================================================
Gopes Pinnacle Academy
Virtual Classroom V2
Meeting WebRTC Engine
Part 1
===========================================================
*/

window.MeetingWebRTC = (() => {

    /*
    ===========================================================
    CONFIGURATION
    ===========================================================
    */

    const rtcConfig = {

        iceServers: [

            {
                urls: [
                    "stun:stun.l.google.com:19302",
                    "stun:stun1.l.google.com:19302"
                ]
            },

            {
                urls: "turn:openrelay.metered.ca:80",
                username: "openrelayproject",
                credential: "openrelayproject"
            },

            {
                urls: "turn:openrelay.metered.ca:443",
                username: "openrelayproject",
                credential: "openrelayproject"
            }

        ],

        iceCandidatePoolSize: 10

    };

    /*
    ===========================================================
    GLOBAL VARIABLES
    ===========================================================
    */

    let localStream = null;

    let screenStream = null;

    let peers = {};

let remoteStreams = {};


/*
===========================================================
OFFER STATE
===========================================================
*/

let makingOffer = {};

let pendingIceCandidates = {};

let roomId = "";

    let role = "";

    let userName = "";

    let userId = "";

    let initialized = false;

    /*
    ===========================================================
    INITIALIZE
    ===========================================================
    */

    async function initialize(options = {}) {

        roomId = options.room || "";

        role = options.role || "";

        userName = options.name || "";

        userId = options.userId || "";

        MeetingUtils.success(
            "Meeting Initialize",
            {
                roomId,
                role,
                userName,
                userId
            }
        );

        /*
===========================================================
USE MEDIA MANAGER V2 LOCAL STREAM
===========================================================
*/

if (
    window.MediaManagerV2 &&
    typeof MediaManagerV2.getLocalStream === "function"
) {

    localStream =
        MediaManagerV2.getLocalStream();


    console.log(
        "WEBRTC LOCAL STREAM:",
        localStream
    );

}

        initialized = true;

        

    }

    /*
    ===========================================================
    LOCAL MEDIA
    ===========================================================
    */

    async function startCamera() {

    /*
    ===========================================================
    USE MEDIA MANAGER V2
    ===========================================================
    */

    if (
        window.MediaManagerV2 &&
        typeof MediaManagerV2.getLocalStream === "function"
    ) {

        const existingStream =
            MediaManagerV2.getLocalStream();


        if (existingStream) {

            localStream =
                existingStream;

            console.log(
                "WEBRTC USING EXISTING MEDIA V2 STREAM"
            );

            return localStream;

        }


        /*
        -------------------------------------------------------
        If MediaManagerV2 has not started yet,
        start it here.
        -------------------------------------------------------
        */

        if (
            typeof MediaManagerV2.startMedia === "function"
        ) {

            localStream =
                await MediaManagerV2.startMedia();

            console.log(
                "WEBRTC RECEIVED MEDIA V2 STREAM"
            );

            return localStream;

        }

    }


    /*
    ===========================================================
    FALLBACK
    ===========================================================

    This is only a safety fallback.
    Normally MediaManagerV2 should provide the stream.
    ===========================================================
    */

    if (localStream) {

        return localStream;

    }


    localStream =
        await navigator.mediaDevices.getUserMedia({

            video: {

                width: 1280,

                height: 720,

                frameRate: 30

            },

            audio: {

                echoCancellation: true,

                noiseSuppression: true,

                autoGainControl: true

            }

        });


    MeetingUtils.success(
        "Camera Started"
    );


    return localStream;

}

    /*
    ===========================================================
    GET LOCAL STREAM
    ===========================================================
    */

    function getLocalStream() {

        return localStream;

    }

    /*
===========================================================
SET LOCAL STREAM
Connect MediaManagerV2 camera to WebRTC
===========================================================
*/

function setLocalStream(stream) {

    if (!stream) {

        console.warn(
            "MeetingWebRTC: local stream is missing."
        );

        return;

    }


    localStream =
        stream;


    console.log(
        "MeetingWebRTC: LOCAL STREAM CONNECTED"
    );


    console.log(
        "Video tracks:",
        localStream.getVideoTracks()
    );


    console.log(
        "Audio tracks:",
        localStream.getAudioTracks()
    );

}

    /*
    ===========================================================
    GET SCREEN STREAM
    ===========================================================
    */

    function getScreenStream() {

        return screenStream;

    }

    /*
    ===========================================================
    GET PEERS
    ===========================================================
    */

    function getPeers() {

        return peers;

    }

    /*
    ===========================================================
    GET REMOTE STREAMS
    ===========================================================
    */

    function getRemoteStreams() {

        return remoteStreams;

    }

    /*
    ===========================================================
    IS INITIALIZED
    ===========================================================
    */

    function isInitialized() {

        return initialized;

    }

    /*
    ===========================================================
    EXPORT
    ===========================================================
    */

        /*
    ===========================================================
    CREATE PEER CONNECTION
    ===========================================================
    */

    async function createPeerConnection(remoteSocketId) {

        if (peers[remoteSocketId]) {

            return peers[remoteSocketId];

        }

        const peer = new RTCPeerConnection(rtcConfig);

        peers[remoteSocketId] = peer;

        if (localStream) {

            localStream.getTracks().forEach(track => {

                peer.addTrack(track, localStream);

            });

        }

        peer.onicecandidate = (event) => {

            if (!event.candidate) return;

            MeetingSocket.emit("ice-candidate", {

                targetSocketId: remoteSocketId,

                candidate: event.candidate

            });

        };

        peer.ontrack = (event) => {

    remoteStreams[remoteSocketId] = event.streams[0];

    if(window.teacherSharing){

        const videoTrack =
            event.streams[0]
                .getVideoTracks()[0];

        if(videoTrack){

            ScreenLayout.attachRemoteTrack(videoTrack);

        }

        return;

    }

    document.dispatchEvent(

        new CustomEvent("meeting:remoteStream",{

            detail:{

                socketId:remoteSocketId,

                stream:event.streams[0]

            }

        })

    );

};

        peer.onconnectionstatechange = () => {

            MeetingUtils.log(

                "Connection State",

                peer.connectionState

            );

            if (peer.connectionState === "failed") {

                peer.restartIce();

            }

        };

        return peer;

    }

    /*
    ===========================================================
    CREATE OFFER
    ===========================================================
    */

    async function createOffer(remoteSocketId) {

    if (!remoteSocketId) {

        return;

    }


    /*
    =========================================================
    PREVENT DUPLICATE OFFERS
    =========================================================
    */

    if (makingOffer[remoteSocketId]) {

        console.log(
            "WEBRTC OFFER ALREADY IN PROGRESS:",
            remoteSocketId
        );

        return;

    }


    makingOffer[remoteSocketId] = true;


    try {

        const peer =
            await createPeerConnection(
                remoteSocketId
            );


        /*
        =====================================================
        MAKE SURE PEER IS STABLE
        =====================================================
        */

        if (
            peer.signalingState !== "stable"
        ) {

            console.log(
                "WEBRTC PEER NOT STABLE:",
                remoteSocketId,
                peer.signalingState
            );

            return;

        }


        /*
        =====================================================
        CREATE OFFER
        =====================================================
        */

        const offer =
            await peer.createOffer({

                offerToReceiveAudio: true,

                offerToReceiveVideo: true

            });


        await peer.setLocalDescription(
            offer
        );


        console.log(
            "WEBRTC OFFER CREATED:",
            remoteSocketId
        );


        /*
        =====================================================
        SEND OFFER
        =====================================================
        */

        MeetingSocket.emit(
            "offer",
            {

                targetSocketId:
                    remoteSocketId,

                offer:
                    peer.localDescription

            }
        );


        console.log(
            "WEBRTC OFFER SENT:",
            remoteSocketId
        );

    }

    catch (error) {

        console.error(
            "WEBRTC CREATE OFFER ERROR:",
            remoteSocketId,
            error
        );

    }

    finally {

        makingOffer[remoteSocketId] =
            false;

    }

}
    /*
    ===========================================================
    RECEIVE OFFER
    ===========================================================
    */

    async function receiveOffer(remoteSocketId, offer) {

    /*
    ===========================================================
    RECEIVE OFFER
    ===========================================================

    IMPORTANT:

    The student may receive the teacher's offer BEFORE
    MediaManagerV2 has finished creating the student's
    local camera stream.

    If we create the PeerConnection before the local
    stream exists, createPeerConnection() cannot add the
    student's camera/microphone tracks.

    Therefore:

    1. Make sure local media exists FIRST
    2. THEN create PeerConnection
    3. THEN set teacher's offer
    4. THEN create answer

    ===========================================================
    */


    console.log(
        "=========================================="
    );

    console.log(
        "WEBRTC RECEIVE OFFER"
    );

    console.log(
        "Remote Socket:",
        remoteSocketId
    );

    console.log(
        "Local Stream Before:",
        localStream
    );

    console.log(
        "=========================================="
    );


    /*
    ===========================================================
    MAKE SURE LOCAL CAMERA/MICROPHONE EXISTS
    ===========================================================
    */

    if (!localStream) {

        console.log(
            "WEBRTC LOCAL STREAM NOT READY"
        );

        console.log(
            "Starting MediaManagerV2 before answering..."
        );


        try {

            localStream =
                await startCamera();


        }
        catch (error) {

            console.error(
                "WEBRTC FAILED TO START LOCAL MEDIA:",
                error
            );

            throw error;

        }

    }


    /*
    ===========================================================
    CHECK LOCAL STREAM
    ===========================================================
    */

    if (!localStream) {

        throw new Error(
            "Cannot answer WebRTC offer: local media stream is unavailable."
        );

    }


    console.log(
        "WEBRTC LOCAL STREAM READY BEFORE PEER CREATION:",
        localStream
    );


    console.log(
        "VIDEO TRACKS:",
        localStream.getVideoTracks()
    );


    console.log(
        "AUDIO TRACKS:",
        localStream.getAudioTracks()
    );


    /*
    ===========================================================
    CREATE PEER CONNECTION
    ===========================================================

    IMPORTANT:

    This MUST happen AFTER localStream exists.

    createPeerConnection() adds the local tracks here.
    ===========================================================
    */

    const peer =
        await createPeerConnection(
            remoteSocketId
        );


    /*
    ===========================================================
    SET REMOTE DESCRIPTION
    ===========================================================
    */

    await peer.setRemoteDescription(

        new RTCSessionDescription(
            offer
        )

    );

    /*
===========================================================
PROCESS QUEUED ICE CANDIDATES
===========================================================
*/

if (
    pendingIceCandidates[
        remoteSocketId
    ]
) {

    console.log(
        "WEBRTC PROCESSING QUEUED ICE:",
        remoteSocketId
    );


    for (
        const candidate
        of pendingIceCandidates[
            remoteSocketId
        ]
    ) {

        try {

            await peer.addIceCandidate(

                new RTCIceCandidate(
                    candidate
                )

            );

        }

        catch (error) {

            console.error(
                "WEBRTC QUEUED ICE ERROR:",
                error
            );

        }

    }


    delete pendingIceCandidates[
        remoteSocketId
    ];

}


    console.log(
        "WEBRTC REMOTE OFFER SET"
    );


    /*
    ===========================================================
    CREATE ANSWER
    ===========================================================
    */

    const answer =
        await peer.createAnswer();


    /*
    ===========================================================
    SET LOCAL DESCRIPTION
    ===========================================================
    */

    await peer.setLocalDescription(
        answer
    );


    console.log(
        "WEBRTC ANSWER CREATED"
    );


    /*
    ===========================================================
    SEND ANSWER
    ===========================================================
    */

    MeetingSocket.emit(
        "answer",
        {

            teacherSocketId:
                remoteSocketId,

            answer:
                answer

        }
    );


    console.log(
        "WEBRTC ANSWER SENT"
    );


    console.log(
        "=========================================="
    );

}

    /*
    ===========================================================
    RECEIVE ANSWER
    ===========================================================
    */

    async function receiveAnswer(remoteSocketId, answer) {

        const peer = peers[remoteSocketId];

        if (!peer) return;

        await peer.setRemoteDescription(

            new RTCSessionDescription(answer)

        );

    }

    /*
    ===========================================================
    RECEIVE ICE
    ===========================================================
    */

    async function receiveIce(
    remoteSocketId,
    candidate
) {

    if (!remoteSocketId || !candidate) {

        return;

    }


    const peer =
        peers[remoteSocketId];


    /*
    =========================================================
    PEER NOT READY
    QUEUE ICE
    =========================================================
    */

    if (!peer) {

        console.log(
            "WEBRTC ICE QUEUED - PEER NOT READY:",
            remoteSocketId
        );


        if (
            !pendingIceCandidates[
                remoteSocketId
            ]
        ) {

            pendingIceCandidates[
                remoteSocketId
            ] = [];

        }


        pendingIceCandidates[
            remoteSocketId
        ].push(
            candidate
        );


        return;

    }


    /*
    =========================================================
    REMOTE DESCRIPTION NOT READY
    QUEUE ICE
    =========================================================
    */

    if (
        !peer.remoteDescription ||
        !peer.remoteDescription.type
    ) {

        console.log(
            "WEBRTC ICE QUEUED - REMOTE DESCRIPTION NOT READY:",
            remoteSocketId
        );


        if (
            !pendingIceCandidates[
                remoteSocketId
            ]
        ) {

            pendingIceCandidates[
                remoteSocketId
            ] = [];

        }


        pendingIceCandidates[
            remoteSocketId
        ].push(
            candidate
        );


        return;

    }


    /*
    =========================================================
    ADD ICE
    =========================================================
    */

    try {

        await peer.addIceCandidate(

            new RTCIceCandidate(
                candidate
            )

        );


        console.log(
            "WEBRTC ICE ADDED:",
            remoteSocketId
        );

    }

    catch (error) {

        console.error(
            "WEBRTC ICE ERROR:",
            error
        );

    }

}

    /*
    ===========================================================
    EXPORT
    ===========================================================
    */

        /*
    ===========================================================
    REMOVE PEER
    ===========================================================
    */

    function removePeer(remoteSocketId){

        const peer = peers[remoteSocketId];

        if(peer){

            peer.close();

            delete peers[remoteSocketId];

        }

        delete remoteStreams[remoteSocketId];

        delete pendingIceCandidates[remoteSocketId];

delete makingOffer[remoteSocketId];

        document.dispatchEvent(

            new CustomEvent("meeting:participantLeft",{

                detail:{
                    socketId:remoteSocketId
                }

            })

        );

    }

    /*
    ===========================================================
    REMOVE ALL PEERS
    ===========================================================
    */

    function removeAllPeers(){

        Object.keys(peers).forEach(removePeer);

    }

    /*
    ===========================================================
    REPLACE VIDEO TRACK
    ===========================================================
    */

    async function replaceVideoTrack(track){

        Object.values(peers).forEach(peer=>{

            const sender = peer.getSenders().find(sender=>

                sender.track &&
                sender.track.kind==="video"

            );

            if(sender){

                sender.replaceTrack(track);

            }

        });

    }

    /*
    ===========================================================
    REPLACE AUDIO TRACK
    ===========================================================
    */

    async function replaceAudioTrack(track){

        Object.values(peers).forEach(peer=>{

            const sender = peer.getSenders().find(sender=>

                sender.track &&
                sender.track.kind==="audio"

            );

            if(sender){

                sender.replaceTrack(track);

            }

        });

    }

    /*
    ===========================================================
    GET PARTICIPANT COUNT
    ===========================================================
    */

    function getParticipantCount(){

        return Object.keys(peers).length;

    }

    /*
    ===========================================================
    EXPORT
    ===========================================================
    */

        /*
    ===========================================================
    RESTART ICE
    ===========================================================
    */

    async function restartIce(remoteSocketId){

        const peer = peers[remoteSocketId];

        if(!peer) return;

        try{

            const offer = await peer.createOffer({

                iceRestart:true

            });

            await peer.setLocalDescription(offer);

            MeetingSocket.emit("offer",{

                targetSocketId:remoteSocketId,

                offer

            });

        }catch(err){

            console.error(err);

        }

    }

    /*
    ===========================================================
    CAMERA ENABLE / DISABLE
    ===========================================================
    */

    function enableCamera(enabled){

        if(!localStream) return;

        localStream.getVideoTracks().forEach(track=>{

            track.enabled = enabled;

        });

    }

    /*
    ===========================================================
    MICROPHONE ENABLE / DISABLE
    ===========================================================
    */

    function enableMicrophone(enabled){

        if(!localStream) return;

        localStream.getAudioTracks().forEach(track=>{

            track.enabled = enabled;

        });

    }

    /*
    ===========================================================
    START SCREEN SHARE
    ===========================================================
    */

    async function startScreenShare(){

        screenStream = await navigator.mediaDevices.getDisplayMedia({

            video:true,

            audio:true

        });

        const track = screenStream.getVideoTracks()[0];

        await replaceVideoTrack(track);

        track.onended = async()=>{

            await stopScreenShare();

        };

        return screenStream;

    }

    /*
    ===========================================================
    STOP SCREEN SHARE
    ===========================================================
    */

    async function stopScreenShare(){

        if(!screenStream) return;

        screenStream.getTracks().forEach(track=>{

            track.stop();

        });

        screenStream = null;

        if(localStream){

            await replaceVideoTrack(

                localStream.getVideoTracks()[0]

            );

        }

    }

    /*
    ===========================================================
    CLOSE EVERYTHING
    ===========================================================
    */

    function destroy(){

        removeAllPeers();

        if(localStream){

            localStream.getTracks().forEach(track=>{

                track.stop();

            });

        }

        if(screenStream){

            screenStream.getTracks().forEach(track=>{

                track.stop();

            });

        }

        localStream = null;

        screenStream = null;

    }

    /*
    ===========================================================
    EXPORT
    ===========================================================
    */

    return {

        initialize,

        startCamera,

        getLocalStream,

setLocalStream,

getScreenStream,

        getPeers,

        getRemoteStreams,

        isInitialized,

        createPeerConnection,

        createOffer,

        receiveOffer,

        receiveAnswer,

        receiveIce,

        removePeer,

        removeAllPeers,

        replaceVideoTrack,

        replaceAudioTrack,

        getParticipantCount,

        restartIce,

        enableCamera,

        enableMicrophone,

        startScreenShare,

        stopScreenShare,

        destroy,

        rtcConfig

    };

})();


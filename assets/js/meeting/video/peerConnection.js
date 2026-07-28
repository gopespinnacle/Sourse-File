/*
====================================================
Peer Manager
====================================================
*/

const PeerManager = {

    peers: {},

    async create(socketId, localStream){

        console.log("CREATE PEER CALLED FOR:", socketId);

        if(this.peers[socketId]){

            return this.peers[socketId];

        }

        const pc = new RTCPeerConnection({

            iceServers: VIDEO_CONFIG.ICE_SERVERS

        });

        this.peers[socketId] = pc;

        if(localStream){

            localStream.getTracks().forEach(track=>{

                pc.addTrack(track,localStream);

            });

        }

        return pc;

    },

    get(socketId){

        return this.peers[socketId];

    },

    remove(socketId){

        if(!this.peers[socketId]) return;

        try{

            this.peers[socketId].close();

        }catch(e){}

        delete this.peers[socketId];

    }

};
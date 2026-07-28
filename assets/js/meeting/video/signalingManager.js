/*
=========================================================
Signaling Manager
Handles Offer / Answer / ICE
=========================================================
*/

const SignalingManager = {

    initialize() {

        console.log("Signaling Manager Ready");

    },

    sendOffer(socketId, offer) {

        console.log("Sending Offer :", socketId);

        SocketManager.getSocket().emit("offer", {

            target: socketId,

            offer

        });

    },

    sendAnswer(socketId, answer) {

        console.log("Sending Answer :", socketId);

        SocketManager.getSocket().emit("answer", {

            target: socketId,

            answer

        });

    },

    sendIceCandidate(socketId, candidate) {

        console.log("Sending ICE Candidate :", socketId);

        SocketManager.getSocket().emit("ice-candidate", {

            target: socketId,

            candidate

        });

    }

};
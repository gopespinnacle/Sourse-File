/*
=========================================================
Stream Manager
=========================================================
*/

const StreamManager = {

    localStream: null,

    remoteStreams: {},

    setLocal(stream) {

        this.localStream = stream;

        console.log("Local Stream Saved");

    },

    getLocal() {

        return this.localStream;

    },

    addRemote(socketId, stream) {

        this.remoteStreams[socketId] = stream;

        console.log("Remote Stream Added :", socketId);

    },

    getRemote(socketId) {

        return this.remoteStreams[socketId];

    },

    removeRemote(socketId) {

        delete this.remoteStreams[socketId];

        console.log("Remote Stream Removed :", socketId);

    },

    removeAllRemote() {

        this.remoteStreams = {};

        console.log("All Remote Streams Removed");

    }

};

window.StreamManager = StreamManager;
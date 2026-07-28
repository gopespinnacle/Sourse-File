/*
=========================================================
Participant Manager
=========================================================
*/

const ParticipantManager = {

    participants: {},

    add(socketId, data = {}) {

        if (this.participants[socketId]) {

            console.log("Participant already exists :", socketId);

            return this.participants[socketId];

        }

        this.participants[socketId] = {

            socketId,

            name: data.name || "Unknown",

            role: data.role || "student",

            video: null,

            peer: null

        };

        console.log("Participant Added :", socketId);

        return this.participants[socketId];

    },

    get(socketId) {

        return this.participants[socketId];

    },

    remove(socketId) {

        if (!this.participants[socketId]) {

            return;

        }

        delete this.participants[socketId];

        console.log("Participant Removed :", socketId);

    },

    getAll() {

        return this.participants;

    }

};

window.ParticipantManager = ParticipantManager;
/*
==========================================================
GOPES PINNACLE ACADEMY
MEETING PARTICIPANTS V2
==========================================================
*/

const MeetingParticipants = {

    participants: {},


    /*
    ======================================================
    ADD / UPDATE
    ======================================================
    */

    set(participant) {

        if (!participant) return;

        if (!participant.socketId) return;

        this.participants[
            participant.socketId
        ] = participant;

    },


    /*
    ======================================================
    REMOVE
    ======================================================
    */

    remove(socketId) {

        if (!socketId) return;

        delete this.participants[
            socketId
        ];

    },


    /*
    ======================================================
    CLEAR
    ======================================================
    */

    clear() {

        this.participants = {};

    },


    /*
    ======================================================
    GET ALL
    ======================================================
    */

    getAll() {

        return Object.values(
            this.participants
        );

    },


    /*
    ======================================================
    FIND
    ======================================================
    */

    get(socketId) {

        return this.participants[
            socketId
        ] || null;

    },


    /*
    ======================================================
    SORT

    Founder
    Teacher
    Student
    ======================================================
    */

    sorted() {

        const order = {

            founder: 1,

            teacher: 2,

            student: 3

        };


        return this.getAll()
            .sort(
                (a, b) =>
                    (order[a.role] || 9) -
                    (order[b.role] || 9)
            );

    }

};


window.MeetingParticipants =
    MeetingParticipants;
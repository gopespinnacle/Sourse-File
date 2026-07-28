/*
=========================================================
Meeting Controller
Controls the complete meeting lifecycle
=========================================================
*/

const MeetingController = {

    room: null,

    role: null,

    name: null,

    studentId: null,

    periodId: null,

    async start(config) {

        console.log("=================================");
        console.log("Starting Meeting");
        console.log("=================================");

        this.room = config.room;
        this.role = config.role;
        this.name = config.name;
        this.studentId = config.studentId || null;
        this.periodId = config.periodId || null;

        SocketManager.connect(config.server);

        SocketManager.joinRoom(

            this.room,

            this.role,

            this.name,

            this.studentId,

            this.periodId

        );

        await VideoManager.startLocalPreview();

        SignalingManager.initialize();

        ParticipantManager.add("local", {

    name: this.name,

    role: this.role

});

        console.log("Meeting Started");

    }

};
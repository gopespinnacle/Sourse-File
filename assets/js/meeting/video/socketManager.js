/*
=========================================================
Socket Manager
=========================================================
*/

const SocketManager = {

    socket: null,

    connect(serverURL) {

        console.log("Connecting to Server...");

        this.socket = io(serverURL);

        this.socket.on("connect", () => {

    console.log("Socket Connected :", this.socket.id);

    ReconnectManager.stop();

});



        this.socket.on("disconnect", () => {

    console.log("Socket Disconnected");

    ReconnectManager.start();

});

        this.socket.on("roomJoined", (data) => {

    console.log("ROOM JOINED");

    console.log(data);

});

    },

    joinRoom(room, role, name, studentId = null, periodId = null) {

    this.socket.emit("joinRoom", {

        room,

        role,

        name,

        studentId,

        periodId

    });

},

getSocket() {

    return this.socket;

}

};
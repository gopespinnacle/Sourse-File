/*
=========================================================
Reconnect Manager
=========================================================
*/

const ReconnectManager = {

    reconnecting: false,

    start() {

        if (this.reconnecting) {

            return;

        }

        this.reconnecting = true;

        console.log("Reconnect Started");

    },

    stop() {

        this.reconnecting = false;

        console.log("Reconnect Finished");

    },

    isRunning() {

        return this.reconnecting;

    }

};

window.ReconnectManager = ReconnectManager;
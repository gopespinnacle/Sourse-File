/*
=========================================
Gopes Pinnacle Academy
Video Module - Constants
Version : 1.0
=========================================
*/

const VIDEO_CONFIG = {

    VERSION: "1.0.0",

    DEBUG: true,

    MAX_RECONNECT_ATTEMPTS: 10,

    RECONNECT_DELAY: 2000,

    ICE_SERVERS: [

        {
            urls: "stun:stun.l.google.com:19302"
        },

        {
            urls: "stun:stun1.l.google.com:19302"
        }

    ]

};


const VIDEO_STATE = {

    IDLE: "idle",

    CONNECTING: "connecting",

    CONNECTED: "connected",

    DISCONNECTED: "disconnected",

    RECONNECTING: "reconnecting",

    FAILED: "failed"

};


const USER_ROLE = {

    TEACHER: "teacher",

    STUDENT: "student",

    FOUNDER: "founder"

};
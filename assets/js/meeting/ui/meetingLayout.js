/*
==================================================
Gopes Pinnacle Academy
Meeting Layout Manager
==================================================
*/

const MeetingLayout = {

    update() {

        this.layoutParticipant();

        this.layoutLocal();

        this.layoutScreen();

    },

    layoutParticipant() {

    const strip = document.getElementById("participantStrip");

    if (!strip) return;

    const count =
        Object.keys(ParticipantLayout.participants).length;

        const hasLocal =
    document.getElementById("localVideoBox") &&
    document.getElementById("localVideoBox").offsetParent !== null;

    const localVisible = hasLocal;

    const screenSharing =
        strip.classList.contains("screen-sharing");

    const isMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    const isPortrait =
        window.innerHeight > window.innerWidth;

    // Reset
    strip.removeAttribute("style");

    Object.values(ParticipantLayout.participants).forEach(p => {

        if (!p.card) return;

        p.card.removeAttribute("style");

    });

    // ===========================================
    // SCREEN SHARING
    // ===========================================

    // ===========================================
// SCREEN SHARING
// ===========================================

if (screenSharing) {

    /*
    =================================================
    SCREEN SHARE = MAIN AREA
    PARTICIPANTS = SMALL VIDEO STACK
    =================================================
    */

    strip.style.setProperty(
        "position",
        "fixed",
        "important"
    );

    strip.style.setProperty(
        "right",
        "10px",
        "important"
    );

    strip.style.setProperty(
        "left",
        "auto",
        "important"
    );

    strip.style.setProperty(
        "top",
        "auto",
        "important"
    );


    /*
    =================================================
    KEEP PARTICIPANTS ABOVE LOCAL VIDEO
    =================================================
    */

    const localBox =
        document.getElementById("localVideoBox");

    const localHeight =
        localBox
            ? localBox.getBoundingClientRect().height
            : 150;

    strip.style.setProperty(
        "bottom",
        (localHeight + 11) + "px",
        "important"
    );


    /*
    =================================================
    PARTICIPANT STRIP
    =================================================
    */

    strip.style.setProperty(
        "display",
        "flex",
        "important"
    );

    strip.style.setProperty(
        "flex-direction",
        "column",
        "important"
    );

    strip.style.setProperty(
        "align-items",
        "flex-end",
        "important"
    );

    strip.style.setProperty(
        "gap",
        "6px",
        "important"
    );

    strip.style.setProperty(
        "width",
        "90px",
        "important"
    );


    /*
    =================================================
    PARTICIPANT VIDEO SIZE
    SAME SIZE AS LOCAL VIDEO
    =================================================
    */

    let participantWidth = 90;

    let participantHeight = 150;


    if (isMobile) {

        if (isPortrait) {

            participantWidth = 90;

            participantHeight = 150;

        } else {

            participantWidth = 70;

            participantHeight = 120;

        }

    } else {

        participantWidth = 120;

        participantHeight = 180;

    }


    /*
    =================================================
    FORCE EVERY PARTICIPANT CARD
    =================================================
    */

    Object.values(
        ParticipantLayout.participants
    ).forEach(p => {

        if (!p || !p.card) return;


        const card = p.card;


        card.style.setProperty(
            "width",
            participantWidth + "px",
            "important"
        );

        card.style.setProperty(
            "height",
            participantHeight + "px",
            "important"
        );

        card.style.setProperty(
            "min-width",
            participantWidth + "px",
            "important"
        );

        card.style.setProperty(
            "min-height",
            participantHeight + "px",
            "important"
        );

        card.style.setProperty(
            "max-width",
            participantWidth + "px",
            "important"
        );

        card.style.setProperty(
            "max-height",
            participantHeight + "px",
            "important"
        );

        card.style.setProperty(
            "flex",
            "0 0 " + participantWidth + "px",
            "important"
        );

        card.style.setProperty(
            "position",
            "relative",
            "important"
        );

        card.style.setProperty(
            "overflow",
            "hidden",
            "important"
        );


        /*
        ---------------------------------------------
        PARTICIPANT VIDEO
        ---------------------------------------------
        */

        if (p.video) {

            p.video.style.setProperty(
                "width",
                "100%",
                "important"
            );

            p.video.style.setProperty(
                "height",
                "100%",
                "important"
            );

            p.video.style.setProperty(
                "object-fit",
                "cover",
                "important"
            );

        }

    });


    console.log(
        "SCREEN SHARE LAYOUT:",
        participantWidth,
        "x",
        participantHeight
    );


    return;

}

    // ===========================================
    // NORMAL MEETING
    // ===========================================

    strip.style.position = "fixed";
    strip.style.left = "0";
    strip.style.top = "50px";
    strip.style.right = "0";
    strip.style.bottom = "0";

    strip.style.display = "grid";

    strip.style.padding = "8px";

    strip.style.gap = "8px";

    if (count === 1) {

    strip.style.gridTemplateColumns = "1fr";
    strip.style.gridTemplateRows = "1fr";

    const participant =
        Object.values(ParticipantLayout.participants)[0];

    if (participant) {

        participant.card.style.width = "100%";
        participant.card.style.height = "100%";
        participant.card.style.position = "relative";

    }

    if (localVisible) {

        const box = document.getElementById("localVideoBox");

        box.style.position = "fixed";
        box.style.right = "10px";
        box.style.bottom = "10px";
        box.style.width = "160px";
        box.style.height = "220px";
        box.style.zIndex = "100000";

    }

}

    else if (count == 2) {

        strip.style.gridTemplateColumns = "1fr 1fr";

    }

    else if (count <= 4) {

        strip.style.gridTemplateColumns = "repeat(2,1fr)";

    }

    else if (count <= 9) {

        strip.style.gridTemplateColumns = "repeat(3,1fr)";

    }

    else {

        strip.style.gridTemplateColumns = "repeat(4,1fr)";

    }

},

    layoutLocal() {

    const box = document.getElementById("localVideoBox");

    if (!box) return;

    const strip = document.getElementById("participantStrip");

    const screenSharing =
        strip &&
        strip.classList.contains("screen-sharing");

    const isMobile =
        /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

    const isPortrait =
        window.innerHeight > window.innerWidth;

    box.removeAttribute("style");

    box.style.position = "fixed";
    box.style.right = "10px";
    box.style.bottom = "10px";
    box.style.left = "auto";
    box.style.top = "auto";
    box.style.zIndex = "100000";

    if (isMobile) {

        if (isPortrait) {

            box.style.width = "90px";
            box.style.height = "150px";

        } else {

            box.style.width = "70px";
            box.style.height = "120px";

        }

    } else {

        box.style.width = "120px";
        box.style.height = "180px";

    }

},

    layoutScreen() {

    // Reserved for future screen-share specific logic.

},

};

window.MeetingLayout = MeetingLayout;

// ==========================================
// Initialize Meeting Layout
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    setTimeout(() => {

        MeetingLayout.update();

    }, 300);

});

// Refresh whenever participant changes
const observer = new MutationObserver(() => {

    MeetingLayout.update();

});

window.addEventListener("load", () => {

    const strip = document.getElementById("participantStrip");

    if (strip) {

        observer.observe(strip, {
            childList: true,
            subtree: true
        });

    }

});

// ==========================================
// Auto Refresh Meeting Layout
// ==========================================

window.addEventListener("resize", () => {

    MeetingLayout.update();

});

window.addEventListener("orientationchange", () => {

    setTimeout(() => {

        MeetingLayout.update();

    }, 300);

});
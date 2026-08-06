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

    if (screenSharing) {

        // One participant → Full screen
        if (count === 1) {

            strip.style.position = "fixed";
            strip.style.left = "0";
            strip.style.top = "50px";
            strip.style.right = "0";
            strip.style.bottom = "0";

            strip.style.display = "grid";

            strip.style.width = "100vw";
strip.style.height = "calc(100vh - 50px)";
strip.style.alignItems = "stretch";
strip.style.justifyItems = "stretch";

            strip.style.gridTemplateColumns = "1fr";
            strip.style.gridTemplateRows = "1fr";

            const participant =
                Object.values(ParticipantLayout.participants)[0];

            if (participant) {

                participant.card.style.width = "100%";
participant.card.style.height = "100%";
participant.card.style.minWidth = "100%";
participant.card.style.minHeight = "100%";

            }

            return;

        }

        // Multiple participants → bottom-right stack

        strip.style.position = "fixed";
        strip.style.right = "10px";
        strip.style.bottom = "10px";
        strip.style.left = "auto";
        strip.style.top = "auto";

        strip.style.display = "flex";
        strip.style.flexDirection = "column";
        strip.style.alignItems = "flex-end";
        strip.style.gap = "3px";

        const width =
            isMobile
                ? (isPortrait ? 90 : 70)
                : 120;

        const height =
            isMobile
                ? (isPortrait ? 150 : 120)
                : 180;

        Object.values(ParticipantLayout.participants).forEach(p => {

            if (!p.card) return;

            p.card.style.width = width + "px";
            p.card.style.height = height + "px";
            p.card.style.flex = "none";

        });

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
/*
==========================================================
GOPES PINNACLE ACADEMY
PRESENTATION LAYOUT V2
Google Meet Style Presentation Layer
==========================================================
*/

window.PresentationLayoutV2 = {

    active: false,

    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    init() {

        console.log(
            "PRESENTATION V2: INITIALIZED"
        );

    },


    /*
    ======================================================
    START PRESENTATION MODE
    ======================================================
    */

    show() {

        console.log(
            "PRESENTATION V2: SHOW"
        );

        this.active = true;

        const screenContainer =
            document.getElementById(
                "screenContainer"
            );

        const participantStrip =
            document.getElementById(
                "participantStrip"
            );

        if (screenContainer) {

            screenContainer.style.display =
                "block";

        }

        /*
        --------------------------------------------------
        IMPORTANT
        DO NOT REMOVE PARTICIPANT VIDEOS
        --------------------------------------------------
        */

        if (participantStrip) {

            participantStrip.classList.add(
                "presentation-active"
            );

        }

        /*
        --------------------------------------------------
        KEEP EXISTING PARTICIPANT VIDEOS
        --------------------------------------------------
        */

        if (
            window.ParticipantLayout &&
            ParticipantLayout.participants
        ) {

            Object.values(
                ParticipantLayout.participants
            ).forEach(
                participant => {

                    if (
                        !participant ||
                        !participant.card
                    ) {

                        return;

                    }

                    participant.card.style.display =
                        "block";

                    participant.card.style.visibility =
                        "visible";

                    participant.card.style.opacity =
                        "1";

                }
            );

        }

    },


    /*
    ======================================================
    STOP PRESENTATION MODE
    ======================================================
    */

    hide() {

        console.log(
            "PRESENTATION V2: HIDE"
        );

        this.active = false;

        const screenContainer =
            document.getElementById(
                "screenContainer"
            );

        const participantStrip =
            document.getElementById(
                "participantStrip"
            );

        if (screenContainer) {

            screenContainer.style.display =
                "none";

        }

        if (participantStrip) {

            participantStrip.classList.remove(
                "presentation-active"
            );

        }

    },


    /*
    ======================================================
    IS ACTIVE
    ======================================================
    */

    isActive() {

        return this.active;

    }

};


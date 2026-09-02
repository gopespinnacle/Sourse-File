/* =========================================================
   GOPES PINNACLE ACADEMY
   EMOJI REACTIONS - UI
   STEP 3
========================================================= */

(function () {

    "use strict";

    /* =====================================================
       EMOJI LIST
    ===================================================== */

    const emojis = [
        "👍",
        "❤️",
        "😂",
        "😮",
        "👏",
        "🙏",
        "🎉",
        "😢"
    ];


    /* =====================================================
       CREATE EMOJI BUTTON
    ===================================================== */

    const emojiButton = document.createElement("button");

    emojiButton.id = "emojiReactionButton";

    emojiButton.type = "button";

    emojiButton.innerHTML = "😀";

    emojiButton.title = "Reactions";


    /* =====================================================
       BUTTON STYLE
    ===================================================== */

    Object.assign(emojiButton.style, {

        width: "52px",
        height: "52px",

        borderRadius: "50%",
        border: "none",

        background: "#2f3035",
        color: "#ffffff",

        fontSize: "27px",

        cursor: "pointer",

        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        boxShadow: "0 2px 8px rgba(0,0,0,0.3)",

        position: "fixed",

        bottom: "18px",
        right: "433px",

        zIndex: "99999"

    });


    /* =====================================================
       HOVER
    ===================================================== */

    emojiButton.addEventListener("mouseenter", () => {

        emojiButton.style.background = "#45464c";

    });


    emojiButton.addEventListener("mouseleave", () => {

        emojiButton.style.background = "#2f3035";

    });


    /* =====================================================
       CREATE EMOJI POPUP
    ===================================================== */

    const emojiPopup = document.createElement("div");

    emojiPopup.id = "emojiReactionPopup";


    Object.assign(emojiPopup.style, {

        position: "fixed",

        bottom: "82px",
right: "415px",

        width: "250px",

        padding: "14px",

        background: "#202124",

        borderRadius: "14px",

        boxShadow: "0 8px 30px rgba(0,0,0,0.45)",

        display: "none",

        gridTemplateColumns: "repeat(4, 1fr)",

        gap: "8px",

        zIndex: "99999"

    });


    /* =====================================================
       CREATE EMOJI OPTIONS
    ===================================================== */

    emojis.forEach((emoji) => {

        const button = document.createElement("button");

        button.type = "button";

        button.innerHTML = emoji;

        button.className = "emoji-reaction-option";


        Object.assign(button.style, {

            width: "50px",
            height: "50px",

            border: "none",

            borderRadius: "10px",

            background: "transparent",

            fontSize: "28px",

            cursor: "pointer"

        });


        button.addEventListener("mouseenter", () => {

            button.style.background = "#3a3b3f";

        });


        button.addEventListener("mouseleave", () => {

            button.style.background = "transparent";

        });


        button.addEventListener("click", () => {

    console.log(
        "😀 EMOJI SELECTED:",
        emoji
    );


    /* =================================================
       SEND EMOJI THROUGH EXISTING MEETING SOCKET
    ================================================= */

    if (
        window.MeetingSocket &&
        typeof window.MeetingSocket.emit === "function"
    ) {

        window.MeetingSocket.emit(
            "emojiReaction",
            {
                emoji: emoji
            }
        );


        console.log(
            "😀 EMOJI SENT:",
            emoji
        );

    }
    else {

        console.warn(
            "⚠️ MeetingSocket is not available"
        );

    }


    /* =================================================
       CLOSE POPUP
    ================================================= */

    emojiPopup.style.display = "none";

});


        emojiPopup.appendChild(button);

    });


    /* =====================================================
       OPEN / CLOSE POPUP
    ===================================================== */

    emojiButton.addEventListener("click", (event) => {

        event.stopPropagation();

        if (emojiPopup.style.display === "grid") {

            emojiPopup.style.display = "none";

        } else {

            emojiPopup.style.display = "grid";

        }

    });


    /* =====================================================
       CLOSE WHEN CLICKING OUTSIDE
    ===================================================== */

    document.addEventListener("click", (event) => {

        if (
            !emojiButton.contains(event.target) &&
            !emojiPopup.contains(event.target)
        ) {

            emojiPopup.style.display = "none";

        }

    });


    /* =====================================================
   ADD TO EXISTING MEETING CONTROL BAR
===================================================== */

const meetingControls =
    document.querySelector(
        ".meeting-controls"
    );

if (meetingControls) {

    meetingControls.appendChild(
        emojiButton
    );

    meetingControls.appendChild(
        emojiPopup
    );

} else {

    /*
     * Fallback if the meeting control
     * container is not available.
     */

    document.body.appendChild(
        emojiButton
    );

    document.body.appendChild(
        emojiPopup
    );

}


    console.log(
        "✅ EMOJI REACTIONS UI LOADED"
    );

})();

/* =========================================================
   EMOJI REACTION DISPLAY
   ========================================================= */

window.addEventListener(
    "meeting:emojiReaction",
    event => {

        const data = event.detail || {};

        const emoji = data.emoji;

        if (!emoji) {
            return;
        }

        console.log(
            "😀 DISPLAYING EMOJI:",
            emoji
        );


        /* =================================================
           CREATE OVERLAY CONTAINER
        ================================================= */

        let overlay =
            document.getElementById(
                "emojiReactionOverlay"
            );

        if (!overlay) {

            overlay =
                document.createElement("div");

            overlay.id =
                "emojiReactionOverlay";

            document.body.appendChild(
                overlay
            );

        }


        /* =================================================
           CREATE EMOJI
        ================================================= */

        const emojiElement =
            document.createElement("div");

        emojiElement.className =
            "meetingEmojiReaction";

        emojiElement.textContent =
            emoji;


        overlay.appendChild(
            emojiElement
        );


        /* =================================================
           REMOVE AFTER ANIMATION
        ================================================= */

        setTimeout(() => {

            emojiElement.remove();

        }, 2000);

    }
);


/* =========================================================
   EMOJI REACTION STYLES
   ========================================================= */

if (
    !document.getElementById(
        "emojiReactionStyles"
    )
) {

    const style =
        document.createElement("style");

    style.id =
        "emojiReactionStyles";

    style.textContent = `

        #emojiReactionOverlay {

            position: fixed;

            inset: 0;

            pointer-events: none;

            z-index: 999999;

            overflow: hidden;

        }


        .meetingEmojiReaction {

            position: absolute;

            left: 50%;

            bottom: 25%;

            transform:
                translateX(-50%)
                scale(0.5);

            font-size: 70px;

            animation:
                meetingEmojiFloat 2s ease-out forwards;

            pointer-events: none;

        }


        @keyframes meetingEmojiFloat {

            0% {

                opacity: 0;

                transform:
                    translateX(-50%)
                    translateY(40px)
                    scale(0.5);

            }


            20% {

                opacity: 1;

                transform:
                    translateX(-50%)
                    translateY(0)
                    scale(1.15);

            }


            70% {

                opacity: 1;

                transform:
                    translateX(-50%)
                    translateY(-80px)
                    scale(1);

            }


            100% {

                opacity: 0;

                transform:
                    translateX(-50%)
                    translateY(-160px)
                    scale(0.8);

            }

        }

    `;

    document.head.appendChild(
        style
    );

}
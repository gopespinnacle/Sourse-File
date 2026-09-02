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
        right: "430px",

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
        right: "390px",

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

            /*
             * SOCKET.IO SENDING
             *
             * WILL BE ADDED IN STEP 4
             */

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
       ADD TO PAGE
    ===================================================== */

    document.body.appendChild(emojiButton);

    document.body.appendChild(emojiPopup);


    console.log(
        "✅ EMOJI REACTIONS UI LOADED"
    );

})();
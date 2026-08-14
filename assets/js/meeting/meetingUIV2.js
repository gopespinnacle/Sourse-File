/*
==========================================================
GOPES PINNACLE ACADEMY
MEETING UI V2
GOOGLE MEET STYLE
==========================================================
*/

const MeetingUI = {


    /*
    ======================================================
    INITIALIZE
    ======================================================
    */

    init() {

        this.cacheElements();

        this.bindControls();

        this.render();

    },


    /*
    ======================================================
    CACHE ELEMENTS
    ======================================================
    */

    cacheElements() {

        this.grid =
            document.getElementById(
                "participantGrid"
            );

        this.peoplePanel =
            document.getElementById(
                "peoplePanel"
            );

        this.peopleList =
            document.getElementById(
                "peopleList"
            );

        this.peopleCount =
            document.getElementById(
                "peopleCount"
            );

        this.systemStatus =
            document.getElementById(
                "systemStatus"
            );

    },


    /*
    ======================================================
    BIND CONTROLS
    ======================================================
    */

    bindControls() {

        const peopleButton =
            document.getElementById(
                "peopleButton"
            );


        if (peopleButton) {

            peopleButton.addEventListener(
                "click",
                () => {

                    this.togglePeople();

                }
            );

        }


        const closePeople =
            document.getElementById(
                "closePeople"
            );


        if (closePeople) {

            closePeople.addEventListener(
                "click",
                () => {

                    this.closePeople();

                }
            );

        }

    },


    /*
    ======================================================
    PEOPLE PANEL
    ======================================================
    */

    togglePeople() {

        if (!this.peoplePanel) return;

        this.peoplePanel.classList.toggle(
            "open"
        );

    },


    closePeople() {

        if (!this.peoplePanel) return;

        this.peoplePanel.classList.remove(
            "open"
        );

    },


    /*
    ======================================================
    RENDER
    ======================================================
    */

    /*
======================================================
RENDER
======================================================
*/

render() {

    if (!this.grid) return;


    const participants =
        MeetingParticipants.sorted();


    /*
    --------------------------------------------------
    EMPTY ROOM
    --------------------------------------------------
    */

    if (!participants.length) {

        /*
        ----------------------------------------------
        Only show empty room if there are no tiles.
        ----------------------------------------------
        */

        if (
            !this.grid.querySelector(
                ".meeting-participant"
            )
        ) {

            this.grid.innerHTML = `

                <div id="emptyRoom">

                    <h2>
                        Virtual Classroom
                    </h2>

                    <div>
                        Waiting for participants...
                    </div>

                </div>

            `;

        }

        return;

    }


    /*
    --------------------------------------------------
    REMOVE EMPTY ROOM MESSAGE
    --------------------------------------------------
    */

    const emptyRoom =
        document.getElementById(
            "emptyRoom"
        );


    if (emptyRoom) {

        emptyRoom.remove();

    }


    /*
    --------------------------------------------------
    REMOVE PARTICIPANTS WHO LEFT
    --------------------------------------------------
    */

    const validSocketIds =
        new Set(
            participants.map(
                participant =>
                    participant.socketId
            )
        );


    this.grid
        .querySelectorAll(
            ".meeting-participant"
        )
        .forEach(tile => {

            const socketId =
                tile.dataset.socketId;


            if (
                socketId &&
                !validSocketIds.has(socketId)
            ) {

                tile.remove();

            }

        });


    /*
    --------------------------------------------------
    CREATE ONLY NEW PARTICIPANT TILES
    --------------------------------------------------
    
    IMPORTANT:
    Existing tiles are NEVER destroyed.

    This preserves:
    
    - video elements
    - MediaStream
    - audio
    - local camera
    - remote camera
    - WebRTC connections
    --------------------------------------------------
    */

    participants.forEach(
        participant => {

            let tile =
                this.grid.querySelector(
                    `[data-socket-id="${participant.socketId}"]`
                );


            /*
            ------------------------------------------
            CREATE TILE ONLY IF IT DOES NOT EXIST
            ------------------------------------------
            */

            if (!tile) {

                this.createParticipantTile(
                    participant
                );

                tile =
                    this.grid.querySelector(
                        `[data-socket-id="${participant.socketId}"]`
                    );

            }


            /*
            ------------------------------------------
            KEEP PARTICIPANT ORDER
            ------------------------------------------
            
            appendChild() moves the existing DOM
            element without destroying it.

            Therefore the video element and its
            MediaStream remain attached.
            ------------------------------------------
            */

            if (tile) {

                this.grid.appendChild(
                    tile
                );

            }

        }
    );


    /*
    --------------------------------------------------
    UPDATE PEOPLE PANEL
    --------------------------------------------------
    */

    this.updatePeoplePanel();

},


    /*
    ======================================================
    PARTICIPANT TILE
    ======================================================
    */

    createParticipantTile(
        participant
    ) {

        const tile =
            document.createElement(
                "div"
            );


        tile.className =
            "meeting-participant";


        tile.dataset.socketId =
            participant.socketId;

            /*
======================================================
VIDEO ELEMENT
======================================================
*/

const video =
    document.createElement(
        "video"
    );

video.className =
    "participant-video";

video.autoplay =
    true;

video.playsInline =
    true;

video.muted =
    this.isLocal(
        participant.socketId
    );

video.dataset.socketId =
    participant.socketId;

tile.appendChild(
    video
);


        /*
        --------------------------------------------------
        AVATAR
        --------------------------------------------------
        */

        const avatar =
            document.createElement(
                "div"
            );


        avatar.className =
            "participant-avatar";


        avatar.textContent =
            this.getInitials(
                participant.name
            );


        tile.appendChild(
            avatar
        );


        /*
        --------------------------------------------------
        ROLE
        --------------------------------------------------
        */

        const role =
            document.createElement(
                "div"
            );


        role.className =
            "participant-role";


        role.textContent =
            this.roleLabel(
                participant.role
            );


        tile.appendChild(
            role
        );


        /*
        --------------------------------------------------
        NAME
        --------------------------------------------------
        */

        const name =
            document.createElement(
                "div"
            );


        name.className =
            "participant-name";


        name.textContent =
            this.isLocal(
                participant.socketId
            )
                ? `You • ${participant.name}`
                : participant.name;


        tile.appendChild(
            name
        );


        /*
        --------------------------------------------------
        MEDIA STATUS
        --------------------------------------------------
        */

        const status =
            document.createElement(
                "div"
            );


        status.className =
            "participant-status";


        const mic =
            document.createElement(
                "div"
            );


        mic.className =
            "media-indicator";


        mic.textContent =
            participant.mic === false
                ? "🔇"
                : "🎤";


        status.appendChild(
            mic
        );


        const camera =
            document.createElement(
                "div"
            );


        camera.className =
            "media-indicator";


        camera.textContent =
            participant.camera === false
                ? "📷"
                : "📹";


        status.appendChild(
            camera
        );


        tile.appendChild(
            status
        );


        /*
        --------------------------------------------------
        PIN
        --------------------------------------------------
        */

        tile.addEventListener(
            "click",
            () => {

                this.pinParticipant(
                    participant.socketId
                );

            }
        );


        this.grid.appendChild(
            tile
        );

    },


    /*
    ======================================================
    PIN
    ======================================================
    */

    pinParticipant(
        socketId
    ) {

        const tiles =
            this.grid.querySelectorAll(
                ".meeting-participant"
            );


        tiles.forEach(
            tile => {

                tile.classList.remove(
                    "pinned"
                );

            }
        );


        const selected =
            this.grid.querySelector(
                `[data-socket-id="${socketId}"]`
            );


        if (!selected) return;


        selected.classList.add(
            "pinned"
        );

    },


    /*
    ======================================================
    PEOPLE PANEL
    ======================================================
    */

    updatePeoplePanel() {

        if (!this.peopleList)
            return;


        this.peopleList.innerHTML = "";


        const participants =
            MeetingParticipants.sorted();


        if (this.peopleCount) {

            this.peopleCount.textContent =
                participants.length;

        }


        const roles = [

            {
                key: "founder",
                title: "Founder"
            },

            {
                key: "teacher",
                title: "Teachers"
            },

            {
                key: "student",
                title: "Students"
            }

        ];


        roles.forEach(
            section => {

                const people =
                    participants.filter(
                        p =>
                            p.role ===
                            section.key
                    );


                if (!people.length)
                    return;


                const title =
                    document.createElement(
                        "div"
                    );


                title.className =
                    "people-section-title";


                title.textContent =
                    section.title;


                this.peopleList.appendChild(
                    title
                );


                people.forEach(
                    participant => {

                        this.createPeopleItem(
                            participant
                        );

                    }
                );

            }
        );

    },


    /*
    ======================================================
    PEOPLE ITEM
    ======================================================
    */

    createPeopleItem(
        participant
    ) {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "people-item";


        const avatar =
            document.createElement(
                "div"
            );


        avatar.className =
            "people-avatar";


        avatar.textContent =
            this.getInitials(
                participant.name
            );


        item.appendChild(
            avatar
        );


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "people-info";


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "people-name";


        name.textContent =
            this.isLocal(
                participant.socketId
            )
                ? `You • ${participant.name}`
                : participant.name;


        info.appendChild(
            name
        );


        const role =
            document.createElement(
                "div"
            );


        role.className =
            "people-role";


        role.textContent =
            this.roleLabel(
                participant.role
            );


        info.appendChild(
            role
        );


        item.appendChild(
            info
        );


        const online =
            document.createElement(
                "div"
            );


        online.className =
            "people-online";


        item.appendChild(
            online
        );


        this.peopleList.appendChild(
            item
        );

    },


    /*
    ======================================================
    INITIALS
    ======================================================
    */

    getInitials(name) {

        if (!name)
            return "?";


        const words =
            name
                .trim()
                .split(/\s+/);


        if (words.length === 1) {

            return words[0]
                .substring(0, 2)
                .toUpperCase();

        }


        return (
            words[0][0] +
            words[1][0]
        ).toUpperCase();

    },


    /*
    ======================================================
    ROLE LABEL
    ======================================================
    */

    roleLabel(role) {

        if (role === "founder")
            return "Founder";

        if (role === "teacher")
            return "Teacher";

        if (role === "student")
            return "Student";

        return role || "Participant";

    },


    /*
    ======================================================
    LOCAL PARTICIPANT
    ======================================================
    */

    isLocal(socketId) {

        return (
            window.MeetingConfig &&
            window.MeetingConfig.socketId ===
                socketId
        );

    },


    /*
    ======================================================
    STATUS
    ======================================================
    */

    setStatus(message) {

        if (!this.systemStatus)
            return;


        this.systemStatus.textContent =
            message;

    }

};


window.MeetingUI =
MeetingUI;
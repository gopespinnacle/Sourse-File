/*
=========================================
Video UI Manager
=========================================
*/

const VideoUI = {

    container: null,

    initialize(containerId) {

        this.container = document.getElementById(containerId);

        console.log("Video UI Ready");

    },

    createVideo(id, name) {

    if (document.getElementById(id)) {

        return;

    }

    const component = VideoCard.create(id, name);

    this.container.appendChild(component.card);

    console.log(name + " video created.");

    return component.video;

}

};
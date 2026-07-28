/*
=========================================
Video Card Component
=========================================
*/

const VideoCard = {

    create(id, name) {

        const card = document.createElement("div");

        card.className = "video-card";

        card.id = id;



        const video = document.createElement("video");

        video.autoplay = true;

        video.playsInline = true;

        video.className = "video-element";



        const footer = document.createElement("div");

footer.className = "video-footer";

const mic = document.createElement("span");

mic.innerHTML = "🎤";

const camera = document.createElement("span");

camera.innerHTML = "📷";

const network = document.createElement("span");

network.innerHTML = "🟢";

const username = document.createElement("span");

username.className = "video-name";

username.innerText = name;

footer.appendChild(mic);

footer.appendChild(camera);

footer.appendChild(network);

footer.appendChild(username);

        card.appendChild(video);

        card.appendChild(footer);



        return {

            card,

            video

        };

    }

};
/*=====================================================
 GOPES PINNACLE BIRTHDAY
=====================================================*/

const studentName = "PRANAV SIVAKUMAAR";

const teacherVideos = [
    "videos/wish1.mp4"
];

let currentVideo = 0;

const music = document.getElementById("birthdayMusic");

const blowBtn = document.getElementById("blowBtn");

const cutBtn = document.getElementById("cutBtn");

const knife = document.getElementById("knife");

const cake = document.getElementById("cake");

const candles = document.querySelectorAll(".candle");

const leftCake = document.querySelector(".left");

const rightCake = document.querySelector(".right");

const video = document.getElementById("teacherVideo");

const videoSection = document.getElementById("videoSection");

const celebrationSection =
document.getElementById("celebrationSection");

const finalSection =
document.getElementById("finalSection");

const counter =
document.getElementById("videoCounter");

window.onload=()=>{

    playMusic();

    createStars();

    createBalloons();

}

function playMusic(){

    music.volume=.25;

    const p=music.play();

    if(p){

        p.catch(()=>{

            document.body.onclick=()=>{

                music.play();

            }

        });

    }

}
/*=====================================================
BLOW CANDLES
=====================================================*/

blowBtn.addEventListener("click",()=>{

    candles.forEach(c=>{

        c.classList.add("off");

    });

    blowBtn.disabled=true;

    cutBtn.disabled=false;

    cutBtn.style.opacity="1";

});

/*=====================================================
CUT CAKE
=====================================================*/

cutBtn.addEventListener("click",()=>{

    cutBtn.disabled=true;

    // Knife Comes Down
    knife.classList.add("cut");

    setTimeout(()=>{

        // Cake Split
        cake.classList.add("cut");

    },700);

    setTimeout(()=>{

        createConfetti();

        startFireworks();

    },1200);

    setTimeout(()=>{

        celebrationSection.style.display="block";

        celebrationSection.scrollIntoView({
            behavior:"smooth"
        });

    },1800);

    // Wait 2 seconds after cake cut

// Wait 2 seconds after cake cut

setTimeout(()=>{

    document.getElementById("videoSection").style.display="block";

    document.getElementById("videoSection").scrollIntoView({

        behavior:"smooth"

    });

    playTeacherVideo();

},2000);

});


/*=====================================================
PLAY TEACHER VIDEO
=====================================================*/

function playTeacherVideo(){

    const video = document.getElementById("teacherVideo");

    video.src = "videos/wish1.mp4";

    video.volume = 1;

    video.muted = false;

    video.controls = true;

    video.load();

    // Pause background birthday music
music.pause();

    console.log("Muted:", video.muted);

    console.log("Volume:", video.volume);

    video.play().then(()=>{

        console.log("Playing");

    }).catch(err=>{

        console.error(err);

    });

}
/*=====================================================
VIDEO FINISHED
=====================================================*/

video.onended=()=>{

    // Resume birthday music
    music.play();

    setTimeout(()=>{

        finishBirthday();

    },1000);

};

/*=====================================================
FINISH
=====================================================*/

function finishBirthday(){

    finalSection.style.display="block";

    finalSection.scrollIntoView({

        behavior:"smooth"

    });

}

/*=====================================================
STARS
=====================================================*/

function createStars(){

    const stars=document.getElementById("stars");

    for(let i=0;i<180;i++){

        const s=document.createElement("div");

        s.className="star";

        s.style.left=Math.random()*100+"%";

        s.style.top=Math.random()*100+"%";

        s.style.animationDelay=Math.random()*3+"s";

        stars.appendChild(s);

    }

}

/*=====================================================
BALLOONS
=====================================================*/

function createBalloons(){

    const container=document.getElementById("balloons");

    const colors=[

        "#ff4d6d",
        "#03a9f4",
        "#ffd600",
        "#4caf50",
        "#9c27b0",
        "#ff9800"

    ];

    setInterval(()=>{

        const b=document.createElement("div");

b.className="balloon";

const string=document.createElement("span");

b.appendChild(string);

        const size=40+Math.random()*35;

        b.style.width=size+"px";

        b.style.height=size*1.3+"px";

        b.style.left=Math.random()*100+"%";

        b.style.background=

        colors[Math.floor(Math.random()*colors.length)];

        b.style.animationDuration=

        (8+Math.random()*6)+"s";

        container.appendChild(b);

        setTimeout(()=>{

            b.remove();

        },15000);

    },700);

}

/*=====================================================
CONFETTI
=====================================================*/

function createConfetti(){

    const container=document.getElementById("confetti-container");

    const colors=[

        "#ff1744",

        "#00e5ff",

        "#ffd600",

        "#76ff03",

        "#e040fb",

        "#ff9100"

    ];

    for(let i=0;i<250;i++){

        const c=document.createElement("div");

        c.className="confetti";

        c.style.left=Math.random()*100+"%";

        c.style.top="-20px";

        c.style.background=

        colors[Math.floor(Math.random()*colors.length)];

        c.style.animationDuration=

        (3+Math.random()*3)+"s";

        c.style.animationDelay=

        Math.random()*2+"s";

        container.appendChild(c);

        setTimeout(()=>{

            c.remove();

        },7000);

    }

}

function startFireworks(){

    const canvas=document.getElementById("fireworksCanvas");

    const ctx=canvas.getContext("2d");

    canvas.width=window.innerWidth;

    canvas.height=window.innerHeight;

    let particles=[];

    function burst(x,y){

        for(let i=0;i<120;i++){

            particles.push({

                x:x,
                y:y,
                angle:Math.random()*Math.PI*2,
                speed:2+Math.random()*8,
                radius:2+Math.random()*4,
                alpha:1,
                color:`hsl(${Math.random()*360},100%,60%)`

            });

        }

    }

    function animate(){

        ctx.clearRect(0,0,canvas.width,canvas.height);

        particles.forEach((p,index)=>{

            p.x+=Math.cos(p.angle)*p.speed;

            p.y+=Math.sin(p.angle)*p.speed;

            p.alpha-=0.01;

            p.speed*=0.98;

            ctx.globalAlpha=p.alpha;

            ctx.beginPath();

            ctx.fillStyle=p.color;

            ctx.arc(p.x,p.y,p.radius,0,Math.PI*2);

            ctx.fill();

            if(p.alpha<=0){

                particles.splice(index,1);

            }

        });

        requestAnimationFrame(animate);

    }

    animate();

    burst(canvas.width/2,180);

    setTimeout(()=>{

        burst(canvas.width*0.25,220);

    },500);

    setTimeout(()=>{

        burst(canvas.width*0.75,220);

    },900);

    setTimeout(()=>{

        burst(canvas.width/2,120);

    },1400);

}

window.addEventListener("resize",()=>{

    const canvas=document.getElementById("fireworksCanvas");

    canvas.width=window.innerWidth;

    canvas.height=window.innerHeight;

});
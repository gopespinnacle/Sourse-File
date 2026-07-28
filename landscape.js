// Run only on mobile devices
if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {

    const overlay = document.createElement("div");

    overlay.id = "rotateOverlay";

    overlay.innerHTML = `
        <div class="rotateBox">
            <div style="font-size:70px;">📱</div>
            <h2>Please Rotate Your Device</h2>
            <p>For the best classroom experience, use Landscape Mode.</p>
        </div>
    `;

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:#0b1220;
        color:white;
        display:none;
        justify-content:center;
        align-items:center;
        text-align:center;
        z-index:999999;
    `;

    document.body.appendChild(overlay);

    function checkOrientation(){

        if(window.innerHeight > window.innerWidth){

            overlay.style.display="flex";

        }else{

            overlay.style.display="none";

        }

    }

    checkOrientation();

    window.addEventListener("resize",checkOrientation);

    window.addEventListener("orientationchange",checkOrientation);

    if(window.matchMedia("(display-mode: standalone)").matches){

        if(screen.orientation){

            screen.orientation.lock("landscape").catch(()=>{});

        }

    }

}
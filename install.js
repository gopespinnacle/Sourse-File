let deferredPrompt = null;

window.addEventListener("beforeinstallprompt", (e) => {

    e.preventDefault();

    deferredPrompt = e;

    const installBtn = document.getElementById("installApp");

    if (installBtn) {
        installBtn.style.display = "block";
    }

});

async function installPWA() {

    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    await deferredPrompt.userChoice;

    deferredPrompt = null;

    const installBtn = document.getElementById("installApp");

    if (installBtn) {
        installBtn.style.display = "none";
    }

}
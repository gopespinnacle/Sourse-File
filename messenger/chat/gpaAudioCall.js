
(function () {
  "use strict";

  const API_BASE = "https://academy-backend-eatl.onrender.com";
  const NS = "/gpa-audio-call";

  let socket = null;
  let pc = null;
  let localStream = null;
  let currentCallId = null;
  let peerId = null;
  let incoming = null;
  let callRole = null;
  let pendingIceCandidates = [];
  let liveKitRoom = null;
let usingLiveKit = false;
let fallbackStarting = false;

  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    localStorage.getItem("authToken");

  function decodeRole(jwt) {
    try {
      const part = jwt.split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      return JSON.parse(atob(part)).role || "";
    } catch {
      return "";
    }
  }

  function status(message) {
    let el = document.getElementById("gpaAudioStatus");
    if (el) el.textContent = message;
  }

  function addInterface() {
    if (document.getElementById("gpaAudioCallButton")) return;

    const header = document.querySelector(
      ".gpa-primary-messenger-header"
    );
    if (!header) return;

    const style = document.createElement("style");
    style.textContent = `
  .gpa-audio-call-button {
    position: absolute;
    right: 12px;
    top: 10px;
    width: 42px;
    height: 42px;
    border: 0;
    border-radius: 50%;
    background: #128c4a;
    color: white;
    font-size: 22px;
    cursor: pointer;
    z-index: 5;
  }

  .gpa-audio-call-button:disabled {
    opacity: .4;
    cursor: not-allowed;
  }

  #gpaAudioCallPopup[hidden] {
    display: none !important;
  }

  #gpaAudioCallPopup {
    position: fixed;
    inset: 0;
    z-index: 999999;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 24px;
    border: 0;
    border-radius: 0;
    background: #080d12;
    color: #f5f6f6;
    box-shadow: none;
    font-family: Arial, Helvetica, sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
  }

  .gpa-call-screen {
    width: 100%;
    max-width: 420px;
    min-height: min(650px, 90vh);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    text-align: center;
    padding: 28px 10px 12px;
    box-sizing: border-box;
  }

  .gpa-call-brand {
    width: 100%;
    text-align: left;
    color: #aeb8c2;
    font-size: 14px;
    letter-spacing: .3px;
  }

  .gpa-call-person {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;
    flex: 1;
    padding: 35px 0;
  }

  #gpaAudioAvatar {
    width: 112px;
    height: 112px;
    border-radius: 50%;
    background: #183b35;
    color: #b9f4d8;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    font-weight: 600;
    overflow: hidden;
  }

  #gpaAudioAvatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  #gpaAudioCaller {
    margin: 8px 0 0;
    color: #f5f6f6;
    font-size: 25px;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }

  #gpaAudioStatus {
    margin: 0;
    color: #c0c8ce;
    font-size: 15px;
    line-height: 1.5;
  }

  .gpa-call-controls {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    padding: 20px 0 10px;
  }

  #gpaAudioCallPopup button {
    border: 0;
    cursor: pointer;
    font-family: inherit;
    font-weight: 600;
    transition: transform .15s ease, filter .15s ease;
  }

  #gpaAudioCallPopup button:hover {
    filter: brightness(1.08);
    transform: scale(1.02);
  }

  #gpaAudioCallPopup button:focus-visible {
    outline: 3px solid white;
    outline-offset: 4px;
  }

  #gpaAudioAccept {
    min-height: 58px;
    flex: 1;
    max-width: 240px;
    padding: 16px 24px;
    border-radius: 32px;
    background: #20c767;
    color: #061b10;
    font-size: 17px;
  }

  #gpaAudioAccept::before {
    content: "☎  ";
  }

    #gpaAudioDecline,
  #gpaAudioEnd {
    width: 58px;
    height: 58px;
    flex: 0 0 58px;
    border-radius: 50%;
    background: #f04444;
    color: white;
    font-size: 0;
    position: relative;
  }

  #gpaAudioDecline::before,
  #gpaAudioEnd::before {
    content: "✕";
  }

  #gpaAudioMute {
    width: 58px;
    height: 58px;
    flex: 0 0 58px;
    border-radius: 50%;
    background: #263039;
    color: white;
    font-size: 21px;
  }

  #gpaAudioRemote {
    display: none;
  }

  @media (max-width: 480px) {
    #gpaAudioCallPopup {
      padding: 16px;
    }

    .gpa-call-screen {
      min-height: 85vh;
    }

    #gpaAudioAvatar {
      width: 96px;
      height: 96px;
      font-size: 36px;
    }

    #gpaAudioCaller {
      font-size: 22px;
    }

    #gpaAudioAccept {
      min-height: 54px;
      font-size: 15px;
    }

    #gpaAudioDecline,
    #gpaAudioEnd,
    #gpaAudioMute {
      width: 54px;
      height: 54px;
      flex-basis: 54px;
    }
  }
`;
    document.head.appendChild(style);

    header.style.position = "relative";

    if (["founder", "admin"].includes(callRole)) {
      const button = document.createElement("button");
      button.id = "gpaAudioCallButton";
      button.className = "gpa-audio-call-button";
      button.type = "button";
      button.title = "Start GPA Audio Call";
      button.textContent = "☎";
      button.addEventListener("click", startCall);
      header.appendChild(button);
    }

    const popup = document.createElement("section");
    popup.id = "gpaAudioCallPopup";
    popup.hidden = true;
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-live", "polite");
    popup.innerHTML = `
  <div class="gpa-call-screen">
    <div class="gpa-call-brand">GOPES PINNACLE ACADEMY</div>

    <div class="gpa-call-person">
      <div id="gpaAudioAvatar" aria-hidden="true">☎</div>

      <p id="gpaAudioCaller">Academy user</p>

      <p id="gpaAudioStatus">Incoming voice call…</p>
    </div>

    <div class="gpa-call-controls">
      <button id="gpaAudioMute" type="button" hidden
        title="Mute microphone" aria-label="Mute microphone">🎙</button>

      <button id="gpaAudioDecline" type="button"
        title="Decline call" aria-label="Decline call">Decline</button>

      <button id="gpaAudioAccept" type="button"
        title="Accept call" aria-label="Accept call">Accept</button>

      <button id="gpaAudioEnd" type="button"
        title="End call" aria-label="End call" hidden>End call</button>
    </div>

    <audio id="gpaAudioRemote" autoplay playsinline></audio>
  </div>
`;
    document.body.appendChild(popup);

    document.getElementById("gpaAudioAccept")
      .addEventListener("click", acceptCall);
    document.getElementById("gpaAudioDecline")
      .addEventListener("click", declineCall);
    document.getElementById("gpaAudioEnd")
      .addEventListener("click", endCall);
    document.getElementById("gpaAudioMute")
      .addEventListener("click", toggleMute);

    // Only show the buttons relevant to the current call state.
    updateControls("idle");
  }

  function updateControls(state) {
    const popup = document.getElementById("gpaAudioCallPopup");
    if (!popup) return;

    popup.hidden = state === "idle";

    document.getElementById("gpaAudioAccept").hidden =
      state !== "incoming";
    document.getElementById("gpaAudioDecline").hidden =
      state !== "incoming";
    document.getElementById("gpaAudioMute").hidden =
      state !== "active";
    document.getElementById("gpaAudioEnd").hidden =
      !["ringing", "active", "connecting"].includes(state);
  }

  function sendSignal(signal) {
    if (!socket?.connected || !currentCallId || !peerId) return;

    socket.emit("call:signal", {
      callId: currentCallId,
      recipientId: peerId,
      signal
    }, result => {
      if (result && result.ok === false) {
        status(result.message || "Unable to send audio signal.");
      }
    });
  }

  
async function preparePeerConnection() {
  if (pc) return;

  pendingIceCandidates = [];

  pc = new RTCPeerConnection({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  });

  pc.onicecandidate = event => {
    if (event.candidate) {
      sendSignal({
        type: "ice",
        candidate: event.candidate
      });
    }
  };

  pc.ontrack = async event => {
    const audio = document.getElementById("gpaAudioRemote");

    if (!audio) return;

    // Support browsers that provide no event.streams entry.
    if (event.streams && event.streams[0]) {
      audio.srcObject = event.streams[0];
    } else {
      if (!audio.srcObject) {
        audio.srcObject = new MediaStream();
      }
      audio.srcObject.addTrack(event.track);
    }

    audio.muted = false;
    audio.volume = 1;

    try {
      await audio.play();
      status("Remote audio received. Check speaker volume.");
    } catch (error) {
      console.warn("Remote audio playback needs user interaction:", error);
      audio.controls = true;
      status("Audio received. Press Play on the audio control if you cannot hear the other person.");
    }
  };

  pc.onconnectionstatechange = () => {
  if (!pc) return;

  console.log("[GPA Audio Call] Connection:", pc.connectionState);
  console.log("[GPA Audio Call] ICE connection:", pc.iceConnectionState);
  console.log("[GPA Audio Call] ICE gathering:", pc.iceGatheringState);

  if (pc.connectionState === "connected") {
    status("Audio connection established.");
 } else if (
    pc.connectionState === "failed" ||
    pc.iceConnectionState === "failed"
) {
    requestLiveKitFallback();
} else if (
    pc.connectionState === "disconnected" ||
    pc.iceConnectionState === "disconnected"
  ) {
    status("Audio connection interrupted.");
  }
};


pc.oniceconnectionstatechange = () => {
    if (!pc) return;

    console.log(
        "[GPA Audio Call] ICE state:",
        pc.iceConnectionState
    );

    if (pc.iceConnectionState === "failed") {
        requestLiveKitFallback();
    } else if (pc.iceConnectionState === "disconnected") {
        status("Audio connection interrupted. Checking connection...");
    }
};


pc.onicegatheringstatechange = () => {
  if (pc) {
    console.log(
      "[GPA Audio Call] ICE gathering:",
      pc.iceGatheringState
    );
  }
};

  localStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true
    },
    video: false
  });

  localStream.getAudioTracks().forEach(track => {
    track.enabled = true;

    console.log("[GPA Audio Call] Local microphone:", {
      label: track.label,
      enabled: track.enabled,
      muted: track.muted,
      readyState: track.readyState
    });

    pc.addTrack(track, localStream);
  });
}


async function requestLiveKitFallback() {
    if (
        usingLiveKit ||
        fallbackStarting ||
        !currentCallId ||
        !socket?.connected
    ) {
        return;
    }

    fallbackStarting = true;
    status("Direct audio failed. Switching to LiveKit...");

    socket.emit(
        "call:fallback-request",
        { callId: currentCallId },
        result => {
            if (!result?.ok) {
                fallbackStarting = false;
                status(
                    result?.message ||
                    "Could not switch to LiveKit."
                );
            }
        }
    );
}

async function startLiveKitFallback(data) {
    if (
        !data ||
        data.callId !== currentCallId ||
        usingLiveKit
    ) {
        return;
    }

    try {
        fallbackStarting = true;
        status("Connecting audio through LiveKit...");

        // Load the LiveKit browser SDK only when needed.
        const { Room, RoomEvent } = await import(
            "https://cdn.jsdelivr.net/npm/livekit-client/+esm"
        );

        // Close the direct WebRTC connection.
        if (pc) {
            pc.ontrack = null;
            pc.onicecandidate = null;
            pc.onconnectionstatechange = null;
            pc.close();
            pc = null;
        }

        pendingIceCandidates = [];

        // Stop the old microphone stream; LiveKit will acquire it.
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        }

        const response = await fetch(
            `${API_BASE}/api/livekit/audio-token`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    callId: data.callId
                })
            }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || "Could not obtain LiveKit token."
            );
        }

        liveKitRoom = new Room();

        liveKitRoom.on(
            RoomEvent.TrackSubscribed,
            async (track, publication, participant) => {
                if (track.kind !== "audio") return;

                const element = track.attach();
                element.autoplay = true;
                element.setAttribute("playsinline", "");
                element.volume = 1;

                document.body.appendChild(element);

                try {
                    await element.play();
                } catch (error) {
                    console.warn(
                        "LiveKit audio playback requires interaction:",
                        error
                    );
                    status(
                        "Connected. Tap the page if you cannot hear audio."
                    );
                }
            }
        );

        await liveKitRoom.connect(
            result.livekitUrl,
            result.token
        );

        await liveKitRoom.localParticipant.setMicrophoneEnabled(true);

        usingLiveKit = true;
        fallbackStarting = false;

        updateControls("active");
        status("LiveKit audio connected. You can speak now.");

    } catch (error) {
        console.error(
            "[GPA Audio Call] LiveKit fallback failed:",
            error
        );

        fallbackStarting = false;
        status("LiveKit fallback failed: " + error.message);
    }
}



  async function startCall() {
    if (!socket?.connected) {
      alert("GPA Audio Call is not connected. Refresh Messenger and try again.");
      return;
    }

    const recipientId = String(
      window.GPAMessengerReceiverId || ""
    );

    if (!/^[a-fA-F0-9]{24}$/.test(recipientId)) {
      alert("Please select a Messenger contact first.");
      return;
    }

    if (recipientId === getCurrentUserId()) {
      alert("You cannot call yourself.");
      return;
    }

    const button = document.getElementById("gpaAudioCallButton");
    button.disabled = true;

    socket.emit("call:invite", { recipientId }, result => {
      button.disabled = false;

      if (!result?.ok) {
        alert(result?.message || "Could not start the call.");
        return;
      }

      currentCallId = result.callId;
      peerId = recipientId;

      document.getElementById("gpaAudioCaller").textContent =
        "Calling " +
        (window.GPAMessengerContacts || [])
          .find(c => String(c._id) === recipientId)?.name;

      updateControls("ringing");
      status("Calling. Waiting for the recipient to answer.");
    });
  }

  async function acceptCall() {
    if (!socket?.connected || !incoming || !currentCallId) return;

    try {
      // Ask for microphone permission after the user's Accept click.
      await preparePeerConnection();

      socket.emit("call:accept", { callId: currentCallId }, result => {
        if (!result?.ok) {
          status(result?.message || "Could not accept the call.");
          cleanup(false);
          return;
        }

        updateControls("active");
        status("Call accepted. Connecting audio...");
      });
    } catch (error) {
      console.error("[GPA Audio Call] Microphone error:", error);
      status("Microphone unavailable. Check browser permission and device settings.");
    }
  }

  async function handleSignal(data) {
    if (!data || data.callId !== currentCallId || !data.signal) return;

    const signal = data.signal;

    try {
      if (signal.type === "offer") {
        if (!pc) await preparePeerConnection();

        await pc.setRemoteDescription(
          new RTCSessionDescription(signal.sdp)
        );
        while (pendingIceCandidates.length > 0) {
  const candidate = pendingIceCandidates.shift();
  await pc.addIceCandidate(candidate);
}

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendSignal({
          type: "answer",
          sdp: pc.localDescription
        });
      } else if (signal.type === "answer") {
        if (pc && !pc.currentRemoteDescription) {
          await pc.setRemoteDescription(
            new RTCSessionDescription(signal.sdp)
          );
          while (pendingIceCandidates.length > 0) {
  const candidate = pendingIceCandidates.shift();
  await pc.addIceCandidate(candidate);
}
        }
      } else if (signal.type === "ice" && signal.candidate) {
  if (!pc) return;

  const candidate = new RTCIceCandidate(signal.candidate);

  if (!pc.remoteDescription) {
    pendingIceCandidates.push(candidate);
  } else {
    await pc.addIceCandidate(candidate);
  }
}
    } catch (error) {
      console.error("[GPA Audio Call] Signaling error:", error);
      status("Could not establish audio. Please end the call and retry.");
    }
  }

  async function declineCall() {
    if (socket?.connected && currentCallId) {
      socket.emit("call:decline", { callId: currentCallId }, () => {});
    }
    cleanup(false);
  }

  function endCall() {
    if (socket?.connected && currentCallId) {
      socket.emit("call:end", { callId: currentCallId }, () => {});
    }
    cleanup(false);
  }

  function cleanup(showEnded) {
    if (liveKitRoom) {
    liveKitRoom.disconnect();
    liveKitRoom = null;
}

usingLiveKit = false;
fallbackStarting = false;
    if (pc) {
      pc.close();
      pc = null;
    }

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      localStream = null;
    }

    const audio = document.getElementById("gpaAudioRemote");
    if (audio) audio.srcObject = null;

    currentCallId = null;
    peerId = null;
    incoming = null;

    updateControls("idle");

    if (showEnded) status("Call ended.");
  }

  function toggleMute() {
    if (!localStream) return;

    const track = localStream.getAudioTracks()[0];
    if (!track) return;

    track.enabled = !track.enabled;
    document.getElementById("gpaAudioMute").textContent =
      track.enabled ? "Mute microphone" : "Unmute microphone";
  }

  function getCurrentUserId() {
    try {
      const part = token.split(".")[1]
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      return String(JSON.parse(atob(part)).id || "");
    } catch {
      return "";
    }
  }

  function connect() {
    if (!token) {
      console.warn("[GPA Audio Call] Login token not found.");
      return;
    }

    callRole = decodeRole(token);
    addInterface();

    socket = io(API_BASE + NS, {
      auth: { token },
      transports: ["websocket", "polling"]
    });

    socket.on("connect", () => {
    console.log("[GPA Audio Call] Signaling connected.");

    socket.emit("call:check-pending", result => {
        console.log(
            "[GPA Audio Call] Pending-call check:",
            result
        );
    });
});

    socket.on("connect_error", error => {
      console.error("[GPA Audio Call] Connection failed:", error.message);
    });

    socket.on("call:incoming", data => {
      if (currentCallId) {
        // The server should prevent a second simultaneous call.
        return;
      }

      incoming = data;
      currentCallId = data.callId;
      peerId = data.caller.id;

      const callerName = data.caller.name || "Academy user";

document.getElementById("gpaAudioCaller").textContent = callerName;
document.getElementById("gpaAudioAvatar").textContent =
  callerName.trim().charAt(0).toUpperCase() || "G";

updateControls("incoming");
status("Voice call");
    });

    socket.on("call:accepted", async data => {
      if (data.callId !== currentCallId) return;

      try {
        await preparePeerConnection();

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendSignal({
          type: "offer",
          sdp: pc.localDescription
        });

        updateControls("active");
        status("Call accepted. Connecting audio...");
      } catch (error) {
        console.error("[GPA Audio Call] Start audio error:", error);
        status("Could not access the microphone or start audio.");
      }
    });

    socket.on("call:signal", handleSignal);
    socket.on("call:fallback", data => {
    startLiveKitFallback(data);
});

    socket.on("call:ended", data => {
      if (data.callId !== currentCallId) return;

      cleanup(false);
      status("Call ended: " + (data.reason || "ended"));
    });
  }

  document.addEventListener("DOMContentLoaded", connect);
})();


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
        position:absolute; right:12px; top:10px;
        border:0; border-radius:50%; width:42px; height:42px;
        background:#15803d; color:white; font-size:21px;
        cursor:pointer; z-index:5;
      }
      .gpa-audio-call-button:disabled {
        opacity:.4; cursor:not-allowed;
      }
      #gpaAudioCallPopup {
        position:fixed; right:22px; bottom:22px;
        width:min(360px, calc(100vw - 32px));
        padding:22px; background:white; color:#172554;
        border:1px solid #cbd5e1; border-radius:16px;
        box-shadow:0 10px 40px #0003; z-index:99999;
        font-family:Arial,sans-serif;
      }
      #gpaAudioCallPopup button {
        padding:10px 15px; margin:8px 6px 0 0;
        border:0; border-radius:8px; cursor:pointer;
        font-weight:bold;
      }
      #gpaAudioAccept { background:#15803d;color:white; }
      #gpaAudioDecline, #gpaAudioEnd { background:#b91c1c;color:white; }
      #gpaAudioMute { background:#e2e8f0;color:#172554; }
      #gpaAudioStatus { font-size:14px; line-height:1.5; }
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
      <h3 style="margin-top:0">GPA Audio Call</h3>
      <p id="gpaAudioCaller"></p>
      <p id="gpaAudioStatus">Ready.</p>
      <button id="gpaAudioAccept">Accept</button>
      <button id="gpaAudioDecline">Decline</button>
      <button id="gpaAudioMute" hidden>Mute microphone</button>
      <button id="gpaAudioEnd" hidden>End call</button>
      <audio id="gpaAudioRemote" autoplay playsinline></audio>
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
    status("Audio connection failed. TURN relay may be required.");
  } else if (
    pc.connectionState === "disconnected" ||
    pc.iceConnectionState === "disconnected"
  ) {
    status("Audio connection interrupted.");
  }
};

pc.oniceconnectionstatechange = () => {
  if (pc) {
    console.log(
      "[GPA Audio Call] ICE state:",
      pc.iceConnectionState
    );
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

      document.getElementById("gpaAudioCaller").textContent =
        "Incoming call from " + (data.caller.name || "Academy user");

      updateControls("incoming");
      status("Incoming GPA Audio Call. Accept or decline.");
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

    socket.on("call:ended", data => {
      if (data.callId !== currentCallId) return;

      cleanup(false);
      status("Call ended: " + (data.reason || "ended"));
    });
  }

  document.addEventListener("DOMContentLoaded", connect);
})();

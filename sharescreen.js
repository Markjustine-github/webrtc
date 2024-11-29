'use strict';

// Define variables for screen sharing.
let screenStream;
let peerConnection;

// ICE servers configuration for connecting peers.
const servers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};

// Handles starting screen sharing.
function startScreenSharing() {
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then((stream) => {
      screenStream = stream;

      // Create a new RTCPeerConnection.
      peerConnection = new RTCPeerConnection(servers);

      // Add screen-sharing stream tracks to the peer connection.
      screenStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, screenStream);
      });

      console.log('Screen sharing stream added to peer connection.');

      // Create an offer and set up connection.
      peerConnection.createOffer()
        .then((offer) => {
          return peerConnection.setLocalDescription(offer);
        })
        .then(() => {
          console.log('Offer created and set as local description.');
          // Send the offer to the participants (via signaling server).
          sendToParticipants({ type: 'offer', sdp: peerConnection.localDescription });
        });

      // Handle ICE candidates.
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          sendToParticipants({ type: 'candidate', candidate: event.candidate });
        }
      };

      // Handle screen stop sharing.
      stream.getVideoTracks()[0].onended = () => {
        stopScreenSharing();
      };
    })
    .catch((error) => {
      console.error('Error starting screen sharing:', error);
    });
}

// Handles stopping screen sharing.
function stopScreenSharing() {
  if (screenStream) {
    screenStream.getTracks().forEach((track) => track.stop());
    screenStream = null;

    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }

    console.log('Screen sharing stopped.');
  }
}

// Sends data (SDP offer or ICE candidates) to participants.
function sendToParticipants(data) {
  // Replace this function with your signaling server logic to send data.
  console.log('Sending data to participants:', data);
}

// Start sharing button logic.
const startSharingButton = document.getElementById('startSharingButton');
startSharingButton.addEventListener('click', startScreenSharing);

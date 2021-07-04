import 'webrtc-adapter';

let peerConnection = null;
let handleICECandidateEvent = null;
let handleTrackEvent = null;
let handleOfferMessage = null;
let handleAnswerMessage = null;
let handleICECandidateMessage = null;

export const openPeerConnection = async (videoStream) => {
    // establish new peer connection
    peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    });
  
    // add event listeners
    peerConnection.onicecandidate = handleICECandidateEvent;
    peerConnection.ontrack = handleTrackEvent;
  
    videoStream.getTracks().forEach((track) => {
      console.log('ADDING TRACK ---');
      peerConnection.addTrack(track, videoStream);
    });
  };

  export const initializePeerListeners = (sendMessage, handleStartRemoteVideo, videoStream) => {
    handleICECandidateEvent = (event) => {
        if (event.candidate) {
          sendMessage({
            target: 'user',
            messageType: 'ICE_CANDIDATE',
            message: JSON.stringify(event.candidate),
          });
        } else {
          console.log('No more candidates!');
        }
      };
  
    handleTrackEvent = (event) => {
        console.log(event);
        handleStartRemoteVideo(event.streams[0]);
      };
  
    handleOfferMessage = async (messageData) => {
        if (!peerConnection) {
          await openPeerConnection(videoStream);
        }
      
        const parsedMessage = JSON.parse(messageData.message);
        const sessionDescription = new RTCSessionDescription(parsedMessage);
        try {
          await peerConnection.setRemoteDescription(sessionDescription);
      
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          sendMessage({
            messageType: 'ANSWER',
            message: JSON.stringify(peerConnection.localDescription),
          });
        } catch (err) {
          console.log(err);
        }
      };
  
    handleAnswerMessage = async (messageData) => {
        if (peerConnection) {
          const parsedMessage = JSON.parse(messageData.message);
          const sessionDescription = new RTCSessionDescription(parsedMessage);
          try {
            await peerConnection.setRemoteDescription(sessionDescription);
          } catch (err) {
            console.log(err);
          }
        }
      };
  
    handleICECandidateMessage = async (messageData) => {
        if (peerConnection) {
          const parsedMessage = JSON.parse(messageData.message);
          const candidate = new RTCIceCandidate(parsedMessage);
          try {
            await peerConnection.addIceCandidate(candidate);
          } catch (err) {
            console.log(err);
          }
        }
      };
  
    return { handleOfferMessage, handleAnswerMessage, handleICECandidateMessage };
  };

  export const createOffer = async (sendMessage) => {
    try {
      const offer = await peerConnection.createOffer();
  
      if (peerConnection.signalingState != 'stable') {
        return;
      }
  
      await peerConnection.setLocalDescription(offer);
  
      sendMessage({
        messageType: 'OFFER',
        message: JSON.stringify(peerConnection.localDescription),
      });
    } catch (err) {
      console.log(err);
    }
  };

  export const closeConnection = () => {
    // Close the RTCPeerConnection
    if (peerConnection) {
      // Disconnect all our event listeners; we don't want stray events
      // to interfere with the hangup while it's ongoing.
      peerConnection.ontrack = null;
      peerConnection.onnicecandidate = null;
      peerConnection.oniceconnectionstatechange = null;
      peerConnection.onsignalingstatechange = null;
      peerConnection.onicegatheringstatechange = null;
      peerConnection.onnotificationneeded = null;
  
      // Close the peer connection
      peerConnection.close();
      peerConnection = null;
    }
  };
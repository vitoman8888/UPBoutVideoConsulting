import '../../css/style.scss';
import {
  renderFilterOptions,
  handleUpdateFilter,
  setCanvas,
  handleUpdateRemoteFilter,
} from './canvas';
import { joinRoom, sendMessage } from './firebase';
import {
  initializePeerListeners,
  openPeerConnection,
  createOffer,
  closeConnection,
} from './webrtc';
import { getNotificationPermission, sendNotification } from './notifications';

const roomIdEl = document.querySelector('#room-id');
const clipboardBtn = document.querySelector('#clipboard-btn');
const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');
const localCanvasEl = document.querySelector('#local-canvas');
const remoteCanvasEl = document.querySelector('#remote-canvas');
const localUserEl = document.querySelector('#local-username');
const mainContentEl = document.querySelector('#main-content');
const alertBoxEl = document.querySelector('#alert-box');
const startCallBtnEl = document.querySelector('#start-call-btn');
const stopCallBtnEl = document.querySelector('#stop-call-btn');
const remoteUserEl = document.querySelector('#remote-username');
const username = `user-${Math.round(Math.random() * 100000)}`;

let roomId = null;
let stream = null;
let remoteStream = null;
const filterOptionsSelectEl = document.querySelector('#filter-options');

const getQueryStringParams = (query) => {
  return query
    ? (/^[?#]/.test(query) ? query.slice(1) : query)
        .split('&')
        .reduce((params, param) => {
          let [key, value] = param.split('=');
          params[key] = value
            ? decodeURIComponent(value.replace(/\+/g, ' '))
            : '';
          return params;
        }, {})
    : {};
};

const getRoomId = () => {
  const params = getQueryStringParams(document.location.search);
  roomId = params.roomId;
  roomIdEl.textContent = roomId;
  return params.roomId;
};

// getRoomId();

const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      // Clipboard API not available
      return;
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const startVideo = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { min: 640, ideal: 1920 },
          height: { min: 400, ideal: 1080 },
          aspectRatio: { ideal: 1.7777777778 },
        },
        audio: true,
      });
      localVideoEl.srcObject = mediaStream;
      stream = mediaStream;
      setCanvas(localCanvasEl, localVideoEl);
  
      return mediaStream;
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleSelectChange = (event) => {
    handleUpdateFilter(event.target.value);
    sendMessage({ messageType: 'CANVAS_FILTER', message: event.target.value });
  };

  const initializeVideoChat = async () => {
    // get the room id
    const roomId = getRoomId();
  
    // write username to page
    localUserEl.textContent = username;
  
    try {
      const videoStream = await startVideo();
      let peerConnectionHandlers = initializePeerListeners(sendMessage, handleStartRemoteVideo, videoStream);
      // join the room
      const successfullyJoined = await joinRoom(roomId, username, {
        handleUserPresence,
        handleUpdateRemoteFilter,
        stopCall,
        ...peerConnectionHandlers,
      });
  
      // if room is full or an error occurs close it off
      if (!successfullyJoined) {
        console.log("Bad join");
        mainContentEl.classList.add('hidden');
        alertBoxEl.classList.remove('hidden');
        return;
      }
  
      // if not, make sure main content is displaying
      console.log("Good join");
      mainContentEl.classList.remove('hidden');
      alertBoxEl.classList.add('hidden');
    } catch (err) {
      console.log("ERROR join");
      console.log(err);
      mainContentEl.classList.add('hidden');
      alertBoxEl.classList.remove('hidden');
    }
  };

  const handleUserPresence = (isPresent, username) => {
    if (isPresent) {
      startCallBtnEl.removeAttribute('disabled');
      remoteUserEl.textContent = username;
      sendNotification('online');
    } else {
      startCallBtnEl.setAttribute('disabled', true);
      stopCallBtnEl.setAttribute('disabled', true);
      remoteUserEl.textContent = 'No remote user';
      sendNotification('offline');
    }
  };

  const handleStartRemoteVideo = (mediaStream) => {
    if (!remoteStream) {
      console.log(mediaStream);
      remoteVideoEl.srcObject = mediaStream;
      remoteStream = mediaStream;
      startCallBtnEl.setAttribute('disabled', true);
      stopCallBtnEl.removeAttribute('disabled');
      setCanvas(remoteCanvasEl, remoteVideoEl, true);
  
      // let remote user know what canvas filter we're using when the video starts
      sendMessage({
        messageType: 'CANVAS_FILTER',
        message: filterOptionsSelectEl.value,
      });

      sendNotification('connected');
    }
  };

  const stopCall = () => {
    closeConnection();
    remoteStream = null;
    remoteVideoEl.srcObject.getTracks().forEach((track) => track.stop());
    startCallBtnEl.removeAttribute('disabled');
    stopCallBtnEl.setAttribute('disabled', true);
    remoteVideoEl.classList.remove('hidden');
    remoteCanvasEl.classList.add('hidden');
    sendNotification('stopped');
  };
  
  const handleStopCall = () => {
    stopCall();
    sendMessage({ messageType: 'HANG_UP', message: '' });
  };

  const handleStartCall = async () => {
    try {
      await openPeerConnection(stream);
      createOffer(sendMessage);
      startCallBtnEl.setAttribute('disabled', true);
      stopCallBtnEl.removeAttribute('disabled');
    } catch (err) {
      console.log(err);
    }
  };

  // startVideo();
  // renderCanvas(localCanvasEl);


  renderFilterOptions(filterOptionsSelectEl);
  
  filterOptionsSelectEl.addEventListener('change', handleSelectChange);

  clipboardBtn.addEventListener('click', copyToClipboard);

  startCallBtnEl.addEventListener('click', handleStartCall);

  stopCallBtnEl.addEventListener('click', handleStopCall);

  getNotificationPermission();

  initializeVideoChat();

  
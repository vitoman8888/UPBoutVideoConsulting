import '../../css/style.scss';
import { renderFilterOptions, handleUpdateFilter, setCanvas } from './canvas';
import { joinRoom, sendMessage } from './firebase';

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
const remoteUserEl = document.querySelector('#remote-username');
const username = `user-${Math.round(Math.random() * 100000)}`;

let roomId = null;
let stream = null;
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
      // join the room
      const successfullyJoined = await joinRoom(roomId, username, {
        handleUserPresence,
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
    } else {
      startCallBtnEl.setAttribute('disabled', true);
      remoteUserEl.textContent = 'No remote user';
    }
  };

  // startVideo();
  // renderCanvas(localCanvasEl);


  renderFilterOptions(filterOptionsSelectEl);
  
  filterOptionsSelectEl.addEventListener('change', handleSelectChange);

  clipboardBtn.addEventListener('click', copyToClipboard);

  initializeVideoChat();

  
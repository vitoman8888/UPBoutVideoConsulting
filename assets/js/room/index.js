import '../../css/style.scss';
import { renderFilterOptions, handleUpdateFilter, setCanvas } from './canvas';

const roomIdEl = document.querySelector('#room-id');
const clipboardBtn = document.querySelector('#clipboard-btn');
const localVideoEl = document.querySelector('#local-video');
const remoteVideoEl = document.querySelector('#remote-video');
const localCanvasEl = document.querySelector('#local-canvas');
const remoteCanvasEl = document.querySelector('#remote-canvas');

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

getRoomId();

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
  };

  startVideo();
  // renderCanvas(localCanvasEl);
  renderFilterOptions(filterOptionsSelectEl);
  
  filterOptionsSelectEl.addEventListener('change', handleSelectChange);

  clipboardBtn.addEventListener('click', copyToClipboard);



  
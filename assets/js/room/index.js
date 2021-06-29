import '../../css/style.scss';

const roomIdEl = document.querySelector('#room-id');
const clipboardBtn = document.querySelector('#clipboard-btn');

let roomId = null;

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
  
  clipboardBtn.addEventListener('click', copyToClipboard);
import '../../css/style.scss';
import { v4 as uuidv4 } from 'uuid';

const joinRoomBtn = document.querySelector('#join-room-btn');

joinRoomBtn.addEventListener('click', () => {
  location.assign(`/room.html?roomId=${uuidv4()}`);
});
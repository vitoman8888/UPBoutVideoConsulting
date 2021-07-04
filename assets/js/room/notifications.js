export const getNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications.');
      return false;
    }
  
    try {
      const permission = await window.Notification.requestPermission();
      return permission;
    } catch (err) {
      console.log(err);
      return err;
    }
  };

  export const sendNotification = (status) => {
    const msg = `User is now ${status}!`;
    const notification = new Notification('UP Fashion Consulting', {
      body: msg,
    });
  
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        // The tab has become visible so clear the now-stale Notification.
        notification.close();
        // document.removeEventListener('visibilityChange', () => {});
      }
    });
  };
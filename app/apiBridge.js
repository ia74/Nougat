const bridge = {
  playing: {},
  cve: {
    _callbacks: {},
    on: (event, callback) => {
      if (!apiBridge.cve._callbacks[event]) {
        apiBridge.cve._callbacks[event] = [];
      }
      apiBridge.cve._callbacks[event].push(callback);
    },
    emit: (event, data) => {
      if (!apiBridge.cve._callbacks[event]) {
        return;
      }
      apiBridge.cve._callbacks[event].forEach(callback => {
        callback(data);
      });
    }
  },
  now: {},
  queue: {},
  toasts: {
    send: (data) => {
      let toastEl = document.createElement('div');
      toastEl.classList.add('toast');
      toastEl.innerHTML = data.message;
      toastEl.onclick = () => {
        toastEl.style.animation = 'fadeout 1s';
        setTimeout(() => {
          toastEl.remove();
        }, 1000);
      }
      document.querySelector('#toasts').appendChild(toastEl);
      setTimeout(() => {
        toastEl.style.animation = 'fadeout 1s';
        setTimeout(() => {
          toastEl.remove();
        }, 1000);
      }, 15000);
    }
  }
}

if(!window['apiBridge']) window['apiBridge'] = bridge;

export default bridge;

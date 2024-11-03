import apiBridge from './apiBridge.js';
import ctxl from './contextual.js';
import './md5.js';

//TODO: Change this if you want to turn DevTools on or off
apiBridge.devTools = true; // false: off, true: on

apiBridge.localStorageHandler = {
  set: (key, value) => {
    localStorage.setItem(key, value);
  },
  get: (key) => {
    return localStorage.getItem(key);
  },
  remove: (key) => {
    localStorage.removeItem(key);
  }
};

let navidromeUrl = apiBridge.localStorageHandler.get('navidrome_url') != null ? apiBridge.localStorageHandler.get('navidrome_url') : '';

apiBridge.ctxl = ctxl;

apiBridge.server = navidromeUrl;

apiBridge.testConnectionToAppMain = async (view) => {
  console.log('[' + view + '] APIBridge: Connection to app main successful.');
  return true;
}

apiBridge.log = (...m) => {
  console.log('APIBRIDGE', m);
}

apiBridge.request = (url, method, data) => {
  if(!url.includes('?')) url += '?';
  else url += '&';
  url += 'f=json';
  return fetch(navidromeUrl + url, {
    method: method,
    body: data
  }).then((res) => res.json());
}

apiBridge.subsonicRequest = (url, method, data) => {
  const ls = apiBridge.localStorageHandler;
  if(!url.includes('?')) url += '?';
  else url += '&';
  url += 'u=' + ls.get('navidrome_user') +'&s=' + ls.get('navidrome_salt') + '&t=' + ls.get('navidrome_hash') + '&v=1.0.0&c=Nougat'
  return apiBridge.request(url, method, data).then((res) => {
    if(res['subsonic-response'].error) throw new Error(res['subsonic-response'].error.message);
    return res['subsonic-response'];
  });
};

apiBridge.authenticateApi = async (user, password, salt=-1, hash=-1, url=-1) => {
  if(salt==-1) salt = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  if(hash==-1) hash = md5(password + salt);
  if(url!=-1) navidromeUrl = url;
  apiBridge.localStorageHandler.set('navidrome_salt', salt);
  apiBridge.localStorageHandler.set('navidrome_hash', hash);
  apiBridge.localStorageHandler.set('navidrome_user', user);
  apiBridge.localStorageHandler.set('navidrome_url', navidromeUrl);
  return new Promise((resolve, reject) => {
    apiBridge.subsonicRequest('/rest/ping.view', 'GET', null).then((res) => {
      resolve(res);
    }).catch((err) => {
      apiBridge.localStorageHandler.remove('navidrome_user');
      reject(err);
    });
  });
}

apiBridge.raw = (url, method, data) => {
  return fetch(navidromeUrl + url, {
    method: method,
    body: data
  }).then((res) => res.blob());
}

apiBridge.rawURL = (url) => {
  const ls = apiBridge.localStorageHandler;
  if(!url.includes('?')) url += '?';
  else url += '&';
  url += 'u=' + ls.get('navidrome_user') +'&s=' + ls.get('navidrome_salt') + '&t=' + ls.get('navidrome_hash') + '&v=1.0.0&c=Nougat'
  return navidromeUrl + url;
}

apiBridge.music = {
  albumList: () => {
    return apiBridge.subsonicRequest('/rest/getAlbumList.view?size=36&type=newest', 'GET', null).then((res) => {
      return res.albumList;
    });
  },
  album: (id) => {
    return apiBridge.subsonicRequest('/rest/getAlbum.view?id=' + id, 'GET', null).then((res) => {
      return res.album;
    });
  },
  playlist: (id) => {
    return apiBridge.subsonicRequest('/rest/getPlaylist.view?id=' + id, 'GET', null).then((res) => {
      return res.playlist;
    });
  },
  stream: (id) => {
    return apiBridge.raw('/rest/stream?id=' + id, 'GET', null).then((res) => {
      return res;
    });
  },
  scrobble: (id, time, submission = true) => {
    console.log(id, time, submission)
    return apiBridge.subsonicRequest('/rest/scrobble.view?id=' + id + '&time=' + time + '&submission=' + submission, 'GET', null).then((res) => {
      return res;
    });
  }
}

const views = [
  'ctxl_devtools',
  'ctxl_home',
  'ctxl_playlists',
  'ctxl_albums',
  'ctxl_navbar',
  'ctxl_progress',
  'ctxl_queue',
  'ctxl_loading',
  'ctxl_generic_album',
  'ctxl_music_handler',
  'ctxl_lyrics',
  'ctxl_login',
]

views.forEach((view) => ctxl.addView(view));

ctxl.destructiveView('ctxl_navbar');
ctxl.nonDestructiveView('ctxl_login');
ctxl.waitForClose('ctxl_login').then(() => {
  navidromeUrl = localStorage.getItem('navidrome_url');
  ctxl.destructiveView('ctxl_home');
  ctxl.nonDestructiveView('ctxl_devtools');
  ctxl.nonDestructiveView('ctxl_lyrics');
  ctxl.nonDestructiveView('ctxl_music_handler');
  ctxl.nonDestructiveView('ctxl_navbar');
  ctxl.nonDestructiveView('ctxl_progress');
  ctxl.nonDestructiveView('ctxl_generic_album');
  ctxl.nonDestructiveView('ctxl_loading');
  ctxl.nonDestructiveView('ctxl_queue');
});

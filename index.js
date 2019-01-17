const axios = require('axios');

const _endpoints = require('./endpoints');
const _encode = require('./encode');
const _decode = require('./decode');

/** 
 * @typedef LGTVSettings
 * @property {string} host ip address or hostname of TV
 * @property {integer} [port] port (default is 8080)
 * @property {function} [encode]
 * @property {endpoints} [encode]
 * @property {string} [pairingKey]
 */
 
 /**
 * @param {LGTVSettings} settings 
 */
function LGTV(settings = {}) {
  const
    { host, port = 8080 } = settings,
    encode = settings.encode || _encode,
    endpoints = settings.endpoints || _endpoints;
  
  function post(path = "/", data = '') {
    return axios({
      method: 'post',
      url: `http://${host}:${port}${path}`,
      response: 'string',
      headers: {
        'Content-Type': "application/atom+xml",
        'Connection': "Keep-Alive"
      },
      data
    })
    .then((request) => _decode(request.data))
  }

  function get(path = "/", data = {}) {
    const parameters = Object.keys(data)
      .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
      .join('&');
    
    return axios({
      method: 'get',
      url: `http://${host}:${port}${path}?${parameters}`,
      response: 'string',
      headers: {
        'Connection': "Close"
      }
    })
    .then((request) => _decode(request.data))
  }

  const auth = {
    AuthKeyReq: () => post(endpoints.auth, encode('auth', {
      type: 'AuthKeyReq',
    })),

    CancelAuthKeyReq: () => post(endpoints.auth, encode('auth', {
      type: 'CancelAuthKeyReq'
    })),

    AuthReq: (pairingKey) => post(endpoints.auth, encode('auth', {
      type: 'AuthReq',
      value: pairingKey || settings.pairingKey
    })),
  };

  const command = {

    ChangeInputSource: (source) => 
      typeof source == "string" ?
        post(endpoints.command, encode('command', {
          name: 'ChangeInputSource',
          inputSource: source,
        })) :
        post(endpoints.command, encode('command', {
          name: 'ChangeInputSource',
          inputSourceType: source.type,
          inputSourceIdx: source.index
        })),

    HandleKeyInput: (value) =>
      post(endpoints.command, encode('command', {
        name: 'HandleKeyInput',
        value
      })),

    AVMode: (source, onOrOff) =>
      post(endpoints.command, encode('command', {
        name: 'AVMode',
        source,
        value: typeof onOrOff === "string" ? onOrOff : (onOrOff ? "on" : "off")
      })),

    HandleChannelChange: ({ major, minor, sourceIndex, physicalNum }) =>
      post(endpoints.command, encode('command', {
        name: 'HandleChannelChange',
        major, minor, sourceIndex, physicalNum
      })),

    AppExecute: ({ auid, appname, contentid, contentAge }) =>
      post(endpoints.command, encode('command', {
        name: 'AppExecute',
        auid, appname, contentid, contentAge
      })),

  };

  const data = {

    inputsrc_list: () => get(endpoints.data, { target: "inputsrc_list" }),
    channel_list: () => get(endpoints.data, { target: "channel_list" }),
    cur_inputsrc: () => get(endpoints.data, { target: "cur_inputsrc" }),
    caps: () => get(endpoints.data, { target: "caps" }),
    
    /**
     * @param {2|3} type
     * @param 
     */
    applist_get: (type, index = 0, number = 100) => 
      get(endpoints.data, {
        target: 'applist_get',
        type, index, number 
      }),

    /**
     * @param {2|3} type
     */
    appnum_get: (type) =>
      get(endpoints.data, { 
        target: 'appnum_get',
        type
      }),

  };

  return {
    get, post,
    auth, command, data
  };

};

LGTV.endpoints = _endpoints;
LGTV.encode = _encode;
LGTV.decode = _decode;

module.exports = LGTV;

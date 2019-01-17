const axios = require('axios');
const {parseString} = require('xml2js');

const _endpoints = Object.freeze({
  auth: '/roap/api/auth',
  command: '/roap/api/command',
  data: '/roap/api/data',
  event: '/roap/api/event',
  navigation: '/navigation',
});

const _encode = require('./encode');

const _decode = (data) => new Promise((resolve, reject) => {
  parseString(data, {
    explicitRoot: false,
    explicitArray: false,
  }, (err, result) => {
    if (err) reject(err);
    else resolve(result);
  })
})

/**
 * @typedef LGTVSettings
 * @property {string} host ip address or hostname of TV
 * @property {integer} [port] port (default is 8080)
 * @property {function} [encode]
 * @property {endpoints} [encode]
 * @property {string} [pairingKey]
 * 
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

  function get(path = "/") {
    return axios({
      method: 'get',
      url: `http://${host}:${port}${path}`,
      response: 'string',
      headers: {
        'Connection': "Close"
      }
    })
  }

  return {
    get,
    post,

    auth: {

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
    },

    command: {
      
      /**
       * Not working
       */
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

      HandleKeyInput: (key) =>
        post(endpoints.command, encode('command', {
          name: 'HandleKeyInput',
          value: key
        })),

    },

    data: {

      inputsrc_list: () => get(`${endpoints.data}?target=inputsrc_list`)

    }
  }
};

LGTV.endpoints = _endpoints;
LGTV.encode = _encode;
LGTV.decode = _decode;

module.exports = LGTV;

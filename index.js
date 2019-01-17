const axios = require('axios');
const {parseString} = require('xml2js');

const _encode = require('./encode');
const _endpoints = Object.freeze({
    auth: '/roap/api/auth',
    command: '/roap/api/command',
});

function LGTV(parameters = {}) {
    const
        { host, port = 8080 } = parameters,
        encode = parameters.encode || _encode,
        endpoints = parameters.endpoints || _endpoints;

    function send(path = "/", data = '') {
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
        .then((response) => 
            new Promise((resolve, reject) =>
                parseString(response.data, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                })
            ))
        .catch(error => { throw error } );
    }

    return {
        send,
        AuthKeyReq : () => send(endpoints.auth, encode('auth', {
            type: 'AuthKeyReq',
        })),
        AuthReq: (pairingKey) => send(endpoints.auth, encode('auth', {
            type: 'AuthReq',
            value: pairingKey || parameters.pairingKey
        })),
    }
};

LGTV.encode = _encode;
LGTV.endpoints = _endpoints;

module.exports = LGTV;


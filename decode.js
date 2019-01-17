const {parseString} = require('xml2js');

function decode(data) {
  return new Promise((resolve, reject) => {
    parseString(data, {
      explicitRoot: false,
      explicitArray: false,
    }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    })
  });
}

module.exports = decode;

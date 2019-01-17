function encode(name, parameters = {}) {
    const body = Object.keys(parameters)
        .map(key => `<${key}>${parameters[key]}</${key}`)
        .join('');
    return `<?xml version="1.0" encoding="utf-8"?><${name}>${body}</${name}>`;
}

module.exports = encode;
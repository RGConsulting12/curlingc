function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
  });
}

function parseBasicAuth(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    return null;
  }
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const [user, pass = ''] = decoded.split(':');
  return { user, pass };
}

function parseCookies(req) {
  const raw = req.headers.cookie || '';
  return raw.split(';').reduce((acc, part) => {
    const [name, value = ''] = part.trim().split('=');
    if (name) {
      acc[name] = value;
    }
    return acc;
  }, {});
}

function json(res, status, payload) {
  res.setHeader('Content-Type', 'application/json');
  res.status(status).send(JSON.stringify(payload));
}

module.exports = {
  readBody,
  parseBasicAuth,
  parseCookies,
  json,
};
